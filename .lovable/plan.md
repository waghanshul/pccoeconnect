

# Fix Notification Tabs Layout

## Problem
The notification category tabs use a horizontal scrolling container (`overflow-x-auto`) that feels awkward. All 8 tabs are in one long row requiring scroll.

## Solution
Replace the horizontal scrolling tab bar with a **wrapping grid/flex layout** so all categories are visible at once without scrolling.

## Changes

### `src/components/notifications/NotificationTabs.tsx`
- Remove the `overflow-x-auto scrollbar-hide` wrapper div
- Change `TabsList` from `inline-flex w-max` to `flex flex-wrap w-full`
- Use a responsive grid or wrapping flex so tabs flow into 2 rows naturally
- Keep icons, labels, and count badges as-is
- Slightly increase tap target size for better accessibility

The result: all 8 category tabs visible in a compact 2-row wrapped layout, no horizontal scrolling needed.

