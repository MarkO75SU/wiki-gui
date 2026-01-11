// src/js/main.js
import { setLanguage, setTranslations, getLanguage, getTranslation } from './modules/state.js';
import { applyTranslations, clearForm, handleSearchFormSubmit, addAccordionFunctionality, populatePresetCategories, populatePresets, applyPreset as applyPresetToForm, setupParameterExplanation } from './modules/ui.js';
import { generateSearchString } from './modules/search.js';
import { saveCurrentSearch, loadSavedSearches, handleSavedSearchActions } from './modules/storage.js';
import { presetCategories } from './modules/presets.js';

async function initializeApp() {
    const initialLang = getLanguage();
    document.documentElement.lang = initialLang;

    addAccordionFunctionality();
    loadSavedSearches();

    // Advanced mode toggle
    const advancedToggle = document.getElementById('advanced-mode-toggle');
    const searchFormContainer = document.querySelector('.search-form-container');
    const advancedModeDescription = document.getElementById('advanced-mode-description');

    function updateAdvancedModeDescription() {
        if (!advancedToggle || !advancedModeDescription) return;

        const labelAdvancedMode = document.getElementById('label-advanced-mode');
        if (labelAdvancedMode) {
             labelAdvancedMode.textContent = getTranslation('label-advanced-mode');
        }

        if (advancedToggle.checked) {
            advancedModeDescription.textContent = getTranslation('advanced-mode-advanced-active');
        } else {
            advancedModeDescription.textContent = getTranslation('advanced-mode-simple-active') + ' ' + getTranslation('advanced-mode-hint');
        }
    }

    if (advancedToggle && searchFormContainer && advancedModeDescription) {
        advancedToggle.addEventListener('change', () => {
            if (advancedToggle.checked) {
                searchFormContainer.classList.add('advanced-view');
            } else {
                searchFormContainer.classList.remove('advanced-view');
            }
            updateAdvancedModeDescription();
        });
        updateAdvancedModeDescription(); // Initial call
    }

    // New Preset Logic Setup
    const presetCategorySelect = document.getElementById('preset-category-select');
    const presetSelect = document.getElementById('preset-select');
    const applyPresetButton = document.getElementById('apply-preset-button');

    if (presetCategorySelect && presetSelect && applyPresetButton) {
        // Initial population and event listeners for presets
        presetCategorySelect.addEventListener('change', () => {
            populatePresets(presetCategorySelect, presetSelect);
            if (presetSelect.options.length > 1) {
                presetSelect.selectedIndex = 1;
                applyPresetButton.disabled = false;
            } else {
                applyPresetButton.disabled = true;
            }
            generateSearchString(); // Update query after category change and default preset selection
        });

        presetSelect.addEventListener('change', () => {
            if (presetSelect.value) {
                applyPresetButton.disabled = false;
            } else {
                applyPresetButton.disabled = true;
            }
            generateSearchString(); // Update query after preset selection
        });

        applyPresetButton.addEventListener('click', () => {
            const selectedCategory = presetCategorySelect.value;
            const selectedPreset = presetSelect.value;
            const presetToApply = presetCategories[selectedCategory]?.presets[selectedPreset];
            if (selectedCategory && selectedPreset && presetToApply) {
                applyPresetToForm(presetToApply);
            }
        });
    }

    // Event listeners for main form elements
    const searchForm = document.getElementById('search-form');
    if (searchForm) { searchForm.addEventListener('submit', handleSearchFormSubmit); }
    
    const clearFormBtn = document.getElementById('clear-form-button');
    if (clearFormBtn) { clearFormBtn.addEventListener('click', () => {
        clearForm();
        generateSearchString();
    }); }

    const saveSearchBtn = document.getElementById('save-search-button');
    if (saveSearchBtn) { saveSearchBtn.addEventListener('click', () => {
        const { apiQuery } = generateSearchString();
        saveCurrentSearch(apiQuery);
    }); }

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
                // Ensure presets are populated AFTER new language is set and translations applied
                if (presetCategorySelect && presetSelect) {
                    populatePresetCategories(presetCategorySelect, presetSelect);
                    if (presetCategorySelect.options.length > 1) {
                        presetCategorySelect.selectedIndex = 1;
                        populatePresets(presetCategorySelect, presetSelect);
                        applyPresetButton.disabled = false;
                    } else {
                        applyPresetButton.disabled = true;
                    }
                }
                updateAdvancedModeDescription(); // Update description on language change
                generateSearchString(); // Update generated string for new language context
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
    const targetLangSelectForCopy = document.getElementById('target-wiki-lang');
    if(targetLangSelectForCopy) {
        targetLangSelectForCopy.addEventListener('change', generateSearchString);
    }

    const generatedSearchStringDisplay = document.getElementById('generated-search-string-display');
    const copyUrlButton = document.getElementById('copy-url-button');
    if (copyUrlButton && generatedSearchStringDisplay) {
        copyUrlButton.addEventListener('click', async () => {
            const textToCopy = generatedSearchStringDisplay.value;
            if (!textToCopy || textToCopy === getTranslation('generated-string-placeholder')) return;

            try {
                await navigator.clipboard.writeText(textToCopy);
                copyUrlButton.classList.add('copied');
                const originalTitle = copyUrlButton.title;
                copyUrlButton.title = getTranslation('copy-success-title');
                setTimeout(() => {
                    copyUrlButton.classList.remove('copied');
                    copyUrlButton.title = originalTitle;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        });
    }

    // Initial language fetch and UI update
    try {
        const response = await fetch(`translations/${initialLang}.json`);
        const data = await response.json();
        setTranslations(initialLang, data);
        applyTranslations(); // Apply initial translations to all elements

        // ONLY after translations are loaded, populate presets and generate initial string
        if (presetCategorySelect && presetSelect) { // Null check for preset elements
            populatePresetCategories(presetCategorySelect, presetSelect);

            // Select the first category by default if available
            if (presetCategorySelect.options.length > 1) {
                presetCategorySelect.selectedIndex = 1; // Select the first actual category
                populatePresets(presetCategorySelect, presetSelect); // Populate presets for the selected category
            }
            // Select the first preset by default if available and enable button
            if (presetSelect.options.length > 1) {
                presetSelect.selectedIndex = 1; // Select the first actual preset
                applyPresetButton.disabled = false;
            }
        }
        generateSearchString(); // Generate string after everything else is set up
        updateAdvancedModeDescription(); // Initial call for description
        // Initialize the parameter explanation UI (button + modal)
        setupParameterExplanation();

    } catch (error) {
        console.error(`Could not fetch initial translations for ${initialLang}:`, error);
    }

}

document.addEventListener('DOMContentLoaded', initializeApp);

// --- Example Search Functionality ---
const exampleButtons = document.querySelectorAll('.example-search-item');
const searchQueryInput = document.getElementById('search-query');

exampleButtons.forEach(button => {
    button.addEventListener('click', () => {
        const searchTerm = button.getAttribute('data-search-term');
        if (searchQueryInput && searchTerm) {
            searchQueryInput.value = searchTerm;
            // Also need to trigger generation of the search string display
            generateSearchString();
        }
    });
});
// --- End Example Search Functionality ---