import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { fetchEventSource, type EventSourceMessage } from "@microsoft/fetch-event-source";
import { useAppStore } from "@/store/appStore";
import type {
	ApiEnvelope,
	AutomationConfigResponse,
	DashboardResponse,
	DeviceStatusResponse,
	DeviceType,
	LoginRequest,
	LoginResponse,
	MeResponse,
	RefreshTokenResponse,
	SendDeviceCommandRequest,
	UpdateDeviceModeRequest,
	UpdateFanThresholdRequest,
	UpdateLedThresholdRequest,
} from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

type RequestWithRetry = InternalAxiosRequestConfig & {
	_retry?: boolean;
};

const api = axios.create({
	baseURL: BASE_URL,
	timeout: 15000,
});

const authApi = axios.create({
	baseURL: BASE_URL,
	timeout: 15000,
});

let refreshPromise: Promise<RefreshTokenResponse> | null = null;

async function refreshAccessToken(): Promise<RefreshTokenResponse> {
	const { refreshToken, logout, setAuthTokens } = useAppStore.getState();
	if (!refreshToken) {
		logout();
		throw new Error("Session expired");
	}

	if (!refreshPromise) {
		refreshPromise = authApi
			.post<ApiEnvelope<RefreshTokenResponse>>("/auth/refresh", { refreshToken })
			.then((res) => res.data.data)
			.finally(() => {
				refreshPromise = null;
			});
	}

	const refreshed = await refreshPromise;
	setAuthTokens(refreshed.accessToken, refreshed.refreshToken);
	return refreshed;
}

function toErrorMessage(error: unknown, fallback = "Request failed") {
	if (axios.isAxiosError(error)) {
		const apiMessage = (error.response?.data as ApiEnvelope<unknown> | undefined)?.message;
		return apiMessage || error.message || fallback;
	}
	if (error instanceof Error) return error.message;
	return fallback;
}

function setAuthHeader(config: InternalAxiosRequestConfig, token: string) {
	const headers = config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers);
	headers.set("Authorization", `Bearer ${token}`);
	config.headers = headers;
}

api.interceptors.request.use((config) => {
	const token = useAppStore.getState().accessToken;
	if (token) setAuthHeader(config, token);
	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError<ApiEnvelope<unknown>>) => {
		const originalRequest = error.config as RequestWithRetry | undefined;

		if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
			throw error;
		}

		originalRequest._retry = true;

		try {
			const refreshed = await refreshAccessToken();
			setAuthHeader(originalRequest, refreshed.accessToken);
			return api(originalRequest);
		} catch (refreshErr) {
			throw refreshErr;
		}
	}
);

type DashboardStreamHandlers = {
  onOpen?: () => void;
  onSnapshot: (snapshot: DashboardResponse) => void;
  onHeartbeat?: (payload: string) => void;
  onError?: (message: string) => void;
};

function parseDashboardSnapshot(message: EventSourceMessage): DashboardResponse | null {
  try {
    const parsed = JSON.parse(message.data) as DashboardResponse | ApiEnvelope<DashboardResponse>;
    if ("data" in parsed && parsed.data) {
      return parsed.data;
    }
    return parsed as DashboardResponse;
  } catch {
    return null;
  }
}

export const authService = {
	async login(payload: LoginRequest): Promise<LoginResponse> {
		const res = await authApi.post<ApiEnvelope<LoginResponse>>("/auth/login", payload);
		return res.data.data;
	},
	async me(): Promise<MeResponse> {
		const res = await api.get<ApiEnvelope<MeResponse>>("/auth/me");
		return res.data.data;
	},
};

export const dashboardService = {
	async getSnapshot(): Promise<DashboardResponse> {
		const res = await api.get<ApiEnvelope<DashboardResponse>>("/dashboard");
		return res.data.data;
	},
	streamDashboard(handlers: DashboardStreamHandlers): () => void {
		const controller = new AbortController();

		const authFetch: typeof fetch = async (input, init) => {
			const headers = new Headers(init?.headers);
			const token = useAppStore.getState().accessToken;

			if (token) headers.set("Authorization", `Bearer ${token}`);
			headers.set("Accept", "text/event-stream");

			let response = await fetch(input, { ...init, headers });
			if (response.status === 401) {
				const refreshed = await refreshAccessToken();
				headers.set("Authorization", `Bearer ${refreshed.accessToken}`);
				response = await fetch(input, { ...init, headers });
			}
			return response;
		};

		void fetchEventSource(`${BASE_URL}/dashboard/stream`, {
			method: "GET",
			signal: controller.signal,
			openWhenHidden: true,
			fetch: authFetch,
			onopen(response) {
				if (response.ok) {
					handlers.onOpen?.();
					return;
				}
				throw new Error(`SSE open failed: ${response.status}`);
			},
			onmessage(message) {
				if (message.event === "heartbeat") {
					handlers.onHeartbeat?.(message.data || "ok");
					return;
				}

				if (message.event === "dashboard.snapshot") {
					const snapshot = parseDashboardSnapshot(message);
					if (snapshot) {
						handlers.onSnapshot(snapshot);
						return;
					}
				}
			},
			onerror(err) {
				handlers.onError?.(toErrorMessage(err, "Mất kết nối realtime, đang thử kết nối lại"));
				return 3000;
			},
		});

		return () => {
			controller.abort();
		};
	},
};

export const deviceService = {
	async getStatus(deviceType: DeviceType): Promise<DeviceStatusResponse> {
		const res = await api.get<ApiEnvelope<DeviceStatusResponse>>(`/devices/${deviceType}`);
		return res.data.data;
	},
	async updateMode(deviceType: DeviceType, payload: UpdateDeviceModeRequest): Promise<DeviceStatusResponse> {
		const res = await api.put<ApiEnvelope<DeviceStatusResponse>>(`/devices/${deviceType}/mode`, payload);
		return res.data.data;
	},
	async sendCommand(deviceType: DeviceType, payload: SendDeviceCommandRequest): Promise<DeviceStatusResponse> {
		const res = await api.post<ApiEnvelope<DeviceStatusResponse>>(`/devices/${deviceType}/command`, payload);
		return res.data.data;
	},
};

export const automationService = {
	async getConfig(): Promise<AutomationConfigResponse> {
		const res = await api.get<ApiEnvelope<AutomationConfigResponse>>("/automation/config");
		return res.data.data;
	},
	async updateFanThreshold(payload: UpdateFanThresholdRequest): Promise<AutomationConfigResponse> {
		const res = await api.put<ApiEnvelope<AutomationConfigResponse>>("/automation/fan-threshold", payload);
		return res.data.data;
	},
	async updateLedThreshold(payload: UpdateLedThresholdRequest): Promise<AutomationConfigResponse> {
		const res = await api.put<ApiEnvelope<AutomationConfigResponse>>("/automation/led-threshold", payload);
		return res.data.data;
	},
};

export { toErrorMessage };
