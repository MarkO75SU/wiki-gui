// src/js/main.js
import { setLanguage, setTranslations, getLanguage } from './modules/state.js';
import { applyTranslations, clearForm, handleSearchFormSubmit, addAccordionFunctionality } from './modules/ui.js';
import { generateSearchString } from './modules/search.js';
import { saveCurrentSearch, loadSavedSearches, handleSavedSearchActions } from './modules/storage.js';

async function initializeApp() {
    // Set initial language
    const initialLang = getLanguage();
    document.documentElement.lang = initialLang;

    // Fetch translations and wait for them to complete
    try {
        const response = await fetch(`translations/${initialLang}.json`);
        const data = await response.json();
        setTranslations(initialLang, data);
        
        // Now that translations are loaded, apply them
        applyTranslations();
    } catch (error) {
        console.error(`Could not fetch initial translations for ${initialLang}:`, error);
    }

    // Set up UI and event listeners after translations are ready
    addAccordionFunctionality();
    generateSearchString(); // To show placeholders correctly
    loadSavedSearches();

    // Setup event listeners
    document.getElementById('search-form').addEventListener('submit', handleSearchFormSubmit);
    document.getElementById('clear-form-button').addEventListener('click', clearForm);
    document.getElementById('save-search-button').addEventListener('click', saveCurrentSearch);
    document.getElementById('saved-searches-list').addEventListener('click', handleSavedSearchActions);

    document.querySelectorAll('.lang-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const lang = event.target.dataset.lang;
            setLanguage(lang);
            try {
                const response = await fetch(`translations/${lang}.json`);
                const data = await response.json();
                setTranslations(lang, data);
                applyTranslations();
            } catch (error) {
                console.error(`Could not fetch translations for ${lang}:`, error);
            }
        });
    });

    // Any other generic listeners
    document.getElementById('search-form').addEventListener('input', generateSearchString);
}

document.addEventListener('DOMContentLoaded', initializeApp);
