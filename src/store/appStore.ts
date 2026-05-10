import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
	DashboardResponse,
	DeviceStatusResponse,
	LoginResponse,
	MeResponse,
} from "@/types";

type AuthState = {
	accessToken: string | null;
	refreshToken: string | null;
	username: string | null;
	me: MeResponse | null;
};

type DataState = {
	dashboard: DashboardResponse | null;
	led: DeviceStatusResponse | null;
	fan: DeviceStatusResponse | null;
};

type AppState = AuthState &
	DataState & {
		setAuthFromLogin: (payload: LoginResponse) => void;
		setAuthTokens: (accessToken: string, refreshToken: string) => void;
		setMe: (me: MeResponse | null) => void;
		logout: () => void;
		setDashboard: (dashboard: DashboardResponse | null) => void;
		setDeviceStatus: (device: DeviceStatusResponse) => void;
	};

const initialAuthState: AuthState = {
	accessToken: null,
	refreshToken: null,
	username: null,
	me: null,
};

const initialDataState: DataState = {
	dashboard: null,
	led: null,
	fan: null,
};

export const useAppStore = create<AppState>()(
	persist(
		(set) => ({
			...initialAuthState,
			...initialDataState,
			setAuthFromLogin: (payload) =>
				set({
					accessToken: payload.accessToken,
					refreshToken: payload.refreshToken,
					username: payload.username,
				}),
			setAuthTokens: (accessToken, refreshToken) =>
				set({
					accessToken,
					refreshToken,
				}),
			setMe: (me) => set({ me }),
			logout: () =>
				set({
					...initialAuthState,
					...initialDataState,
				}),
			setDashboard: (dashboard) =>
				set({
					dashboard,
					led: dashboard?.led ?? null,
					fan: dashboard?.fan ?? null,
				}),
			setDeviceStatus: (device) =>
				set((state) => ({
					led: device.deviceType === "LED" ? device : state.led,
					fan: device.deviceType === "FAN" ? device : state.fan,
				})),
		}),
		{
			name: "smarthome-fe-store",
			partialize: (state) => ({
				accessToken: state.accessToken,
				refreshToken: state.refreshToken,
				username: state.username,
			}),
		}
	)
);
