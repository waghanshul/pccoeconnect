

# Complete Frontend Redesign — Twitter/X-Inspired with Left Sidebar

## Overview

Transform the entire post-login experience from the current top-nav + centered single-column layout into a **Twitter/X-inspired design** with a persistent left sidebar, centered content feed, and polished, professional styling across all pages. The landing page and auth flow stay as-is. Backend logic, Supabase queries, and all data services remain untouched.

## New Layout Architecture

```text
┌──────────────────────────────────────────────────┐
│  Desktop (≥768px)                                │
│ ┌─────────┬──────────────────────────────────┐   │
│ │ Sidebar │  Main Content Area               │   │
│ │  (240px)│  (centered, max-w-2xl)           │   │
│ │         │                                  │   │
│ │  Logo   │  [Page-specific content]         │   │
│ │  Home   │                                  │   │
│ │  Connect│                                  │   │
│ │  Messages│                                 │   │
│ │  Notifs │                                  │   │
│ │  Profile│                                  │   │
│ │  Settings│                                 │   │
│ │         │                                  │   │
│ │  Logout │                                  │   │
│ └─────────┴──────────────────────────────────┘   │
│                                                  │
│  Mobile (<768px)                                 │
│ ┌──────────────────────────────────────────────┐ │
│ │  Top bar (logo + icons)                      │ │
│ │  Main content (full width)                   │ │
│ │  Bottom tab bar (same 5 tabs)                │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

## Design Tokens & Styling Updates

### `src/index.css`
- Refine the color palette for sharper contrast — slightly lighter card backgrounds, crisper borders
- Add utility classes: `.sidebar-item`, `.content-panel` for consistent layout primitives
- Remove the `glass-card` / `glass-surface` classes — replace with solid surface cards (per visual identity guidelines)

## Component Changes

### 1. New: `src/components/layout/AppSidebar.tsx`
- Persistent left sidebar (w-60) visible on desktop only
- Contains: Logo at top, nav links (Home, Connections, Messages, Notifications, Profile, Settings) with icons + text labels
- Active state: highlighted background + primary color text
- User avatar + name at bottom with logout button
- Notification badge count on the Notifications link (reuse existing `fetchNotificationCount` logic)

### 2. New: `src/components/layout/AppLayout.tsx`
- Shared layout wrapper used by all post-login pages
- Desktop: `flex` with `AppSidebar` on left + scrollable main content area on right
- Mobile: top bar + content + bottom tab bar (similar to now but refined)
- Replaces the `<Navigation />` import in every page

### 3. Remove/Deprecate: `src/components/Navigation.tsx`
- Logic moves into `AppSidebar` (desktop) and refined `BottomTabBar` (mobile)
- The mobile top bar becomes a slimmer element inside `AppLayout`

### 4. Update: `src/components/ui/BottomTabBar.tsx`
- Minor style refinements — slightly larger tap targets, bolder active state

## Page Redesigns

### 5. `src/pages/Index.tsx` (Home Feed)
- Use `AppLayout` wrapper
- Feed remains centered (`max-w-2xl`) inside the main content area
- `CreatePost` card: tighter, cleaner design — remove rounded-full input, use a flat text area trigger with subtle border
- `SocialPost`: sharper card design — remove hover border glow, use clean dividers, tighter spacing

### 6. `src/pages/Connections.tsx`
- Use `AppLayout` wrapper
- Replace card grid with a **list layout** — each connection as a horizontal row (avatar, name, department, action buttons) for a Twitter "Who to follow" feel
- Search bar at top stays but gets restyled

### 7. `src/components/connections/ConnectionCard.tsx`
- Redesign from vertical card to horizontal row item
- Avatar (40px) | Name + department | Connect/Message buttons right-aligned
- Clean hover state with subtle background change

### 8. `src/pages/Messages.tsx` + `MessagesLayout.tsx`
- Use `AppLayout` wrapper (sidebar replaces the old Navigation)
- Messages content: sidebar becomes a conversation list panel within the main content area (not in the global sidebar)
- Full-height chat area with cleaner message bubbles

### 9. `src/pages/Notifications.tsx`
- Use `AppLayout` wrapper
- Category tabs: style as compact pill buttons in a single row
- Notification items: tighter spacing, cleaner typography

### 10. `src/pages/Profile.tsx` + `src/pages/UserProfile.tsx`
- Use `AppLayout` wrapper
- Profile header: Twitter-style — cover area at top (solid gradient), avatar overlapping, name/bio/stats in a clean stack below
- Connection count, role, department as inline metadata
- Remove the centered Card wrapper — use full-width content flow

### 11. `src/pages/Settings.tsx`
- Use `AppLayout` wrapper
- Keep accordion structure but restyle with cleaner section headers and tighter padding

### 12. `src/pages/PostView.tsx`
- Use `AppLayout` wrapper
- Centered single post view

## File Summary

| Action | File |
|--------|------|
| **Create** | `src/components/layout/AppSidebar.tsx` |
| **Create** | `src/components/layout/AppLayout.tsx` |
| **Modify** | `src/index.css` — remove glass utils, add new layout utils |
| **Modify** | `src/pages/Index.tsx` — use AppLayout |
| **Modify** | `src/pages/Connections.tsx` — use AppLayout, list layout |
| **Modify** | `src/pages/Messages.tsx` — use AppLayout |
| **Modify** | `src/pages/Notifications.tsx` — use AppLayout |
| **Modify** | `src/pages/Profile.tsx` — use AppLayout, new header |
| **Modify** | `src/pages/UserProfile.tsx` — use AppLayout |
| **Modify** | `src/pages/Settings.tsx` — use AppLayout |
| **Modify** | `src/pages/PostView.tsx` — use AppLayout |
| **Modify** | `src/components/connections/ConnectionCard.tsx` — row layout |
| **Modify** | `src/components/connections/ConnectionsList.tsx` — list layout |
| **Modify** | `src/components/social/SocialPost.tsx` — tighter card |
| **Modify** | `src/components/social/CreatePost.tsx` — cleaner composer |
| **Modify** | `src/components/profile/ProfileHeader.tsx` — Twitter-style |
| **Modify** | `src/components/UserProfile.tsx` — remove Card wrapper |
| **Modify** | `src/components/messaging/MessagesLayout.tsx` — use AppLayout |
| **Modify** | `src/components/ui/BottomTabBar.tsx` — style tweaks |

## What Stays the Same
- All Supabase queries, RPC calls, realtime subscriptions
- All hooks (`useNotifications`, `useConversations`, `useMessages`, etc.)
- All services (`social/`, `auth.ts`, `user.ts`, etc.)
- Zustand stores, AuthContext
- Landing page, Register page, Admin Dashboard
- Database schema, migrations, edge functions

