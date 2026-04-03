

# Update OG Preview Image

## Problem
The `og:image` in `index.html` currently points to `/og-image.png` which shows Lovable branding when sharing links.

## Solution
Take a screenshot of the ChatPCCOE landing page and use it as the OG image.

## Changes

### 1. Generate OG image
- Capture/create a 1200x630px image of the ChatPCCOE landing page
- Save it as `public/og-image.png`, replacing the existing one

### 2. Update `index.html`
- Update the `og:image` meta tag to use an absolute URL: `https://chatpccoe.lovable.app/og-image.png`
- Add `og:image:width` (1200) and `og:image:height` (630) meta tags for better platform support

This will replace the Lovable-branded preview with a screenshot of your actual landing page when sharing links.

