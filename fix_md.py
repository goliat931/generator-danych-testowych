import re

with open(".Jules/palette.md", "r") as f:
    md = f.read()

md = re.sub(
    r"<<<<<<< HEAD\n## 2025-02-23 - Focus Styles in High Contrast Mode\n\*\*Learning:\*\* Using `outline: none;` on focusable elements \(like inputs and selects\) and relying solely on `border-color` changes is an accessibility anti-pattern\. Windows High Contrast Mode \(HCM\) overrides custom borders and backgrounds, which removes the visual focus indicator entirely if `outline` is set to `none`\.\n\*\*Action:\*\* Never use `outline: none;`\. Instead, use `outline: 2px solid transparent;` to preserve the native focus ring structure for HCM while remaining invisible in normal modes, allowing custom border styles to handle visual focus indicator\. Additionally, ensure explicit `:focus-visible` styles with `outline` are provided for all interactive elements\.\n=======\n## 2025-02-23 - Accessible Form Field Focus Outlines\n\n\*\*Learning:\*\* Using `outline: none` on inputs and relying only on a `border-color` change for focus state is an accessibility anti-pattern\. It may fail WCAG contrast ratio requirements and, critically, is entirely stripped out by High Contrast Modes \(like Windows High Contrast\), leaving keyboard users with no visible focus indicator\.\n\*\*Action:\*\* Always replace `outline: none` with a strong `:focus-visible` outline using high-contrast design tokens \(e\.g\. `var\(--icon-fill-hover\)` with `outline-offset`\)\. This ensures focus states are robust across all color themes and accessibility modes\.\n>>>>>>> origin/main",
    r"## 2025-02-23 - Accessible Form Field Focus Outlines (High Contrast Mode)\n\n**Learning:** Using `outline: none` on inputs and relying only on a `border-color` change for focus state is an accessibility anti-pattern. It may fail WCAG contrast ratio requirements and, critically, is entirely stripped out by High Contrast Modes (like Windows High Contrast), leaving keyboard users with no visible focus indicator.\n**Action:** Never use `outline: none;`. Instead, use `outline: 2px solid transparent;` to preserve the native focus ring structure for HCM while remaining invisible in normal modes, allowing custom border styles to handle visual focus indicator. Always add a strong `:focus-visible` outline using high-contrast design tokens (e.g. `var(--icon-fill-hover)` with `outline-offset`). This ensures focus states are robust across all color themes and accessibility modes.",
    md
)

with open(".Jules/palette.md", "w") as f:
    f.write(md)
