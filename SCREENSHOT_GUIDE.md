# ClipSync Screenshot Guide - Visual Mockup Descriptions

This guide describes exactly what each screenshot should look like when captured from the fully upgraded ClipSync platform.

---

## WEB APPLICATION SCREENSHOTS

### 1. Authentication Modal

**Location**: When loading app without authentication
**File**: `clipsync-app/src/components/AuthModal.jsx`
**Dimensions**: 600x700px (modal, full page bg behind)

**Visual Layout**:
```
┌─ Welcome Modal ─────────────────────────────────────┐
│                                                       │
│  [X] (close button, top right)                      │
│                                                       │
│                    [Y] ClipSync                       │
│                                                       │
│        Welcome to ClipSync                           │
│   Sign in to sync clipboard across devices           │
│                                                       │
│   [ERROR BOX IF ERROR] (red bg, white text)         │
│                                                       │
│   ┌─────────────────────────────────────────┐       │
│   │  [Google icon] Sign in with Google      │       │
│   └─────────────────────────────────────────┘       │
│                                                       │
│   ┌─────────────────────────────────────────┐       │
│   │  [GitHub icon] Continue with GitHub     │       │
│   └─────────────────────────────────────────┘       │
│                                                       │
│   "Signing in..." [spinner]  (if loading)            │
│                                                       │
│   ─────────────── FEATURES ───────────────────      │
│   🔄 Sync across all your devices                    │
│   📋 Unlimited clipboard history                     │
│   🔒 End-to-end encryption                          │
│   👥 Team collaboration                             │
│                                                       │
│   By signing in, you agree to Terms & Privacy Policy │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Colors**:
- Background: White
- Google Button: Light gray with Google logo
- GitHub Button: Zinc-900 (dark gray) with white text
- Features: Dark zinc text on white
- Text: Zinc-600 for descriptions

**Key Elements**:
- ✅ Google Sign-In button (standard Google styling)
- ✅ GitHub Sign-In button (new, with GitHub logo)
- ✅ Y logo in circle (ClipSync branding)
- ✅ Features list with icons
- ✅ Privacy notice at bottom

---

### 2. Pricing Screen

**Location**: `/pricing` route
**File**: `clipsync-app/src/components/PricingScreen.jsx`
**Dimensions**: Full screen (1920x1080 recommended)

**Visual Layout**:
```
← Back Button

    Simple, Transparent Pricing
    Start free, upgrade when you need more. No credit card required.

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│    🚀    │  │    ⚡    │  │    💼    │  │    👑    │
│          │  │          │  │          │  │          │
│  Free    │  │Professional(highlighted)   Business  │  Enterprise
│ Personal │  │ Power users │ Teams      │  Unlimited
│          │  │ MOST POPULAR│          │  Custom
│  $0      │  │  $9.99     │  $19.99   │  Pricing
│ forever  │  │  /month    │  /month   │
│          │  │  (scaled 105%)(shadow)   │          │
│          │  │            │          │          │
│ Features │  │ Features   │ Features │ Features
│ • 50 clips  │ • 500 clips│ • 5,000 clips│ • ∞
│ • 1 device  │ • 3 devices│ • 10 devices │ • ∞
│ • 100MB storage │ • 1GB │ • 10GB  │ • ∞
│ • Basic search  │ • Advanced search  │ • AI Search │ • Full AI
│ • No team   │ • 5 members │ • 50 members│ • ∞
│ • No API    │ • API access│ • API access│ • Webhooks
│ • No support│ • Email support│ • Priority support│ • 24/7
│          │            │          │          │
│[Current] │[Upgrade Now]│[Upgrade Now]│[Contact]
└──────────┘  └──────────┘  └──────────┘  └──────────┘

        Feature Comparison Table
┌─ Feature ─────────┬─Free─┬─Pro─┬─Business─┬─Enterprise─┐
│ Clips per month   │ 50  │ 500 │ 5,000   │ ∞         │
│ Devices          │ 1   │ 3   │ 10      │ ∞         │
│ Storage          │100MB│ 1GB │ 10GB    │ ∞         │
│ Cross-device sync│ ✗   │ ✓   │ ✓       │ ✓         │
│ Team collab      │ ✗   │5 mb │50 mb    │ ∞         │
│ API access       │ ✗   │ ✓   │ ✓       │ ✓         │
│ AI search        │ ✗   │ ✗   │ ✓       │ ✓         │
│ Priority support │ ✗   │ ✓   │ ✓       │ ✓         │
└──────────────────┴─────┴─────┴─────────┴───────────┘

     Frequently Asked Questions
