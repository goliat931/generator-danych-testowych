// ====================================================
// Infotipy: dymki z obrazowym opisem struktury generowanych danych
// (PESEL, dowód osobisty, REGON, NRB/IBAN, NIP) i linkiem do pełnej
// definicji. Wystarczy w HTML umieścić:
//   <button type="button" class="infotip-btn" data-infotip="pesel">i</button>
// a ten skrypt podepnie dymek (klik/Enter = przypnij, najechanie = podgląd,
// Escape lub klik poza = zamknij). Elementy dodane później (np. lista pól
// na stronie API) podpina się przez window.Infotips.attach(kontener).
// ====================================================
(function () {
  const DEFINITIONS = {
    pesel: {
      title: "PESEL - jak jest zbudowany",
      subtitle: "11 cyfr: data urodzenia, numer seryjny z płcią i cyfra kontrolna",
      segments: [
        { chars: "44", label: "rok", color: "#3a7ca5" },
        { chars: "05", label: "miesiąc", color: "#2e7d32" },
        { chars: "14", label: "dzień", color: "#8e24aa" },
        { chars: "013", label: "nr seryjny", color: "#ef6c00" },
        { chars: "5", label: "płeć", color: "#c62828" },
        { chars: "9", label: "kontrolna", color: "#546e7a" },
      ],
      points: [
        "Data urodzenia zapisana jako RRMMDD (tu: 14 maja 1944).",
        "Miesiąc koduje też stulecie: +20 dla lat 2000-2099, +40 dla 2100-2199, +80 dla 1800-1899.",
        "Przedostatnia cyfra to płeć: nieparzysta = mężczyzna, parzysta = kobieta.",
        "Ostatnia cyfra to suma kontrolna (wagi 1,3,7,9,1,3,7,9,1,3, mod 10).",
      ],
      links: [
        { label: "PESEL - Wikipedia", href: "https://pl.wikipedia.org/wiki/PESEL" },
      ],
    },
    id: {
      title: "Numer dowodu osobistego",
      subtitle: "3 litery serii, cyfra kontrolna i 5 cyfr numeru",
      segments: [
        { chars: "QFL", label: "seria", color: "#3a7ca5" },
        { chars: "6", label: "kontrolna", color: "#546e7a" },
        { chars: "26390", label: "numer", color: "#ef6c00" },
      ],
      points: [
        "Litery są przeliczane na liczby (A=10, B=11, ..., Z=35).",
        "Cyfra kontrolna stoi zaraz po serii - liczona z wag 7,3,1,9,7,3,1,7,3 (mod 10).",
        "Nowsze dowody mają dokładnie ten sam format 3 litery + 6 cyfr.",
      ],
      links: [
        {
          label: "Dowód osobisty w Polsce - Wikipedia",
          href: "https://pl.wikipedia.org/wiki/Dow%C3%B3d_osobisty_w_Polsce",
        },
      ],
    },
    regon: {
      title: "REGON - jak jest zbudowany",
      subtitle: "9 cyfr (podmiot) lub 14 cyfr (jednostka lokalna)",
      segments: [
        { chars: "71711374", label: "numer podmiotu", color: "#3a7ca5" },
        { chars: "6", label: "kontrolna", color: "#546e7a" },
      ],
      points: [
        "Wersja 9-cyfrowa: 8 cyfr numeru + cyfra kontrolna (wagi 8,9,2,3,4,5,6,7, mod 11; wynik 10 = 0).",
        "Wersja 14-cyfrowa: pełny 9-cyfrowy REGON + 4 cyfry jednostki lokalnej + osobna cyfra kontrolna.",
        "Nadawany przez GUS każdemu podmiotowi gospodarki narodowej.",
      ],
      links: [
        { label: "REGON - Wikipedia", href: "https://pl.wikipedia.org/wiki/REGON" },
      ],
    },
    nrb: {
      title: "NRB / IBAN - jak jest zbudowany",
      subtitle: "26 cyfr: suma kontrolna, kod banku i oddziału, numer rachunku",
      segments: [
        { chars: "87", label: "kontrolna", color: "#546e7a" },
        { chars: "9681", label: "bank", color: "#3a7ca5" },
        { chars: "0002", label: "oddział", color: "#2e7d32" },
        { chars: "0552006260082412", label: "nr rachunku (16)", color: "#ef6c00" },
      ],
      points: [
        "8 cyfr po sumie kontrolnej to numer rozliczeniowy: 4 cyfry banku + 4 cyfry oddziału.",
        "Z prefiksem kraju (PL) ten sam numer staje się IBAN-em: PL + 26 cyfr.",
        "Suma kontrolna wg ISO 7064 (mod 97-10) - liczona z numeru przestawionego razem z kodem kraju.",
        "Zagraniczne IBAN-y mają inną długość BBAN (np. DE 18, GB 18, FR 23 znaki), ale tę samą sumę kontrolną.",
      ],
      links: [
        {
          label: "Numer rachunku bankowego (NRB) - Wikipedia",
          href: "https://pl.wikipedia.org/wiki/Numer_rachunku_bankowego",
        },
        {
          label: "IBAN - Wikipedia",
          href: "https://pl.wikipedia.org/wiki/Mi%C4%99dzynarodowy_numer_rachunku_bankowego",
        },
      ],
    },
    nip: {
      title: "NIP - jak jest zbudowany",
      subtitle: "10 cyfr: kod urzędu skarbowego, numer i cyfra kontrolna",
      segments: [
        { chars: "525", label: "urząd skarbowy", color: "#3a7ca5" },
        { chars: "000012", label: "numer", color: "#ef6c00" },
        { chars: "7", label: "kontrolna", color: "#546e7a" },
      ],
      points: [
        "Pierwsze 3 cyfry to kod urzędu skarbowego, który nadał numer.",
        "Cyfra kontrolna: suma ważona (wagi 6,5,7,2,3,4,5,6,7) mod 11 - wynik 10 jest niedozwolony.",
      ],
      links: [
        {
          label: "NIP - Wikipedia",
          href: "https://pl.wikipedia.org/wiki/Numer_identyfikacji_podatkowej",
        },
      ],
    },
  };

  // Klucze pól z generatora zbiorów / API, które mają tę samą definicję.
  const ALIASES = { bankaccount: "nrb", dok_tozs: "id" };

  function resolveKey(key) {
    return ALIASES[key] || key;
  }

  function has(key) {
    return Object.prototype.hasOwnProperty.call(DEFINITIONS, resolveKey(key));
  }

  let openState = null; // { trigger, popover, pinned }
  let popoverCounter = 0;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function buildPopover(def, id, trigger) {
    const pop = el("div", "infotip-popover");
    pop.id = id;
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-modal", "false");

    const head = el("div", "infotip-head");
    const titleId = `${id}-title`;
    const title = el("h3", "infotip-title", def.title);
    title.id = titleId;
    pop.setAttribute("aria-labelledby", titleId);
    const closeBtn = el("button", "infotip-close", "×");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Zamknij podpowiedź");
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeOpen();
      trigger.focus();
    });
    head.appendChild(title);
    head.appendChild(closeBtn);
    pop.appendChild(head);

    if (def.subtitle) pop.appendChild(el("p", "infotip-subtitle", def.subtitle));

    const segments = el("div", "infotip-segments");
    segments.setAttribute("aria-label", "Przykładowy numer z zaznaczonymi częściami");
    def.segments.forEach((seg) => {
      const segEl = el("div", "infotip-seg");
      segEl.style.setProperty("--seg-color", seg.color);
      segEl.appendChild(el("span", "infotip-seg-chars", seg.chars));
      segEl.appendChild(el("span", "infotip-seg-label", seg.label));
      segments.appendChild(segEl);
    });
    pop.appendChild(segments);

    const list = el("ul", "infotip-points");
    def.points.forEach((p) => list.appendChild(el("li", null, p)));
    pop.appendChild(list);

    const links = el("div", "infotip-links");
    def.links.forEach((link) => {
      const a = el("a", "infotip-link", `Pełna definicja: ${link.label}`);
      a.href = link.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      links.appendChild(a);
    });
    pop.appendChild(links);

    return pop;
  }

  function position(trigger, pop) {
    const margin = 12;
    const gap = 8;
    const rect = trigger.getBoundingClientRect();
    const popRect = pop.getBoundingClientRect();

    let left = rect.left + rect.width / 2 - popRect.width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - popRect.width - margin));

    let top = rect.bottom + gap;
    let placement = "below";
    if (top + popRect.height > window.innerHeight - margin && rect.top - gap - popRect.height >= margin) {
      top = rect.top - gap - popRect.height;
      placement = "above";
    }

    pop.style.left = `${Math.round(left)}px`;
    pop.style.top = `${Math.round(top)}px`;
    pop.dataset.placement = placement;
    // Strzałka wskazuje na środek przycisku, nawet po dosunięciu dymka do krawędzi.
    const arrowX = rect.left + rect.width / 2 - left;
    pop.style.setProperty("--arrow-x", `${Math.round(arrowX)}px`);
  }

  function closeOpen() {
    if (!openState) return;
    const { trigger, popover } = openState;
    popover.classList.remove("infotip-visible");
    trigger.setAttribute("aria-expanded", "false");
    const toRemove = popover;
    setTimeout(() => toRemove.remove(), 180);
    openState = null;
  }

  function open(trigger, def, pinned) {
    if (openState && openState.trigger === trigger) {
      openState.pinned = openState.pinned || pinned;
      return;
    }
    closeOpen();

    const id = `infotip-pop-${++popoverCounter}`;
    const pop = buildPopover(def, id, trigger);
    document.body.appendChild(pop);
    trigger.setAttribute("aria-controls", id);
    trigger.setAttribute("aria-expanded", "true");
    position(trigger, pop);
    // Osobna klatka, żeby przejście CSS (opacity/transform) zadziałało.
    requestAnimationFrame(() => pop.classList.add("infotip-visible"));

    openState = { trigger, popover: pop, pinned };

    pop.addEventListener("mouseleave", () => {
      if (openState && openState.popover === pop && !openState.pinned) {
        scheduleHoverClose(trigger);
      }
    });
    pop.addEventListener("mouseenter", cancelHoverClose);
  }

  let hoverCloseTimer = null;
  function scheduleHoverClose(trigger) {
    cancelHoverClose();
    hoverCloseTimer = setTimeout(() => {
      if (openState && openState.trigger === trigger && !openState.pinned) {
        closeOpen();
      }
    }, 160);
  }
  function cancelHoverClose() {
    if (hoverCloseTimer) {
      clearTimeout(hoverCloseTimer);
      hoverCloseTimer = null;
    }
  }

  function attachOne(trigger) {
    if (trigger.dataset.infotipReady === "1") return;
    const def = DEFINITIONS[resolveKey(trigger.dataset.infotip)];
    if (!def) return;
    trigger.dataset.infotipReady = "1";

    if (!trigger.textContent.trim()) trigger.textContent = "i";
    if (!trigger.getAttribute("aria-label")) {
      trigger.setAttribute("aria-label", def.title);
    }
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-expanded", "false");

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (openState && openState.trigger === trigger) {
        if (openState.pinned) closeOpen();
        else openState.pinned = true;
      } else {
        open(trigger, def, true);
      }
    });

    trigger.addEventListener("mouseenter", () => {
      cancelHoverClose();
      if (!openState || openState.trigger !== trigger) open(trigger, def, false);
    });
    trigger.addEventListener("mouseleave", () => {
      if (openState && openState.trigger === trigger && !openState.pinned) {
        scheduleHoverClose(trigger);
      }
    });
    trigger.addEventListener("focus", () => {
      if (!openState || openState.trigger !== trigger) open(trigger, def, false);
    });
    trigger.addEventListener("blur", () => {
      if (openState && openState.trigger === trigger && !openState.pinned) {
        // Daj szansę przenieść fokus do dymka (np. na link) przed zamknięciem.
        setTimeout(() => {
          if (openState && openState.trigger === trigger && !openState.pinned) {
            const active = document.activeElement;
            if (!openState.popover.contains(active)) closeOpen();
          }
        }, 120);
      }
    });
  }

  function attach(root) {
    (root || document).querySelectorAll("button[data-infotip]").forEach(attachOne);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && openState) {
      const trigger = openState.trigger;
      closeOpen();
      trigger.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (!openState) return;
    if (openState.popover.contains(e.target) || openState.trigger.contains(e.target)) return;
    closeOpen();
  });

  document.addEventListener("focusin", (e) => {
    if (!openState || !openState.pinned) return;
    if (openState.popover.contains(e.target) || openState.trigger === e.target) return;
    closeOpen();
  });

  function reposition() {
    if (openState) position(openState.trigger, openState.popover);
  }
  window.addEventListener("resize", reposition);
  window.addEventListener("scroll", reposition, true);

  window.Infotips = { attach, has, DEFINITIONS };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => attach(document));
  } else {
    attach(document);
  }
})();
