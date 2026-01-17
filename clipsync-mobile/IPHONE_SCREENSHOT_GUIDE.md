# iPhone Screenshot Automation Guide

This guide explains how to capture automated screenshots of the ClipSync mobile app on iPhone using Detox.

## Prerequisites

### 1. Install Xcode and Command Line Tools

```bash
# Install Xcode from the Mac App Store
# Then install command line tools
xcode-select --install
```

### 2. Install Homebrew (if not already installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 3. Install Required Tools

```bash
# Install applesimutils (required for Detox iOS)
brew tap wix/brew
brew install applesimutils

# Install CocoaPods (if not already installed)
sudo gem install cocoapods

# Install Node dependencies
cd clipsync-mobile
npm install
```

### 4. Set Up iOS Project

```bash
# Navigate to iOS directory
cd ios

# Install iOS dependencies
pod install

# Go back to mobile root
cd ..
```

## Running Screenshot Automation

### Quick Start

```bash
# From the clipsync-mobile directory

# 1. Build the iOS app for testing
npm run detox:build:ios

# 2. Run the screenshot capture
npm run detox:screenshots:ios
```

Screenshots will be saved to: `clipsync-mobile/artifacts/`

### Step-by-Step Process

#### 1. Build the iOS App

```bash
npm run detox:build:ios
```

This compiles the iOS app in Release mode for the simulator. It may take 5-10 minutes on the first run.

#### 2. Run Screenshot Tests

```bash
npm run detox:screenshots:ios
```

This will:
- Launch the iPhone 15 Pro simulator
- Install the ClipSync app
- Run through all screenshot scenarios
- Save screenshots to the artifacts directory
- Generate logs for debugging

#### 3. Find Your Screenshots

Screenshots are saved to:
```
clipsync-mobile/artifacts/
└── ios.sim.release.iPhone 15 Pro/
    └── screenshots.e2e.js/
        ├── 01-onboarding-welcome.png
        ├── 02-auth-signin.png
        ├── 03-dashboard-main.png
        ├── 04-clipboard-history.png
        ├── 05-device-management.png
        ├── 06-settings.png
        ├── 07-biometric-prompt.png
        ├── 08-premium-paywall.png
        ├── 09-notification-settings.png
        └── 10-share-sheet.png
```

## Configuration Options

### Change iPhone Model

Edit `.detoxrc.js`:

```javascript
devices: {
  simulator: {
    type: 'ios.simulator',
    device: {
      type: 'iPhone 15 Pro Max'  // or 'iPhone 14', 'iPhone SE (3rd generation)', etc.
    }
  }
}
```

Available device types can be listed with:
```bash
xcrun simctl list devices
```

### Customize Screenshot Scenarios

Edit `e2e/screenshots.e2e.js` to:
- Add new test cases
- Modify navigation flows
- Change screenshot names
- Add delays or interactions

Example:
```javascript
it('should capture new feature', async () => {
  await element(by.id('new-feature-button')).tap();
  await waitFor(element(by.id('new-screen')))
    .toBeVisible()
    .withTimeout(5000);

  await device.takeScreenshot('11-new-feature');
});
```

## Troubleshooting

### Build Failures

**Issue**: Xcode build fails
```bash
# Clean build folder
cd ios
xcodebuild clean -workspace ClipSync.xcworkspace -scheme ClipSync
cd ..

# Reinstall pods
cd ios
pod deintegrate
pod install
cd ..
```

**Issue**: CocoaPods version mismatch
```bash
# Update CocoaPods
sudo gem install cocoapods
cd ios
pod repo update
pod install
cd ..
```

### Simulator Issues

**Issue**: Simulator doesn't launch
```bash
# Kill all simulators
killall Simulator

# Reset simulator
xcrun simctl erase all

# List available simulators
xcrun simctl list devices
```

**Issue**: App doesn't install on simulator
```bash
# Uninstall old version
xcrun simctl uninstall booted com.clipsync.mobile

# Rebuild
npm run detox:build:ios
```

### Test Failures

**Issue**: Elements not found
- Check that testID props are added to React Native components
- Increase timeout values in waitFor() calls
- Add delays between actions: `await new Promise(r => setTimeout(r, 1000))`

