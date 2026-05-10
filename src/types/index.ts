export type ApiEnvelope<T> = {
	statusCode: number;
	message: string;
	data: T;
};

export type DeviceType = "LED" | "FAN";
export type DeviceMode = "MANUAL" | "AUTO";
export type DeviceState = "ON" | "OFF";
export type SensorType = "TEMP" | "HUMI" | "LIGHT" | "PIR";
export type CommandSource = "MANUAL_USER" | "AUTOMATION" | "SYSTEM";

export interface LoginRequest {
	username: string;
	password: string;
}

export interface LoginResponse {
	accessToken: string;
	refreshToken: string;
	tokenType: string;
	expiresAt: string;
	refreshExpiresAt: string;
	username: string;
}

export interface RefreshTokenRequest {
	refreshToken: string;
}

export type RefreshTokenResponse = LoginResponse;

export interface MeResponse {
	id: number;
	username: string;
	enabled: boolean;
}

export interface SensorLatestResponse {
	sensorType: SensorType;
	value: number;
	receivedAt: string;
}

export interface DeviceStatusResponse {
	deviceType: DeviceType;
	mode: DeviceMode;
	state: DeviceState;
	lastCommandPayload: string;
	lastCommandSource: CommandSource;
	lastCommandReason?: string;
	lastCommandAt?: string;
	updatedAt: string;
}

export interface AutomationConfigResponse {
	fanLowTemp: number;
	fanHighTemp: number;
	ledOnThreshold: number;
	ledOffThreshold: number;
	pirAlertCooldownSeconds: number;
}

export interface DashboardResponse {
	temp: SensorLatestResponse | null;
	humi: SensorLatestResponse | null;
	light: SensorLatestResponse | null;
	pir: SensorLatestResponse | null;
	led: DeviceStatusResponse | null;
	fan: DeviceStatusResponse | null;
	automationConfig: AutomationConfigResponse | null;
}

export interface UpdateDeviceModeRequest {
	mode: DeviceMode;
}

export interface SendDeviceCommandRequest {
	state: DeviceState;
	reason?: string;
}

export interface UpdateFanThresholdRequest {
	lowTemp: number;
	highTemp: number;
}

export interface UpdateLedThresholdRequest {
	onThreshold: number;
	offThreshold: number;
}