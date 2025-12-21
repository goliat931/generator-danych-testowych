# Generator Danych Testowych

Ten projekt to prosta aplikacja webowa do generowania i walidacji losowych danych testowych Polski, takich jak numery PESEL, dowody osobiste, numery REGON i numery NRB.

https://goliat931.github.io/generator-danych-testowych/

## Strony aplikacji

### 1. **Generator Danych** (index.html)
Główna strona aplikacji umożliwiająca generowanie pojedynczych numerów:
- **PESEL** - z opcjami wyboru płci, roku, miesiąca i dnia urodzenia
- **Dowód Osobisty (ID)** - generuje numery dowodów z prawidłowym checksumem
- **REGON** - generuje 9-cyfrowe lub 14-cyfrowe numery REGON
- **NRB (Numer Rachunku Bankowego)** - generuje numery IBAN z rzeczywistymi kodami banków
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
- 🔄 Wybór pól do wygenerowania (PESEL, ID, REGON, NRB, Imię, Nazwisko)
- ⬆️⬇️ Zmiana kolejności pól za pomocą drag & drop
- 🔢 Konfiguracja liczby rekordów (1-100,000)
- 📦 Wybór formatu eksportu:
  - **CSV** - z opcją wyboru separatora (przecinek, średnik, tabulacja, rura)
  - **JSON** - sformatowany, gotowy do parsowania
  - **XML** - z prawidłową strukturą XML
- 👀 Podgląd danych (pierwsze 5 wierszy)
- 📋 Generuj (wyświetla podgląd)
- 📥 Pobierz (pobiera plik)

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
5. Wybierz format i separator (dla CSV)
6. Kliknij "Generuj"
7. Sprawdź podgląd
8. Kliknij "Pobierz" aby pobrać plik

## Formaty danych

### PESEL (11 cyfr)
Numer Powszechnego Elekhronicznego Systemu Ewidencji Ludności
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

### NRB (26 cyfr IBAN)
Numer Rachunku Bankowego (IBAN)
- Format: PL + 24 cyfry
- Cyfry 3-4: kod banku
- Pozostałe cyfry: numer konta
- Weryfikacja checksumu IBAN

### Imiona i Nazwiska
Polskie imiona i nazwiska z rzeczywistych baz danych.

## Funkcje

✅ Generowanie prawidłowych numerów z checksumami
✅ Walidacja formatów i checksumów
✅ Metadane dla każdego numeru (np. wiek z PESEL-u)
✅ Baza kodów bankowych dla weryfikacji NRB
✅ Tryb ciemny/jasny z preferencjami przeglądarki
✅ Responsywny design
✅ Kopiowanie do schowka
✅ Export zbiorów w CSV/JSON/XML
✅ Drag & drop do zmiany kolejności pól
✅ Bez wymaganych zewnętrznych zależności (vanilla JS)

## Baza danych bankowych

Projekt zawiera plik `plewibnra_utf8.txt` z oficjalną listą polskich banków i ich kodami. Dane są przetwarzane na `bank_codes.json` zawierający:
- 3-cyfrowe kody banków
- 8-cyfrowe kody oddziałów
- Nazwy bankowych instytucji