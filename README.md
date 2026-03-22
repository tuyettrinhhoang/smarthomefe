# Smart Home Frontend

A modern, responsive Smart Home management application built with React, TypeScript, and Vite.

## Features

- 🏠 Dashboard with device overview
- 💡 Device management and control
- 🎬 Scene automation
- ⚙️ Settings and preferences
- 📱 Mobile-responsive design
- 🔐 Secure API communication
- 🎨 Modern UI with Lucide icons
- 📊 Real-time device status

## Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Styling**: CSS3

## Project Structure

```
src/
├── components/          # Reusable components
├── pages/              # Page components
├── services/           # API services
│   └── api.ts
├── hooks/              # Custom hooks
│   └── index.ts
├── store/              # State management
│   └── appStore.ts
├── types/              # TypeScript types
│   └── index.ts
├── utils/              # Utility functions
│   └── index.ts
├── App.tsx             # Main App component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SmartHome_FE
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your API configuration:
```
VITE_API_URL=http://localhost:5000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Build for production:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

### Linting

Check code quality:
```bash
npm run lint
```

### Testing

Run tests:
```bash
npm run test
```

Run tests with UI:
```bash
npm run test:ui
```

## API Integration

The app expects a backend API at the configured `VITE_API_URL`. Update the API service in `src/services/api.ts` to match your backend endpoints.

### Example API Endpoints

- `GET /api/devices` - Get all devices
- `POST /api/devices` - Create device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `POST /api/devices/:id/toggle` - Toggle device

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request