▶ Can I change my plan anytime?
  Yes, upgrade or downgrade at any time. Changes take effect immediately.

▶ What happens if I exceed my limit?
  You can still use ClipSync, but you'll see an upgrade prompt...

▶ Do you offer a trial period?
  Yes! Start with our free plan...

▶ What payment methods do you accept?
  All major credit cards, PayPal...
```

**Colors**:
- Free/Business: White background, zinc border
- Professional: Gradient (indigo-600 to purple-600), white text, highlighted
- Enterprise: White background
- Table: White with gray header, Professional row highlighted in indigo

**Key Elements**:
- ✅ 4 pricing cards in grid layout
- ✅ Professional card highlighted with "MOST POPULAR" badge
- ✅ Professional card slightly larger (scale-105) and has shadow
- ✅ Feature list with check marks ✓ and crosses ✗
- ✅ Comparison table below all cards
- ✅ FAQ section with expandable details
- ✅ All interactive buttons functional

---

### 3. Clipboard History / Dashboard

**Location**: `/` or `/history` route
**File**: `clipsync-app/src/components/HistoryScreen.jsx`
**Dimensions**: Full screen (1920x1080)

**Visual Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ [☰] ClipSync    [Search...] [Filter: All ▾]  [User Avatar]  │
│ Modern Navigation Bar                                        │
└─────────────────────────────────────────────────────────────┘

  📋 History                [Filters]
┌──────────────────────────────────────────────────────────────┐
│ Search: [_______________]  Filter: [All ▾]                   │
│                           Types: Code  JSON  URL  Image       │
├──────────────────────────────────────────────────────────────┤
│ Today                                                          │
├──────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [📄 Code] const handler = () => { return data; }        │ │
│ │ 2:30 PM • Code Clip                  [📌] [📋] [🔗]      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [🎨 Color] #FF6B6B                                      │ │
│ │ 2:15 PM • Color Value                [📌] [📋] [🔗]      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [🔗 URL] https://example.com/article                   │ │
│ │ 1:45 PM • URL                        [📌] [📋] [🔗]      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ Yesterday                                                    │
├──────────────────────────────────────────────────────────────┤
│ [More clips...]                                              │
└──────────────────────────────────────────────────────────────┘

[+] Floating Action Button (bottom right)
```

**Colors**:
- Nav background: Dark zinc-900 or indigo
- Clip cards: White with light border
- Icons: Colored (code=indigo, URL=blue, color=rainbow, etc)
- Type badges: Colored backgrounds

**Key Elements**:
- ✅ Search bar at top
- ✅ Filter bar (All/Code/JSON/URL/Images)
- ✅ Date grouping (Today, Yesterday, etc)
- ✅ Clip cards with preview
- ✅ Action buttons: Pin, Copy, Share
- ✅ Floating Action Button for new clip
- ✅ Virtual scrolling for performance

---

### 4. Settings - Device Management

**Location**: `/settings#devices` or `/settings/devices`
**File**: `clipsync-app/src/components/DeviceManagement.jsx`
**Dimensions**: Panel within settings (400x600px)

**Visual Layout**:
```
Device Management

1 of 1 devices
Device limit reached. Upgrade to add more. ⚠

┌──────────────────────────────────────────────────┐
│ [💻] MacBook Pro (Desktop)                       │
│      web                   Last activity: Today  │
│                                                  │
│                                          [🗑️]  │
└──────────────────────────────────────────────────┘

Device Usage
                                            1 / 1
┌───────────────────────────────────────────────┐
│████████████████████████████████████████│ 100%│
└───────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ Your free plan includes 1 device                │
│                                                 │
│ [Upgrade Plan] (button)                        │
└────────────────────────────────────────────────┘
```

**Colors**:
- Device icon: Indigo-100 background, indigo-600 icon
- Device name: Dark zinc text
- Type badge: Zinc-200 background
- Usage bar: Red (100% full)
- Upgrade box: Indigo-50 background, indigo border

**Key Elements**:
- ✅ Device list with icons
- ✅ Device type and last activity shown
- ✅ Delete button for each device
- ✅ Usage progress bar
- ✅ Plan info box
- ✅ Upgrade button visible when at limit

---

### 5. Settings - Usage Quota

**Location**: `/settings#quota` or `/settings/quota`
**Files**: `clipsync-app/src/components/UsageQuota.jsx`
**Dimensions**: Panel within settings (600x400px)

