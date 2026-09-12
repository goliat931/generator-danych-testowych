# Generator Danych Testowych

Ten projekt to prosta aplikacja webowa do generowania i walidacji losowych danych testowych Polski, takich jak numery PESEL, dowody osobiste, numery REGON, numery NRB/IBAN (w tym zagraniczne rachunki), hasła oraz całe zbiory danych testowych.

https://goliat931.github.io/generator-danych-testowych/

## Strony aplikacji

### 1. **Generator Danych** (index.html)

Główna strona aplikacji umożliwiająca generowanie pojedynczych numerów:

- **PESEL** - z opcjami wyboru płci, roku, miesiąca i dnia urodzenia
- **Dowód Osobisty (ID)** - generuje numery dowodów z prawidłowym checksumem
- **REGON** - generuje 9-cyfrowe lub 14-cyfrowe numery REGON
- **NRB / IBAN** - generuje polskie numery NRB z rzeczywistymi kodami banków, a także zagraniczne numery IBAN (Niemcy, Wielka Brytania, Francja, Czechy, Słowacja, USA, Szwajcaria) z opcją wyboru: znany bank z prawdziwą nazwą i kodem SWIFT, albo w pełni losowy (ale poprawny formatem) kod banku
- **Imiona i Nazwiska** - losowe imiona i nazwiska polskie

Każdy wygenerowany numer wyświetla dodatkowe metadane:

- PESEL: wiek, płeć, data urodzenia, nazwa banku
- Inne: odpowiednie informacje walidacyjne

Funkcje:

- 🌙 Tryb ciemny/jasny z persystencją w localStorage
- 📋 Kopiowanie do schowka z powiadomieniem toast
- 📱 Responsywny layout (mobile, tablet, desktop)

### 2. **Walidatory Danych** (validator.html)

Strona do walidacji wygenerowanych lub użytkownika danych:

- Weryfikacja PESEL-u (checksum, format, metadata)
- Weryfikacja ID/Dowodu Osobistego (checksum, format)
- Weryfikacja REGON (checksum dla 9 i 14 cyfr)
- Weryfikacja NRB (checksum IBAN, kod banku)

Każdy walidator wyświetla szczegółowe wyniki:

- Status walidacji (✓ prawidłowy / ✗ nieprawidłowy)
- Metadane (wiek, płeć, nazwa banku itd.)
- Szczegóły błędów

### 3. **Generator Zbiorów Danych** (dataset-generator.html)

Zaawansowana strona do generowania masowych zbiorów danych:

**Funkcjonalność:**

- 🔄 Wybór pól do wygenerowania (PESEL, ID, REGON, Imię, Nazwisko oraz dodatkowe pola testowe: token z datą, dane osobowe, dane adresowe, email, rachunek bankowy, NIP, nazwa firmy, komentarze i inne)
- ⬆️⬇️ Zmiana kolejności pól za pomocą drag & drop
- 🔢 Konfiguracja liczby rekordów (1-100,000)
- 📦 Wybór formatu eksportu:
  - **CSV** - z opcją wyboru separatora (przecinek, średnik, tabulacja, rura)
  - **JSON** - sformatowany, gotowy do parsowania
  - **XML** - z prawidłową strukturą XML
  - **SQL** - wsadowe instrukcje `INSERT INTO` (z konfigurowalną nazwą tabeli), gotowe do wklejenia do bazy danych
- 👀 Podgląd danych (pierwsze 5 wierszy)
- 📋 Generuj (wyświetla podgląd)
- 📥 Pobierz (pobiera plik)

### 4. **Generator Haseł** (passwords.html)

Strona do generowania losowych haseł testowych:

- Konfigurowalna długość hasła (4-128 znaków)
- Wybór zestawów znaków: małe/wielkie litery, cyfry, znaki specjalne, znaki diakrytyczne (ąćęłńóśźż)
- Wykluczanie znaków podobnych (l, 1, I, O, 0)
- Generowanie wielu haseł naraz (lista)
- Wskaźnik siły hasła
- Hasła generują się na bieżąco po każdej zmianie ustawień (bez przycisku)

### 5. **API** (api.html)

Strona pozwalająca pobrać gotowy zestaw danych bezpośrednio przez adres URL z parametrami, np.:

```
api.html?fields=pesel,imie,nazwa,mail&count=20&format=json
```

Dostępne parametry: `fields` (lista kluczy pól po przecinku), `count` (1-5000), `format` (`json`/`csv`/`xml`/`sql`), `separator` (dla CSV) oraz `table` (dla SQL). Wynik generuje się od razu po otwarciu strony, a każda zmiana ustawień w formularzu na żywo aktualizuje wynik i adres URL, który można skopiować i zapisać na później.

> **Uwaga:** to jest "API" po stronie przeglądarki, nie prawdziwy serwer - aplikacja jest hostowana statycznie (GitHub Pages), więc dane generuje JavaScript uruchomiony w karcie przeglądarki. Zadziała po otwarciu URL-a w przeglądarce (albo w narzędziu sterującym prawdziwą przeglądarką, np. Playwright/Selenium/Puppeteer), ale **nie zadziała** z `curl`, Postmana ani żadnego backendu wysyłającego zwykłe zapytanie HTTP GET - taki klient dostanie surowy plik HTML zamiast wygenerowanych danych.

## Jak używać

### Generator Danych:

1. Otwórz stronę w przeglądarce (index.html)
2. Wybierz opcje generowania (np. płeć, rok, miesiąc dla PESEL-u)
3. Kliknij przycisk generowania
4. Kliknij na wygenerowany numer, aby skopiować go do schowka

