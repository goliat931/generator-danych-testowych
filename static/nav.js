// Menu mobilne: dokłada przycisk hamburgera do paska nawigacji
// (.button-group > nav.nav-links). Widoczny tylko w CSS poniżej 768px.
(function () {
  function init() {
    const bar = document.querySelector(".button-group");
    const nav = bar && bar.querySelector("nav.nav-links");
    if (!bar || !nav || bar.querySelector(".nav-hamburger")) return;

    if (!nav.id) nav.id = "main-nav";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nav-hamburger";
    btn.setAttribute("aria-label", "Menu");
    btn.setAttribute("aria-controls", nav.id);
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = "<span></span><span></span><span></span>";
    bar.insertBefore(btn, nav);

    function setOpen(open) {
      bar.classList.toggle("nav-open", open);
      btn.setAttribute("aria-expanded", String(open));
    }

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(!bar.classList.contains("nav-open"));
    });
    document.addEventListener("click", (e) => {
      if (!bar.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && bar.classList.contains("nav-open")) {
        setOpen(false);
        btn.focus();
      }
    });
    window
      .matchMedia("(min-width: 769px)")
      .addEventListener("change", (e) => e.matches && setOpen(false));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