**Issue**: Authentication required
- Add mock authentication in test setup
- Use test credentials
- Mock backend API responses

### Screenshot Quality

**Issue**: Screenshots are too dark
- Check simulator appearance settings (Light vs Dark mode)
- Modify simulator settings before running tests

**Issue**: Wrong device size
- Verify device type in `.detoxrc.js`
- Ensure simulator is using correct resolution

## Running on Physical iPhone

To capture screenshots on a real device:

### 1. Update Detox Configuration

Edit `.detoxrc.js`:

```javascript
apps: {
  'ios.release': {
    type: 'ios.app',
    binaryPath: 'ios/build/Build/Products/Release-iphoneos/ClipSync.app',
    build: 'xcodebuild -workspace ios/ClipSync.xcworkspace -scheme ClipSync -configuration Release -sdk iphoneos -derivedDataPath ios/build CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO'
  }
},
devices: {
  iphone: {
    type: 'ios.device',
    device: {
      name: 'Your iPhone Name'  // Get from iOS Settings > General > About
    }
  }
},
configurations: {
  'ios.device.release': {
    device: 'iphone',
    app: 'ios.release'
  }
}
```

### 2. Connect Your iPhone

- Connect iPhone via USB
- Trust the computer on iPhone
- Find device name: `xcrun xctrace list devices`

### 3. Build and Run

```bash
# Build for device
detox build --configuration ios.device.release

# Run tests on device
detox test --configuration ios.device.release e2e/screenshots.e2e.js --take-screenshots all
```

**Note**: Physical device testing may require a paid Apple Developer account for code signing.

## Advanced Usage

### Generate Screenshots for App Store

```bash
# Run on multiple device sizes
npm run detox:screenshots:ios -- --device-name="iPhone 15 Pro Max"
npm run detox:screenshots:ios -- --device-name="iPhone 15 Pro"
npm run detox:screenshots:ios -- --device-name="iPhone SE (3rd generation)"
npm run detox:screenshots:ios -- --device-name="iPad Pro (12.9-inch) (6th generation)"
```

### Batch Processing

Create a script `capture-all-screenshots.sh`:

```bash
#!/bin/bash

DEVICES=("iPhone 15 Pro Max" "iPhone 15 Pro" "iPhone 14" "iPad Pro (12.9-inch)")

for device in "${DEVICES[@]}"; do
  echo "Capturing screenshots for $device"
  detox test --configuration ios.sim.release \
    --device-name="$device" \
    e2e/screenshots.e2e.js \
    --take-screenshots all \
    --artifacts-location "artifacts/$device"
done

echo "All screenshots captured!"
```

### Integration with CI/CD

For automated screenshot generation in CI:

```yaml
# .github/workflows/screenshots.yml
name: iOS Screenshots

on:
  push:
    branches: [main]

jobs:
  screenshots:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          brew tap wix/brew
          brew install applesimutils
          cd clipsync-mobile
          npm install
          cd ios && pod install && cd ..

      - name: Build iOS app
        run: cd clipsync-mobile && npm run detox:build:ios

      - name: Capture screenshots
        run: cd clipsync-mobile && npm run detox:screenshots:ios

      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        with:
          name: ios-screenshots
          path: clipsync-mobile/artifacts/
```

## Best Practices

1. **Keep tests deterministic**: Avoid relying on network requests or timers
2. **Use testIDs**: Add `testID` props to all interactive elements
3. **Add proper waits**: Use `waitFor()` instead of arbitrary delays
4. **Reset state**: Ensure each test starts from a clean state
5. **Organize screenshots**: Use clear naming conventions (01-screen-name.png)
6. **Test on multiple devices**: Capture screenshots for all required device sizes
7. **Version control**: Don't commit artifacts directory, add to .gitignore

## Resources

- [Detox Documentation](https://wix.github.io/Detox/)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)
- [App Store Screenshot Requirements](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications)

## Support

For issues with ClipSync iPhone automation:
1. Check the troubleshooting section above
2. Review Detox logs in `artifacts/` directory
3. Open an issue on the ClipSync repository
