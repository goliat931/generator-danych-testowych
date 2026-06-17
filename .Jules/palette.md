## PALETTE'S JOURNAL

## 2024-06-16 - Add ARIA Labels and Keyboard Access for Copy Functionality
**Learning:** The generated output elements (PESEL, ID, REGON, etc.) were missing ARIA labels and keyboard accessibility for their copy-to-clipboard functionality. Users using screen readers wouldn't know they are clickable and users using keyboard navigation wouldn't be able to trigger the copy.
**Action:** Added `tabindex="0"`, `role="button"`, `aria-label`, and `title` to these elements in `index.html`. Also added an event listener in `static/script.js` to support keyboard `Enter` and `Space` to trigger the click event, and `focus-visible` styles in `static/styles.css` for clear visual indication during keyboard navigation.

## 2023-10-27 - Screen Reader Announcements for Dynamic Updates
**Learning:** In vanilla JS apps using custom toast messages or updating text contents to show validation results, screen readers will often not announce the changes since the elements are already in the DOM.
**Action:** Always add `role="status" aria-live="polite"` to notification containers (`copy-message`) or validation results so that visual changes are reliably announced to visually impaired users without interrupting their workflow.
