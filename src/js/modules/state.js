// src/js/modules/state.js

const LANGUAGE_STORAGE_KEY = 'wikiGuiLanguage';

const getInitialLang = () => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && ['de', 'en'].includes(saved)) return saved;
    return 'de';
};

const state = {
    currentLang: getInitialLang(),
    translations: {}
};

export function setLanguage(lang) {
    if (!['de', 'en'].includes(lang)) return;
    state.currentLang = lang;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

export function getLanguage() {
    return state.currentLang || 'de';
}

export function setTranslations(lang, data) {
    state.translations[lang] = data;
}

export function getTranslation(key, defaultValue = '', replacements = {}) {
    let translatedString = defaultValue;
    if (state.translations[state.currentLang] && state.translations[state.currentLang][key]) {
        translatedString = state.translations[state.currentLang][key];
    }

    for (const placeholder in replacements) {
        const regex = new RegExp(`{\s*${placeholder}\s*}`, 'g');
        translatedString = translatedString.replace(regex, replacements[placeholder]);
    }

    return translatedString;
}
