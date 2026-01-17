# ClipSync Mobile App

React Native mobile application for iOS and Android.

## Features

- ✅ Clipboard monitoring and capture
- ✅ Real-time sync across devices
- ✅ Offline support with local storage
- ✅ Biometric authentication (iOS/Android)
- ✅ Push notifications
- ✅ Native share extension (iOS)
- ✅ Material Design 3 UI (Android)

## Setup

### Prerequisites

- Node.js 18+
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)

### Installation

```bash
cd clipsync-mobile
npm install
```

### iOS Setup

```bash
cd ios
pod install
cd ..
npm run ios
```

### Android Setup

```bash
npm run android
```

## Development

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Configuration

Set environment variables in `.env`:

```
API_URL=https://api.clipsync.com
```

## iPhone Screenshot Automation

### Prerequisites

- macOS with Xcode installed
- Homebrew package manager
- Node.js 18+

### Quick Capture

The easiest way to capture iPhone screenshots:

```bash
# From ClipSync root directory
./scripts/capture-iphone-screenshots.sh
```

This will:
1. Install required tools (applesimutils, CocoaPods)
2. Build the iOS app for testing
3. Launch iPhone simulator
4. Capture all screenshots automatically
5. Save them to `clipsync-mobile/artifacts/`

### Manual Commands

```bash
# From clipsync-mobile directory

# Build iOS app for testing
npm run detox:build:ios

# Capture screenshots
npm run detox:screenshots:ios
```

### Detailed Guide

For complete documentation on iPhone screenshot automation, including:
- Physical device testing
- Custom screenshot scenarios
- Troubleshooting
- CI/CD integration

See: **[IPHONE_SCREENSHOT_GUIDE.md](./IPHONE_SCREENSHOT_GUIDE.md)**

## Testing

```bash
# Run unit tests
npm test

# Run Detox E2E tests (iOS)
npm run detox:test:ios
```

## Building

### iOS

```bash
cd ios
xcodebuild -workspace ClipSync.xcworkspace -scheme ClipSync -configuration Release
```

### Android

```bash
cd android
./gradlew assembleRelease
```

