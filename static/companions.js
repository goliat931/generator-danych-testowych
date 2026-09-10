// Funkcja odpalająca animację i poświatę
function animateCompanion(characterId, glowColor) {
    const charEl = document.getElementById(characterId);
    if (!charEl) return;

    // Dodaj klasę animacji i poświatę
    charEl.classList.add('action-active');
    charEl.style.boxShadow = `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`;
    charEl.style.borderRadius = "50%"; // Żeby poświata była okrągła

    // Wyłącz po 1.5 sekundy (dostosuj czas do swoich potrzeb)
    setTimeout(() => {
        charEl.classList.remove('action-active');
        charEl.style.boxShadow = "none";
    }, 1500);
}
