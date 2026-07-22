import re

with open("static/styles.css", "r") as f:
    css = f.read()

# Fix the first conflict block
css = re.sub(
    r"<<<<<<< HEAD\nselect:focus,\ninput:focus {\n  outline: 2px solid transparent;\n=======\nselect:focus-visible,\ninput:focus-visible {\n  outline: 2px solid var\(--icon-fill-hover\);\n  outline-offset: 2px;\n>>>>>>> origin/main",
    r"select:focus-visible,\ninput:focus-visible {\n  outline: 2px solid var(--icon-fill-hover);\n  outline-offset: 2px;\n}\n\nselect:focus,\ninput:focus {\n  outline: 2px solid transparent;",
    css
)

# Fix the second conflict block
css = re.sub(
    r"<<<<<<< HEAD\n.validator-input-group input:focus {\n  outline: 2px solid transparent;\n=======\n.validator-input-group input:focus-visible {\n  outline: 2px solid var\(--icon-fill-hover\);\n  outline-offset: 2px;\n>>>>>>> origin/main",
    r".validator-input-group input:focus-visible {\n  outline: 2px solid var(--icon-fill-hover);\n  outline-offset: 2px;\n}\n\n.validator-input-group input:focus {\n  outline: 2px solid transparent;",
    css
)

# Fix the third conflict block
css = re.sub(
    r"<<<<<<< HEAD\n.field-name-input:focus {\n  outline: 2px solid transparent;\n=======\n.field-name-input:focus-visible {\n  outline: 2px solid var\(--icon-fill-hover\);\n  outline-offset: 2px;\n>>>>>>> origin/main",
    r".field-name-input:focus-visible {\n  outline: 2px solid var(--icon-fill-hover);\n  outline-offset: 2px;\n}\n\n.field-name-input:focus {\n  outline: 2px solid transparent;",
    css
)

with open("static/styles.css", "w") as f:
    f.write(css)
