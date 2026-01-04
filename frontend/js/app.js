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
    expandedFolders: "langlearn_expanded_folders",
    reverseMode: "langlearn_reverse_mode",
    vocabMastery: "langlearn_vocab_mastery",
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

  // Reverse mode - translate from target to source language
  let reverseMode = false;

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
      reverseModeToggle: document.getElementById("reverse-mode-toggle"),
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
      setModal: document.getElementById("set-modal"),
      setFolders: document.getElementById("set-folders"),
      currentSetName: document.getElementById("current-set-name"),
      acceptedVariants: document.getElementById("accepted-variants"),
      userSaid: document.getElementById("user-said"),
      userSaidLabel: document.getElementById("user-said-label"),
      userSaidTranscript: document.getElementById("user-said-transcript"),
      nextButton: document.getElementById("next-button"),
      sourceSetInfo: document.getElementById("source-set-info"),
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

    // Set selection modal - close on backdrop click
    el.setModal?.addEventListener("click", (e) => {
      if (e.target === el.setModal) hideSetModal();
    });

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
    el.reverseModeToggle?.addEventListener("change", saveReverseModeSetting);
    el.themeToggle?.addEventListener("change", saveThemeSetting);
    el.clearCacheButton?.addEventListener("click", clearCache);
    el.backButton?.addEventListener("click", () => Router.back());
    el.answerAudioButton?.addEventListener("click", playAnswerAudio);
  }

  // Initialize
  document.addEventListener("DOMContentLoaded", () => {
    I18N.init();
    initTheme();
    // Set version in footer
    const versionEl = document.querySelector("[data-version]");
    if (versionEl && typeof APP_VERSION !== "undefined") {
      versionEl.textContent = APP_VERSION;
    }
    cacheElements();
    bindEventListeners();
    loadSettings();
    populateSetFolders();
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
    if (el.reverseModeToggle) el.reverseModeToggle.checked = reverseMode;
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

      const savedReverseMode = localStorage.getItem(STORAGE_KEYS.reverseMode);
      reverseMode = savedReverseMode === "true";

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

  function saveReverseModeSetting() {
    reverseMode = el.reverseModeToggle.checked;
    localStorage.setItem(STORAGE_KEYS.reverseMode, reverseMode);
    // Update speech recognition language for reverse mode
    if (recognition && currentSet) {
      recognition.lang = reverseMode
        ? currentSet.metadata.sourceSpeechLang
        : currentSet.metadata.speechLang;
    }
    if (currentPhrase) {
      showPhrase(currentPhrase);
    }
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

  // Set menu (folder-based modal)
  function getExpandedFolders() {
    return Storage.get(STORAGE_KEYS.expandedFolders, []);
  }

  function saveExpandedFolders(expanded) {
    Storage.set(STORAGE_KEYS.expandedFolders, expanded);
  }

  function populateSetFolders() {
    const container = el.setFolders;
    if (!container) return;
    container.innerHTML = "";

    // Group sets by language
    const grouped = {};
    for (const [id, set] of Object.entries(SETS)) {
      const lang = set.metadata.language;
      if (!grouped[lang]) grouped[lang] = [];
      grouped[lang].push({ id, ...set });
    }

    // Get expanded state
    const expanded = getExpandedFolders();

    // Sort languages alphabetically by display name
    const uiLang = I18N.currentLang;
    const sortedLangs = Object.keys(grouped).sort((a, b) => {
      const nameA = getLanguageDisplay(a, uiLang).name;
      const nameB = getLanguageDisplay(b, uiLang).name;
      return nameA.localeCompare(nameB);
    });

    // Create folder for each language
    for (const lang of sortedLangs) {
      const sets = grouped[lang];
      const display = getLanguageDisplay(lang, uiLang);
      const isExpanded = expanded.includes(lang);

      // Check for review set
      const reviewData = buildReviewSetData(lang);

      const folderHTML = createFolderHTML(
        lang,
        display,
        sets,
        reviewData,
        isExpanded,
      );
      container.insertAdjacentHTML("beforeend", folderHTML);
    }

    // Attach event listeners
    attachFolderListeners();
  }

  function createFolderHTML(lang, display, sets, reviewData, isExpanded) {
    const chevronRotation = isExpanded ? "rotate(180deg)" : "rotate(0deg)";
    const contentHidden = isExpanded ? "" : "hidden";

    // Build set items HTML
    let setsHTML = sets
      .map(
        (set) => `
      <button class="set-item w-full text-left p-2 pl-4 rounded-lg text-slate-600
                     dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30
                     hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm"
              data-set-id="${set.id}">
        ${set.metadata.name}
      </button>
    `,
      )
      .join("");

    // Add mixed practice button if there are multiple sets
    if (sets.length > 1) {
      const mixedData = buildMixedPracticeData(lang);
      if (mixedData && mixedData.phrases.length > 0) {
        setsHTML += `
          <button class="set-item w-full text-left p-2 pl-4 rounded-lg text-indigo-600
                         dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30
                         transition-colors text-sm"
                  data-set-id="mixed_${lang}">
            <span class="flex items-center gap-1">
              <span>🔀</span>
              <span>${I18N.t("mixedPractice")} (${mixedData.phrases.length})</span>
            </span>
          </button>
        `;
      }
    }

    // Add review set if exists
    if (reviewData && reviewData.phrases.length > 0) {
      setsHTML += `
        <button class="set-item w-full text-left p-2 pl-4 rounded-lg text-amber-600
                       dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30
                       transition-colors text-sm"
                data-set-id="review_${lang}">
          <span class="flex items-center gap-1">
            <span>⭐</span>
            <span>${I18N.t("reviewSetPrefix")} (${reviewData.phrases.length})</span>
          </span>
        </button>
      `;
    }

    return `
      <div class="language-folder mb-2">
        <button class="folder-toggle w-full flex items-center justify-between p-3
                       rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                data-lang="${lang}">
          <span class="flex items-center gap-2">
            <span class="text-xl">${display.flag}</span>
            <span class="font-medium text-slate-800 dark:text-slate-200">${display.name}</span>
            <span class="text-xs text-slate-400 dark:text-slate-500">(${sets.length})</span>
          </span>
          <svg class="w-5 h-5 text-slate-400 transition-transform duration-200"
               style="transform: ${chevronRotation};"
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div class="folder-content ${contentHidden} pl-4 mt-1 space-y-1">
          ${setsHTML}
        </div>
      </div>
    `;
  }

  function attachFolderListeners() {
    if (!el.setFolders) return;

    // Folder toggles
    el.setFolders.querySelectorAll(".folder-toggle").forEach((btn) => {
      btn.addEventListener("click", () => toggleFolder(btn.dataset.lang));
    });

    // Set items
    el.setFolders.querySelectorAll(".set-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        loadSet(btn.dataset.setId);
        hideSetModal();
      });
    });
  }

  function toggleFolder(lang) {
    const folderBtn = el.setFolders.querySelector(`[data-lang="${lang}"]`);
    if (!folderBtn) return;

    const content = folderBtn.nextElementSibling;
    const chevron = folderBtn.querySelector("svg");

    const isHidden = content.classList.contains("hidden");
    content.classList.toggle("hidden");
    chevron.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";

    // Save state to localStorage
    let expanded = getExpandedFolders();
    if (isHidden) {
      if (!expanded.includes(lang)) expanded.push(lang);
    } else {
      expanded = expanded.filter((l) => l !== lang);
    }
    saveExpandedFolders(expanded);
  }

  function showSetModal() {
    populateSetFolders();
    UI.show(el.setModal);
  }

  function hideSetModal() {
    UI.hide(el.setModal);
  }

  function toggleSetMenu() {
    if (el.setModal.classList.contains("hidden")) {
      showSetModal();
    } else {
      hideSetModal();
    }
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
    } else if (setId.startsWith("mixed_")) {
      // Mixed practice mode
      const language = setId.replace("mixed_", "");
      const mixedData = buildMixedPracticeData(language);

      if (!mixedData) {
        // No phrases available for mixed practice
        const firstSetId = Object.keys(SETS)[0];
        if (firstSetId) {
          loadSet(firstSetId);
        }
        return;
      }

      currentSet = { id: setId, ...mixedData };
    } else {
      const baseSet = SETS[setId];
      currentSet = { id: setId, ...baseSet };
    }

    localStorage.setItem(STORAGE_KEYS.lastSet, setId);
    el.currentSetName.textContent = currentSet.metadata.name;

    // Update speech recognition language (use source language in reverse mode)
    if (recognition) {
      recognition.lang = reverseMode
        ? currentSet.metadata.sourceSpeechLang
        : currentSet.metadata.speechLang;
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
      // Migrate old progress format
      let needsSave = false;
      for (const phraseId of Object.keys(parsed)) {
        const prog = parsed[phraseId];
        if (prog) {
          // Migrate to include totalAttempts and successCount
          if (prog.totalAttempts === undefined) {
            prog.totalAttempts = prog.correctStreak || 0;
            prog.successCount = prog.correctStreak || 0;
            needsSave = true;
          }
          // Migrate to include SRS fields (interval, easeFactor, nextReviewDate)
          if (prog.interval === undefined) {
            // Initialize SRS fields based on existing progress
            if (prog.correctStreak >= requiredStreak) {
              // Already learned - set reasonable interval
              prog.interval = 6;
              prog.easeFactor = 2.5;
              prog.nextReviewDate =
                (prog.lastSeen || Date.now()) + 6 * 24 * 60 * 60 * 1000;
            } else {
              // Not yet learned - start fresh
              prog.interval = 1;
              prog.easeFactor = 2.5;
              prog.nextReviewDate = null;
            }
            needsSave = true;
          }
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

  // SM-2 Spaced Repetition Algorithm
  // Quality ratings: 0-2 (fail), 3 (hard), 4 (good), 5 (easy)
  function updateSRS(phraseId, quality) {
    const progress = getProgress();
    const prog = progress[phraseId] || {
      correctStreak: 0,
      totalAttempts: 0,
      successCount: 0,
      interval: 1,
      easeFactor: 2.5,
      nextReviewDate: null,
    };

    if (quality < 3) {
      // Failed - reset interval to 1 day
      prog.interval = 1;
    } else {
      // Success - increase interval
      if (prog.interval === 1) {
        prog.interval = 6; // First success: 6 days
      } else {
        prog.interval = Math.round(prog.interval * prog.easeFactor);
      }
    }

    // Update ease factor (minimum 1.3)
    // SM-2 formula: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
    prog.easeFactor = Math.max(
      1.3,
      prog.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
    );

    // Set next review date
    prog.nextReviewDate = Date.now() + prog.interval * 24 * 60 * 60 * 1000;

    progress[phraseId] = prog;
    saveProgress(progress);
  }

  // Convert boolean correct to SM-2 quality rating
  function getQualityRating(correct) {
    // Simple mapping: correct = 4 (good), wrong = 1 (fail)
    // Could be extended with "hard" button (3) or "easy" button (5)
    return correct ? 4 : 1;
  }

  // Calculate priority for overdue phrases (shared logic)
  function calculateOverduePriority(nextReviewDate) {
    const overdueDays = (Date.now() - nextReviewDate) / (24 * 60 * 60 * 1000);
    return 500 + Math.min(overdueDays * 10, 500);
  }

  // Cache for global overdue phrases (performance optimization)
  let globalOverdueCache = null;
  let globalOverdueCacheTime = 0;
  const GLOBAL_OVERDUE_CACHE_TTL = 30000; // 30 seconds

  // Get overdue phrases from all sets of the same target language (for global reminders)
  function getGlobalOverduePhrases(currentLanguage, excludeSetId) {
    const now = Date.now();

    // Return cached result if valid
    if (
      globalOverdueCache &&
      globalOverdueCache.language === currentLanguage &&
      now - globalOverdueCacheTime < GLOBAL_OVERDUE_CACHE_TTL
    ) {
      // Filter out current set from cached results
      return globalOverdueCache.phrases.filter(
        (p) => p._sourceSetId !== excludeSetId,
      );
    }

    const overduePhrases = [];

    for (const [setId, set] of Object.entries(SETS)) {
      // Skip mixed practice sets and review sets
      if (set.metadata?.isMixedPractice || set.metadata?.isReviewSet) continue;
      // Only same target language
      if (set.metadata?.language !== currentLanguage) continue;

      const progress = getProgress(setId);

      for (const phrase of set.phrases) {
        const prog = progress[phrase.id];
        if (prog?.nextReviewDate && now >= prog.nextReviewDate) {
          overduePhrases.push({
            ...phrase,
            _sourceSetId: setId,
            _sourceSetName: set.metadata?.name || setId,
            _overduePriority: calculateOverduePriority(prog.nextReviewDate),
          });
        }
      }
    }

    // Sort by priority (most overdue first)
    overduePhrases.sort((a, b) => b._overduePriority - a._overduePriority);

    // Cache results (without excludeSetId filter - applied on read)
    globalOverdueCache = { language: currentLanguage, phrases: overduePhrases };
    globalOverdueCacheTime = now;

    return overduePhrases.filter((p) => p._sourceSetId !== excludeSetId);
  }

  // Priority algorithm for phrase selection (SM-2 based)
  function calculatePriority(phrase, progress) {
    const prog = progress[phrase.id];

    // New phrases get highest priority
    if (!prog || !prog.totalAttempts) {
      return CONFIG.NEW_PHRASE_PRIORITY;
    }

    // If no nextReviewDate, use legacy algorithm for backwards compatibility
    if (!prog.nextReviewDate) {
      const successRate = prog.successCount / prog.totalAttempts;
      const hoursSinceLastSeen =
        (Date.now() - (prog.lastSeen || 0)) / (1000 * 60 * 60);
      return (1 - successRate) * Math.log(hoursSinceLastSeen + 1);
    }

    const now = Date.now();

    // Overdue phrases get high priority based on how overdue they are
    if (now >= prog.nextReviewDate) {
      return calculateOverduePriority(prog.nextReviewDate);
    }

    // Not yet due - low priority (but not zero, to allow practice)
    const daysUntilDue = (prog.nextReviewDate - now) / (24 * 60 * 60 * 1000);
    return Math.max(0.1, 10 - daysUntilDue);
  }

  // Global reminder ratio - 20% chance to show overdue phrase from other sets
  const GLOBAL_REMINDER_RATIO = 0.2;

  function selectNextPhrase(phrases) {
    if (phrases.length === 0) return null;

    // For mixed practice mode, we need to get progress from source sets
    const isMixedOrReview =
      currentSet?.metadata?.isMixedPractice ||
      currentSet?.metadata?.isReviewSet;

    // Global reminders: 20% chance to show overdue phrase from other sets (same language)
    // Only for regular sets, not mixed practice or review sets
    const currentLanguage = currentSet?.metadata?.language;
    const currentSetId = currentSet?.metadata?.id;
    if (!isMixedOrReview && currentLanguage && currentSetId) {
      const globalOverdue = getGlobalOverduePhrases(
        currentLanguage,
        currentSetId,
      );

      if (globalOverdue.length > 0 && Math.random() < GLOBAL_REMINDER_RATIO) {
        // Pick from top overdue phrases (weighted by priority)
        const topOverdue = globalOverdue.slice(0, 10);
        const totalPriority = topOverdue.reduce(
          (sum, p) => sum + p._overduePriority,
          0,
        );
        let random = Math.random() * totalPriority;

        for (const phrase of topOverdue) {
          random -= phrase._overduePriority;
          if (random <= 0) return phrase;
        }
        return topOverdue[0];
      }
    }

    // Calculate priorities for current set phrases
    const withPriority = phrases.map((p) => {
      const progress =
        isMixedOrReview && p._sourceSetId
          ? getProgress(p._sourceSetId)
          : getProgress();
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

    // In reverse mode, swap prompt and answer
    const displayPrompt = reverseMode ? phrase.answer : phrase.prompt;
    const displayAnswer = reverseMode ? phrase.prompt : phrase.answer;

    el.prompt.textContent = displayPrompt;
    el.answer.textContent = displayAnswer;
    el.transcript.textContent = "";

    // Show source set name for mixed practice mode or global reminders
    if (el.sourceSetInfo) {
      if (phrase._sourceSetName) {
        el.sourceSetInfo.textContent = `${I18N.t("fromSet")} ${phrase._sourceSetName}`;
        UI.show(el.sourceSetInfo);
      } else {
        UI.hide(el.sourceSetInfo);
      }
    }

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

    // Ensure correct language (use source language in reverse mode)
    recognition.lang = reverseMode
      ? currentSet.metadata.sourceSpeechLang
      : currentSet.metadata.speechLang;

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

    let correct;

    if (reverseMode) {
      // In reverse mode, user speaks the source language (prompt)
      // Compare against the original prompt
      const promptLower = phrase.prompt.toLowerCase();
      correct =
        promptLower === normalized ||
        promptLower.replace(/[\s\-]+/g, "") === noSpecial;
    } else {
      // Normal mode - check against answer and accepted alternatives
      // Also compare without spaces/hyphens to handle speech API variations
      // (e.g., "entlanggehen" recognized as "entlang gehen")
      // (e.g., "check-out" recognized as "checkout")
      correct =
        phrase.answer.toLowerCase() === normalized ||
        phrase.accepted.some((a) => {
          const acceptedLower = a.toLowerCase();
          return (
            acceptedLower === normalized ||
            acceptedLower.replace(/[\s\-]+/g, "") === noSpecial
          );
        });
    }

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
    // For mixed practice / review sets / global reminders, save progress to source set
    const isMixedOrReview =
      currentSet?.metadata?.isMixedPractice ||
      currentSet?.metadata?.isReviewSet;
    // Use source set ID for mixed/review sets OR for global reminder phrases
    const progressSetId = currentPhrase._sourceSetId
      ? currentPhrase._sourceSetId
      : null;

    const progress = getProgress(progressSetId);
    const current = progress[currentPhrase.id] || {
      correctStreak: 0,
      totalAttempts: 0,
      successCount: 0,
      interval: 1,
      easeFactor: 2.5,
      nextReviewDate: null,
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

    // Update SRS fields
    const quality = getQualityRating(correct);
    if (quality < 3) {
      // Failed - reset interval
      current.interval = 1;
    } else {
      // Success - increase interval
      if (!current.interval || current.interval === 1) {
        current.interval = 6;
      } else {
        current.interval = Math.round(
          current.interval * (current.easeFactor || 2.5),
        );
      }
    }
    // Update ease factor
    current.easeFactor = Math.max(
      1.3,
      (current.easeFactor || 2.5) +
        (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
    );
    // Set next review date
    current.nextReviewDate =
      Date.now() + current.interval * 24 * 60 * 60 * 1000;

    progress[currentPhrase.id] = current;
    saveProgress(progress, progressSetId);

    // Update vocabulary mastery if phrase has vocabulary data
    const vocabSetId = progressSetId || currentSet.id;
    updateVocabMastery(currentPhrase, correct, vocabSetId);

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
        name: `⭐ ${I18N.t("review")}: ${getLanguageDisplay(language, I18N.currentLang).name}`,
        isReviewSet: true,
        reviewLanguage: language,
      },
      phrases,
    };
  }

  // Mixed Practice Mode - interleaved learning across all sets of same language
  function buildMixedPracticeData(language) {
    const allSets = Object.entries(SETS).filter(
      ([, set]) =>
        set.metadata.language === language && !set.metadata.isReviewSet,
    );

    if (allSets.length === 0) return null;

    const phrases = [];
    let metadata = null;

    for (const [setId, set] of allSets) {
      const progress = getProgress(setId);

      for (const phrase of set.phrases) {
        const prog = progress[phrase.id];
        // Include unlearned phrases or phrases due for review
        const isUnlearned = !prog || prog.correctStreak < requiredStreak;
        const isDueForReview =
          prog?.nextReviewDate && Date.now() >= prog.nextReviewDate;

        if (isUnlearned || isDueForReview) {
          phrases.push({
            ...phrase,
            _sourceSetId: setId,
            _sourceSetName: set.metadata.name,
          });
        }
      }

      if (!metadata) {
        metadata = { ...set.metadata };
      }
    }

    if (phrases.length === 0 || !metadata) return null;

    const display = getLanguageDisplay(language, I18N.currentLang);
    return {
      metadata: {
        ...metadata,
        id: `mixed_${language}`,
        name: `🔀 ${I18N.t("mixedPractice")}: ${display.name}`,
        isMixedPractice: true,
        mixedLanguage: language,
      },
      phrases,
    };
  }

  function toggleReview() {
    if (!currentPhrase || !currentSet) return;

    // For review sets, remove from review; otherwise add/toggle
    if (currentSet.metadata.isReviewSet) {
      const sourceSetId = currentPhrase._sourceSetId;
      const language = currentSet.metadata.reviewLanguage;
      removeFromReviewSet(sourceSetId, currentPhrase.id, language);
      updateReviewIcon();
      populateSetFolders();
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
      populateSetFolders();
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
    const generalNotes = getGeneralNotes();

    if (entries.length === 0 && generalNotes.length === 0) {
      alert(I18N.t("noNotesToExport"));
      return;
    }

    // Sort by update time (newest first)
    entries.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    generalNotes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Format phrase notes
    const formattedPhrases = entries
      .map((n) => `${n.prompt} → ${n.answer}\n${n.text}`)
      .join("\n\n---\n\n");

    // Format general notes
    const formattedGeneral = generalNotes
      .map((n) => n.text)
      .join("\n\n---\n\n");

    // Build final output
    let formatted = "";
    if (generalNotes.length > 0) {
      formatted += `=== ${I18N.t("generalNotes")} ===\n\n${formattedGeneral}`;
      if (entries.length > 0) {
        formatted += "\n\n---\n\n";
      }
    }
    if (entries.length > 0) {
      formatted += formattedPhrases;
    }

    // Copy to clipboard
    const totalCount = entries.length + generalNotes.length;
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
    const generalNotes = getGeneralNotes();
    const entries = Object.values(notes);

    if (entries.length === 0 && generalNotes.length === 0) {
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

  function getGeneralNotes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.generalNotes)) || [];
    } catch {
      return [];
    }
  }

  function openGeneralNotes() {
    toggleMenu();
    el.generalNotesTextarea.value = "";
    el.generalNotesModal.classList.remove("hidden");
  }

  function closeGeneralNotes() {
    el.generalNotesModal.classList.add("hidden");
  }

  function saveGeneralNotes() {
    const text = el.generalNotesTextarea.value.trim();
    if (text) {
      const notes = getGeneralNotes();
      notes.push({
        text,
        createdAt: Date.now(),
      });
      localStorage.setItem(STORAGE_KEYS.generalNotes, JSON.stringify(notes));
    }
    closeGeneralNotes();
  }

  // ========== VOCABULARY MASTERY TRACKING ==========
  // Tracks mastery at vocabulary level across multiple contexts

  function getVocabMastery() {
    return Storage.get(STORAGE_KEYS.vocabMastery, {});
  }

  function saveVocabMastery(mastery) {
    Storage.set(STORAGE_KEYS.vocabMastery, mastery);
  }

  // Update vocabulary mastery when a phrase is answered
  // Only works if phrase has vocabulary field
  function updateVocabMastery(phrase, correct, setId) {
    if (!phrase.vocabulary || !Array.isArray(phrase.vocabulary)) {
      return; // Skip if no vocabulary data
    }

    const mastery = getVocabMastery();

    for (const vocab of phrase.vocabulary) {
      const baseWord = vocab.base || vocab.word;
      if (!baseWord) continue;

      const key = baseWord.toLowerCase();

      if (!mastery[key]) {
        mastery[key] = {
          word: baseWord,
          type: vocab.type,
          contexts: [],
          totalCorrect: 0,
          totalAttempts: 0,
        };
      }

      // Update context-specific mastery
      const contextKey = `${setId}__${phrase.id}`;
      let context = mastery[key].contexts.find((c) => c.key === contextKey);

      if (!context) {
        context = {
          key: contextKey,
          setId: setId,
          phraseId: phrase.id,
          correct: 0,
          attempts: 0,
          mastered: false,
        };
        mastery[key].contexts.push(context);
      }

      context.attempts++;
      mastery[key].totalAttempts++;

      if (correct) {
        context.correct++;
        mastery[key].totalCorrect++;

        // Mark as mastered in this context if 2+ correct
        if (context.correct >= 2) {
          context.mastered = true;
        }
      } else {
        // Reset mastery on wrong answer
        context.mastered = false;
        context.correct = 0;
      }

      // Calculate overall mastery percentage
      const masteredContexts = mastery[key].contexts.filter(
        (c) => c.mastered,
      ).length;
      mastery[key].overallMastery =
        mastery[key].contexts.length > 0
          ? masteredContexts / mastery[key].contexts.length
          : 0;
    }

    saveVocabMastery(mastery);
  }

  // Get vocabulary items that need more practice (low mastery)
  function getWeakVocabulary(minContexts = 2) {
    const mastery = getVocabMastery();
    const weak = [];

    for (const [key, data] of Object.entries(mastery)) {
      // Only include words with multiple contexts but low mastery
      if (data.contexts.length >= minContexts && data.overallMastery < 0.5) {
        weak.push({
          word: data.word,
          type: data.type,
          mastery: data.overallMastery,
          contexts: data.contexts.length,
          masteredContexts: data.contexts.filter((c) => c.mastered).length,
        });
      }
    }

    // Sort by mastery (lowest first)
    return weak.sort((a, b) => a.mastery - b.mastery);
  }

  // No longer exposing functions to global scope - all handlers are bound via addEventListener
})();
