

# Shareable Post Links with Preview

## Overview
Add a `/post/:postId` route that displays a single post. When sharing posts via messages, send a clickable link (`/post/{id}`) instead of pasting the full content. The link renders as a rich preview card in the chat, and clicking it navigates to the post.

## Changes

### 1. New Page: `src/pages/PostView.tsx`
- Route: `/post/:postId`
- Fetches the single post from `social_posts` by ID (with author profile, likes, comments)
- Renders using the existing `SocialPost` component inside the standard layout (Navigation + PageTransition)
- Shows a "Post not found" state if invalid ID
- Scrolls to top on mount

### 2. Add Route in `App.tsx`
- Add `<Route path="/post/:postId" element={<ProtectedRoute><PostView /></ProtectedRoute>} />`

### 3. Update `SharePostDialog.tsx` — Send Link Instead of Content
- Instead of sending the full quoted text as a message, send:
  ```
  📤 Shared a post by {author}:
  "{truncated content}"
  
  👉 pccoeconnect.lovable.app/post/{postId}
  ```
- Pass `postId` as a new prop to `SharePostDialog` and `SocialPostActions`/`PostActions`

### 4. Rich Link Preview in Chat — `MessageItem.tsx`
- Detect URLs matching `/post/{uuid}` pattern in message content
- Render a small preview card inline: post author avatar, name, truncated content, and a "View Post" button that navigates to `/post/{id}`
- Fetch post data on-demand when the link card mounts (lightweight query: content + author name)

### 5. Update OG Meta Tags for SEO Preview
- In `index.html`, the existing static OG tags stay as fallback
- Since this is a client-side SPA, true OG previews for external sharing (WhatsApp, etc.) would need server-side rendering — out of scope for now. The in-app link preview covers the primary use case.

### 6. Props Threading
- Add `postId` prop to `SharePostDialog`, `SocialPostActions`, `PostActions`
- Pass `post.id` from `SocialPost` and `Post` components down to the share dialog

## Files Modified
- **New**: `src/pages/PostView.tsx`
- `src/App.tsx` — add route
- `src/components/social/SharePostDialog.tsx` — send link in message
- `src/components/social/post/SocialPostActions.tsx` — pass postId
- `src/components/post/PostActions.tsx` — pass postId
- `src/components/social/SocialPost.tsx` — pass post.id to actions
- `src/components/Post.tsx` — pass id to actions
- `src/components/messaging/MessageItem.tsx` — render post link preview card

## What Stays the Same
- Database schema (no changes needed)
- Social feed, post creation, like/comment logic
- Existing messaging infrastructure

