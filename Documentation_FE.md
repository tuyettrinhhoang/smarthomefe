# SmartHome Backend - FE Integration API Guide

Tài liệu này tổng hợp API BE để FE implement giao diện web (dashboard, điều khiển thiết bị, auth JWT, realtime SSE).

## 1) Tổng quan nhanh

- Base URL local: `http://localhost:8080`
- API prefix: `/api/v1`
- Mọi response theo wrapper:

```json
{
  "statusCode": 200,
  "message": "...",
  "data": {}
}
```

- Auth hiện tại:
  - Public: `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`
  - Protected (cần access token): các route `/api/v1/**` còn lại, bao gồm `GET /api/v1/auth/me`, dashboard, devices, automation, test sensors.

## 2) Authentication flow cho FE

## 2.1 Login

- **POST** `/api/v1/auth/login`
- Body:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

- Response `data` (`LoginResponse`):
  - `accessToken`: JWT dùng cho các API protected
  - `refreshToken`: JWT dùng để xin token mới
  - `tokenType`: luôn là `Bearer`
  - `expiresAt`: thời điểm hết hạn access token
  - `refreshExpiresAt`: thời điểm hết hạn refresh token
  - `username`

## 2.2 Refresh token

- **POST** `/api/v1/auth/refresh`
- Body:

```json
{
  "refreshToken": "<refresh-token-cu>"
}
```

- Response trả về cặp token mới (access + refresh).
- BE đang dùng cơ chế rotate refresh token (token cũ sẽ bị revoke sau khi refresh thành công).

## 2.3 Me (profile đang đăng nhập)

- **GET** `/api/v1/auth/me`
- Header bắt buộc:

```http
Authorization: Bearer <access-token>
```

- Response `data` (`MeResponse`):
  - `id`
  - `username`
  - `enabled`

## 2.4 Gợi ý FE token handling

- Lưu `accessToken` trong memory/state (ưu tiên) hoặc storage tùy policy của FE.
- Khi API 401:
  1. gọi `/auth/refresh` bằng `refreshToken`
  2. nếu refresh thành công -> retry request trước đó
  3. nếu refresh fail -> logout và về màn hình login

## 3) Dashboard APIs

## 3.1 Snapshot dashboard

- **GET** `/api/v1/dashboard`
- Header: `Authorization: Bearer <access-token>`
- `data` (`DashboardResponse`):
  - `temp`, `humi`, `light`, `pir` (`SensorLatestResponse`)
  - `led`, `fan` (`DeviceStatusResponse`)
  - `automationConfig` (`AutomationConfigResponse`)

## 3.2 Realtime dashboard (SSE)

- **GET** `/api/v1/dashboard/stream`
- Content type: `text/event-stream`
- Event BE gửi:
  - `dashboard.snapshot`: payload là `DashboardResponse`
  - `heartbeat`: payload chuỗi `"ok"`

Lưu ý quan trọng cho FE:

- Endpoint này đang là protected route (`/api/v1/**`).
- `EventSource` native của browser không set được custom `Authorization` header.
- FE cần 1 trong các phương án:
  - dùng thư viện/event-source polyfill có hỗ trợ header
  - hoặc đổi sang polling nếu chưa set được auth cho SSE
  - hoặc backend thay đổi policy endpoint stream (nếu team thống nhất)

## 4) Device APIs

Tất cả endpoint dưới cần header:

```http
Authorization: Bearer <access-token>
```

## 4.1 Lấy trạng thái thiết bị

- **GET** `/api/v1/devices/{deviceType}`
- `deviceType`: `LED` | `FAN`

## 4.2 Đổi mode thiết bị

- **PUT** `/api/v1/devices/{deviceType}/mode`
- Body:

```json
{
  "mode": "AUTO"
}
```

- `mode`: `MANUAL` | `AUTO`

## 4.3 Gửi lệnh tay

- **POST** `/api/v1/devices/{deviceType}/command`
- Body:

```json
{
  "state": "ON",
  "reason": "turn on from dashboard"
}
```

- `state`: `ON` | `OFF`
- `reason`: optional

## 5) Automation APIs

Tất cả endpoint dưới cần `Authorization`.

## 5.1 Lấy config automation

- **GET** `/api/v1/automation/config`

## 5.2 Cập nhật ngưỡng fan

- **PUT** `/api/v1/automation/fan-threshold`
- Body:

```json
{
  "lowTemp": 26,
  "highTemp": 30
}
```

Validation:

- `lowTemp`, `highTemp` trong khoảng `[0,100]`
- `highTemp >= lowTemp`

## 6) Sensor test API (hỗ trợ FE/dev)

- **POST** `/api/v1/test/sensors/ingest`
- Header: `Authorization: Bearer <access-token>`
- Body:

```json
{
  "sensorType": "LIGHT",
  "value": 20
}
```

- `sensorType`: `TEMP` | `HUMI` | `LIGHT` | `PIR`

Endpoint này hữu ích để demo UI realtime mà không cần thiết bị MQTT thật.

## 7) DTO shape chính FE cần render

## 7.1 SensorLatestResponse

```json
{
  "sensorType": "TEMP",
  "value": 31.5,
  "receivedAt": "2026-03-29T12:00:00Z"
}
```

## 7.2 DeviceStatusResponse

```json
{
  "deviceType": "LED",
  "mode": "AUTO",
  "state": "ON",
  "lastCommandPayload": "0",
  "lastCommandSource": "AUTOMATION",
  "lastCommandReason": "LIGHT <= 50",
  "lastCommandAt": "2026-03-29T12:00:00Z",
  "updatedAt": "2026-03-29T12:00:00Z"
}
```

## 7.3 AutomationConfigResponse

```json
{
  "fanLowTemp": 26,
  "fanHighTemp": 30,
  "ledOnThreshold": 50,
  "ledOffThreshold": 70,
  "pirAlertCooldownSeconds": 30
}
```

## 8) Error handling contract

Validation/business error thường trả:

```json
{
  "statusCode": 400,
  "message": "...",
  "data": null
}
```

Auth fail trả:

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "data": null
}
```

## 9) Enums FE cần dùng đúng chữ hoa

- `DeviceType`: `LED`, `FAN`
- `DeviceMode`: `MANUAL`, `AUTO`
- `DeviceState`: `ON`, `OFF`
- `SensorType`: `TEMP`, `HUMI`, `LIGHT`, `PIR`
- `CommandSource`: `MANUAL_USER`, `AUTOMATION`

## 10) Checklist implement FE

1. Làm màn hình login + store token.
2. Setup HTTP interceptor để tự động gán `Authorization`.
3. Setup auto refresh token khi gặp 401.
4. Mở dashboard bằng `GET /dashboard` (first snapshot).
5. Nối realtime stream `/dashboard/stream` (nếu đảm bảo gửi được auth header).
6. Render form điều khiển LED/FAN + update ngay sau command/mode change.
7. Render và update automation threshold.
8. Dùng `test/sensors/ingest` để test realtime flow khi dev.

## 11) Curl quick test

```bash
# Login
curl -X POST "http://localhost:8080/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"

# Me
curl -X GET "http://localhost:8080/api/v1/auth/me" \
  -H "Authorization: Bearer <access-token>"

# Dashboard
curl -X GET "http://localhost:8080/api/v1/dashboard" \
  -H "Authorization: Bearer <access-token>"

# Refresh
curl -X POST "http://localhost:8080/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"<refresh-token>\"}"
```

