// src/js/main.js
import { setLanguage, setTranslations, getLanguage } from './modules/state.js';
import { applyTranslations, clearForm, handleSearchFormSubmit, addAccordionFunctionality, populatePresetCategories, applyPreset as applyPresetToForm } from './modules/ui.js';
import { generateSearchString } from './modules/search.js';
import { saveCurrentSearch, loadSavedSearches, handleSavedSearchActions } from './modules/storage.js';
import { presetCategories } from './modules/presets.js';

async function initializeApp() {
    const initialLang = getLanguage();
    document.documentElement.lang = initialLang;

    try {
        const response = await fetch(`translations/${initialLang}.json`);
        const data = await response.json();
        setTranslations(initialLang, data);
        applyTranslations();
    } catch (error) {
        console.error(`Could not fetch initial translations for ${initialLang}:`, error);
    }

    addAccordionFunctionality();
    generateSearchString();
    loadSavedSearches();

    // Advanced mode toggle
    const advancedToggle = document.getElementById('advanced-mode-toggle');
    const searchFormContainer = document.querySelector('.search-form-container');
    if (advancedToggle && searchFormContainer) { // Null check
        advancedToggle.addEventListener('change', () => {
            if (advancedToggle.checked) {
                searchFormContainer.classList.add('advanced-view');
            } else {
                searchFormContainer.classList.remove('advanced-view');
            }
        });
    }


    // New Preset Logic Setup
    const presetCategorySelect = document.getElementById('preset-category-select');
    const presetSelect = document.getElementById('preset-select');
    const applyPresetButton = document.getElementById('apply-preset-button');

    if (presetCategorySelect && presetSelect && applyPresetButton) { // Null check for preset elements
        populatePresetCategories(presetCategorySelect, presetSelect);

        presetCategorySelect.addEventListener('change', () => {
            populatePresets(presetCategorySelect, presetSelect);
        });

        applyPresetButton.addEventListener('click', () => {
            const selectedCategory = presetCategorySelect.value;
            const selectedPreset = presetSelect.value;
            console.log("DEBUG: Selected Preset Category:", selectedCategory); // DEBUG
            console.log("DEBUG: Selected Preset Name:", selectedPreset);     // DEBUG
            const presetToApply = presetCategories[selectedCategory]?.presets[selectedPreset];
            if (selectedCategory && selectedPreset && presetToApply) {
                console.log("DEBUG: Preset object to apply:", presetToApply); // DEBUG
                applyPresetToForm(presetToApply);
            } else {
                console.warn("DEBUG: Invalid preset selection or preset not found."); // DEBUG
            }
        });
    }
    // End New Preset Logic

    const searchForm = document.getElementById('search-form');
    if (searchForm) { searchForm.addEventListener('submit', handleSearchFormSubmit); }
    const clearFormBtn = document.getElementById('clear-form-button');
    if (clearFormBtn) { clearFormBtn.addEventListener('click', clearForm); }
    const saveSearchBtn = document.getElementById('save-search-button');
    if (saveSearchBtn) { saveSearchBtn.addEventListener('click', saveCurrentSearch); }
    const savedSearchesList = document.getElementById('saved-searches-list');
    if (savedSearchesList) { savedSearchesList.addEventListener('click', handleSavedSearchActions); }


    document.querySelectorAll('.lang-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const lang = event.target.dataset.lang;
            setLanguage(lang);
            try {
                const response = await fetch(`translations/${lang}.json`);
                const data = await response.json();
                setTranslations(lang, data);
                applyTranslations();
                if (presetCategorySelect && presetSelect) { // Re-populate presets on lang change
                    populatePresetCategories(presetCategorySelect, presetSelect);
                }
            } catch (error) {
                console.error(`Could not fetch translations for ${lang}:`, error);
            }
        });
    });

    if (searchForm) { searchForm.addEventListener('input', generateSearchString); }

    const dateafterInput = document.getElementById('dateafter-value');
    if (dateafterInput) { dateafterInput.addEventListener('change', generateSearchString); }
    const datebeforeInput = document.getElementById('datebefore-value');
    if (datebeforeInput) { datebeforeInput.addEventListener('change', generateSearchString); }
}

document.addEventListener('DOMContentLoaded', initializeApp);
