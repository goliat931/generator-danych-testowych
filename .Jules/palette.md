## PALETTE'S JOURNAL

## 2024-06-16 - Add ARIA Labels and Keyboard Access for Copy Functionality
**Learning:** The generated output elements (PESEL, ID, REGON, etc.) were missing ARIA labels and keyboard accessibility for their copy-to-clipboard functionality. Users using screen readers wouldn't know they are clickable and users using keyboard navigation wouldn't be able to trigger the copy.
**Action:** Added `tabindex="0"`, `role="button"`, `aria-label`, and `title` to these elements in `index.html`. Also added an event listener in `static/script.js` to support keyboard `Enter` and `Space` to trigger the click event, and `focus-visible` styles in `static/styles.css` for clear visual indication during keyboard navigation.
