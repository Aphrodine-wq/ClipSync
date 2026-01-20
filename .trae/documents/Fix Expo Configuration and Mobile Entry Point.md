The "iOS Bundling failed" error persists because the root directory is still configured as an Expo project (due to `.expo` folder and `tsconfig.json` extending Expo), causing tools to mistakenly treat the launcher script as a React Native entry point. Additionally, the mobile project is missing its entry point file.

I will fix this by completely decoupling the root from Expo and properly configuring the mobile project.

## 1. De-Expo the Root Directory
*   **Remove Expo Configuration**: Delete the `.expo` folder from the root directory.
*   **Update TypeScript Config**: Modify `tsconfig.json` in the root to be a standard Node.js configuration instead of extending `expo/tsconfig.base`.
*   **Cleanup**: Check for and remove `babel.config.js` in the root if it exists, as it's likely Expo-related.

## 2. Fix Mobile Project Structure (`clipsync-mobile`)
*   **Create Entry Point**: Create `clipsync-mobile/index.js` to register the main App component with `AppRegistry`.
*   **Create App Config**: Create `clipsync-mobile/app.json` to define the app name and display name required for the registry.

This will ensure the root acts purely as a launcher/monorepo root, while the mobile app functions independently in its own directory.