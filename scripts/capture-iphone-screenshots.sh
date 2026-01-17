#!/bin/bash

# ClipSync iPhone Screenshot Capture Script
# This script automates the process of capturing screenshots on iPhone simulator

set -e

echo "🍎 ClipSync iPhone Screenshot Automation"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "clipsync-mobile" ]; then
    echo "❌ Error: Must be run from ClipSync root directory"
    exit 1
fi

# Navigate to mobile directory
cd clipsync-mobile

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: Xcode is not installed"
    echo "Please install Xcode from the Mac App Store"
    exit 1
fi

# Check if applesimutils is installed
if ! command -v applesimutils &> /dev/null; then
    echo "⚠️  applesimutils not found. Installing..."
    brew tap wix/brew
    brew install applesimutils
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if iOS pods are installed
if [ ! -d "ios/Pods" ]; then
    echo "📦 Installing iOS dependencies..."
    cd ios
    pod install
    cd ..
fi

# Build the app if needed
echo ""
echo "🔨 Building iOS app for testing..."
echo "This may take 5-10 minutes on first run..."
npm run detox:build:ios

# Run screenshot capture
echo ""
echo "📸 Capturing screenshots..."
npm run detox:screenshots:ios

# Show results
echo ""
echo "✅ Screenshot capture complete!"
echo ""
echo "📁 Screenshots saved to:"
echo "   clipsync-mobile/artifacts/"
echo ""

# List the screenshots
if [ -d "artifacts" ]; then
    echo "📸 Captured screenshots:"
    find artifacts -name "*.png" -type f | sort
    echo ""
fi

# Open artifacts folder
if command -v open &> /dev/null; then
    echo "Opening artifacts folder..."
    open artifacts
fi

echo ""
echo "✨ Done! Check the artifacts folder for your screenshots."
