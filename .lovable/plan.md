

# Fix OG Meta Tags for Link Previews

## Problem
When sharing the site link externally (WhatsApp, Discord, etc.), the preview shows "Lovable Generated Project" because `index.html` still has default Lovable meta tags.

## Changes

### `index.html`
- Update `<meta name="description">` from "Lovable Generated Project" to a proper ChatPCCOE description
- Update `<meta name="author">` from "Lovable" to "ChatPCCOE"
- Update/add `<meta property="og:title">` to "ChatPCCOE"
- Update/add `<meta property="og:description">` with a proper app description
- Add `<meta property="og:url">` pointing to `https://chatpccoe.com`
- Add `<meta property="og:type" content="website">`
- Keep the existing `og:image` tag (update if you have a custom preview image)

This ensures any platform that scrapes OG tags will show your branding instead of "Lovable Generated Project."

