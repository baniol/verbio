# Intensive Learning Pack - Specyfikacja Funkcji

## Cel
Maksymalizacja efektywności nauki dla intensywnie zmotywowanego użytkownika.
Bazuje na metodach DLI (wojsko), FSI (dyplomaci) i badaniach naukowych (Bjork, Krashen).

---

## Powiązane dokumenty

- [LLM Validation Backend](./llm-validation-backend.md) - walidacja odpowiedzi przez AI (Lambda + Bedrock Nova) zamiast string matching. **Fundament dla wiarygodnych danych Weak Vocabulary.**

---

## Funkcje do Implementacji

### 1. Weak Vocabulary View
**Priorytet:** ⭐⭐⭐⭐⭐ | **Czas:** ~2h | **Status:** Do zrobienia

**Opis:** Widok pokazujący słownictwo z niskim poziomem opanowania.

**Istniejący kod:**
- `getWeakVocabulary(minContexts = 2)` w app.js:1982
- Zwraca słowa z `overallMastery < 0.5` posortowane od najsłabszych
- Dane już są zbierane w `langlearn_vocab_mastery`

**Do zrobienia:**
- [ ] Dodać przycisk/zakładkę "Weak Words" w UI
- [ ] Wyświetlić listę słabych słów z % opanowania
- [ ] Umożliwić praktykę tylko na frazach zawierających słabe słowa
- [ ] Pokazać w ilu kontekstach słowo występuje

**UI:**
```
┌─────────────────────────────────────┐
│ Słabe słownictwo (12 słów)          │
├─────────────────────────────────────┤
│ möchten (mögen)     23% │ 4 konteksty │ [Ćwicz]
│ werden              31% │ 7 kontekstów │ [Ćwicz]  
│ können              45% │ 5 kontekstów │ [Ćwicz]
│ ...                                  │
└─────────────────────────────────────┘
```

---

### 2. Hard/Easy Przyciski (Pełne SM-2)
**Priorytet:** ⭐⭐⭐⭐ | **Czas:** ~2h | **Status:** Do zrobienia

**Opis:** Rozszerzenie oceny odpowiedzi z 2 do 4 poziomów.

**Istniejący kod:**
- `updateSRS(phraseId, quality)` w app.js:841 - przyjmuje quality 0-5
- `getQualityRating(correct)` w app.js:883 - obecnie zwraca tylko 1 lub 4

**Obecne działanie:**
- Źle = quality 1 (interval reset)
- Dobrze = quality 4 (normalny wzrost)

**Nowe działanie:**
- Źle = quality 1 (interval reset)
- Trudne = quality 3 (krótszy interwał, +0.0 easeFactor)
- Dobrze = quality 4 (normalny interwał, +0.1 easeFactor)  
- Łatwe = quality 5 (dłuższy interwał, +0.15 easeFactor)

**Do zrobienia:**
- [ ] Zmienić przyciski po odpowiedzi: [Źle] [Trudne] [Dobrze] [Łatwe]
- [ ] Zaktualizować `getQualityRating()` lub usunąć
- [ ] Pokazać przewidywany następny interwał przy każdym przycisku

**UI po odpowiedzi:**
```
┌─────────────────────────────────────┐
│        "Ich möchte bestellen"       │
│                                     │
│  [Źle]   [Trudne]  [Dobrze] [Łatwe] │
│  <1d      3d        7d       14d    │
└─────────────────────────────────────┘
```

---

### 3. Interleaving Slider
**Priorytet:** ⭐⭐⭐⭐ | **Czas:** ~1h | **Status:** Do zrobienia

**Opis:** Konfigurowalny poziom mieszania materiału z innych zestawów.

**Istniejący kod:**
- Global reminders w app.js:1001 - stała 20% szansa
- `getOverduePhrases(language)` - pobiera przeterminowane z innych zestawów

**Badania:** Interleaving zwiększa retencję o 200%+ vs blocked practice.

**Do zrobienia:**
- [ ] Dodać slider w Settings: "Mieszanie zestawów: 0-100%"
- [ ] Zapisywać w localStorage: `langlearn_interleaving_ratio`
- [ ] Zastąpić stałe 0.2 wartością ze slidera
- [ ] Opcja "Full interleaving" = 100% (losuje z wszystkich zestawów języka)

