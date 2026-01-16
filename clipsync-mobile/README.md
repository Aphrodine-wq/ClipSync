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

