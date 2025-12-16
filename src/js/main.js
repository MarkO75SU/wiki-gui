// src/js/main.js
import { setLanguage, setTranslations, getLanguage, getTranslation } from './modules/state.js';
import { applyTranslations, clearForm, handleSearchFormSubmit, addAccordionFunctionality, populatePresetCategories, populatePresets, applyPreset as applyPresetToForm } from './modules/ui.js';
import { generateSearchString } from './modules/search.js';
import { saveCurrentSearch, loadSavedSearches, handleSavedSearchActions } from './modules/storage.js';
import { presetCategories } from './modules/presets.js';

async function initializeApp() {
    const initialLang = getLanguage();
    document.documentElement.lang = initialLang;

    addAccordionFunctionality();
    generateSearchString();
    loadSavedSearches();

    // Advanced mode toggle
    const advancedToggle = document.getElementById('advanced-mode-toggle');
    const searchFormContainer = document.querySelector('.search-form-container');
    const advancedModeDescription = document.getElementById('advanced-mode-description'); // Get the new description span

    function updateAdvancedModeDescription() {
        if (!advancedToggle || !advancedModeDescription) return;

        // Update the label-advanced-mode as well, as its text content might need to change
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


    if (advancedToggle && searchFormContainer) { // Null check
        advancedToggle.addEventListener('change', () => {
            if (advancedToggle.checked) {
                searchFormContainer.classList.add('advanced-view');
            } else {
                searchFormContainer.classList.remove('advanced-view');
            }
            updateAdvancedModeDescription(); // Call after state changes
        });
        updateAdvancedModeDescription(); // Call once on initialization
    }


    // New Preset Logic Setup
    const presetCategorySelect = document.getElementById('preset-category-select');
    const presetSelect = document.getElementById('preset-select');
    const applyPresetButton = document.getElementById('apply-preset-button');

    if (presetCategorySelect && presetSelect && applyPresetButton) { // Null check for preset elements
        applyPresetButton.disabled = true; // Disable apply button initially

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

        presetCategorySelect.addEventListener('change', () => {
            populatePresets(presetCategorySelect, presetSelect);
            // After populating, select the first preset if available
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
            } else {
                // console.warn("Invalid preset selection or preset not found."); // Removed
            }
        });
    }
    // End New Preset Logic

    const searchForm = document.getElementById('search-form');
    if (searchForm) { searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const { apiQuery } = generateSearchString(); // Destructure apiQuery
        const lang = document.getElementById('target-wiki-lang').value;
        const resultsContainer = document.getElementById('simulated-search-results');
        const searchResultsHeading = document.getElementById('search-results-heading');
        
        if (!apiQuery) return; // Use apiQuery for validation

        resultsContainer.innerHTML = `<li><div class="loading-indicator">${getTranslation('loading-indicator')}</div></li>`;
        
        const apiResponse = await performWikipediaSearch(apiQuery, lang); // Pass apiQuery
        const results = apiResponse?.query?.search || [];
        const totalHits = apiResponse?.query?.searchinfo?.totalhits || 0;

        // Update the results heading with the total number of hits
        if (searchResultsHeading) {
            searchResultsHeading.textContent = getTranslation('search-results-heading', '', { totalResults: totalHits });
        }

        resultsContainer.innerHTML = '';

        if (results.length === 0) {
            resultsContainer.innerHTML = `<li>${getTranslation('no-results-found')}</li>`;
            return;
        }

        for (const result of results) {
            const summary = await fetchArticleSummary(result.title, lang);
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="https://${lang}.wikipedia.org/wiki/${encodeURIComponent(result.title)}" target="_blank">
                    <strong>${result.title}</strong>
                </a>
                <p>${summary}</p>
            `;
            resultsContainer.appendChild(listItem);
        }
    }); }
    const clearFormBtn = document.getElementById('clear-form-button');
    if (clearFormBtn) { clearFormBtn.addEventListener('click', () => {
        clearForm();
        generateSearchString(); // Call generateSearchString directly to update UI
    }); }
    const saveSearchBtn = document.getElementById('save-search-button');
    if (saveSearchBtn) { saveSearchBtn.addEventListener('click', () => {
        const { apiQuery } = generateSearchString(); // Get apiQuery for saving
        saveCurrentSearch(apiQuery); // Pass apiQuery
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
                if (presetCategorySelect && presetSelect) { // Re-populate presets on lang change
                    populatePresetCategories(presetCategorySelect, presetSelect);
                }
                updateAdvancedModeDescription(); // Update description on language change
            } catch (error) {
                console.error(`Could not fetch translations for ${lang}:`, error);
            }
        });
    });

    if (searchForm) { searchForm.addEventListener('input', generateSearchString); } // Call generateSearchString directly

    const dateafterInput = document.getElementById('dateafter-value');
    if (dateafterInput) { dateafterInput.addEventListener('change', generateSearchString); } // Call generateSearchString directly
    const datebeforeInput = document.getElementById('datebefore-value');
    if (datebeforeInput) { datebeforeInput.addEventListener('change', generateSearchString); } // Call generateSearchString directly

    const targetLangSelectForCopy = document.getElementById('target-wiki-lang');
    if(targetLangSelectForCopy) {
        targetLangSelectForCopy.addEventListener('change', generateSearchString); // Call generateSearchString directly
    }

    const copyIcon = document.querySelector('.copy-icon');
    const generatedSearchStringDisplay = document.getElementById('generated-search-string-display');

    if (copyIcon && generatedSearchStringDisplay) {
        copyIcon.addEventListener('click', async () => {
            const textToCopy = generatedSearchStringDisplay.value; // Use .value for input
            try {
                await navigator.clipboard.writeText(textToCopy);
                const originalIcon = copyIcon.textContent;
                copyIcon.textContent = '✅'; // Change to checkmark
                setTimeout(() => {
                    copyIcon.textContent = originalIcon; // Revert after a short delay
                }, 1500);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                // Optionally provide user feedback for failure
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);

