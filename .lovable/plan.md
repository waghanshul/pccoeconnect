

## Content Moderation Feature

### Overview
Create a Supabase Edge Function microservice that checks text content for profanity/bad words before allowing posts and comments. The frontend will call this edge function before submitting content, and display an error if inappropriate content is detected.

### Architecture

```text
User types post/comment
       │
       ▼
Frontend calls Edge Function
  POST /moderate-content { content: "..." }
       │
       ▼
Edge Function checks against bad-words list
       │
       ├── Clean → returns { flagged: false }
       │                 │
       │                 ▼
       │         Frontend proceeds to create post/comment
       │
       └── Flagged → returns { flagged: true, reason: "..." }
                          │
                          ▼
                  Frontend shows error toast, blocks submission
```

### Backend: Edge Function `moderate-content`

**File: `supabase/functions/moderate-content/index.ts`**

- CORS headers for browser access
- JWT validation via `getClaims()` (authenticated users only)
- Contains a curated list of common English profanity/bad words (embedded in the function -- no external API needed)
- Checks content against the list using word-boundary regex matching (case-insensitive)
- Returns JSON: `{ flagged: boolean, reason?: string }`

**Config update: `supabase/config.toml`**
- Add `[functions.moderate-content]` with `verify_jwt = false` (validate in code per project conventions)

### Frontend Changes

**1. New utility: `src/services/moderation.ts`**
- `moderateContent(content: string): Promise<{ flagged: boolean; reason?: string }>` 
- Calls the edge function via `supabase.functions.invoke('moderate-content', { body: { content } })`

**2. Update `src/services/social/posts.ts`**
- In `createPost()`: call `moderateContent()` before the Supabase insert. If flagged, throw error with the reason and show toast.

**3. Update `src/services/social/comments.ts`**
- In `addComment()`: same moderation check before inserting the comment.

**4. Update `src/components/social/CreatePost.tsx`**
- In `handleTextPost`, `handleMediaPost`, `handlePollPost`: wrap calls with try/catch to surface moderation errors from the store.

**5. Update `src/components/post/CreateTextPost.tsx`**
- Add loading state on the Post button while moderation check runs.

### Key Design Decisions
- **Self-contained bad words list** in the edge function (no external API dependency, no extra secrets needed)
- **Word-boundary matching** to avoid false positives (e.g., "class" won't be flagged)
- **Server-side validation** so users can't bypass by calling the DB directly -- but since we can't block at the DB level without triggers, the edge function acts as the gate at the application layer
- Moderation applies to: text posts, media post descriptions, poll questions, and comments

