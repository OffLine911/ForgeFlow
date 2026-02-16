# macOS Notification Troubleshooting

## Problem
`osascript` notifications may not work on some macOS systems, even when the command runs without errors.

## Solutions

### Option 1: Install terminal-notifier (Recommended)
ForgeFlow will automatically use `terminal-notifier` if available, which is more reliable:

```bash
# Install via Homebrew
brew install terminal-notifier
```

After installation, restart ForgeFlow and notifications should work.

### Option 2: Fix osascript Permissions
1. Open **System Settings** → **Notifications**
2. Find your terminal app (Terminal.app, iTerm2, etc.) or ForgeFlow
3. Enable "Allow Notifications"
4. Restart the app

### Option 3: Check System Settings
- Disable **Do Not Disturb** mode (Control Center → Focus)
- Check **Focus** settings aren't blocking notifications
- Ensure **Screen Time** restrictions aren't blocking notifications

### Option 4: Test Manually
Run this in Terminal to verify osascript works:

```bash
osascript -e 'display notification "Test message" with title "Test" sound name "default"'
```

If nothing appears:
- Check Notification Center (top-right clock icon)
- Look in **System Settings** → **Notifications** → **Script Editor** or **Terminal**

## Technical Details
The updated implementation tries `terminal-notifier` first, then falls back to `osascript` with better error reporting. This provides maximum compatibility across different macOS configurations.
