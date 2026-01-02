/**
 * Language Learning App
 * Frontend-only with multiple sets support
 */

(function () {
  "use strict";

  // Configuration constants
  const CONFIG = {
    AUTO_ADVANCE_DELAY: 2000,
    AUTO_LISTEN_DELAY: 300,
    NEW_PHRASE_PRIORITY: 1000,
    DEBOUNCE_DELAY: 300,
  };

  // UI Helper - toggle visibility
  const UI = {
    show: (el) => el?.classList.remove("hidden"),
    hide: (el) => el?.classList.add("hidden"),
    toggle: (el, visible) => el?.classList.toggle("hidden", !visible),
  };

  // Storage Helper - unified localStorage access
  const Storage = {
    get: (key, defaultValue = null) => {
      try {
        const value = localStorage.getItem(key);
        if (value === null) return defaultValue;
        // Try to parse JSON, fallback to raw value
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      } catch {
        return defaultValue;
      }
    },
    set: (key, value) => {
      try {
        const toStore =
          typeof value === "string" ? value : JSON.stringify(value);
        localStorage.setItem(key, toStore);
        return true;
      } catch (e) {
        console.error("Storage error:", e);
        return false;
      }
    },
    remove: (key) => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    },
  };

  // Debounce helper
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Clear immediate retry state
  function clearRetryState() {
    retryPhrase = null;
    retrySuccessCount = 0;
    retryFailures = 0;
  }

  // LocalStorage keys
  const STORAGE_KEYS = {
    lastSet: "langlearn_last_set",
    speechEnabled: "langlearn_speech_enabled",
    manualNext: "langlearn_manual_next",
    autoListen: "langlearn_auto_listen",
    devMode: "langlearn_dev_mode",
    theme: "langlearn_theme",
    requiredStreak: "langlearn_required_streak",
    progress: (setId) => `langlearn_progress_${setId}`,
    notes: "langlearn_notes",
    generalNotes: "langlearn_general_notes",
    reviewSet: (language) => `langlearn_review_set_${language}`,
    immediateRetry: "langlearn_immediate_retry",
  };

  // State
  let currentSet = null;
  let currentPhrase = null;
  let speechEnabled = true;
  let manualNext = false;
  let autoListen = false;
  let devMode = false;
  let theme = "system"; // "light", "dark", or "system"
  let requiredStreak = 2; // how many correct answers in a row to mark as learned
  let recognition = null;
  let isListening = false; // Flag to prevent multiple recognition starts
  let currentAudio = null; // Current playing audio element

  // Immediate retry state (speech mode only)
  let immediateRetry = true; // setting on/off
  let retryPhrase = null; // phrase for immediate retry
  let retrySuccessCount = 0; // correct answers in retry (goal: 2)
  let retryFailures = 0; // failures during retry (max 1 allowed)

  // Cached DOM Elements (populated on init)
  let el = {};

  function cacheElements() {
    el = {
      languageSelect: document.getElementById("language-select"),
      loading: document.getElementById("loading"),
      allLearned: document.getElementById("all-learned"),
      flashcard: document.getElementById("flashcard"),
      prompt: document.getElementById("prompt"),
      answer: document.getElementById("answer"),
      speechMode: document.getElementById("speech-mode"),
      showAnswerMode: document.getElementById("show-answer-mode"),
      answerSection: document.getElementById("answer-section"),
      reviewButtons: document.getElementById("review-buttons"),
      resultFeedback: document.getElementById("result-feedback"),
      resultIcon: document.getElementById("result-icon"),
      resultText: document.getElementById("result-text"),
      transcript: document.getElementById("transcript"),
      micButton: document.getElementById("mic-button"),
      progressBar: document.getElementById("progress-bar"),
      progressText: document.getElementById("progress-text"),
      speechToggle: document.getElementById("speech-toggle"),
      manualNextToggle: document.getElementById("manual-next-toggle"),
      autoListenToggle: document.getElementById("auto-listen-toggle"),
      devModeToggle: document.getElementById("dev-mode-toggle"),
      devTools: document.getElementById("dev-tools"),
      cacheStatus: document.getElementById("cache-status"),
      requiredStreakSelect: document.getElementById("required-streak-select"),
      immediateRetryToggle: document.getElementById("immediate-retry-toggle"),
      themeToggle: document.getElementById("theme-toggle"),
      themeIcon: document.getElementById("theme-icon"),
      themeLabel: document.getElementById("theme-label"),
      resetModal: document.getElementById("reset-modal"),
      resetModalTitle: document.getElementById("reset-modal-title"),
      resetModalText: document.getElementById("reset-modal-text"),
      noteModal: document.getElementById("note-modal"),
      noteTextarea: document.getElementById("note-textarea"),
      notePhraseInfo: document.getElementById("note-phrase-info"),
      noteIconEmpty: document.getElementById("note-icon-empty"),
      noteIconFilled: document.getElementById("note-icon-filled"),
      reviewButton: document.getElementById("review-button"),
      reviewIconEmpty: document.getElementById("review-icon-empty"),
      reviewIconFilled: document.getElementById("review-icon-filled"),
      setMenu: document.getElementById("set-menu"),
      setSelect: document.getElementById("set-select"),
      currentSetName: document.getElementById("current-set-name"),
      acceptedVariants: document.getElementById("accepted-variants"),
      userSaid: document.getElementById("user-said"),
      userSaidLabel: document.getElementById("user-said-label"),
      userSaidTranscript: document.getElementById("user-said-transcript"),
      nextButton: document.getElementById("next-button"),
      // Buttons for event binding
      resetButton: document.getElementById("reset-button"),
      menuButton: document.getElementById("menu-button"),
      menuCloseButton: document.getElementById("menu-close-button"),
      menuOverlay: document.getElementById("menu-overlay"),
      menuPanel: document.getElementById("menu-panel"),
      settingsLink: document.getElementById("settings-link"),
      exportNotesButton: document.getElementById("export-notes-button"),
      clearNotesButton: document.getElementById("clear-notes-button"),
      generalNotesButton: document.getElementById("general-notes-button"),
      generalNotesModal: document.getElementById("general-notes-modal"),
      generalNotesTextarea: document.getElementById("general-notes-textarea"),
      generalNotesCancelButton: document.getElementById(
        "general-notes-cancel-button",
      ),
      generalNotesSaveButton: document.getElementById(
        "general-notes-save-button",
      ),
      themeToggleMenu: document.getElementById("theme-toggle-menu"),
      showAnswerButton: document.getElementById("show-answer-button"),
      peekAnswerButton: document.getElementById("peek-answer-button"),
      startOverButton: document.getElementById("start-over-button"),
      didntKnowButton: document.getElementById("didnt-know-button"),
      knewButton: document.getElementById("knew-button"),
      noteButton: document.getElementById("note-button"),
      noteCancelButton: document.getElementById("note-cancel-button"),
      noteSaveButton: document.getElementById("note-save-button"),
      resetCancelButton: document.getElementById("reset-cancel-button"),
      resetConfirmButton: document.getElementById("reset-confirm-button"),
      clearCacheButton: document.getElementById("clear-cache-button"),
      backButton: document.getElementById("back-button"),
      answerAudioButton: document.getElementById("answer-audio-button"),
    };
  }

  // Bind all event listeners (replaces inline onclick handlers)
  function bindEventListeners() {
    // Header buttons
    el.resetButton?.addEventListener("click", confirmReset);
    el.currentSetName?.addEventListener("click", toggleSetMenu);
    el.menuButton?.addEventListener("click", toggleMenu);

    // Set selection
    el.setSelect?.addEventListener("change", changeSet);

    // Menu
    el.menuOverlay?.addEventListener("click", toggleMenu);
    el.menuCloseButton?.addEventListener("click", toggleMenu);
    el.settingsLink?.addEventListener("click", toggleMenu);
    el.exportNotesButton?.addEventListener("click", exportNotes);
    el.clearNotesButton?.addEventListener("click", clearNotes);
    el.generalNotesButton?.addEventListener("click", openGeneralNotes);
    el.generalNotesCancelButton?.addEventListener("click", closeGeneralNotes);
    el.generalNotesSaveButton?.addEventListener("click", saveGeneralNotes);
    el.themeToggleMenu?.addEventListener("click", toggleTheme);

    // Flashcard actions
    el.micButton?.addEventListener("click", startListening);
    el.showAnswerButton?.addEventListener("click", showAnswer);
    el.peekAnswerButton?.addEventListener("click", peekAnswer);
    el.startOverButton?.addEventListener("click", resetProgress);
    el.didntKnowButton?.addEventListener("click", () => submitAnswer(false));
    el.knewButton?.addEventListener("click", () => submitAnswer(true));

    // Notes
    el.noteButton?.addEventListener("click", openNoteModal);
    el.noteCancelButton?.addEventListener("click", closeNoteModal);
    el.noteSaveButton?.addEventListener("click", saveNote);

    // Review
    el.reviewButton?.addEventListener("click", toggleReview);

    // Reset modal
    el.resetCancelButton?.addEventListener("click", closeResetModal);
    el.resetConfirmButton?.addEventListener("click", resetProgress);

    // Settings
    el.languageSelect?.addEventListener("change", changeLanguage);
    el.speechToggle?.addEventListener("change", saveSpeechSetting);
    el.manualNextToggle?.addEventListener("change", saveManualNextSetting);
    el.autoListenToggle?.addEventListener("change", saveAutoListenSetting);
    el.devModeToggle?.addEventListener("change", saveDevModeSetting);
    el.requiredStreakSelect?.addEventListener(
      "change",
      saveRequiredStreakSetting,
    );
    el.immediateRetryToggle?.addEventListener(
      "change",
      saveImmediateRetrySetting,
    );
    el.themeToggle?.addEventListener("change", saveThemeSetting);
    el.clearCacheButton?.addEventListener("click", clearCache);
    el.backButton?.addEventListener("click", () => Router.back());
    el.answerAudioButton?.addEventListener("click", playAnswerAudio);
  }

  // Initialize
  document.addEventListener("DOMContentLoaded", () => {
    I18N.init();
    initTheme();
    cacheElements();
    bindEventListeners();
    loadSettings();
    populateSetMenu();
    loadLastSet();
    initSpeechRecognition();
    initRouter();
  });

  // Router integration
  function initRouter() {
    Router.register("/", onFlashcardView);
    Router.register("/settings", onSettingsView);
    Router.init();
  }

  function onFlashcardView() {
    // Re-cache elements and refresh settings UI when returning to flashcard
    if (currentPhrase) {
      showPhrase(currentPhrase);
    }
  }

  function onSettingsView() {
    // Refresh settings toggles when entering settings view
    refreshSettingsUI();
  }

  function refreshSettingsUI() {
    if (el.speechToggle) el.speechToggle.checked = speechEnabled;
    if (el.manualNextToggle) el.manualNextToggle.checked = manualNext;
    if (el.autoListenToggle) el.autoListenToggle.checked = autoListen;
    if (el.devModeToggle) el.devModeToggle.checked = devMode;
    if (el.requiredStreakSelect)
      el.requiredStreakSelect.value = requiredStreak.toString();
    if (el.immediateRetryToggle)
      el.immediateRetryToggle.checked = immediateRetry;
    if (el.themeToggle) el.themeToggle.checked = isDarkMode();
    if (el.languageSelect) el.languageSelect.value = I18N.currentLang;
    updateDevToolsVisibility();
    updateThemeUI();
  }

  // Settings
  function loadSettings() {
    try {
      const savedSpeech = localStorage.getItem(STORAGE_KEYS.speechEnabled);
      speechEnabled = savedSpeech === null ? true : savedSpeech === "true";

      const savedManual = localStorage.getItem(STORAGE_KEYS.manualNext);
      manualNext = savedManual === null ? true : savedManual === "true";

      const savedAutoListen = localStorage.getItem(STORAGE_KEYS.autoListen);
      autoListen = savedAutoListen === "true";

      const savedDevMode = localStorage.getItem(STORAGE_KEYS.devMode);
      devMode = savedDevMode === "true";

      const savedRequiredStreak = localStorage.getItem(
        STORAGE_KEYS.requiredStreak,
      );
      requiredStreak = savedRequiredStreak
        ? parseInt(savedRequiredStreak, 10)
        : 2;

      const savedImmediateRetry = localStorage.getItem(
        STORAGE_KEYS.immediateRetry,
      );
      immediateRetry =
        savedImmediateRetry === null ? true : savedImmediateRetry === "true";

      // Apply to UI if elements exist
      refreshSettingsUI();
    } catch (e) {
      console.error("Failed to load settings:", e);
      // Use defaults
      speechEnabled = true;
      manualNext = false;
      autoListen = false;
      devMode = false;
      requiredStreak = 2;
      immediateRetry = true;
    }
  }

  function saveSpeechSetting() {
    speechEnabled = el.speechToggle.checked;
    localStorage.setItem(STORAGE_KEYS.speechEnabled, speechEnabled);
    if (currentPhrase) {
      showPhrase(currentPhrase);
    }
  }

  function saveManualNextSetting() {
    manualNext = el.manualNextToggle.checked;
    localStorage.setItem(STORAGE_KEYS.manualNext, manualNext);
  }

  function saveAutoListenSetting() {
    autoListen = el.autoListenToggle.checked;
    localStorage.setItem(STORAGE_KEYS.autoListen, autoListen);
  }

  function saveDevModeSetting() {
    devMode = el.devModeToggle.checked;
    localStorage.setItem(STORAGE_KEYS.devMode, devMode);
    updateDevToolsVisibility();
  }

  function saveRequiredStreakSetting() {
    requiredStreak = parseInt(el.requiredStreakSelect.value, 10);
    localStorage.setItem(STORAGE_KEYS.requiredStreak, requiredStreak);
  }

  function saveImmediateRetrySetting() {
    immediateRetry = el.immediateRetryToggle.checked;
    localStorage.setItem(STORAGE_KEYS.immediateRetry, immediateRetry);
    clearRetryState();
  }

  function updateDevToolsVisibility() {
    UI.toggle(el.devTools, devMode);
  }

  function changeLanguage() {
    const lang = el.languageSelect.value;
    I18N.setLanguage(lang);
  }

  function clearCache() {
    if (!navigator.serviceWorker.controller) {
      el.cacheStatus.textContent = I18N.t("noActiveServiceWorker");
      return;
    }

    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      if (event.data === "CACHE_CLEARED") {
        el.cacheStatus.textContent = I18N.t("cacheCleared");
      }
    };

    navigator.serviceWorker.controller.postMessage("CLEAR_CACHE", [
      messageChannel.port2,
    ]);
  }

  // Theme management
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    theme = savedTheme || "system";
    applyTheme();

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (theme === "system") {
          applyTheme();
        }
      });
  }

  function isDarkMode() {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyTheme() {
    if (isDarkMode()) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    updateThemeUI();
  }

  function updateThemeUI() {
    const dark = isDarkMode();
    if (el.themeToggle) el.themeToggle.checked = dark;
    if (el.themeIcon) el.themeIcon.textContent = dark ? "☀️" : "🌙";
    if (el.themeLabel)
      el.themeLabel.textContent = dark
        ? I18N.t("lightMode")
        : I18N.t("darkMode");
  }

  function saveThemeSetting() {
    const wantsDark = el.themeToggle.checked;
    theme = wantsDark ? "dark" : "light";
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    applyTheme();
  }

  function toggleTheme() {
    const currentlyDark = isDarkMode();
    theme = currentlyDark ? "light" : "dark";
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    applyTheme();
  }

  // Set menu
  function populateSetMenu() {
    const select = el.setSelect;
    select.innerHTML = "";

    // Regular sets
    for (const [id, set] of Object.entries(SETS)) {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = set.metadata.name;
      select.appendChild(option);
    }

    // Review sets
    const reviewLanguages = getReviewSetLanguages();
    if (reviewLanguages.length > 0) {
      // Add separator
      const separator = document.createElement("option");
      separator.disabled = true;
      separator.textContent = "──────────";
      select.appendChild(separator);

      for (const lang of reviewLanguages) {
        const reviewData = buildReviewSetData(lang);
        if (reviewData) {
          const option = document.createElement("option");
          option.value = `review_${lang}`;
          option.textContent = `${reviewData.metadata.name} (${reviewData.phrases.length})`;
          select.appendChild(option);
        }
      }
    }
  }

  function toggleSetMenu() {
    el.setMenu.classList.toggle("hidden");
  }

  function loadLastSet() {
    const lastSetId = localStorage.getItem(STORAGE_KEYS.lastSet);
    const setIds = Object.keys(SETS);

    if (lastSetId && SETS[lastSetId]) {
      loadSet(lastSetId);
      return;
    }

    if (setIds.length > 0) {
      loadSet(setIds[0]);
    }
  }

  function changeSet() {
    const setId = el.setSelect.value;
    loadSet(setId);
    toggleSetMenu();
  }

  function loadSet(setId) {
    // Check if it's a review set
    if (setId.startsWith("review_")) {
      const language = setId.replace("review_", "");
      const reviewData = buildReviewSetData(language);

      if (!reviewData) {
        // Review set is empty, load first regular set
        const firstSetId = Object.keys(SETS)[0];
        if (firstSetId) {
          loadSet(firstSetId);
        }
        return;
      }

      currentSet = { id: setId, ...reviewData };
    } else {
      const baseSet = SETS[setId];
      currentSet = { id: setId, ...baseSet };
    }

    localStorage.setItem(STORAGE_KEYS.lastSet, setId);
    el.setSelect.value = setId;
    el.currentSetName.textContent = currentSet.metadata.name;

    // Update speech recognition language
    if (recognition) {
      recognition.lang = currentSet.metadata.speechLang;
    }

    // Clear any pending retry when changing sets
    clearRetryState();

    loadNextPhrase();
  }

  // Progress management
  function getProgress(setId) {
    const id = setId || currentSet.id;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.progress(id));
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      // Check if old format (phraseId: true) - if so, start fresh
      const firstValue = Object.values(parsed)[0];
      if (firstValue === true || firstValue === false) {
        return {};
      }
      // Migrate old progress format to include totalAttempts and successCount
      let needsSave = false;
      for (const phraseId of Object.keys(parsed)) {
        const prog = parsed[phraseId];
        if (prog && prog.totalAttempts === undefined) {
          prog.totalAttempts =
            (prog.correctStreak || 0) + (prog.wrongCount || 0);
          prog.successCount = prog.correctStreak || 0;
          needsSave = true;
        }
      }
      if (needsSave) {
        localStorage.setItem(STORAGE_KEYS.progress(id), JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse progress:", e);
      return {};
    }
  }

  function saveProgress(progress, setId) {
    const id = setId || currentSet.id;
    try {
      localStorage.setItem(STORAGE_KEYS.progress(id), JSON.stringify(progress));
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }

  function getStats() {
    const total = currentSet.phrases.length;
    const progress = getProgress();
    let learned = 0;

    for (const phrase of currentSet.phrases) {
      const prog = progress[phrase.id];
      if (prog && prog.correctStreak >= requiredStreak) {
        learned++;
      }
    }

    return { total, learned, remaining: total - learned };
  }

  function getUnlearnedPhrases() {
    const progress = getProgress();
    return currentSet.phrases.filter((phrase) => {
      const prog = progress[phrase.id];
      return !prog || prog.correctStreak < requiredStreak;
    });
  }

  // Priority algorithm for phrase selection
  function calculatePriority(phrase, progress) {
    const prog = progress[phrase.id];
    if (!prog || !prog.totalAttempts) {
      return CONFIG.NEW_PHRASE_PRIORITY; // New phrases get highest priority
    }

    const successRate = prog.successCount / prog.totalAttempts;
    const hoursSinceLastSeen =
      (Date.now() - (prog.lastSeen || 0)) / (1000 * 60 * 60);

    // Higher priority = lower success rate + not seen recently
    return (1 - successRate) * Math.log(hoursSinceLastSeen + 1);
  }

  function selectNextPhrase(phrases) {
    if (phrases.length === 0) return null;

    const progress = getProgress();

    // Calculate priorities
    const withPriority = phrases.map((p) => {
      return { phrase: p, priority: calculatePriority(p, progress) };
    });

    // Weighted random - higher priority = higher chance
    const totalPriority = withPriority.reduce(
      (sum, item) => sum + item.priority,
      0,
    );

    // Fallback if all priorities are 0
    if (totalPriority === 0) {
      return phrases[Math.floor(Math.random() * phrases.length)];
    }

    let random = Math.random() * totalPriority;

    for (const item of withPriority) {
      random -= item.priority;
      if (random <= 0) return item.phrase;
    }

    return withPriority[0].phrase;
  }

  // Load next phrase
  function loadNextPhrase() {
    stopAudio();
    showLoading();

    // Immediate retry mode - show same phrase if in retry
    if (immediateRetry && speechEnabled && retryPhrase) {
      currentPhrase = retryPhrase;
      showPhrase(currentPhrase);
      return;
    }

    const unlearnedPhrases = getUnlearnedPhrases();
    updateProgress(getStats());

    if (unlearnedPhrases.length === 0) {
      showAllLearned();
    } else {
      // Use priority-based selection
      currentPhrase = selectNextPhrase(unlearnedPhrases);
      showPhrase(currentPhrase);
    }
  }

  // Show phrase
  function showPhrase(phrase) {
    hideAll();
    UI.show(el.flashcard);
    el.prompt.textContent = phrase.prompt;
    el.answer.textContent = phrase.answer;
    el.transcript.textContent = "";

    // Show accepted variants as list (if feature enabled)
    if (FEATURES.showAlternatives) {
      const variants = phrase.accepted.filter(
        (v) => v.toLowerCase() !== phrase.answer.toLowerCase(),
      );
      if (variants.length > 0) {
        el.acceptedVariants.innerHTML =
          '<p class="text-slate-400 dark:text-slate-500 mb-1 text-left">' +
          I18N.t("also") +
          "</p>" +
          '<ul class="list-disc list-inside space-y-1 text-left">' +
          variants.map((v) => `<li>${v}</li>`).join("") +
          "</ul>";
      } else {
        el.acceptedVariants.innerHTML = "";
      }
    } else {
      el.acceptedVariants.innerHTML = "";
    }
    UI.hide(el.userSaid);
    el.userSaidLabel.textContent = "";
    el.userSaidTranscript.textContent = "";

    // Reset state
    UI.hide(el.answerSection);
    UI.hide(el.reviewButtons);
    UI.hide(el.resultFeedback);

    // Update note and review icons
    updateNoteIcon();
    updateReviewIcon();

    // Check if audio exists for this phrase (async)
    updateAudioButton();

    if (speechEnabled) {
      UI.show(el.speechMode);
      UI.hide(el.showAnswerMode);

      // Auto-start listening if enabled
      if (autoListen && recognition) {
        setTimeout(() => {
          startListening();
        }, CONFIG.AUTO_LISTEN_DELAY);
      }
    } else {
      UI.hide(el.speechMode);
      UI.show(el.showAnswerMode);
    }
  }

  // Audio playback
  function getAudioPath(setId, phraseId) {
    return `/audio/${setId}/${phraseId}.mp3`;
  }

  function checkAudioExists(setId, phraseId) {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve(true);
      audio.onerror = () => resolve(false);
      audio.src = getAudioPath(setId, phraseId);
    });
  }

  function playAnswerAudio() {
    if (!currentPhrase || !currentSet) return;

    // Stop any currently playing audio
    stopAudio();

    const setId = currentPhrase._sourceSetId || currentSet.id;
    const audioPath = getAudioPath(setId, currentPhrase.id);

    currentAudio = new Audio(audioPath);
    currentAudio.play().catch((err) => {
      console.error("Failed to play audio:", err);
    });
  }

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  }

  async function updateAudioButton() {
    if (!currentPhrase || !el.answerAudioButton) return;

    const setId = currentPhrase._sourceSetId || currentSet.id;
    const hasAudio = await checkAudioExists(setId, currentPhrase.id);

    UI.toggle(el.answerAudioButton, hasAudio);
  }

  // Speech recognition
  function initSpeechRecognition() {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      console.warn("Speech recognition not supported");
      speechEnabled = false;
      if (el.speechToggle) {
        el.speechToggle.checked = false;
        el.speechToggle.disabled = true;
      }
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    // Set language from current set
    if (currentSet) {
      recognition.lang = currentSet.metadata.speechLang;
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      el.transcript.textContent = transcript;

      if (event.results[0].isFinal) {
        validateSpeech(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      resetMicButton();

      if (event.error === "no-speech") {
        el.transcript.textContent = I18N.t("noSpeech");
      }
    };

    recognition.onend = () => {
      isListening = false;
      resetMicButton();
    };
  }

  function resetMicButton() {
    el.micButton.textContent = "🎤";
    el.micButton.classList.remove("mic-recording", "bg-red-500");
    el.micButton.classList.add("mic-glow");
  }

  function startListening() {
    if (!recognition) {
      alert(I18N.t("speechNotAvailable"));
      return;
    }

    // Prevent multiple starts
    if (isListening) {
      return;
    }

    // Ensure correct language
    recognition.lang = currentSet.metadata.speechLang;

    el.transcript.textContent = I18N.t("listening");
    el.micButton.textContent = "🔴";
    el.micButton.classList.remove("mic-glow");
    el.micButton.classList.add("mic-recording", "bg-red-500");

    try {
      isListening = true;
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      isListening = false;
      resetMicButton();
    }
  }

  // Validate speech
  function validateSpeech(transcript) {
    const normalized = transcript.toLowerCase().trim();
    const noSpecial = normalized.replace(/[\s\-]+/g, "");
    const phrase = currentPhrase;

    // Check against answer and accepted alternatives
    // Also compare without spaces/hyphens to handle speech API variations
    // (e.g., "entlanggehen" recognized as "entlang gehen")
    // (e.g., "check-out" recognized as "checkout")
    const correct =
      phrase.answer.toLowerCase() === normalized ||
      phrase.accepted.some((a) => {
        const acceptedLower = a.toLowerCase();
        return (
          acceptedLower === normalized ||
          acceptedLower.replace(/[\s\-]+/g, "") === noSpecial
        );
      });

    showSpeechResult(correct, transcript);
  }

  function showSpeechResult(isCorrect, transcript) {
    UI.hide(el.speechMode);
    UI.show(el.answerSection);
    UI.show(el.resultFeedback);

    // Show what user said
    if (transcript) {
      el.userSaidLabel.textContent = I18N.t("youSaid");
      el.userSaidTranscript.textContent = transcript;
      el.userSaidTranscript.className = isCorrect
        ? "text-lg font-semibold mt-1 text-slate-600 dark:text-slate-300"
        : "text-lg font-semibold mt-1 text-red-600 dark:text-red-400";
      UI.show(el.userSaid);
    } else {
      UI.hide(el.userSaid);
    }

    if (isCorrect) {
      el.resultIcon.textContent = "✅";
      el.resultText.textContent = I18N.t("great");
      el.resultText.className = "text-xl font-bold text-green-600";
    } else {
      el.resultIcon.textContent = "❌";
      el.resultText.textContent = I18N.t("notThisTime");
      el.resultText.className = "text-xl font-bold text-red-600";
    }

    if (manualNext) {
      // Show next button
      showNextButton(isCorrect);
    } else {
      // Auto-submit and move to next
      setTimeout(() => {
        submitAnswer(isCorrect);
      }, CONFIG.AUTO_ADVANCE_DELAY);
    }
  }

  function showNextButton(isCorrect) {
    UI.show(el.nextButton);
    el.nextButton.onclick = () => {
      UI.hide(el.nextButton);
      submitAnswer(isCorrect);
    };
  }

  // Show answer (non-speech mode)
  function showAnswer() {
    UI.hide(el.showAnswerMode);
    UI.hide(el.speechMode);
    UI.show(el.answerSection);
    UI.show(el.reviewButtons);
  }

  // Peek answer (speech mode) - shows answer and moves on without marking as learned
  function peekAnswer() {
    UI.hide(el.speechMode);
    UI.show(el.answerSection);

    if (manualNext) {
      showNextButton(false);
    } else {
      setTimeout(() => {
        loadNextPhrase();
      }, CONFIG.AUTO_ADVANCE_DELAY);
    }
  }

  // Submit answer (with debounce protection)
  let isSubmitting = false;
  function submitAnswer(correct) {
    // Prevent double submissions
    if (isSubmitting) return;
    isSubmitting = true;

    // --- IMMEDIATE RETRY MODE (speech only) ---
    if (immediateRetry && speechEnabled && retryPhrase) {
      if (correct) {
        retrySuccessCount++;
        if (retrySuccessCount >= 2) {
          // Retry completed successfully - clear and move on
          clearRetryState();
        }
      } else {
        retryFailures++;
        if (retryFailures > 1) {
          // Too many failures in retry - reset success count
          retrySuccessCount = 0;
          retryFailures = 0;
        }
      }
      // Don't update progress during retry - it's just practice
      loadNextPhrase();
      setTimeout(() => {
        isSubmitting = false;
      }, CONFIG.DEBOUNCE_DELAY);
      return;
    }

    // --- NORMAL MODE ---
    const progress = getProgress();
    const current = progress[currentPhrase.id] || {
      correctStreak: 0,
      totalAttempts: 0,
      successCount: 0,
    };

    current.totalAttempts = (current.totalAttempts || 0) + 1;
    if (correct) {
      current.correctStreak++;
      current.successCount = (current.successCount || 0) + 1;
    } else {
      current.correctStreak = 0;
      // Start immediate retry on wrong answer (speech mode only)
      if (immediateRetry && speechEnabled) {
        retryPhrase = currentPhrase;
        retrySuccessCount = 0;
        retryFailures = 0;
      }
    }
    current.lastSeen = Date.now();
    progress[currentPhrase.id] = current;
    saveProgress(progress);

    loadNextPhrase();

    // Reset submission flag after a short delay
    setTimeout(() => {
      isSubmitting = false;
    }, CONFIG.DEBOUNCE_DELAY);
  }

  // Progress bar
  function updateProgress(stats) {
    const percent = stats.total > 0 ? (stats.learned / stats.total) * 100 : 0;
    el.progressBar.style.width = `${percent}%`;
    el.progressText.textContent = `${stats.learned} / ${stats.total}`;
  }

  // UI helpers
  function hideAll() {
    UI.hide(el.loading);
    UI.hide(el.allLearned);
    UI.hide(el.flashcard);
  }

  function showLoading() {
    hideAll();
    UI.show(el.loading);
  }

  function showAllLearned() {
    hideAll();
    UI.show(el.allLearned);
  }

  // Reset
  function confirmReset() {
    UI.show(el.resetModal);
  }

  function closeResetModal() {
    UI.hide(el.resetModal);
  }

  function resetProgress() {
    closeResetModal();
    localStorage.removeItem(STORAGE_KEYS.progress(currentSet.id));
    loadNextPhrase();
  }

  // Menu
  function toggleMenu() {
    const isOpen = !el.menuOverlay.classList.contains("hidden");

    if (isOpen) {
      // Close menu
      UI.hide(el.menuOverlay);
      el.menuPanel.classList.add("translate-x-full");
    } else {
      // Open menu
      UI.show(el.menuOverlay);
      el.menuPanel.classList.remove("translate-x-full");
    }
  }

  // Review Set management
  function getReviewSet(language) {
    return Storage.get(STORAGE_KEYS.reviewSet(language), []);
  }

  function saveReviewSet(language, reviewSet) {
    Storage.set(STORAGE_KEYS.reviewSet(language), reviewSet);
  }

  function addToReviewSet(setId, phraseId, language) {
    const reviewSet = getReviewSet(language);
    const exists = reviewSet.some(
      (r) => r.setId === setId && r.phraseId === phraseId,
    );
    if (!exists) {
      reviewSet.push({ setId, phraseId });
      saveReviewSet(language, reviewSet);
    }
  }

  function removeFromReviewSet(setId, phraseId, language) {
    const reviewSet = getReviewSet(language);
    const filtered = reviewSet.filter(
      (r) => !(r.setId === setId && r.phraseId === phraseId),
    );
    saveReviewSet(language, filtered);
  }

  function isInReviewSet(setId, phraseId, language) {
    const reviewSet = getReviewSet(language);
    return reviewSet.some((r) => r.setId === setId && r.phraseId === phraseId);
  }

  function getReviewSetLanguages() {
    const languages = [];
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("langlearn_review_set_")) {
        const lang = key.replace("langlearn_review_set_", "");
        const reviewSet = getReviewSet(lang);
        if (reviewSet.length > 0) {
          languages.push(lang);
        }
      }
    }
    return languages;
  }

  function buildReviewSetData(language) {
    const reviewSet = getReviewSet(language);
    if (reviewSet.length === 0) return null;

    const phrases = [];
    let metadata = null;

    for (const ref of reviewSet) {
      const sourceSet = SETS[ref.setId];
      if (!sourceSet) continue;

      const phrase = sourceSet.phrases.find((p) => p.id === ref.phraseId);
      if (phrase) {
        // Add source set ID to phrase for tracking
        phrases.push({ ...phrase, _sourceSetId: ref.setId });
        // Use first valid set's metadata
        if (!metadata) {
          metadata = { ...sourceSet.metadata };
        }
      }
    }

    if (phrases.length === 0 || !metadata) return null;

    return {
      metadata: {
        ...metadata,
        id: `review_${language}`,
        name: `⭐ ${I18N.t("review")}: ${getLanguageDisplayName(language)}`,
        isReviewSet: true,
        reviewLanguage: language,
      },
      phrases,
    };
  }

  function getLanguageDisplayName(langCode) {
    const names = {
      de: "German",
      en: "English",
      es: "Spanish",
      fr: "French",
      pl: "Polish",
      it: "Italian",
      pt: "Portuguese",
      nl: "Dutch",
      ru: "Russian",
      ja: "Japanese",
      zh: "Chinese",
      ko: "Korean",
    };
    return names[langCode] || langCode.toUpperCase();
  }

  function toggleReview() {
    if (!currentPhrase || !currentSet) return;

    // For review sets, remove from review; otherwise add/toggle
    if (currentSet.metadata.isReviewSet) {
      const sourceSetId = currentPhrase._sourceSetId;
      const language = currentSet.metadata.reviewLanguage;
      removeFromReviewSet(sourceSetId, currentPhrase.id, language);
      updateReviewIcon();
      populateSetMenu();
      // Rebuild current set data to reflect removal
      const reviewData = buildReviewSetData(language);
      if (reviewData) {
        currentSet = { id: currentSet.id, ...reviewData };
      }
      // Load next phrase since this one is removed
      loadNextPhrase();
    } else {
      const language = currentSet.metadata.language;
      const inReview = isInReviewSet(currentSet.id, currentPhrase.id, language);

      if (inReview) {
        removeFromReviewSet(currentSet.id, currentPhrase.id, language);
      } else {
        addToReviewSet(currentSet.id, currentPhrase.id, language);
      }
      updateReviewIcon();
      populateSetMenu();
      // Restore selection after repopulating
      el.setSelect.value = currentSet.id;
    }
  }

  function updateReviewIcon() {
    if (!currentPhrase || !el.reviewIconEmpty || !el.reviewIconFilled) return;

    let inReview = false;

    if (currentSet.metadata.isReviewSet) {
      // Always show filled in review set mode
      inReview = true;
    } else {
      const language = currentSet.metadata.language;
      inReview = isInReviewSet(currentSet.id, currentPhrase.id, language);
    }

    UI.toggle(el.reviewIconEmpty, !inReview);
    UI.toggle(el.reviewIconFilled, inReview);

    // Update tooltip
    if (el.reviewButton) {
      el.reviewButton.title = inReview
        ? I18N.t("removeFromReview")
        : I18N.t("addToReview");
    }
  }

  // Notes management
  function getAllNotes() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.notes);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load notes:", e);
      return {};
    }
  }

  function saveAllNotes(notes) {
    try {
      localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
    } catch (e) {
      console.error("Failed to save notes:", e);
    }
  }

  function getNoteKey(phrase) {
    const setId = phrase._sourceSetId || currentSet.id;
    return `${setId}__${phrase.id}`;
  }

  function getNote(phrase) {
    const notes = getAllNotes();
    return notes[getNoteKey(phrase)] || null;
  }

  function updateNoteIcon() {
    if (!currentPhrase || !el.noteIconEmpty || !el.noteIconFilled) return;
    const note = getNote(currentPhrase);
    const hasNote = note && note.text;
    UI.toggle(el.noteIconEmpty, !hasNote);
    UI.toggle(el.noteIconFilled, hasNote);
  }

  function openNoteModal() {
    if (!currentPhrase) return;
    const note = getNote(currentPhrase);
    el.notePhraseInfo.textContent = `${currentPhrase.prompt} → ${currentPhrase.answer}`;
    el.noteTextarea.value = note ? note.text : "";
    UI.show(el.noteModal);
    el.noteTextarea.focus();
  }

  function closeNoteModal() {
    UI.hide(el.noteModal);
  }

  function saveNote() {
    if (!currentPhrase) return;
    const text = el.noteTextarea.value.trim();
    const notes = getAllNotes();
    const key = getNoteKey(currentPhrase);

    if (text) {
      notes[key] = {
        text: text,
        prompt: currentPhrase.prompt,
        answer: currentPhrase.answer,
        setId: currentPhrase._sourceSetId || currentSet.id,
        updatedAt: Date.now(),
      };
    } else {
      delete notes[key];
    }

    saveAllNotes(notes);
    updateNoteIcon();
    closeNoteModal();
  }

  function exportNotes() {
    const notes = getAllNotes();
    const entries = Object.values(notes);
    const generalNotes = localStorage.getItem(STORAGE_KEYS.generalNotes) || "";

    if (entries.length === 0 && !generalNotes) {
      alert(I18N.t("noNotesToExport"));
      return;
    }

    // Sort by update time (newest first)
    entries.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    // Format phrase notes
    const formattedPhrases = entries
      .map((n) => `${n.prompt} → ${n.answer}\n${n.text}`)
      .join("\n\n---\n\n");

    // Build final output
    let formatted = "";
    if (generalNotes) {
      formatted += `=== ${I18N.t("generalNotes")} ===\n\n${generalNotes}`;
      if (entries.length > 0) {
        formatted += "\n\n---\n\n";
      }
    }
    if (entries.length > 0) {
      formatted += formattedPhrases;
    }

    // Copy to clipboard
    const totalCount = entries.length + (generalNotes ? 1 : 0);
    navigator.clipboard
      .writeText(formatted)
      .then(() => {
        alert(I18N.t("notesCopied", { count: totalCount }));
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        alert(I18N.t("failedToCopy"));
      });

    toggleMenu();
  }

  function clearNotes() {
    const notes = getAllNotes();
    const generalNotes = localStorage.getItem(STORAGE_KEYS.generalNotes) || "";
    const entries = Object.values(notes);

    if (entries.length === 0 && !generalNotes) {
      alert(I18N.t("noNotesToClear"));
      toggleMenu();
      return;
    }

    if (confirm(I18N.t("notesCleared") + "?")) {
      localStorage.removeItem(STORAGE_KEYS.notes);
      localStorage.removeItem(STORAGE_KEYS.generalNotes);
      alert(I18N.t("notesCleared"));
    }

    toggleMenu();
  }

  function openGeneralNotes() {
    toggleMenu();
    const saved = localStorage.getItem(STORAGE_KEYS.generalNotes) || "";
    el.generalNotesTextarea.value = saved;
    el.generalNotesModal.classList.remove("hidden");
  }

  function closeGeneralNotes() {
    el.generalNotesModal.classList.add("hidden");
  }

  function saveGeneralNotes() {
    const text = el.generalNotesTextarea.value.trim();
    if (text) {
      localStorage.setItem(STORAGE_KEYS.generalNotes, text);
    } else {
      localStorage.removeItem(STORAGE_KEYS.generalNotes);
    }
    closeGeneralNotes();
  }

  // No longer exposing functions to global scope - all handlers are bound via addEventListener
})();
