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
    h: "#5c3a21",
    s: "#f2c49b",
    t: "#4a7a96",
    b: "#3a2a18",
    e: "#111111",
    p: "#8b5a2b",
    l: "#969696",
  };
  const DAVID_BODY_A = [
    "....hhhh....",
    "...hhsshh...",
    "...hse.es...",
    "...hssssh...",
    "....ssss....",
    "...ltttt....",
    "..l.tttt.p..",
    ".l..tttt..p.",
    "....tttt....",
    "...bbbbbb...",
    "...b....b...",
    "..bbb..bbb..",
  ];
  const DAVID_BODY_B = [
    "....hhhh....",
    "...hhsshh...",
    "...hse.es...",
    "...hssssh...",
    "....ssss....",
    "...ltttt....",
    "..l.tttt.p..",
    ".l..tttt..p.",
    "....tttt....",
    "...bbbbbb...",
    "...bb..bb...",
    "...bb..bb...",
  ];
  const DAVID_FRAMES = {
    A: rowsToBoxShadow(DAVID_BODY_A, DAVID_PALETTE),
    B: rowsToBoxShadow(DAVID_BODY_B, DAVID_PALETTE),
  };
  const DAVID_WIDTH = 12;
  const DAVID_HEIGHT = 12;

  // --- Goliat: opancerzony olbrzym ---
  const GOLIATH_PALETTE = {
    H: "#707780",
    S: "#8a939e",
    f: "#d1a384",
    A: "#573a20",
    D: "#c49a45",
    b: "#21160e",
    e: "#111111",
    r: "#a83232",
  };
  const GOLIATH_BODY_A = [
    "......rrrr......",
    ".....rrrrrr.....",
    "....HHHHHHHH....",
    "...HSHHHHHHSH...",
    "...HHfffffHHH...",
    "...HHfe.efHHH...",
    "....HfffffHH....",
    "....HHHHHHHH....",
    "...HHHAAAAHHH...",
    "..HHHHAAAAHHHH..",
    "..HHHHADDDHHHH..",
    "..HHHHAAAAHHHH..",
    "...HHHHHHHHHH...",
    "...HH......HH...",
    "..bbb......bbb..",
    "..bbb......bbb..",
  ];
  const GOLIATH_BODY_B = [
    "......rrrr......",
    ".....rrrrrr.....",
    "....HHHHHHHH....",
    "...HSHHHHHHSH...",
    "...HHfffffHHH...",
    "...HHfe.efHHH...",
    "....HfffffHH....",
    "....HHHHHHHH....",
    "...HHHAAAAHHH...",
    "..HHHHAAAAHHHH..",
    "..HHHHADDDHHHH..",
    "..HHHHAAAAHHHH..",
    "...HHHHHHHHHH...",
    "...HH......HH...",
    "...bbb....bbb...",
    "...bbb....bbb...",
  ];
  const GOLIATH_FRAMES = {
    A: rowsToBoxShadow(GOLIATH_BODY_A, GOLIATH_PALETTE),
    B: rowsToBoxShadow(GOLIATH_BODY_B, GOLIATH_PALETTE),
  };
  const GOLIATH_WIDTH = 16;
  const GOLIATH_HEIGHT = 16;

  // --- Ikonki "dymków" nawiązujące do funkcji danej strony ---
  const ICON_PALETTES = {
    documents: { c: "#f5f0e0", l: "#3a7ca5" },
    validate: { g: "#2e7d32" },
    dataset: { d: "#c9a24b" },
    security: { h: "#8a8a8a", k: "#d4af37" },
    interact: { e: "#e74c3c" },
  };
  const ICON_ROWS = {
    documents: ["cccccc", "c.ll.c", "c....c", "c.ll.c", "cccccc"],
    validate: ["......", ".....g", "....g.", ".g.g..", "..g...", "......"],
    dataset: ["ddddddd", ".ddddd.", "ddddddd", ".ddddd.", "ddddddd"],
    security: [".hhhh.", "h....h", "kkkkkk", "kkkkkk", "kk..kk", "kkkkkk"],
    interact: ["...", ".e.", ".e.", ".e.", "...", ".e.", "..."],
  };
  const ICON_SHADOWS = Object.fromEntries(
    Object.keys(ICON_ROWS).map((key) => [
      key,
      rowsToBoxShadow(ICON_ROWS[key], ICON_PALETTES[key]),
    ]),
  );

  // Motyw dobierany wg aktualnej strony - nawiązuje do jej funkcji.
  const THEME_BY_PAGE = {
    "index.html": "documents",
    "": "documents",
    "validator.html": "validate",
    "dataset-generator.html": "dataset",
    "passwords.html": "security",
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

  // --- Silnik ruchu: prosty automat stanów na jedną postać ---
  function createWalker(el, frames, spriteWidthPx, opts) {
    const state = {
      x: opts.startX,
      groundY: 0,
      climbTarget: 0,
      direction: opts.startDirection || 1,
      mode: "walk", // walk | pause | climbUp | climbDown | climbIdle
      modeUntil: performance.now() + 1000 + Math.random() * 2000,
      frame: "A",
      frameToggleAt: performance.now() + opts.frameInterval,
      nextPropAt:
        performance.now() +
        opts.propMinDelay +
        Math.random() * opts.propMinDelay,
    };

    function setFrame(name) {
      if (state.frame === name) return;
      state.frame = name;
      el.sprite.style.boxShadow = frames[name];
    }
    setFrame("A");

    function showProp(overrideTheme) {
      const currentTheme = overrideTheme || theme;
      el.propInner.style.boxShadow = ICON_SHADOWS[currentTheme];
      el.prop.classList.add("show");
      setTimeout(() => {
        el.prop.classList.remove("show");
        setTimeout(() => {
          el.propInner.style.boxShadow = ICON_SHADOWS[theme];
        }, 250);
      }, 1500);
    }

    function maxX() {
      return Math.max(0, window.innerWidth - spriteWidthPx);
    }

    function tick(now, dt) {
      // Losowe pojawianie się "dymka" z ikonką nawiązującą do strony.
      if (now >= state.nextPropAt) {
        showProp();
        state.nextPropAt =
          now + opts.propMinDelay + Math.random() * opts.propMinDelay * 1.5;
      }

      if (state.mode === "walk") {
        setFrame(
          now >= state.frameToggleAt
            ? state.frame === "A"
              ? "B"
              : "A"
            : state.frame,
        );
        if (now >= state.frameToggleAt) {
          state.frameToggleAt = now + opts.frameInterval;
        }

        state.x += state.direction * opts.speed * dt;
        const limit = maxX();
        if (state.x <= 0) {
          state.x = 0;
          state.direction = 1;
        } else if (state.x >= limit) {
          state.x = limit;
          state.direction = -1;
        } else if (
          !prefersReducedMotion &&
          Math.random() < opts.turnChance * dt
        ) {
          state.direction *= -1;
        }

        if (!prefersReducedMotion && now >= state.modeUntil) {
          if (Math.random() < 0.35) {
            state.mode = "pause";
            setFrame("A");
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
          state.climbTarget = 40 + Math.random() * (window.innerHeight * 0.25);
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
      }

      el.wrap.style.transform = `translate3d(${state.x}px, ${-state.groundY}px, 0)`;
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

    return { tick, state, el, setFrame, showProp };
  }

  const davidWalker = createWalker(david, DAVID_FRAMES, DAVID_WIDTH * PX, {
    startX: 40,
    speed: 48,
    climbSpeed: 30,
    frameInterval: 160,
    turnChance: 0.03,
    propMinDelay: 9000,
  });
  const goliathWalker = createWalker(
    goliath,
    GOLIATH_FRAMES,
    GOLIATH_WIDTH * PX,
    {
      startX: window.innerWidth - GOLIATH_WIDTH * PX - 60,
      startDirection: -1,
      speed: 24,
      climbSpeed: 18,
      frameInterval: 260,
      turnChance: 0.02,
      propMinDelay: 12000,
    },
  );

  let interactionCooldown = 0;

  if (prefersReducedMotion) {
    // Bez ciągłego wędrowania - postacie stoją, wciąż można je "poklikać".
    david.wrap.style.transform = `translate3d(${davidWalker.state.x}px, 0, 0)`;
    goliath.wrap.style.transform = `translate3d(${goliathWalker.state.x}px, 0, 0)`;
  } else {
    let lastTime = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // Obsługa interakcji między postaciami
      if (
        now > interactionCooldown &&
        davidWalker.state.groundY === 0 &&
        goliathWalker.state.groundY === 0 &&
        davidWalker.state.mode === "walk" &&
        goliathWalker.state.mode === "walk"
      ) {
        const dx =
          davidWalker.state.x +
          (DAVID_WIDTH * PX) / 2 -
          (goliathWalker.state.x + (GOLIATH_WIDTH * PX) / 2);

        if (Math.abs(dx) < 60) {
          // Są blisko, robimy interakcję
          davidWalker.state.mode = "pause";
          goliathWalker.state.mode = "pause";
          davidWalker.state.modeUntil = now + 2000;
          goliathWalker.state.modeUntil = now + 2000;

          // Zwracają się ku sobie
          davidWalker.state.direction = dx < 0 ? 1 : -1;
          goliathWalker.state.direction = dx > 0 ? 1 : -1;

          davidWalker.setFrame("A");
          goliathWalker.setFrame("A");

          davidWalker.el.flip.classList.add("companion-bounce");
          goliathWalker.el.flip.classList.add("companion-bounce");

          davidWalker.showProp("interact");
          setTimeout(() => goliathWalker.showProp("interact"), 300);

          setTimeout(() => {
            davidWalker.el.flip.classList.remove("companion-bounce");
            goliathWalker.el.flip.classList.remove("companion-bounce");
          }, 400);

          // Po interakcji odchodzą w przeciwnych kierunkach
          setTimeout(() => {
            davidWalker.state.direction *= -1;
            goliathWalker.state.direction *= -1;
            davidWalker.state.mode = "walk";
            goliathWalker.state.mode = "walk";
            davidWalker.state.modeUntil = now + 4000 + Math.random() * 6000;
            goliathWalker.state.modeUntil = now + 4000 + Math.random() * 6000;
          }, 2000);

          interactionCooldown = now + 15000 + Math.random() * 10000;
        }
      }

      davidWalker.tick(now, dt);
      goliathWalker.tick(now, dt);
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
