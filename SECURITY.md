# Polityka bezpieczeństwa / Security Policy

## Zakres

Generator Danych Testowych to statyczna aplikacja (HTML/CSS/JavaScript) hostowana na GitHub Pages. Nie ma backendu, nie przechowuje ani nie przesyła danych użytkowników; wszystkie dane generowane są lokalnie w przeglądarce. Generowane numery (PESEL, REGON, NRB itd.) są losowe i służą wyłącznie do testów.

## Zgłaszanie podatności

Jeśli znajdziesz lukę bezpieczeństwa, **nie otwieraj publicznego issue**. Zamiast tego:

1. Użyj formularza **Report a vulnerability** w zakładce _Security_ tego repozytorium (GitHub Private Vulnerability Reporting):
   https://github.com/goliat931/generator-danych-testowych/security/advisories/new
2. Opisz, czego dotyczy problem, jak go odtworzyć i jaki ma potencjalny skutek.

Odpowiedź w ciągu 7 dni; poprawka lub plan naprawy w ciągu 30 dni od potwierdzenia.

Zgłoszenia, które nie dotyczą bezpieczeństwa (błędy w generowaniu, walidacji, UI), prosimy kierować do zwykłych [issues](https://github.com/goliat931/generator-danych-testowych/issues).

## Wspierane wersje

Wspierana jest wyłącznie bieżąca zawartość gałęzi `main` (to, co jest opublikowane na GitHub Pages).

---

**English:** This is a static, client-only web app with no backend. To report a security issue, please use GitHub's private vulnerability reporting for this repository (link above) rather than a public issue. Only the current `main` branch is supported.
