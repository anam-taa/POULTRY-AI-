# Poultry AI (React Version)

This is the migrated React version of the Poultry AI application.

## Prerequisites
- Node.js v16+ (Verified on v16.13.1)

## Setup
1. Open the terminal in `poultry-ai-react` directory.
2. Install dependencies (if not already):
   ```bash
   npm install
   ```

## Running the App
Start the development server:
```bash
npm run dev
```
The app will likely start at `http://localhost:5173`.

## Architecture
- **Framework**: React 18 + Vite 4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Structure**:
  - `src/components/`: Shared UI (Sidebar, Auth)
  - `src/features/`: Feature pages (Dashboard, Upload, etc.)
  - `src/types.ts`: Shared types
  - `src/App.tsx`: Main routing and state management logic
