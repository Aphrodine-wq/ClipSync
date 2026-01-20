# ClipSync Mobile

This project has been converted to use the **Expo** framework.

## Prerequisites

- Node.js >= 18
- Expo Go app on your physical device (optional, for testing)
- Android Studio / Xcode (for native builds)

## Installation

```bash
npm install
```

## Running the App

### Start the Development Server
```bash
npx expo start
```
This will start the Metro Bundler. You can then:
- Scan the QR code with the **Expo Go** app (Android) or Camera app (iOS).
- Press `a` to run on Android Emulator.
- Press `i` to run on iOS Simulator.

### Clear Cache
If you encounter any issues, try clearing the cache:
```bash
npx expo start -c
```

## Project Structure

- **app.json**: Expo configuration.
- **index.js**: Entry point (uses `registerRootComponent`).
- **babel.config.js**: Configured with `babel-preset-expo`.
- **metro.config.js**: Configured with `@expo/metro-config`.
