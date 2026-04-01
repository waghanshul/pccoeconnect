

# Rebrand to ChatPCCOE

## Changes

### 1. `src/components/Logo.tsx`
Replace the current "PC" badge + "PCCOE Connect" with a lean logo:
- A simple chat-bubble icon rendered with CSS/SVG (no Lucide icons) containing "CP" initials
- Text: "ChatPCCOE" in a clean, tight font

### 2. Text replacements across 5 files
Replace all "PCCOE Connect" references with "ChatPCCOE":
- `src/components/landing/Hero.tsx` -- heading text
- `src/pages/Landing.tsx` -- sheet description
- `src/components/auth/AdminLoginForm.tsx` -- sheet description
- `src/context/AuthContext.tsx` -- toast message

### 3. `index.html`
- Update `<title>` from "pccoe-connectivity-hub" to "ChatPCCOE"

### Files modified: 6
### No backend changes

