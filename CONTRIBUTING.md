# Współpraca

Dzięki za zainteresowanie projektem. Kilka zasad, które utrzymują `main` w stanie gotowym do publikacji (GitHub Pages wdraża każdy commit z `main` automatycznie).

## Jak zgłosić zmianę

1. Utwórz gałąź od `main` (np. `feature/nazwa` lub `fix/nazwa`). Nie pushuj bezpośrednio na `main`.
2. Przed wysłaniem uruchom testy: `npm ci && npm test`. Wszystkie muszą być zielone.
3. Otwórz pull request i wypełnij szablon. CI uruchomi testy i CodeQL; PR musi być zielony, żeby go zmergować.
4. Jedna zmiana = jeden PR. Większe pomysły opisz najpierw w issue.

## Zasady dla kodu

- Projekt to vanilla JS bez kroku budowania. Nie dodawaj zależności produkcyjnych ani skryptów z zewnętrznych CDN - strony mają politykę CSP `script-src 'self'`.
- Logika generatorów i formatów eksportu żyje w `static/data-generators.js` (współdzielona przez generator zbiorów i stronę API); algorytmy sum kontrolnych nie powinny być duplikowane.
- Nie używaj `innerHTML` z danymi - buduj DOM przez `textContent` / `createElement`.
- Nowe funkcje dostają testy w `test/` (Jest + jsdom).
- Pliki danych (`static/*.json`, `static/plewibnra_utf8.txt`) zawierają wyłącznie dane publiczne. Nie commituj danych osobowych ani sekretów.

## Boty i asystenci AI

PR-y generowane automatycznie (Jules, Palette, Claude itp.) podlegają tym samym zasadom: przechodzą przez CI i review, nie są mergowane bezpośrednio do `main`. Zduplikowane PR-y z tą samą zmianą będą zamykane.

## Licencja

Wysyłając PR, zgadzasz się, że Twój wkład jest udostępniany na licencji MIT (patrz `LICENSE`).
