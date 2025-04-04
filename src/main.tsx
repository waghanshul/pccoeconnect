
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Script to remove the Lovable badge
const removeBadgeScript = () => {
  // More aggressive badge removal function
  const hideEditBadge = () => {
    // Target all possible lovable elements
    const badgeElements = document.querySelectorAll('.lovable-editor-button, [id*="lovable"], [class*="lovable"], [data-lovable], [aria-label*="lovable"]');
    
    // Remove them from the DOM completely
    badgeElements.forEach(el => {
      if (el instanceof HTMLElement) {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }
    });
  };

  // Execute immediately and periodically with higher frequency
  hideEditBadge();
  const interval = setInterval(hideEditBadge, 100);
  
  // After 10 seconds, reduce the frequency to save resources
  setTimeout(() => {
    clearInterval(interval);
    setInterval(hideEditBadge, 1000);
  }, 10000);

  // Add CSS to prevent the badge from showing
  const style = document.createElement('style');
  style.textContent = `
    .lovable-editor-button, 
    [id*="lovable"], 
    [class*="lovable"],
    [id^="lovable"],
    [class^="lovable"],
    [data-lovable],
    [aria-label*="lovable"] {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
      position: absolute !important;
      width: 0 !important;
      height: 0 !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
    }
  `;
  document.head.appendChild(style);

  // Set up MutationObserver to catch any dynamically added elements
  const observer = new MutationObserver((mutations) => {
    let shouldRemove = false;
    
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        shouldRemove = true;
      }
    });
    
    if (shouldRemove) {
      hideEditBadge();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

// Run the script as soon as possible - before React even mounts
removeBadgeScript();

// Create a root for React rendering
createRoot(document.getElementById("root")!).render(<App />);
