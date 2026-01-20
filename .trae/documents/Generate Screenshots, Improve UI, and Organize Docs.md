I will proceed with the following steps to address your request:

### 1. Generate Advanced Screenshots via MCP

I will use the `Puppeteer` MCP tool to capture the **Paywall Modals** (Device Limit, Clip Limit, Storage Limit) which require manual triggering and were missed by the previous script.

* **Action**: Launch Puppeteer via MCP.

* **Action**: Navigate to the app and inject JavaScript to trigger each paywall modal.

* **Action**: Capture screenshots and save them to `screenshots/web/`.

* **Note**: For "VSCODE screenshots", I cannot capture the actual VS Code Desktop GUI via MCP, but I will ensure the **VS Code Extension** source code is verified and point you to the manual workflow for capturing it.

### 2. Improve UI/UX (Frontend)

I will enhance the **Pricing Screen** to be more visually appealing and interactive.

* **File**: `clipsync-app/src/components/PricingScreen.jsx`

* **Changes**:

  * Add hover effects and transitions to pricing cards.

  * Improve spacing and typography using Tailwind CSS.

  * Ensure responsive layout is polished.

### 3. Organize and Update Documentation

I will clean up the project root by moving scattered documentation into the `docs/` directory.

* **Action**: Move root Markdown files (e.g., `ARCHITECTURE-DIAGRAM.md`, `BUILD-WINDOWS.md`, `SCREENSHOT_CAPTURE_WORKFLOW.md`, etc.) into `docs/`.

* **Action**: Create/Update `docs/README.md` as a central index.

* **Action**: Update the root `README.md` to link to the new locations.

* **Action**: Update `docs/SCREENSHOT_CAPTURE_WORKFLOW.md` to reflect that Web screenshots are now automated via MCP.

### 4. Verification

* **Verify**: Ensure the web app still runs correctly after UI changes.

* **Verify**: Check that new screenshots are generated.

* **Verify**: Confirm documentation links work.

