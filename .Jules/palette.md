## PALETTE'S JOURNAL

## 2024-06-16 - Add ARIA Labels and Keyboard Access for Copy Functionality

**Learning:** The generated output elements (PESEL, ID, REGON, etc.) were missing ARIA labels and keyboard accessibility for their copy-to-clipboard functionality. Users using screen readers wouldn't know they are clickable and users using keyboard navigation wouldn't be able to trigger the copy.
**Action:** Added `tabindex="0"`, `role="button"`, `aria-label`, and `title` to these elements in `index.html`. Also added an event listener in `static/script.js` to support keyboard `Enter` and `Space` to trigger the click event, and `focus-visible` styles in `static/styles.css` for clear visual indication during keyboard navigation.

## 2023-10-27 - Screen Reader Announcements for Dynamic Updates

**Learning:** In vanilla JS apps using custom toast messages or updating text contents to show validation results, screen readers will often not announce the changes since the elements are already in the DOM.
**Action:** Always add `role="status" aria-live="polite"` to notification containers (`copy-message`) or validation results so that visual changes are reliably announced to visually impaired users without interrupting their workflow.

## 2024-07-25 - Custom Modal Close Buttons Accessibility

**Learning:** In custom modal implementations, a simple `<span>×</span>` is often used as a close button. However, this pattern is completely inaccessible to screen reader and keyboard users, as `span` elements are non-interactive by default. Without explicit roles and keyboard handling, these users can get trapped inside modals.
**Action:** Always add `role="button"`, `tabindex="0"`, a descriptive `aria-label`, a `keydown` event listener for 'Enter'/'Space', and explicit `:focus-visible` styles to any `div` or `span` that functions as a button.

## 2025-01-24 - Missing Focus Indicators on Interactive Elements

**Learning:** Native interactive elements like `<button>` and `<a>` across the application (e.g., standard buttons, custom navigation links, and theme toggle buttons) were lacking explicit `:focus-visible` styles, making keyboard navigation difficult for users who rely on visual focus indicators.
**Action:** Always ensure that global styles include clear, high-contrast `:focus-visible` outlines for all interactive elements (such as `button`, `a`, and `.btn-*` classes) to meet accessibility standards and improve keyboard usability.

## 2025-02-09 - Modal Escape Key and Focus Management

**Learning:** Custom modals often forget to implement the `Escape` key to close, and fail to return focus to the trigger element after closing. Also, focus must be brought inside the modal upon opening. This breaks keyboard navigation flow and traps users or leaves them disconnected from the context.
**Action:** Always add a `keydown` listener for `Escape` on the `window`/`document` to close custom modals. Ensure focus is moved inside the modal (e.g. to the close button) when it opens, and focus is restored to the element that originally opened the modal after closing it, to maintain keyboard context.

## 2025-02-23 - Replace Blocking Alerts with Inline Feedback

**Learning:** Using native `alert()` for form validation is disruptive to the user flow, inaccessible for many screen reader users, and visually jarring.
**Action:** Replace `alert()` calls with inline feedback elements (e.g., using `role="status" aria-live="polite"`) styled appropriately for errors or success messages. This allows for clear, non-blocking contextual feedback that works well for all users.

## 2025-02-23 - Asynchronous UI Feedback for Heavy Tasks

**Learning:** When generating massive datasets (e.g. 100,000 records) entirely on the client-side, the browser's main thread becomes blocked, freezing the application. Without visual feedback, users might think the application has crashed and try to click the button multiple times.
**Action:** Always wrap heavy synchronous operations in a `setTimeout` (even with a small delay like 50ms) to allow the browser to paint loading states (e.g., `⏳ Generowanie...`, disabling the button, and setting `aria-busy="true"`) before the main thread is locked. Use `try/finally` to guarantee the button state is restored when the operation finishes.

## 2025-02-23 - Dynamic ARIA Labels for Theme Toggles

**Learning:** When using a toggle button for themes (light/dark) whose state is managed by JavaScript, setting a static or generic `aria-label` (like "auto", "light", or "dark") fails to convey the _action_ that will happen when the button is clicked.
**Action:** Always dynamically update the `aria-label` and `title` of toggle buttons via JavaScript to clearly describe the action it will perform (e.g., "Switch to light theme" or "Włącz motyw jasny") based on the _current_ state.

## 2025-02-23 - Dynamic ARIA labels for adjoining input elements

**Learning:** When building complex forms with adjoining interactive elements (like a checkbox next to a text input without explicit label wrappers), screen readers fail to associate the elements properly. For example, a screen reader would announce a checkbox without context, and a text input without context.
**Action:** Always add explicit `aria-label`s to both elements. Furthermore, if one element's value provides context for the other (e.g., the text input names the field that the checkbox toggles), use JavaScript to dynamically update the checkbox's `aria-label` whenever the text input changes to maintain accurate context for screen reader users.

## 2025-02-23 - Accessible Form Field Focus Outlines

**Learning:** Using `outline: none` on inputs and relying only on a `border-color` change for focus state is an accessibility anti-pattern. It may fail WCAG contrast ratio requirements and, critically, is entirely stripped out by High Contrast Modes (like Windows High Contrast), leaving keyboard users with no visible focus indicator.
**Action:** Always replace `outline: none` with a strong `:focus-visible` outline using high-contrast design tokens (e.g. `var(--icon-fill-hover)` with `outline-offset`). This ensures focus states are robust across all color themes and accessibility modes.

## 2026-07-22 - Form Validation Accessibility and Visual Feedback

**Learning:** When form inputs have validation messages, screen readers need to know which error message applies to which input. Additionally, relying solely on text messages for validation feedback is insufficient for visual users; visual cues tied directly to the accessible state provide a better experience.
**Action:** Always link form inputs to their error message containers using `aria-describedby`. Dynamically set `aria-invalid="true"` or `"false"` on the input element itself to programmatically indicate state for screen readers. Use these exact attributes (`input[aria-invalid="true"]`) as CSS selectors to apply visual validation feedback (e.g., colored borders), ensuring visual cues are tied directly to accessible states. Finally, clear these error states immediately on the `input` event to provide real-time feedback and prevent user frustration.
