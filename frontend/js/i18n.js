/**
 * Internationalization (i18n) system
 * Provides UI translations for multiple languages
 */

// Language names with flags for set grouping
const LANGUAGE_NAMES = {
  de: {
    flag: "🇩🇪",
    en: "German",
    pl: "Niemiecki",
    de: "Deutsch",
    es: "Alemán",
    fr: "Allemand",
  },
  en: {
    flag: "🇬🇧",
    en: "English",
    pl: "Angielski",
    de: "Englisch",
    es: "Inglés",
    fr: "Anglais",
  },
  es: {
    flag: "🇪🇸",
    en: "Spanish",
    pl: "Hiszpański",
    de: "Spanisch",
    es: "Español",
    fr: "Espagnol",
  },
  fr: {
    flag: "🇫🇷",
    en: "French",
    pl: "Francuski",
    de: "Französisch",
    es: "Francés",
    fr: "Français",
  },
  it: {
    flag: "🇮🇹",
    en: "Italian",
    pl: "Włoski",
    de: "Italienisch",
    es: "Italiano",
    fr: "Italien",
  },
  pt: {
    flag: "🇵🇹",
    en: "Portuguese",
    pl: "Portugalski",
    de: "Portugiesisch",
    es: "Portugués",
    fr: "Portugais",
  },
  nl: {
    flag: "🇳🇱",
    en: "Dutch",
    pl: "Holenderski",
    de: "Niederländisch",
    es: "Neerlandés",
    fr: "Néerlandais",
  },
  ru: {
    flag: "🇷🇺",
    en: "Russian",
    pl: "Rosyjski",
    de: "Russisch",
    es: "Ruso",
    fr: "Russe",
  },
  ja: {
    flag: "🇯🇵",
    en: "Japanese",
    pl: "Japoński",
    de: "Japanisch",
    es: "Japonés",
    fr: "Japonais",
  },
  zh: {
    flag: "🇨🇳",
    en: "Chinese",
    pl: "Chiński",
    de: "Chinesisch",
    es: "Chino",
    fr: "Chinois",
  },
  ko: {
    flag: "🇰🇷",
    en: "Korean",
    pl: "Koreański",
    de: "Koreanisch",
    es: "Coreano",
    fr: "Coréen",
  },
  pl: {
    flag: "🇵🇱",
    en: "Polish",
    pl: "Polski",
    de: "Polnisch",
    es: "Polaco",
    fr: "Polonais",
  },
};

/**
 * Get display info for a language (flag + localized name)
 * @param {string} langCode - Language code (e.g., "de", "en")
 * @param {string} uiLang - Current UI language for localized name
 * @returns {{flag: string, name: string}}
 */
function getLanguageDisplay(langCode, uiLang) {
  const lang = LANGUAGE_NAMES[langCode];
  if (!lang) return { flag: "🌐", name: langCode.toUpperCase() };
  return { flag: lang.flag, name: lang[uiLang] || lang.en };
}

// Export for use in app.js
window.getLanguageDisplay = getLanguageDisplay;

