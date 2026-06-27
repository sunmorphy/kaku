'use client';

import { useEffect } from 'react';

export default function DevToolsProtection() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    // Disable right-click context menu
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    const disableKeyboardShortcuts = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I (Inspector)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+C (Element selector)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (View source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+K (Console in Firefox)
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        return false;
      }
    };

    // Detect DevTools opening
    const detectDevTools = () => {
      const threshold = 160;
      
      const checkDevTools = () => {
        if (
          window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold
        ) {
          // DevTools likely open - redirect or show warning
          document.body.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; font-size: 24px; color: #333;">Developer tools are not allowed</div>';
        }
      };

      setInterval(checkDevTools, 1000);
    };

    // Console warning
    const consoleWarning = () => {
      console.clear();
      console.log('%cSTOP!', 'color: red; font-size: 50px; font-weight: bold;');
      console.log('%cThis is a browser feature intended for developers. Using console commands here may compromise your security.', 'color: red; font-size: 16px;');
    };

    // Disable text selection
    const disableSelection = () => {
      const bodyStyle = document.body.style as any;
      bodyStyle.userSelect = 'none';
      bodyStyle.webkitUserSelect = 'none';
      bodyStyle.mozUserSelect = 'none';
      bodyStyle.msUserSelect = 'none';
    };

    // Add event listeners
    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableKeyboardShortcuts);
    
    // Initialize protection
    consoleWarning();
    detectDevTools();
    disableSelection();

    // Cleanup function
    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableKeyboardShortcuts);
    };
  }, []);

  return null;
}