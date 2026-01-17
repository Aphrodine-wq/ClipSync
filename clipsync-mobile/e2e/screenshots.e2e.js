describe('ClipSync iOS Screenshots', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: { notifications: 'YES', clipboard: 'YES' }
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should capture onboarding screen', async () => {
    // Wait for the onboarding screen to load
    await waitFor(element(by.text('Welcome to ClipSync')))
      .toBeVisible()
      .withTimeout(10000);

    // Take screenshot
    await device.takeScreenshot('01-onboarding-welcome');
  });

  it('should capture authentication screen', async () => {
    // Navigate to auth screen if needed
    await element(by.text('Get Started')).tap();

    await waitFor(element(by.text('Sign In')))
      .toBeVisible()
      .withTimeout(5000);

    await device.takeScreenshot('02-auth-signin');
  });

  it('should capture main dashboard after login', async () => {
    // Note: You'll need to implement login logic here
    // For now, this is a placeholder

    // Fill in email
    await element(by.id('email-input')).typeText('demo@clipsync.com');

    // Fill in password
    await element(by.id('password-input')).typeText('demo123');

    // Tap sign in
    await element(by.text('Sign In')).tap();

    // Wait for dashboard
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(10000);

    await device.takeScreenshot('03-dashboard-main');
  });

  it('should capture clipboard history', async () => {
    // Navigate to clipboard history
    await element(by.id('history-tab')).tap();

    await waitFor(element(by.id('clipboard-history')))
      .toBeVisible()
      .withTimeout(5000);

    await device.takeScreenshot('04-clipboard-history');
  });

  it('should capture device management', async () => {
    // Navigate to devices
    await element(by.id('devices-tab')).tap();

    await waitFor(element(by.id('devices-screen')))
      .toBeVisible()
      .withTimeout(5000);

    await device.takeScreenshot('05-device-management');
  });

  it('should capture settings screen', async () => {
    // Navigate to settings
    await element(by.id('settings-tab')).tap();

    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(5000);

    await device.takeScreenshot('06-settings');
  });

  it('should capture biometric authentication prompt', async () => {
    // Enable biometric in settings
    await element(by.id('biometric-toggle')).tap();

    await waitFor(element(by.text('Enable Biometric Authentication')))
      .toBeVisible()
      .withTimeout(5000);

    await device.takeScreenshot('07-biometric-prompt');
  });

  it('should capture premium/paywall screen', async () => {
    // Navigate to premium features
    await element(by.id('premium-button')).tap();

    await waitFor(element(by.text('ClipSync Premium')))
      .toBeVisible()
      .withTimeout(5000);

    await device.takeScreenshot('08-premium-paywall');
  });

  it('should capture notification settings', async () => {
    // Go back to settings
    await element(by.id('back-button')).tap();

    // Tap on notifications
    await element(by.text('Notifications')).tap();

    await waitFor(element(by.id('notification-settings')))
      .toBeVisible()
      .withTimeout(5000);

    await device.takeScreenshot('09-notification-settings');
  });

  it('should capture share sheet', async () => {
    // Navigate back to clipboard
    await element(by.id('history-tab')).tap();

    // Long press on a clip to share
    await element(by.id('clip-item-0')).longPress();

    await waitFor(element(by.text('Share')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.text('Share')).tap();

    // Wait a moment for share sheet
    await new Promise(resolve => setTimeout(resolve, 1000));

    await device.takeScreenshot('10-share-sheet');
  });
});
