// ====================================================
// Dawid i Goliat - pixelartowi towarzysze wędrujący po dole/bokach ekranu.
// Czysto dekoracyjne, bez wpływu na funkcjonalność strony (pointer-events:
// none poza samymi sprite'ami, żeby kliknięcie w nie dało małą reakcję).
// Sylwetki rysowane technika "box-shadow pixel art" - brak zewnętrznych
// obrazków.
// ====================================================
(function () {
  "use strict";

  if (document.getElementById("companions-layer")) return;

  const PX = 4; // rozmiar jednego "piksela" sprite'a w px

  function padRows(rows) {
    const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
    return rows.map((row) => row.padEnd(width, "."));
  }

  const OUTLINE_COLOR = "#14100c";

  // Dorysowuje ciemny 1-pikselowy kontur wokół sylwetki (klasyczna technika
  // pixel-artowa). Bez niego drobne, blokowe kształty (zwłaszcza cienkie
  // nogi) potrafią wtopić się w tło strony i sprawiać wrażenie "urwanych".
  function outlineCells(rows) {
    const height = rows.length;
    const width = rows[0].length;
    const filled = (x, y) =>
      y >= 0 && y < height && x >= 0 && x < width && rows[y][x] !== ".";
    const cells = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (filled(x, y)) continue;
        if (
          filled(x - 1, y) ||
          filled(x + 1, y) ||
          filled(x, y - 1) ||
          filled(x, y + 1) ||
          filled(x - 1, y - 1) ||
          filled(x + 1, y - 1) ||
          filled(x - 1, y + 1) ||
          filled(x + 1, y + 1)
        ) {
          cells.push([x, y]);
        }
      }
    }
    return cells;
  }

  // Rysuje siatkę pikseli od góry (rząd 0 = góra sylwetki) w dół, z
  // dorysowanym konturem. Element bazowy MUSI mieć jawnie ustawioną pełną
  // szerokość/wysokość sprite'a (patrz buildCompanion), żeby jego własny box
  // faktycznie obejmował całą postać - inaczej dymek z ikonką (bottom: 100%)
  // pozycjonowałby się względem jednego "piksela", a nie całej sylwetki.
  function rowsToBoxShadow(rows, palette) {
    const padded = padRows(rows);
    const shadows = [];
    // Kontur najpierw (rysowany "pod spodem"), potem kolorowe piksele na wierzchu.
    outlineCells(padded).forEach(([x, y]) => {
      shadows.push(`${x * PX}px ${y * PX}px 0 ${OUTLINE_COLOR}`);
    });
    padded.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const char = row[x];
        const color = palette[char];
        if (!color) continue;
        shadows.push(`${x * PX}px ${y * PX}px 0 ${color}`);
      }
    });
    return shadows.join(",");
  }

  // --- Dawid: mały pasterz z procą ---
  const DAVID_PALETTE = {
    h: "#5a3a1a",
    f: "#e8b98a",
    t: "#3a7ca5",
    u: "#28587a", // ciemniejszy odcień tuniki (prosty cień dla objętości)
    b: "#4a3418",
    s: "#2b2b2b",
    e: "#0d0d0d", // oczy
  };
  const DAVID_BODY = [
    "...h....", // czub włosów
    "..hhhh..",
    ".hfefeh.", // oczy
    "..ffff..",
    ".tttuuu.",
    "stttuuuu",
    ".tttuuu.",
    ".tttuuu.",
    ".tt..tt.",
  ];
  const DAVID_FRAMES = {
    A: rowsToBoxShadow(
      [...DAVID_BODY, ".bb..bb.", ".bb..bb."],
      DAVID_PALETTE,
    ),
    B: rowsToBoxShadow(
      [...DAVID_BODY, "bb....bb", "bb....bb"],
      DAVID_PALETTE,
    ),
  };
  const DAVID_WIDTH = 8;
  const DAVID_HEIGHT = DAVID_BODY.length + 2;

  // --- Goliat: opancerzony olbrzym ---
  const GOLIATH_PALETTE = {
    H: "#8a8f98",
    f: "#c99770",
    A: "#6b4a2a",
    a: "#4a331c", // ciemniejszy odcień zbroi (prosty cień dla objętości)
    D: "#b08d57",
    b: "#2e2116",
    e: "#0d0d0d", // oczy
    p: "#8a2a2a", // pióropusz hełmu
  };
  const GOLIATH_BODY = [
    "....pp......", // pióropusz
    "..HHHHHHHH..",
    ".HHHHHHHHHH.",
    ".HffefffefH.", // oczy
    "..ffffffff..",
    ".AAAAAaaaaa.",
    "AADAAAaaaDaa",
    ".AAAAAaaaaa.",
    ".AAAAAaaaaa.",
    ".AAAAAaaaaa.",
    "..AAAAAAAA..",
  ];
  const GOLIATH_FRAMES = {
    A: rowsToBoxShadow(
      [...GOLIATH_BODY, "..bbb..bbb..", "..bbb..bbb.."],
      GOLIATH_PALETTE,
    ),
    B: rowsToBoxShadow(
      [...GOLIATH_BODY, ".bbb....bbb.", ".bbb....bbb."],
      GOLIATH_PALETTE,
    ),
  };
  const GOLIATH_WIDTH = 12;
  const GOLIATH_HEIGHT = GOLIATH_BODY.length + 2;

  // --- Ikonki "dymków" nawiązujące do funkcji danej strony ---
  const ICON_PALETTES = {
    documents: { c: "#f5f0e0", l: "#3a7ca5" },
    validate: { g: "#2e7d32" },
    dataset: { d: "#c9a24b" },
    security: { h: "#8a8a8a", k: "#d4af37" },
    api: { n: "#4fc3f7", w: "#01579b" },
  };
  const ICON_ROWS = {
    documents: ["cccccc", "c.ll.c", "c....c", "c.ll.c", "cccccc"],
    validate: ["......", ".....g", "....g.", ".g.g..", "..g...", "......"],
    dataset: ["ddddddd", ".ddddd.", "ddddddd", ".ddddd.", "ddddddd"],
    security: [".hhhh.", "h....h", "kkkkkk", "kkkkkk", "kk..kk", "kkkkkk"],
    // Węzły sieci połączone liniami - nawiązuje do wywołań API.
    api: ["n.n.n", ".www.", "n.w.n", ".www.", "n.n.n"],
    // Iskierka pokazywana, gdy Dawid i Goliat się spotkają (patrz encounter).
    spark: ["..y..", ".yyy.", "yyyyy", ".yyy.", "..y.."],
  };
  const ICON_PALETTES_ALL = { ...ICON_PALETTES, spark: { y: "#ffd23f" } };
  const ICON_SHADOWS = Object.fromEntries(
    Object.keys(ICON_ROWS).map((key) => [
      key,
      rowsToBoxShadow(ICON_ROWS[key], ICON_PALETTES_ALL[key]),
    ]),
  );

  // Motyw dobierany wg aktualnej strony - nawiązuje do jej funkcji.
  const THEME_BY_PAGE = {
    "index.html": "documents",
    "": "documents",
    "validator.html": "validate",
    "dataset-generator.html": "dataset",
    "passwords.html": "security",
    "api.html": "api",
  };
  const pageName = location.pathname.split("/").pop() || "index.html";
  const theme = THEME_BY_PAGE[pageName] || "documents";

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Budowa DOM ---
  const layer = document.createElement("div");
  layer.id = "companions-layer";
  layer.className = "companions-layer";
  layer.setAttribute("aria-hidden", "true");

  function buildCompanion(id, widthCols, heightRows) {
    const wrap = document.createElement("div");
    wrap.className = "companion";
    wrap.id = id;

    const prop = document.createElement("div");
    prop.className = "companion-prop";
    const propInner = document.createElement("div");
    propInner.style.boxShadow = ICON_SHADOWS[theme];
    prop.appendChild(propInner);

    const flip = document.createElement("div");
    flip.className = "companion-flip";

    // WAŻNE: technika "box-shadow pixel art" wymaga, żeby element bazowy
    // (.companion-sprite) był rozmiaru JEDNEGO piksela (PX x PX) - box-shadow
    // bez "spread" kopiuje kształt/rozmiar CAŁEGO boxa, więc powiększenie go
    // do rozmiaru całej postaci sprawia, że każdy "piksel" staje się kopią
    // całego dużego prostokąta i obraz się rozjeżdża. Dlatego pełny rozmiar
    // sylwetki ustawiamy na OSOBNYM kontenerze (.companion-body), żeby dymek
    // z ikonką (bottom: 100% względem .companion) poprawnie pozycjonował się
    // nad głową, a sam sprite zostaje mały.
    const body = document.createElement("div");
    body.className = "companion-body";
    body.style.width = `${widthCols * PX}px`;
    body.style.height = `${heightRows * PX}px`;

    const sprite = document.createElement("div");
    sprite.className = "companion-sprite";
    sprite.style.width = `${PX}px`;
    sprite.style.height = `${PX}px`;

    body.appendChild(sprite);
    flip.appendChild(body);
    wrap.appendChild(prop);
    wrap.appendChild(flip);

    return { wrap, prop, propInner, flip, body, sprite };
  }

  const david = buildCompanion("companion-david", DAVID_WIDTH, DAVID_HEIGHT);
  const goliath = buildCompanion(
    "companion-goliath",
    GOLIATH_WIDTH,
    GOLIATH_HEIGHT,
  );
  layer.appendChild(david.wrap);
  layer.appendChild(goliath.wrap);
  document.body.appendChild(layer);

  // Pokazuje na chwilę dymek z podaną ikonką (domyślnie ikonka tematyczna
  // strony), po czym przywraca ikonkę tematyczną - używane też przy
  // spotkaniach Dawida i Goliata (patrz startEncounter niżej).
  function showPropIcon(el, iconKey) {
    el.propInner.style.boxShadow = ICON_SHADOWS[iconKey];
    el.prop.classList.add("show");
    setTimeout(() => {
      el.prop.classList.remove("show");
      if (iconKey !== theme) {
        setTimeout(() => {
          el.propInner.style.boxShadow = ICON_SHADOWS[theme];
        }, 300);
      }
    }, 1500);
  }

  // --- Silnik ruchu: prosty automat stanów na jedną postać ---
  // Stany: walk | pause | toEdge | climbUp | climbIdle | climbDown
  //        | toEncounter | encounterWait | encounter (spotkanie z drugą postacią)
  function createWalker(el, frames, spriteWidthPx, opts) {
    const state = {
      x: opts.startX,
      groundY: 0,
      climbTarget: 0,
      direction: 1,
      mode: "walk",
      modeUntil: performance.now() + 1000 + Math.random() * 2000,
      frame: "A",
      frameToggleAt: performance.now() + opts.frameInterval,
      nextPropAt:
        performance.now() + opts.propMinDelay + Math.random() * opts.propMinDelay,
      encounterTargetX: 0,
    };

    function setFrame(name) {
      if (state.frame === name) return;
      state.frame = name;
      el.sprite.style.boxShadow = frames[name];
    }
    setFrame("A");

    function showProp() {
      showPropIcon(el, theme);
    }

    function setIdleSway(on) {
      el.body.classList.toggle("companion-idle", on);
    }

    function maxX() {
      return Math.max(0, window.innerWidth - spriteWidthPx);
    }

    // Wspólna animacja "kroczenia" (klatki nóg + lekkie podbicie w górę na
    // co drugiej klatce) - używana zarówno w normalnym chodzeniu, jak i przy
    // podchodzeniu do spotkania.
    function advanceWalkFrame(now) {
      if (now >= state.frameToggleAt) {
        setFrame(state.frame === "A" ? "B" : "A");
        state.frameToggleAt = now + opts.frameInterval;
      }
    }

    function tick(now, dt) {
      // Losowe pojawianie się "dymka" z ikonką nawiązującą do strony.
      if (
        now >= state.nextPropAt &&
        state.mode !== "encounter" &&
        state.mode !== "encounterWait"
      ) {
        showProp();
        state.nextPropAt =
          now + opts.propMinDelay + Math.random() * opts.propMinDelay * 1.5;
      }

      if (state.mode === "walk") {
        advanceWalkFrame(now);

        state.x += state.direction * opts.speed * dt;
        const limit = maxX();
        if (state.x <= 0) {
          state.x = 0;
          state.direction = 1;
        } else if (state.x >= limit) {
          state.x = limit;
          state.direction = -1;
        } else if (!prefersReducedMotion && Math.random() < opts.turnChance * dt) {
          state.direction *= -1;
        }

        if (!prefersReducedMotion && now >= state.modeUntil) {
          if (Math.random() < 0.35) {
            state.mode = "pause";
            setFrame("A");
            setIdleSway(true);
            state.modeUntil = now + 1200 + Math.random() * 1800;
          } else if (Math.random() < 0.3) {
            // Wycieczka na bok ekranu.
            state.direction = state.x > limit / 2 ? 1 : -1;
            state.mode = "toEdge";
          } else {
            state.modeUntil = now + 4000 + Math.random() * 6000;
          }
        }
      } else if (state.mode === "pause") {
        if (now >= state.modeUntil) {
          setIdleSway(false);
          state.mode = "walk";
          state.modeUntil = now + 4000 + Math.random() * 6000;
        }
      } else if (state.mode === "toEdge") {
        const limit = maxX();
        state.x += state.direction * opts.speed * 1.4 * dt;
        const atEdge = state.direction > 0 ? state.x >= limit : state.x <= 0;
        state.x = Math.min(limit, Math.max(0, state.x));
        if (atEdge) {
          state.mode = "climbUp";
          state.climbTarget =
            40 + Math.random() * (window.innerHeight * 0.25);
          setFrame("A");
        }
      } else if (state.mode === "climbUp") {
        state.groundY += opts.climbSpeed * dt;
        if (state.groundY >= state.climbTarget) {
          state.groundY = state.climbTarget;
          state.mode = "climbIdle";
          state.modeUntil = now + 1500 + Math.random() * 1500;
        }
      } else if (state.mode === "climbIdle") {
        if (now >= state.modeUntil) {
          state.mode = "climbDown";
        }
      } else if (state.mode === "climbDown") {
        state.groundY -= opts.climbSpeed * dt;
        if (state.groundY <= 0) {
          state.groundY = 0;
          state.mode = "walk";
          state.modeUntil = now + 4000 + Math.random() * 6000;
        }
      } else if (state.mode === "toEncounter") {
        // Podchodzenie do drugiej postaci na wspólne spotkanie.
        const target = state.encounterTargetX;
        state.direction = target >= state.x ? 1 : -1;
        advanceWalkFrame(now);
        state.x += state.direction * opts.speed * dt;
        if (
          (state.direction > 0 && state.x >= target) ||
          (state.direction < 0 && state.x <= target)
        ) {
          state.x = target;
          state.mode = "encounterWait";
          setFrame("A");
        }
      }
      // "encounterWait" i "encounter" celowo nic nie robią w tick() -
      // postać po prostu stoi w miejscu, animacje reakcji obsługuje
      // startEncounter() poniżej.

      const bob =
        (state.mode === "walk" || state.mode === "toEncounter") &&
        state.frame === "B" &&
        !prefersReducedMotion
          ? opts.bobAmount
          : 0;
      el.wrap.style.transform = `translate3d(${state.x}px, ${-(state.groundY + bob)}px, 0)`;
      el.flip.style.transform = `scaleX(${state.direction})`;
    }

    // Reakcja na kliknięcie: mały podskok + natychmiastowy dymek.
    // Nasłuch na .companion-body (pełny rozmiar postaci), nie na malutkim
    // .companion-sprite, żeby obszar klikalny obejmował całą sylwetkę.
    el.body.addEventListener("click", () => {
      showProp();
      el.flip.classList.add("companion-bounce");
      setTimeout(() => el.flip.classList.remove("companion-bounce"), 400);
    });

    return { tick, state, maxX, setIdleSway };
  }

  const davidWalker = createWalker(david, DAVID_FRAMES, DAVID_WIDTH * PX, {
    startX: 40,
    speed: 48,
    climbSpeed: 30,
    frameInterval: 160,
    turnChance: 0.03,
    propMinDelay: 9000,
    bobAmount: 2,
  });
  const goliathWalker = createWalker(
    goliath,
    GOLIATH_FRAMES,
    GOLIATH_WIDTH * PX,
    {
      startX: window.innerWidth - GOLIATH_WIDTH * PX - 60,
      speed: 24,
      climbSpeed: 18,
      frameInterval: 260,
      turnChance: 0.02,
      propMinDelay: 12000,
      bobAmount: 1,
    },
  );

  // --- Spotkania Dawida i Goliata: interakcja między postaciami ---
  // Co jakiś czas obaj przerywają wędrówkę, schodzą się na środek, "witają
  // się" (podskok + iskierka nad głową) i rozchodzą w przeciwne strony.
  let nextEncounterAt =
    performance.now() + 10000 + Math.random() * 8000;

  function tryStartEncounter(now) {
    if (now < nextEncounterAt) return;
    if (davidWalker.state.mode !== "walk" || goliathWalker.state.mode !== "walk") {
      return; // spróbuj ponownie, gdy oboje będą swobodnie chodzić
    }

    const limit = Math.max(0, window.innerWidth - GOLIATH_WIDTH * PX);
    const meetX = 60 + Math.random() * Math.max(1, limit - 120);
    const gap = 26; // odstęp między postaciami przy spotkaniu

    davidWalker.state.mode = "toEncounter";
    davidWalker.state.encounterTargetX = Math.max(0, meetX - gap);

    goliathWalker.state.mode = "toEncounter";
    goliathWalker.state.encounterTargetX = Math.min(limit, meetX + gap);

    nextEncounterAt = now + 22000 + Math.random() * 20000;
  }

  function runEncounterReaction() {
    // Zwróć postacie twarzą do siebie.
    davidWalker.state.direction =
      goliathWalker.state.x >= davidWalker.state.x ? 1 : -1;
    goliathWalker.state.direction =
      davidWalker.state.x >= goliathWalker.state.x ? 1 : -1;
    david.flip.style.transform = `scaleX(${davidWalker.state.direction})`;
    goliath.flip.style.transform = `scaleX(${goliathWalker.state.direction})`;

    davidWalker.state.mode = "encounter";
    goliathWalker.state.mode = "encounter";

    showPropIcon(david, "spark");
    david.flip.classList.add("companion-bounce");
    setTimeout(() => {
      showPropIcon(goliath, "spark");
      goliath.flip.classList.add("companion-bounce");
    }, 220);
    setTimeout(() => {
      david.flip.classList.remove("companion-bounce");
      goliath.flip.classList.remove("companion-bounce");
    }, 700);

    setTimeout(() => {
      const now = performance.now();
      davidWalker.state.mode = "walk";
      davidWalker.state.direction = -1;
      davidWalker.state.modeUntil = now + 4000 + Math.random() * 4000;

      goliathWalker.state.mode = "walk";
      goliathWalker.state.direction = 1;
      goliathWalker.state.modeUntil = now + 4000 + Math.random() * 4000;
    }, 2000);
  }

  if (prefersReducedMotion) {
    // Bez ciągłego wędrowania - postacie stoją, wciąż można je "poklikać".
    david.wrap.style.transform = `translate3d(${davidWalker.state.x}px, 0, 0)`;
    goliath.wrap.style.transform = `translate3d(${goliathWalker.state.x}px, 0, 0)`;
  } else {
    let lastTime = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      davidWalker.tick(now, dt);
      goliathWalker.tick(now, dt);

      tryStartEncounter(now);
      if (
        davidWalker.state.mode === "encounterWait" &&
        goliathWalker.state.mode === "encounterWait"
      ) {
        runEncounterReaction();
      }

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", () => {
    davidWalker.state.x = Math.min(
      davidWalker.state.x,
      Math.max(0, window.innerWidth - DAVID_WIDTH * PX),
    );
    goliathWalker.state.x = Math.min(
      goliathWalker.state.x,
      Math.max(0, window.innerWidth - GOLIATH_WIDTH * PX),
    );
  });
})();