### Walidatory:

1. Przejdź na stronę "Walidatory Danych"
2. Wpisz numer do walidacji
3. Kliknij "Waliduj"
4. Zobaczysz szczegółowe wyniki oraz metadane

### Generator Zbiorów:

1. Przejdź na stronę "Generator Zbiorów"
2. Zaznacz pola, które mają się znaleźć w zbiorze
3. Zmień kolejność (drag & drop)
4. Podaj liczbę rekordów
5. Wybierz format (CSV/JSON/XML/SQL) i separator (dla CSV) lub nazwę tabeli (dla SQL)
6. Kliknij "Generuj"
7. Sprawdź podgląd
8. Kliknij "Pobierz" aby pobrać plik

### Generator Haseł:

1. Przejdź na stronę "Generator Haseł"
2. Ustaw długość, liczbę haseł i zestawy znaków
3. Hasła generują się automatycznie - kliknij hasło, aby je skopiować

### API:

1. Przejdź na stronę "API"
2. Zaznacz pola, ustaw liczbę rekordów i format
3. Skopiuj gotowy URL albo dane wynikowe, albo pobierz plik

## Formaty danych

### PESEL (11 cyfr)

Numer Powszechnego Elektronicznego Systemu Ewidencji Ludności

- Cyfry 1-6: data urodzenia (YYMMDD)
- Cyfry 7-9: numer seryjny
- Cyfra 10: płeć (nieparzysta=mężczyzna, parzysta=kobieta)
- Cyfra 11: checksum

### ID/Dowód Osobisty (3 litery + 6 cyfr + checksum)

- Format: ABC123456X
- Weryfikacja checksumu

### REGON (9 lub 14 cyfr)

Rejestr Gospodarki Narodowej

- 9 cyfr: dla osób fizycznych
- 14 cyfr: dla podmiotów gospodarczych
- Ostatnia cyfra to checksum

### NRB / IBAN

Numer Rachunku Bankowego

- Polska: PL + 24 cyfry (NRB), z prawdziwymi kodami banków
- Zagraniczne: IBAN dla Niemiec, Wielkiej Brytanii, Francji, Czech, Słowacji, USA i Szwajcarii - z opcją znanego banku (nazwa + SWIFT) albo w pełni losowego kodu banku
- Weryfikacja sumy kontrolnej IBAN (mod 97-10, ISO 7064)

### Imiona i Nazwiska

Polskie imiona i nazwiska z rzeczywistych baz danych.

## Funkcje

✅ Generowanie prawidłowych numerów z checksumami
✅ Walidacja formatów i checksumów
✅ Metadane dla każdego numeru (np. wiek z PESEL-u)
✅ Baza kodów bankowych dla weryfikacji NRB
✅ Zagraniczne numery IBAN (7 krajów) ze znanym bankiem/SWIFT-em albo w pełni losowym kodem
✅ Generator haseł z konfigurowalnymi zestawami znaków i wskaźnikiem siły
✅ Tryb ciemny/jasny z preferencjami przeglądarki
✅ Responsywny design
✅ Kopiowanie do schowka
✅ Export zbiorów w CSV/JSON/XML/SQL
✅ Drag & drop do zmiany kolejności pól
✅ Strona API do pobierania zestawów danych przez parametry URL (tryb przeglądarki)
✅ Zintegrowana biblioteka **Faker.js** dla realistycznych danych testowych
✅ Bez wymaganych zewnętrznych zależności (vanilla JS + Faker z CDN)

## Baza danych bankowych

Projekt zawiera plik `plewibnra_utf8.txt` z oficjalną listą polskich banków i ich kodami. Dane są przetwarzane na `bank_codes.json` zawierający:

- 3-cyfrowe kody banków
- 8-cyfrowe kody oddziałów
- Nazwy bankowych instytucji

## Architektura generowania danych

Logika generatorów pól i formatów eksportu (CSV/XML/SQL) żyje we wspólnym module `static/data-generators.js`, z którego korzystają zarówno generator zbiorów (`dataset-generator.html`), jak i strona API (`api.html`) - dzięki temu algorytmy sum kontrolnych są zdefiniowane w jednym miejscu.

### Generatory autorskie (własne implementacje):

- **PESEL** - algorytm z checksumem, kodowanie płci i stulecia
- **Dowód Osobisty (ID)** - format ABC123456X z checksumem
- **REGON** - 9 lub 14 cyfrowe numery z checksumem
- **NRB (IBAN)** - format PL + 24 cyfry z checksumem IBAN, kody banków z bazy
- **NIP** - 10-cyfrowy numer z checksumem mod 11

### Dane z plików JSON (polskie słowniki):

- **Imiona** - maleNames, femaleNames (rzeczywiste imiona polskie)
- **Nazwiska** - polskie nazwiska z bazy danych

### Dane z biblioteki Faker.js (CDN):

- **Miasta** - kombinacja polskich miast + Faker (60% polskie, 40% od Faker)
- **Ulice** - kombinacja polskich nazw ulic + Faker
- **Telefony** - format polski za pomocą Faker
- **Email** - domeny polskie (wp.pl, onet.pl, o2.pl, interia.pl, gazeta.pl, tlen.pl)
- **Nazwy firm** - Faker + polskie sufiksy (Sp. z o.o., S.A., Sp. k., Sp. j.)
- **Daty** - losowe daty między wstawionymi przedziałami
- **Inne** - komentarze, sezonowe dane itp.