const I18N = {
  // Available languages
  languages: {
    en: "English",
    pl: "Polski",
    de: "Deutsch",
    es: "Español",
    fr: "Français",
  },

  // Translations
  translations: {
    en: {
      // App title
      appTitle: "Language Learning",
      appDescription: "Language learning - flashcards",

      // Header
      selectSet: "Select set",
      resetProgress: "Reset progress",

      // Progress
      progress: "Progress",

      // Loading states
      loading: "Loading...",

      // All learned
      congratulations: "Congratulations!",
      allLearnedMessage: "You know all phrases from this set!",
      startOver: "Start over",

      // Flashcard
      translate: "Translate",
      sayAnswer: "Say the answer",
      showAnswer: "Show answer",
      answer: "Answer",
      also: "also:",
      youSaid: "you said:",

      // Results
      great: "Great!",
      notThisTime: "Not this time",

      // Review buttons
      didntKnow: "Didn't know",
      knew: "Knew",
      next: "Next",

      // Menu
      menu: "Menu",
      settings: "Settings",
      generalNotes: "General notes",
      exportNotes: "Export notes",
      clearNotes: "Clear notes",
      darkMode: "Dark mode",
      lightMode: "Light mode",

      // Settings
      appearance: "Appearance",
      learning: "Learning",
      developer: "Developer",
      speaking: "Speaking",
      speakingDesc: "Answer with voice",
      manualNext: "Manual next",
      manualNextDesc: "Click 'Next' instead of auto-advance",
      autoListen: "Auto-listen",
      autoListenDesc: "Automatically listen after showing",
      learningThreshold: "Learning threshold",
      learningThresholdDesc:
        "How many correct answers in a row to mark phrase as learned",
      correctAnswer1: "1 correct answer",
      correctAnswers2: "2 correct in a row",
      correctAnswers3: "3 correct in a row",
      devMode: "Developer mode",
      devTools: "Developer tools:",
      clearCache: "Clear SW cache",
      autoOrManual: "Automatic or manual",

      // Language
      interfaceLanguage: "Interface language",

      // Reset modal
      resetProgressQuestion: "Reset progress?",
      resetProgressMessage:
        "All phrases from this set will return to learning.",
      cancel: "Cancel",
      reset: "Reset",

      // Notes
      note: "Note",
      addNote: "Add note",
      yourNote: "Your note...",
      save: "Save",
      noNotesToExport: "No notes to export",
      notesCopied: "Copied {count} notes to clipboard",
      failedToCopy: "Failed to copy to clipboard",
      notesCleared: "All notes cleared",
      noNotesToClear: "No notes to clear",

      // Set selection
      selectSetLabel: "Select set:",

      // Speech recognition
      listening: "Listening...",
      noSpeech: "No speech... try again",
      speechNotAvailable: "Speech recognition is not available in this browser",

      // Cache/Developer
      noActiveServiceWorker: "No active Service Worker",
      cacheCleared: "Cache cleared! Refresh the page.",

      // Review Set
      review: "Review",
      addToReview: "Add to review",
      removeFromReview: "Remove from review",

      // Audio
      playAudio: "Play audio",

      // Immediate retry
      immediateRetry: "Immediate retry",
      immediateRetryDesc: "Repeat phrase immediately after error",

      // Set selection modal
      reviewSetPrefix: "Review",

      // Archive
      archive: "Archive",

      // Hide phrases
      hidePhrase: "Hide phrase",
      unhidePhrase: "Show phrase",
      hidePhraseQuestion: "Hide phrase?",
      hidePhraseMessage:
        "This phrase will not appear in exercises or statistics.",
      hide: "Hide",
      hiddenPhrases: "Hidden phrases",
      clearHiddenPhrases: "Show all hidden phrases",
      clearHiddenPhrasesDesc: "Restore all hidden phrases across all sets",
      noHiddenPhrases: "No hidden phrases",
      hiddenPhrasesCleared: "All hidden phrases restored",
    },

    pl: {
      // App title
      appTitle: "Nauka Języków",
      appDescription: "Nauka języków - fiszki",

      // Header
      selectSet: "Wybierz zestaw",
      resetProgress: "Resetuj postęp",

      // Progress
      progress: "Postęp",

      // Loading states
      loading: "Ładowanie...",

      // All learned
      congratulations: "Brawo!",
      allLearnedMessage: "Znasz już wszystkie frazy z tego zestawu!",
      startOver: "Zacznij od nowa",

      // Flashcard
      translate: "Przetłumacz",
      sayAnswer: "Powiedz odpowiedź",
      showAnswer: "Pokaż odpowiedź",
      answer: "Odpowiedź",
      also: "także:",
      youSaid: "powiedziałeś:",

      // Results
      great: "Świetnie!",
      notThisTime: "Nie tym razem",

      // Review buttons
      didntKnow: "Nie wiedziałem",
      knew: "Wiedziałem",
      next: "Dalej",

      // Menu
      menu: "Menu",
      settings: "Ustawienia",
      generalNotes: "Notatki ogólne",
      exportNotes: "Eksportuj notatki",
      clearNotes: "Wyczyść notatki",
      darkMode: "Tryb ciemny",
      lightMode: "Tryb jasny",

      // Settings
      appearance: "Wygląd",
      learning: "Nauka",
      developer: "Deweloper",
      speaking: "Mówienie",
      speakingDesc: "Odpowiadaj głosowo",
      manualNext: "Ręczne przejście",
      manualNextDesc: "Kliknij 'Dalej' zamiast auto-przejścia",
      autoListen: "Auto-nasłuchiwanie",
      autoListenDesc: "Automatycznie słuchaj po wyświetleniu",
      learningThreshold: "Próg nauczenia",
      learningThresholdDesc:
        "Ile razy musisz odpowiedzieć poprawnie, żeby fraza była uznana za nauczoną",
      correctAnswer1: "1 poprawna odpowiedź",
      correctAnswers2: "2 poprawne z rzędu",
      correctAnswers3: "3 poprawne z rzędu",
      devMode: "Tryb deweloperski",
      devTools: "Narzędzia deweloperskie:",
      clearCache: "Wyczyść cache SW",
      autoOrManual: "Automatycznie lub ręcznie",

      // Language
      interfaceLanguage: "Język interfejsu",

      // Reset modal
      resetProgressQuestion: "Resetować postęp?",
      resetProgressMessage: "Wszystkie frazy z tego zestawu wrócą do nauki.",
      cancel: "Anuluj",
      reset: "Resetuj",

      // Notes
      note: "Notatka",
      addNote: "Dodaj notatkę",
      yourNote: "Twoja notatka...",
      save: "Zapisz",
      noNotesToExport: "Brak notatek do wyeksportowania",
      notesCopied: "Skopiowano {count} notatek do schowka",
      failedToCopy: "Nie udało się skopiować do schowka",
      notesCleared: "Wszystkie notatki zostały usunięte",
      noNotesToClear: "Brak notatek do usunięcia",

      // Set selection
      selectSetLabel: "Wybierz zestaw:",

      // Speech recognition
      listening: "Słucham...",
      noSpeech: "Nie słyszę... spróbuj jeszcze raz",
      speechNotAvailable:
        "Rozpoznawanie mowy nie jest dostępne w tej przeglądarce",

      // Cache/Developer
      noActiveServiceWorker: "Brak aktywnego Service Workera",
      cacheCleared: "Cache wyczyszczony! Odśwież stronę.",

      // Review Set
      review: "Powtórka",
      addToReview: "Dodaj do powtórki",
      removeFromReview: "Usuń z powtórki",

      // Audio
      playAudio: "Odtwórz audio",

      // Immediate retry
      immediateRetry: "Natychmiastowa powtórka",
      immediateRetryDesc: "Powtórz frazę od razu po błędzie",

      // Set selection modal
      reviewSetPrefix: "Do powtórki",

      // Archive
      archive: "Archiwum",

      // Hide phrases
      hidePhrase: "Ukryj frazę",
      unhidePhrase: "Pokaż frazę",
      hidePhraseQuestion: "Ukryć frazę?",
      hidePhraseMessage:
        "Ta fraza nie będzie pojawiać się w ćwiczeniach ani statystykach.",
      hide: "Ukryj",
      hiddenPhrases: "Ukryte frazy",
      clearHiddenPhrases: "Pokaż wszystkie ukryte frazy",
      clearHiddenPhrasesDesc:
        "Przywróć wszystkie ukryte frazy we wszystkich zestawach",
      noHiddenPhrases: "Brak ukrytych fraz",
      hiddenPhrasesCleared: "Wszystkie ukryte frazy przywrócone",
    },

    de: {
      // App title
      appTitle: "Sprachenlernen",
      appDescription: "Sprachenlernen - Karteikarten",

      // Header
      selectSet: "Set auswählen",
      resetProgress: "Fortschritt zurücksetzen",

      // Progress
      progress: "Fortschritt",

      // Loading states
      loading: "Laden...",

      // All learned
      congratulations: "Glückwunsch!",
      allLearnedMessage: "Du kennst alle Phrasen aus diesem Set!",
      startOver: "Von vorne beginnen",

      // Flashcard
      translate: "Übersetzen",
      sayAnswer: "Sag die Antwort",
      showAnswer: "Antwort zeigen",
      answer: "Antwort",
      also: "auch:",
      youSaid: "du sagtest:",

      // Results
      great: "Super!",
      notThisTime: "Nicht diesmal",

      // Review buttons
      didntKnow: "Wusste nicht",
      knew: "Wusste",
      next: "Weiter",

      // Menu
      menu: "Menü",
      settings: "Einstellungen",
      generalNotes: "Allgemeine Notizen",
      exportNotes: "Notizen exportieren",
      clearNotes: "Notizen löschen",
      darkMode: "Dunkelmodus",
      lightMode: "Hellmodus",

      // Settings
      appearance: "Erscheinungsbild",
      learning: "Lernen",
      developer: "Entwickler",
      speaking: "Sprechen",
      speakingDesc: "Mit Stimme antworten",
      manualNext: "Manuell weiter",
      manualNextDesc: "'Weiter' klicken statt automatisch",
      autoListen: "Auto-Zuhören",
      autoListenDesc: "Automatisch nach Anzeige zuhören",
      learningThreshold: "Lernschwelle",
      learningThresholdDesc:
        "Wie viele richtige Antworten hintereinander, um als gelernt zu gelten",
      correctAnswer1: "1 richtige Antwort",
      correctAnswers2: "2 richtige hintereinander",
      correctAnswers3: "3 richtige hintereinander",
      devMode: "Entwicklermodus",
      devTools: "Entwicklertools:",
      clearCache: "SW-Cache leeren",
      autoOrManual: "Automatisch oder manuell",

      // Language
      interfaceLanguage: "Sprache der Benutzeroberfläche",

      // Reset modal
      resetProgressQuestion: "Fortschritt zurücksetzen?",
      resetProgressMessage:
        "Alle Phrasen aus diesem Set kehren zum Lernen zurück.",
      cancel: "Abbrechen",
      reset: "Zurücksetzen",

      // Notes
      note: "Notiz",
      addNote: "Notiz hinzufügen",
      yourNote: "Deine Notiz...",
      save: "Speichern",
      noNotesToExport: "Keine Notizen zum Exportieren",
      notesCopied: "{count} Notizen in die Zwischenablage kopiert",
      failedToCopy: "Kopieren in die Zwischenablage fehlgeschlagen",
      notesCleared: "Alle Notizen gelöscht",
      noNotesToClear: "Keine Notizen zum Löschen",

      // Set selection
      selectSetLabel: "Set auswählen:",

      // Speech recognition
      listening: "Höre zu...",
      noSpeech: "Keine Sprache... versuche es erneut",
      speechNotAvailable:
        "Spracherkennung ist in diesem Browser nicht verfügbar",

      // Cache/Developer
      noActiveServiceWorker: "Kein aktiver Service Worker",
      cacheCleared: "Cache geleert! Seite neu laden.",

      // Review Set
      review: "Wiederholung",
      addToReview: "Zur Wiederholung hinzufügen",
      removeFromReview: "Aus Wiederholung entfernen",

      // Audio
      playAudio: "Audio abspielen",

      // Immediate retry
      immediateRetry: "Sofortige Wiederholung",
      immediateRetryDesc: "Phrase sofort nach Fehler wiederholen",

      // Set selection modal
      reviewSetPrefix: "Wiederholung",

      // Archive
      archive: "Archiv",

      // Hide phrases
      hidePhrase: "Phrase ausblenden",
      unhidePhrase: "Phrase einblenden",
      hidePhraseQuestion: "Phrase ausblenden?",
      hidePhraseMessage:
        "Diese Phrase erscheint nicht in Übungen oder Statistiken.",
      hide: "Ausblenden",
      hiddenPhrases: "Ausgeblendete Phrasen",
      clearHiddenPhrases: "Alle ausgeblendeten Phrasen anzeigen",
      clearHiddenPhrasesDesc:
        "Alle ausgeblendeten Phrasen in allen Sets wiederherstellen",
      noHiddenPhrases: "Keine ausgeblendeten Phrasen",
      hiddenPhrasesCleared: "Alle ausgeblendeten Phrasen wiederhergestellt",
    },

    es: {
      // App title
      appTitle: "Aprendizaje de Idiomas",
      appDescription: "Aprendizaje de idiomas - tarjetas",

      // Header
      selectSet: "Seleccionar conjunto",
      resetProgress: "Restablecer progreso",

      // Progress
      progress: "Progreso",

      // Loading states
      loading: "Cargando...",

      // All learned
      congratulations: "¡Felicidades!",
      allLearnedMessage: "¡Conoces todas las frases de este conjunto!",
      startOver: "Empezar de nuevo",

      // Flashcard
      translate: "Traducir",
      sayAnswer: "Di la respuesta",
      showAnswer: "Mostrar respuesta",
      answer: "Respuesta",
      also: "también:",
      youSaid: "dijiste:",

      // Results
      great: "¡Genial!",
      notThisTime: "Esta vez no",

      // Review buttons
      didntKnow: "No lo sabía",
      knew: "Lo sabía",
      next: "Siguiente",

      // Menu
      menu: "Menú",
      settings: "Ajustes",
      generalNotes: "Notas generales",
      exportNotes: "Exportar notas",
      clearNotes: "Borrar notas",
      darkMode: "Modo oscuro",
      lightMode: "Modo claro",

      // Settings
      appearance: "Apariencia",
      learning: "Aprendizaje",
      developer: "Desarrollador",
      speaking: "Hablar",
      speakingDesc: "Responder con voz",
      manualNext: "Siguiente manual",
      manualNextDesc: "Clic en 'Siguiente' en vez de avanzar automáticamente",
      autoListen: "Auto-escuchar",
      autoListenDesc: "Escuchar automáticamente después de mostrar",
      learningThreshold: "Umbral de aprendizaje",
      learningThresholdDesc:
        "Cuántas respuestas correctas seguidas para marcar como aprendida",
      correctAnswer1: "1 respuesta correcta",
      correctAnswers2: "2 correctas seguidas",
      correctAnswers3: "3 correctas seguidas",
      devMode: "Modo desarrollador",
      devTools: "Herramientas de desarrollador:",
      clearCache: "Limpiar caché SW",
      autoOrManual: "Automático o manual",

      // Language
      interfaceLanguage: "Idioma de la interfaz",

      // Reset modal
      resetProgressQuestion: "¿Restablecer progreso?",
      resetProgressMessage:
        "Todas las frases de este conjunto volverán al aprendizaje.",
      cancel: "Cancelar",
      reset: "Restablecer",

      // Notes
      note: "Nota",
      addNote: "Añadir nota",
      yourNote: "Tu nota...",
      save: "Guardar",
      noNotesToExport: "No hay notas para exportar",
      notesCopied: "{count} notas copiadas al portapapeles",
      failedToCopy: "Error al copiar al portapapeles",
      notesCleared: "Todas las notas borradas",
      noNotesToClear: "No hay notas para borrar",

      // Set selection
      selectSetLabel: "Seleccionar conjunto:",

      // Speech recognition
      listening: "Escuchando...",
      noSpeech: "Sin voz... inténtalo de nuevo",
      speechNotAvailable:
        "El reconocimiento de voz no está disponible en este navegador",

      // Cache/Developer
      noActiveServiceWorker: "No hay Service Worker activo",
      cacheCleared: "Cache limpiado! Actualiza la pagina.",

      // Review Set
      review: "Repaso",
      addToReview: "Añadir al repaso",
      removeFromReview: "Quitar del repaso",

      // Audio
      playAudio: "Reproducir audio",

      // Immediate retry
      immediateRetry: "Repetición inmediata",
      immediateRetryDesc: "Repetir frase inmediatamente después de error",

      // Set selection modal
      reviewSetPrefix: "Repaso",

      // Archive
      archive: "Archivo",

      // Hide phrases
      hidePhrase: "Ocultar frase",
      unhidePhrase: "Mostrar frase",
      hidePhraseQuestion: "¿Ocultar frase?",
      hidePhraseMessage:
        "Esta frase no aparecerá en ejercicios ni estadísticas.",
      hide: "Ocultar",
      hiddenPhrases: "Frases ocultas",
      clearHiddenPhrases: "Mostrar todas las frases ocultas",
      clearHiddenPhrasesDesc:
        "Restaurar todas las frases ocultas en todos los conjuntos",
      noHiddenPhrases: "No hay frases ocultas",
      hiddenPhrasesCleared: "Todas las frases ocultas restauradas",
    },

    fr: {
      // App title
      appTitle: "Apprentissage des Langues",
      appDescription: "Apprentissage des langues - cartes",

      // Header
      selectSet: "Sélectionner un ensemble",
      resetProgress: "Réinitialiser la progression",

      // Progress
      progress: "Progression",

      // Loading states
      loading: "Chargement...",

      // All learned
      congratulations: "Félicitations!",
      allLearnedMessage: "Tu connais toutes les phrases de cet ensemble!",
      startOver: "Recommencer",

      // Flashcard
      translate: "Traduire",
      sayAnswer: "Dis la réponse",
      showAnswer: "Montrer la réponse",
      answer: "Réponse",
      also: "aussi:",
      youSaid: "tu as dit:",

      // Results
      great: "Super!",
      notThisTime: "Pas cette fois",

      // Review buttons
      didntKnow: "Je ne savais pas",
      knew: "Je savais",
      next: "Suivant",

      // Menu
      menu: "Menu",
      settings: "Paramètres",
      generalNotes: "Notes générales",
      exportNotes: "Exporter les notes",
      clearNotes: "Effacer les notes",
      darkMode: "Mode sombre",
      lightMode: "Mode clair",

      // Settings
      appearance: "Apparence",
      learning: "Apprentissage",
      developer: "Développeur",
      speaking: "Parler",
      speakingDesc: "Répondre avec la voix",
      manualNext: "Suivant manuel",
      manualNextDesc: "Cliquer sur 'Suivant' au lieu d'avancer automatiquement",
      autoListen: "Écoute automatique",
      autoListenDesc: "Écouter automatiquement après affichage",
      learningThreshold: "Seuil d'apprentissage",
      learningThresholdDesc:
        "Combien de bonnes réponses consécutives pour marquer comme apprise",
      correctAnswer1: "1 bonne réponse",
      correctAnswers2: "2 bonnes consécutives",
      correctAnswers3: "3 bonnes consécutives",
      devMode: "Mode développeur",
      devTools: "Outils de développeur:",
      clearCache: "Vider le cache SW",
      autoOrManual: "Automatique ou manuel",

      // Language
      interfaceLanguage: "Langue de l'interface",

      // Reset modal
      resetProgressQuestion: "Réinitialiser la progression?",
      resetProgressMessage:
        "Toutes les phrases de cet ensemble reviendront à l'apprentissage.",
      cancel: "Annuler",
      reset: "Réinitialiser",

      // Notes
      note: "Note",
      addNote: "Ajouter une note",
      yourNote: "Ta note...",
      save: "Enregistrer",
      noNotesToExport: "Aucune note à exporter",
      notesCopied: "{count} notes copiées dans le presse-papiers",
      failedToCopy: "Échec de la copie dans le presse-papiers",
      notesCleared: "Toutes les notes effacées",
      noNotesToClear: "Aucune note à effacer",

      // Set selection
      selectSetLabel: "Sélectionner un ensemble:",

      // Speech recognition
      listening: "J'écoute...",
      noSpeech: "Pas de voix... réessaye",
      speechNotAvailable:
        "La reconnaissance vocale n'est pas disponible dans ce navigateur",

      // Cache/Developer
      noActiveServiceWorker: "Pas de Service Worker actif",
      cacheCleared: "Cache vide! Rafraichissez la page.",

      // Review Set
      review: "Révision",
      addToReview: "Ajouter à la révision",
      removeFromReview: "Retirer de la révision",

      // Audio
      playAudio: "Lire l'audio",

      // Immediate retry
      immediateRetry: "Répétition immédiate",
      immediateRetryDesc: "Répéter la phrase immédiatement après une erreur",

      // Set selection modal
      reviewSetPrefix: "Révision",

      // Archive
      archive: "Archives",

      // Hide phrases
      hidePhrase: "Masquer la phrase",
      unhidePhrase: "Afficher la phrase",
      hidePhraseQuestion: "Masquer la phrase ?",
      hidePhraseMessage:
        "Cette phrase n'apparaîtra pas dans les exercices ni les statistiques.",
      hide: "Masquer",
      hiddenPhrases: "Phrases masquées",
      clearHiddenPhrases: "Afficher toutes les phrases masquées",
      clearHiddenPhrasesDesc:
        "Restaurer toutes les phrases masquées dans tous les ensembles",
      noHiddenPhrases: "Aucune phrase masquée",
      hiddenPhrasesCleared: "Toutes les phrases masquées restaurées",
    },
  },

  // Current language
  currentLang: "en",

  // Storage key
  STORAGE_KEY: "langlearn_ui_language",

  /**
   * Initialize i18n system
   * Uses saved preference if available, otherwise defaults to English
   */
  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved && this.translations[saved]) {
      this.currentLang = saved;
    }
    // Default is already 'en', no browser detection needed
    this.applyTranslations();
  },

  /**
   * Set current language
   */
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem(this.STORAGE_KEY, lang);
      this.applyTranslations();
      return true;
    }
    return false;
  },

  /**
   * Get translation for a key
   */
  t(key, params = {}) {
    let translation =
      this.translations[this.currentLang]?.[key] ||
      this.translations["en"]?.[key] ||
      key;

    // Replace parameters like {count}
    return translation.replace(/\{(\w+)\}/g, (_, param) => params[param] ?? "");
  },

  /**
   * Apply translations to all elements with data-i18n attribute
   */
  applyTranslations() {
    // Update document language
    document.documentElement.lang = this.currentLang;

    // Update elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = this.t(key);
    });

    // Update elements with data-i18n-placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.placeholder = this.t(key);
    });

    // Update elements with data-i18n-title
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      el.title = this.t(key);
    });

    // Update page title
    document.title = this.t("appTitle");

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = this.t("appDescription");
    }
  },
};

// Export for use in other modules
window.I18N = I18N;
