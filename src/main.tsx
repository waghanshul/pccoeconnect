
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Script to remove the Lovable badge
const removeBadgeScript = () => {
  // Function to hide the badge
  const hideEditBadge = () => {
    const badgeElements = document.querySelectorAll('.lovable-editor-button, [id*="lovable"], [class*="lovable"]');
    badgeElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
      }
    });
  };

  // Execute immediately and periodically
  hideEditBadge();
  setInterval(hideEditBadge, 500);

  // Add CSS to prevent the badge from showing
  const style = document.createElement('style');
  style.textContent = `
    .lovable-editor-button, [id*="lovable"], [class*="lovable"] {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);
};

// Run the script as soon as possible
removeBadgeScript();

createRoot(document.getElementById("root")!).render(<App />);