**Wartości:**
- 0% = tylko bieżący zestaw
- 20% = domyślne (obecne)
- 50% = połowa z innych
- 100% = pełne mieszanie wszystkich zestawów języka

---

### 4. Timer Drill Mode
**Priorytet:** ⭐⭐⭐⭐⭐ | **Czas:** ~4h | **Status:** Do zrobienia

**Opis:** Tryb z presją czasową na odpowiedź - wymusza automatyzację.

**Uzasadnienie naukowe:**
- "Desirable difficulty" (Bjork) - trudniejsze = lepiej zapamiętane
- DLI i FSI używają intensywnych drilli czasowych
- Presja czasowa wymusza automatyzację (nie ma czasu na tłumaczenie w głowie)

**Do zrobienia:**
- [ ] Dodać opcję w Settings: "Tryb Drill" on/off
- [ ] Konfigurowalne limity: 5s / 10s / 15s / 20s
- [ ] Timer wizualny (pasek lub countdown)
- [ ] Brak odpowiedzi w czasie = automatycznie źle
- [ ] Na końcu sesji: statystyki (ile w czasie, średni czas)

**UI:**
```
┌─────────────────────────────────────┐
│ ████████░░░░░░░░░░  7s pozostało    │
├─────────────────────────────────────┤
│                                     │
│     "Gdzie jest dworzec?"           │
│                                     │
│         [Naciśnij i mów]            │
└─────────────────────────────────────┘
```

**Opcje timera:**
- Czas na odpowiedź: 5s / 10s / 15s / 20s / bez limitu
- Dźwięk ostrzegawczy na 3s przed końcem (opcjonalnie)

---

### 5. Session Summary
**Priorytet:** ⭐⭐⭐⭐ | **Czas:** ~2h | **Status:** Do zrobienia

**Opis:** Podsumowanie po zakończeniu sesji nauki.

**Dane do wyświetlenia:**
- Liczba przerobonych fraz
- % poprawnych odpowiedzi
- Czas sesji
- Słowa, które sprawiły problemy
- Porównanie z poprzednimi sesjami

**Do zrobienia:**
- [ ] Śledzić dane sesji w pamięci (start time, answers array)
- [ ] Przycisk "Zakończ sesję" lub auto po X frazach
- [ ] Modal z podsumowaniem
- [ ] Zapisywać historię sesji w localStorage

**UI:**
```
┌─────────────────────────────────────┐
│         Podsumowanie sesji          │
├─────────────────────────────────────┤
│ Czas:           12 min              │
│ Frazy:          34                  │
│ Poprawne:       28 (82%)            │
│ Nowe nauczone:  5                   │
├─────────────────────────────────────┤
│ Problematyczne słowa:               │
│ • möchten (2/4 błędów)              │
│ • werden (1/3 błędów)               │
├─────────────────────────────────────┤
│       [Kontynuuj]  [Zakończ]        │
└─────────────────────────────────────┘
```

---

## Pliki do Modyfikacji

| Plik | Zmiany |
|------|--------|
| `frontend/js/app.js` | Logika wszystkich funkcji |
| `frontend/index.html` | Nowe UI elementy |
| `frontend/js/i18n.js` | Tłumaczenia nowych tekstów |

---

## Kolejność Implementacji

1. **Weak Vocabulary View** - najmniej pracy, największy zysk
2. **Hard/Easy Przyciski** - proste, duży wpływ na SRS
3. **Interleaving Slider** - bardzo proste
4. **Session Summary** - średnie, dobry feedback
5. **Timer Drill Mode** - najbardziej złożone, zostawić na koniec

---

## Źródła Naukowe

- [Defense Language Institute](https://www.dliflc.edu/) - metody wojskowe
- [FSI Language Courses](https://www.fsi-language-courses.org/) - szkolenie dyplomatów
- [Spaced Repetition Research](https://pmc.ncbi.nlm.nih.gov/articles/PMC4492928/)
- [Desirable Difficulties - Bjork](https://pmc.ncbi.nlm.nih.gov/articles/PMC4888598/)
- [Interleaving Research](https://yuichisuzuki.net/wp-content/uploads/2023/04/Nakata-Suzuki-2019-MLJ.pdf)
