document.addEventListener("DOMContentLoaded", () => {
  function initTheme() {
    const themeToggleBtn = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    let currentTheme = savedTheme || (prefersDark ? "dark" : "light");

    const applyTheme = (theme) => {
      document.documentElement.setAttribute("data-theme", theme);
      if (themeToggleBtn) {
        const titleText =
          theme === "dark" ? "Włącz motyw jasny" : "Włącz motyw ciemny";
        themeToggleBtn.setAttribute("aria-label", titleText);
        themeToggleBtn.setAttribute("title", titleText);
      }
    };

    applyTheme(currentTheme);

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        currentTheme = currentTheme === "light" ? "dark" : "light";
        localStorage.setItem("theme", currentTheme);
        applyTheme(currentTheme);
      });
    }

    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          if (!localStorage.getItem("theme")) {
            currentTheme = e.matches ? "dark" : "light";
            applyTheme(currentTheme);
          }
        });
    }
  }
  initTheme();

  const LOWER = "abcdefghijklmnopqrstuvwxyz";
  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const DIGITS = "0123456789";
  const SPECIAL = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";
  const DIACRITICS = "ąćęłńóśźżĄĆĘŁŃÓŚŹŻ";
  const SIMILAR_CHARS = "il1IoO0";

  const lengthInput = document.getElementById("pwLength");
  const lengthValueLabel = document.getElementById("pwLengthValue");
  const countInput = document.getElementById("pwCount");
  const lowerCheckbox = document.getElementById("pwLower");
  const upperCheckbox = document.getElementById("pwUpper");
  const digitsCheckbox = document.getElementById("pwDigits");
  const specialCheckbox = document.getElementById("pwSpecial");
  const diacriticsCheckbox = document.getElementById("pwDiacritics");
  const excludeSimilarCheckbox = document.getElementById("pwExcludeSimilar");
  const generateBtn = document.getElementById("generatePasswordsBtn");
  const resultsContainer = document.getElementById("passwordResults");
  const errorDiv = document.getElementById("passwordError");
  const copyMessage = document.getElementById("copy-message");

  if (lengthInput && lengthValueLabel) {
    lengthValueLabel.textContent = lengthInput.value;
    lengthInput.addEventListener("input", () => {
      lengthValueLabel.textContent = lengthInput.value;
    });
  }

  function showCopyMessage(text) {
    if (!copyMessage) return;
    copyMessage.innerText = text;
    copyMessage.classList.add("show");
    setTimeout(() => {
      copyMessage.classList.remove("show");
    }, 3000);
  }

  function setupCopyOnClick(element, message) {
    if (!element) return;
    element.addEventListener("click", () => {
      const text = element.innerText;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => showCopyMessage(message))
          .catch((err) => console.error("Błąd podczas kopiowania:", err));
      } else {
        showCopyMessage(message);
      }
    });
  }

  // Losowy indeks < max, z CSPRNG (crypto.getRandomValues) gdy dostępne.
  function randomIndex(max) {
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(1);
      // Odrzucamy wartości powodujące bias modulo (uniform rejection sampling).
      const limit = Math.floor(0xffffffff / max) * max;
      let value;
      do {
        window.crypto.getRandomValues(array);
        value = array[0];
      } while (value >= limit);
      return value % max;
    }
    return Math.floor(Math.random() * max);
  }

  function buildCharPool() {
    let pool = "";
    if (lowerCheckbox && lowerCheckbox.checked) pool += LOWER;
    if (upperCheckbox && upperCheckbox.checked) pool += UPPER;
    if (digitsCheckbox && digitsCheckbox.checked) pool += DIGITS;
    if (specialCheckbox && specialCheckbox.checked) pool += SPECIAL;
    if (diacriticsCheckbox && diacriticsCheckbox.checked) pool += DIACRITICS;

    if (excludeSimilarCheckbox && excludeSimilarCheckbox.checked) {
      pool = pool
        .split("")
        .filter((c) => !SIMILAR_CHARS.includes(c))
        .join("");
    }

    return [...new Set(pool.split(""))].join("");
  }

  function generatePassword(length, pool) {
    let password = "";
    for (let i = 0; i < length; i++) {
      password += pool.charAt(randomIndex(pool.length));
    }
    return password;
  }

  function calculateEntropyBits(length, poolSize) {
    return poolSize > 1 ? length * Math.log2(poolSize) : 0;
  }

  function getStrength(bits) {
    if (bits < 28) return { label: "Bardzo słabe", className: "very-weak" };
    if (bits < 36) return { label: "Słabe", className: "weak" };
    if (bits < 60) return { label: "Rozsądne", className: "medium" };
    if (bits < 128) return { label: "Mocne", className: "strong" };
    return { label: "Bardzo mocne", className: "very-strong" };
  }

  function showError(message) {
    if (!errorDiv) return;
    errorDiv.textContent = "❌ " + message;
    errorDiv.style.display = "block";
    setTimeout(() => {
      errorDiv.style.display = "none";
    }, 5000);
  }

  function hideError() {
    if (!errorDiv) return;
    errorDiv.style.display = "none";
  }

  function renderPasswords(passwords, poolSize, length) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = "";

    const bits = calculateEntropyBits(length, poolSize);
    const strength = getStrength(bits);

    passwords.forEach((password, index) => {
      const row = document.createElement("div");
      row.className = "password-row";

      const output = document.createElement("div");
      output.className = "generated-output password-output";
      output.textContent = password;
      output.tabIndex = 0;
      output.setAttribute("role", "button");
      output.setAttribute(
        "aria-label",
        `Skopiuj hasło ${index + 1} do schowka / Copy password ${index + 1} to clipboard`,
      );
      output.title = "Skopiuj do schowka / Copy to clipboard";

      const meter = document.createElement("span");
      meter.className = `password-strength ${strength.className}`;
      meter.textContent = `${strength.label} (~${Math.round(bits)} bitów)`;

      row.appendChild(output);
      row.appendChild(meter);
      resultsContainer.appendChild(row);

      setupCopyOnClick(output, "Hasło skopiowane!");
      output.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          output.click();
        }
      });
    });
  }

  function handleGenerate() {
    const pool = buildCharPool();
    if (!pool) {
      showError("Zaznacz przynajmniej jeden zestaw znaków.");
      if (resultsContainer) resultsContainer.innerHTML = "";
      return;
    }
    hideError();

    const length = Math.min(
      Math.max(parseInt(lengthInput ? lengthInput.value : 16, 10) || 16, 4),
      128,
    );
    const count = Math.min(
      Math.max(parseInt(countInput ? countInput.value : 1, 10) || 1, 1),
      50,
    );

    const passwords = Array.from({ length: count }, () =>
      generatePassword(length, pool),
    );
    renderPasswords(passwords, pool.length, length);
  }

  if (generateBtn) {
    generateBtn.addEventListener("click", handleGenerate);
  }

  handleGenerate();
});