**Visual Layout**:
```
Clips This Month              Storage Usage
┌─────────────────────────┐  ┌─────────────────────────┐
│ [📈]                    │  │ [💾]                    │
│ Clips This Month        │  │ Storage Usage           │
│ Monthly allowance       │  │ Cloud storage           │
│                   [Good]│  │               [Getting] │
│ 25 / 50 clips           │  │ 75 / 100 MB              │
│ 50%                     │  │ 75%                     │
│ ├─────░░░░░░░░░░░░┤    │  │ ├────────░░░░░░░░┤     │
│                         │  │                         │
│ 25 clips remaining      │  │ 25 MB available         │
│ this month              │  │                         │
└─────────────────────────┘  └─────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Current Plan: Free                                   │
│ 50 clips/month, 100MB storage                       │
│                                                     │
│ [Upgrade Now] (button, if at limit)               │
└─────────────────────────────────────────────────────┘
```

**Colors**:
- Clips card: Green-50 background with green progress bar
- Storage card: Amber-50 background with amber progress bar (75%)
- Progress bars: Green for <80%, Amber for 80-99%, Red for 100%
- Icons: Indigo-100 background

**Key Elements**:
- ✅ Side-by-side quota displays
- ✅ Color-coded progress bars
- ✅ Usage percentage shown
- ✅ Remaining allocation calculated
- ✅ Plan info displayed
- ✅ Upgrade button when needed

---

### 6. Paywall Modal - Device Limit

**Location**: Triggered when adding 2nd device on Free plan
**File**: `clipsync-app/src/components/PaywallModal.jsx`
**Dimensions**: 500x600px centered modal

**Visual Layout**:
```
┌─ Paywall Modal ──────────────────────────────────┐
│ ┌──────────────────────────────────────────────┐ │
│ │ [Gradient Background: Purple→Blue→Indigo]  [X]│ │
│ │                                                 │
│ │ [⚠️] Device Limit Reached                       │
│ │     Upgrade to unlock more                      │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ ┌──────────────────────────────────────────────┐ │
│ │ Current Plan              [free]               │ │
│ │ Devices Used             2 / 1                 │ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ Your free plan allows 1 device.                   │
│ You're currently using 2 devices.                 │
│                                                   │
│ Upgrade to Professional to use ClipSync on       │
│ 3 devices or more.                               │
│                                                   │
│ Upgrade to Professional Plan:                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ [⚡] Increased usage limits          [✓]      │ │
│ │ [∞]  More devices and storage        [✓]      │ │
│ │ [🛡️] Priority support               [✓]      │ │
│ └──────────────────────────────────────────────┘ │
│                                                   │
│ [Maybe Later]  [Upgrade Now →]                  │
│                                                   │
└───────────────────────────────────────────────────┘
```

**Colors**:
- Header: Gradient (purple-600 → blue-600 → indigo-700)
- Status box: Zinc-50 background
- Feature list: Indigo-50 background with indigo borders
- Buttons: Gray for "Maybe Later", Indigo gradient for "Upgrade Now"

**Key Elements**:
- ✅ Gradient header with icon
- ✅ Current status box (plan and usage)
- ✅ Clear explanation of limit
- ✅ Features list showing upgrade benefits
- ✅ Two CTA buttons (dismiss and upgrade)
- ✅ Smooth slide-up animation

---

### 7. Paywall Modal - Clip Limit

**Visual Layout** (same structure as Device Limit, but):
- Header: "Monthly Clip Limit Reached"
- Status: "Clips Created" instead of "Devices Used"
- Example: "25 / 50 clips (this month)"
- Reset date shown: "Your limit resets on Feb 1"
- Message: "Upgrade to create more clips this month"

---

### 8. Paywall Modal - Storage Limit

**Visual Layout** (same structure, but):
- Header: "Storage Limit Reached"
- Status: "Storage Used" instead
- Example: "98 / 100 MB"
- Message: "Upgrade to get more storage space"

---

## DESKTOP APPLICATION SCREENSHOTS

### 1. Main Window

**File**: `clipsync-desktop/src/renderer/windows/MainWindow.jsx`
**Dimensions**: 1000x700px

