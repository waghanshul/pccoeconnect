

# Visual Redesign Plan -- Modern, Refined UI

This plan covers a complete visual refresh of PCCOE Connect without touching any backend logic, database queries, or core functionality. Every component keeps its exact same props, state management, and event handlers -- only CSS classes, layout structure, and visual styling change.

## Design Direction

The current UI uses a basic dark theme with flat gray cards and minimal visual hierarchy. The redesign will introduce:

- **Glassmorphism**: Translucent cards with backdrop-blur and subtle borders
- **Refined color palette**: Richer gradients, softer backgrounds, better contrast
- **Micro-interactions**: Smoother hover states, subtle transitions, better focus states
- **Improved spacing and typography**: More breathing room, refined font weights
- **Consistent design language**: Every page follows the same visual system

## Files to Change

### 1. Global Theme (`src/index.css`)
- Update CSS variables for richer, more nuanced dark palette
- Add utility classes for glass effects (`glass-card`, `glass-surface`)
- Add subtle gradient background patterns
- Improve scrollbar styling
- Add smooth transition defaults

### 2. Navigation (`src/components/Navigation.tsx`)
- Glassmorphic navbar with backdrop-blur and semi-transparent background
- Active link gets a pill-shaped indicator with glow effect
- Notification badge with pulse animation
- Smoother hover transitions on nav items
- Better mobile menu with slide-in animation

### 3. Landing Page
- **Hero** (`src/components/landing/Hero.tsx`): Animated gradient background blobs, refined typography with letter-spacing, floating campus image with shadow
- **Features** (`src/components/landing/Features.tsx`): Glass cards with colored icon accents, hover lift effect
- **RoleSelection** (`src/components/landing/RoleSelection.tsx`): Refined selection cards with gradient borders, smoother transitions
- **Landing** (`src/pages/Landing.tsx`): Glass auth panel, improved form container

### 4. Home / Social Feed
- **Index** (`src/pages/Index.tsx`): Refined background gradient, remove the badge-blocking div hack
- **SocialFeed** (`src/components/social/SocialFeed.tsx`): Better loading skeletons with shimmer animation
- **CreatePost** (`src/components/social/CreatePost.tsx`): Glass card with refined tabs styling
- **SocialPost** (`src/components/social/SocialPost.tsx`): Glass card, refined content spacing
- **SocialPostActions** (`src/components/social/post/SocialPostActions.tsx`): Refined action buttons with hover color transitions
- **SocialPostComments** (`src/components/social/SocialPostComments.tsx`): Better comment bubbles, refined input area

### 5. Messages
- **MessagesLayout** (`src/components/messaging/MessagesLayout.tsx`): Refined grid layout with proper gaps
- **MessagesSidebar** (`src/components/messaging/MessagesSidebar.tsx`): Glass panel with refined header
- **ConversationListItem** (`src/components/messaging/ConversationListItem.tsx`): Better hover states, refined active indicator
- **ChatWindow** (`src/components/ChatWindow.tsx`): Glass container, refined layout
- **MessageItem** (`src/components/messaging/MessageItem.tsx`): Refined message bubbles with gradient for own messages
- **MessageInput** (`src/components/messaging/MessageInput.tsx`): Refined input with glass background
- **MessagesList** (`src/components/messaging/MessagesList.tsx`): Better empty/loading states

### 6. Profile
- **Profile** (`src/pages/Profile.tsx`): Refined gradient banner, better card layout
- **ProfileHeader** (`src/components/profile/ProfileHeader.tsx`): Larger avatar with gradient ring, refined buttons
- **UserProfile** (`src/components/UserProfile.tsx`): Glass card with better shadow

### 7. Connections
- **Connections** (`src/pages/Connections.tsx`): Refined page header, better layout
- **ConnectionCard** (`src/components/connections/ConnectionCard.tsx`): Glass card with gradient border on hover
- **ConnectionsList** (`src/components/connections/ConnectionsList.tsx`): Refined search input

### 8. Notifications
- **Notifications** (`src/pages/Notifications.tsx`): Refined page layout
- **NotificationTabs** (`src/components/notifications/NotificationTabs.tsx`): Better tab styling with pill indicators
- **NotificationItem** (`src/components/notifications/NotificationItem.tsx`): Glass notification cards, refined badges

### 9. Settings
- **Settings** (`src/pages/Settings.tsx`): Glass section cards, refined layout
- **BasicInfoSection** (`src/components/settings/BasicInfoSection.tsx`): Glass card, refined form fields

### 10. Admin Dashboard
- **AdminDashboard** (`src/pages/AdminDashboard.tsx`): Glass panels, refined form elements, better table styling

### 11. Shared UI Primitives (CSS-only changes)
- **Card** (`src/components/ui/card.tsx`): Default glass styling with backdrop-blur
- **Button** (`src/components/ui/button.tsx`): Refined variants with better gradients and transitions

### 12. Tailwind Config (`tailwind.config.ts`)
- Add glass-related utilities
- Add shimmer keyframe animation

## What Does NOT Change
- All Supabase queries, RLS policies, and database operations
- All state management (Zustand stores, React hooks)
- All routing logic and protected routes
- All form submission handlers and validation
- All realtime subscription logic
- Component props and interfaces
- Any file in `src/hooks/`, `src/services/`, `src/context/`, `src/integrations/`

## Estimated Scope
~25 files modified, purely className and minor JSX layout tweaks. No new dependencies needed.