**Visual Layout**:
```
ClipSync
┌───────────────────────────────────────────────────────┐
│ [≡] ClipSync     🔄 Syncing...    ⚙ Settings  [□][–][×]│
│ Style: Modern dark with Tailwind styling              │
├───────────────────────────────────────────────────────┤
│ Search:  [_______________]  Filter: [All ▾]          │
├───────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐   │
│ │ const handler = () => { /* code */ }            │   │
│ │ 2:30 PM • JavaScript      [📌] [📋] [🔗]         │   │
│ └─────────────────────────────────────────────────┘   │
│                                                        │
│ ┌─────────────────────────────────────────────────┐   │
│ │ #FF6B6B Color Palette                          │   │
│ │ 2:15 PM                  [📌] [📋] [🔗]         │   │
│ └─────────────────────────────────────────────────┘   │
│                                                        │
│ [+ New Clip]                                          │
└───────────────────────────────────────────────────────┘

System Tray:
┌─ ClipSync ─────────┐
│ Open              │
│ ─────────────────  │
│ Settings          │
│ Quit              │
└───────────────────┘
```

**Key Elements**:
- ✅ Title bar with app name
- ✅ Sync status indicator
- ✅ Settings access
- ✅ Clip list with search/filter
- ✅ New clip button
- ✅ System tray menu

---

### 2. Settings Window - Device & Plan Info

**Dimensions**: 600x500px

**Visual Layout**:
```
Settings - Device Management

Device Information
┌──────────────────────────────────────────────┐
│ Device ID: abc123def456                      │
│ Device Name: MacBook Pro                     │
│ Type: Desktop                                │
│ Last Activity: Just now                      │
│ Registered: Jan 15, 2026                     │
└──────────────────────────────────────────────┘

Plan Information
┌──────────────────────────────────────────────┐
│ Current Plan: Free                           │
│ Status: Active                               │
│                                              │
│ Features:                                    │
│ • 50 clips per month                         │
│ • 1 device (you're using it now)            │
│ • 100MB storage                              │
│ • Offline support                            │
│                                              │
│ [Upgrade to Professional]                   │
└──────────────────────────────────────────────┘

[ Close ]
```

---

## MOBILE APPLICATION SCREENSHOTS

### 1. iOS Login Screen

**Device**: iPhone 14 Pro (390x844px)
**File**: `clipsync-mobile/src/screens/AuthScreen.tsx`

**Visual Layout**:
```
                    [Status Bar]
                   12:45 ◀ 100% 🔋

          [Background Gradient: Indigo→Purple]

                [Y] ClipSync Logo
                (large, centered)


          Welcome to ClipSync


    Sign in to sync across all devices


     ┌─────────────────────────────────┐
     │  🔍  Continue with Google        │
     └─────────────────────────────────┘


     ┌─────────────────────────────────┐
     │ [GitHub] Continue with GitHub    │
     └─────────────────────────────────┘


  What you get with ClipSync:
  🔄 Sync across devices
  📋 Clipboard history
  🔒 End-to-end encryption
  👥 Team collaboration


    By signing in you agree to
    Terms of Service & Privacy Policy

        [iPhone home indicator]
```

**Colors**:
- Background: Gradient (indigo-600 → purple-600)
- Buttons: White/black with rounded corners
- Text: White on dark background

---

### 2. Android Home Screen

**Device**: Pixel 6 (412x915px)

**Visual Layout**:
```
[Status Bar] Time  Wifi  Battery

≡ ClipSync        🔄 [Search] [⚙]
────────────────────────────────────────

History


┌──────────────────────────────────┐
│ const handler = async () => {    │
│ 2:30 PM • Code      [📌][📋][🔗] │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ https://example.com              │
│ 2:15 PM • URL        [📌][📋][🔗]│
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ @import url(...);                │
│ 1:45 PM • CSS        [📌][📋][🔗]│
└──────────────────────────────────┘



      [+ Floating Action Button]

────────────────────────────────────
[Home] [Search] [Favorites] [Settings]
```

---

### 3. Settings - Device Management (Mobile)

**Visual Layout**:
```
⬅ Settings

Device Management

You're using 1 of 1 devices

Your free plan allows 1 device
Upgrade to add more.  [⚠]


Registered Devices

┌────────────────────────────────┐
│ [📱] iPhone                     │
│ Mobile                          │
│ Active now                      │
│                      [Delete]   │
└────────────────────────────────┘

[Upgrade Plan]
```

---

## BROWSER EXTENSION SCREENSHOTS

### 1. Chrome Extension Popup

**Dimensions**: 390x600px

**Visual Layout**:
```
ClipSync Clipboard

┌──────────────────────────────┐
│ [Search clips...]            │
└──────────────────────────────┘

Recent Clips

┌──────────────────────────────┐
│ const handler = () => {      │
│ 2:30 PM                  [📋]│
└──────────────────────────────┘

┌──────────────────────────────┐
│ #FF6B6B                      │
│ 2:15 PM                  [📋]│
└──────────────────────────────┘

┌──────────────────────────────┐
│ https://example.com          │
│ 1:45 PM                  [📋]│
└──────────────────────────────┘

"You've reached your clip limit
this month. Upgrade to continue."

[Upgrade] [Settings]

────────────────────────────────
❤️ Favorites  ⚙ Settings
```

---

### 2. Firefox Extension Popup

Same as Chrome, with Firefox styling.

---

## VS CODE EXTENSION SCREENSHOTS

### 1. Sidebar Panel

**Location**: VS Code Activity Bar (left side)
**Width**: 300px

**Visual Layout**:
```
CLIPSYNC

┌──────────────────────────┐
│ 🔍 [Search clips...]     │
└──────────────────────────┘

Recent Clips
├── 📄 index.js
│   └── const handler = () => {}
├── 🎨 Colors
│   └── #FF6B6B
├── 🔗 URLs
│   └── example.com
└── 📋 Text
    └── Some text content

Favorites
├── 🌟 Important Snippet
├── 🌟 API Response
└── 🌟 SQL Query

[Device Limit Alert!]
You're using 2 of 1 devices
[Upgrade]
```

---

### 2. Command Palette Integration

**Trigger**: Cmd+Shift+V (Mac) or Ctrl+Shift+V (Windows/Linux)

**Visual Output**:
```
> ClipSync: Paste from History
> ClipSync: Search Clips
> ClipSync: Save as Snippet
> ClipSync: Transform Text
> ClipSync: Open Settings
```

---

## Color Palette Reference

**Primary Colors**:
- Indigo-600: `#4F46E5` - Primary action buttons
- Indigo-700: `#4338CA` - Hover state
- Purple-600: `#9333EA` - Gradients
- Blue-600: `#2563EB` - Secondary elements

**Neutral Colors**:
- Zinc-900: `#18181B` - Dark text, headers
- Zinc-700: `#3F3F46` - Secondary text
- Zinc-600: `#52525B` - Description text
- Zinc-50: `#FAFAFA` - Light backgrounds
- Zinc-200: `#E4E4E7` - Borders

**Status Colors**:
- Green-500: `#22C55E` - Success, Good status
- Amber-500: `#F59E0B` - Warning, Caution
- Red-500: `#EF4444` - Error, Limit reached

**Semantic Colors**:
- Success: Green-50 bg, Green-500 bar
- Warning: Amber-50 bg, Amber-500 bar
- Error: Red-50 bg, Red-500 bar

---

## Typography Reference

**Headings**:
- H1: 32-40px, Bold (text-4xl)
- H2: 24-28px, Bold (text-2xl)
- H3: 18-20px, Semibold (text-lg)

**Body**:
- Regular: 14-16px (text-sm, text-base)
- Small: 12px (text-xs)

**Fonts**:
- Primary: System Font Stack or Inter
- Monospace: Fira Code or Monaco for code blocks

---

## Animation Reference

**Transitions**:
- Fade In: 200ms ease-out
- Slide Up: 300ms ease-out (modals)
- Hover: 150ms ease-out (buttons)

**Progress Bars**:
- Fill animation: Color change on threshold
- Smooth width transition: 300ms

---

## Screenshot Capture Instructions

### For Web App:
1. Open DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Set to 1920x1080 for desktop or responsive
4. Navigate to each route
5. Screenshot with full window

### For Desktop App:
1. Build desktop app: `npm run build` in clipsync-desktop
2. Run the app
3. Navigate through windows
4. Use OS screenshot tool (Win+Shift+S, Cmd+Shift+4, etc)

### For Mobile:
1. Use iOS Simulator (Xcode) or Android Emulator
2. Navigate through screens
3. Screenshot from simulator
4. Crop to device frame

### For Extensions:
1. Load extension in dev mode
2. Click extension icon
3. Take popup screenshot
4. Use browser DevTools for element details

---

## Quality Checklist for Screenshots

- [ ] All text is readable (minimum 12px)
- [ ] Colors are accurate to specification
- [ ] No personal data visible (use placeholder data)
- [ ] All interactive elements are visible
- [ ] Consistent styling across all screenshots
- [ ] Mobile screenshots show full viewport
- [ ] Desktop screenshots at standard resolution
- [ ] High quality (no artifacts, 72dpi minimum)
- [ ] Consistent naming convention (web_auth.png, web_pricing.png, etc)
- [ ] Organized in `/screenshots` directory

---

**Total Screenshots Expected**: 25-30 across all platforms
