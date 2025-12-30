// src/js/modules/ui.js
import { getTranslation, getLanguage } from './state.js';
import { generateSearchString } from './search.js';
import { performWikipediaSearch, fetchArticleSummary } from './api.js';
import { presetCategories } from './presets.js';

const wikipediaSearchHelpUrls = {
    'de': 'https://de.wikipedia.org/wiki/Hilfe:Suche',
    'en': 'https://en.wikipedia.org/wiki/Help:Searching',
    'fr': 'https://fr.wikipedia.org/wiki/Aide:Recherche',
    'es': 'https://es.wikipedia.org/wiki/Ayuda:Búsqueda',
    'zh': 'https://zh.wikipedia.org/wiki/Help:Search',
    'hi': 'https://hi.wikipedia.org/wiki/Help:Search',
    'ar': 'https://ar.wikipedia.org/wiki/Help:Search',
    'ru': 'https://ru.wikipedia.org/wiki/Help:Search',
    'pt': 'https://pt.wikipedia.org/wiki/Ajuda:Pesquisa'
};

export function populatePresets(categorySelectElement, presetSelectElement) {
    presetSelectElement.innerHTML = `<option value="">${getTranslation('placeholder-select-preset')}</option>`;
    const selectedCategoryKey = categorySelectElement.value;
    if (selectedCategoryKey && presetCategories[selectedCategoryKey]) {
        const categoryPresets = presetCategories[selectedCategoryKey].presets;
        for (const key in categoryPresets) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = getTranslation(categoryPresets[key].display_name_key); // Use display_name_key
            presetSelectElement.appendChild(option);
        }
    }
}

export function populatePresetCategories(categorySelectElement, presetSelectElement) {
    categorySelectElement.innerHTML = `<option value="">${getTranslation('placeholder-preset-category')}</option>`;
    for (const key in presetCategories) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = presetCategories[key][`name_${getLanguage()}`] || presetCategories[key].name_en;
        categorySelectElement.appendChild(option);
    }
}

export function applyPreset(preset) {
    clearForm(); // Clear all form fields first

    const targetLangSelect = document.getElementById('target-wiki-lang');
    if(targetLangSelect) {
        targetLangSelect.value = getLanguage();
    }

    for (const key in preset) {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = preset[key];
            } else {
                const presetValue = preset[key];
                let valueToSet = presetValue;
                if (typeof presetValue === 'string' && presetValue.startsWith('preset-')) {
                    valueToSet = getTranslation(presetValue, presetValue);
                }
                element.value = valueToSet;
            }
        }
    }
    generateSearchString();
}

export function applyTranslations() {
    const lang = getLanguage();
    document.documentElement.lang = lang;

    document.querySelectorAll('[id]').forEach(element => {
        const key = element.id;
        // Skip advanced-mode-description as its content is managed dynamically by updateAdvancedModeDescription
        if (key === 'advanced-mode-description') {
            return;
        }
        const translation = getTranslation(key);
        if (translation) {
            if (element.hasAttribute('placeholder')) {
                element.placeholder = translation;
            } else {
                const textNode = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
                if (textNode) {
                    textNode.textContent = translation;
                } else {
                    element.textContent = translation;
                }
            }
        }
    });

    // Explicitly translate the apply preset button and comment placeholder
    const applyPresetButton = document.getElementById('apply-preset-button');
    if (applyPresetButton) {
        applyPresetButton.textContent = getTranslation('button-apply-preset');
    }

    const saveSearchCommentInput = document.getElementById('save-search-comment');
    if (saveSearchCommentInput) {
        saveSearchCommentInput.placeholder = getTranslation('save-search-comment-placeholder');
    }

    const searchQueryInput = document.getElementById('search-query');
    if (searchQueryInput) {
        searchQueryInput.placeholder = getTranslation('search-query-placeholder');
    }

    const exactPhraseInput = document.getElementById('exact-phrase');
    if (exactPhraseInput) {
        exactPhraseInput.placeholder = getTranslation('exact-phrase-placeholder');
    }

    const withoutWordsInput = document.getElementById('without-words');
    if (withoutWordsInput) {
        withoutWordsInput.placeholder = getTranslation('without-words-placeholder');
    }

    const anyWordsInput = document.getElementById('any-words');
    if (anyWordsInput) {
        anyWordsInput.placeholder = getTranslation('any-words-placeholder');
    }

    const prefixValueInput = document.getElementById('prefix-value');
    if (prefixValueInput) {
        prefixValueInput.placeholder = getTranslation('prefix-placeholder');
    }

    const incategoryValueInput = document.getElementById('incategory-value');
    if (incategoryValueInput) {
        incategoryValueInput.placeholder = getTranslation('incategory-placeholder');
    }

    const deepcatValueInput = document.getElementById('deepcat-value');
    if (deepcatValueInput) {
        deepcatValueInput.placeholder = getTranslation('deepcat-placeholder');
    }

    const linkfromValueInput = document.getElementById('linkfrom-value');
    if (linkfromValueInput) {
        linkfromValueInput.placeholder = getTranslation('linkfrom-placeholder');
    }

    const hastemplateValueInput = document.getElementById('hastemplate-value');
    if (hastemplateValueInput) {
        hastemplateValueInput.placeholder = getTranslation('hastemplate-placeholder');
    }

    const filesizeMinInput = document.getElementById('filesize-min');
    if (filesizeMinInput) {
        filesizeMinInput.placeholder = getTranslation('filesize-min-placeholder');
    }

    const filesizeMaxInput = document.getElementById('filesize-max');
    if (filesizeMaxInput) {
        filesizeMaxInput.placeholder = getTranslation('filesize-max-placeholder');
    }

    const insourceValueInput = document.getElementById('insource-value');
    if (insourceValueInput) {
        insourceValueInput.placeholder = getTranslation('insource-placeholder');
    }
    
    // Translate preset category and preset select labels
    const presetCategorySelect = document.getElementById('preset-category-select');
    const presetSelect = document.getElementById('preset-select');
    if (presetCategorySelect && presetSelect) {
        populatePresetCategories(presetCategorySelect, presetSelect);
    }

    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
        populateCategoryOptions(categorySelect);
    }


    const officialDocLink = document.getElementById('official-doc-link');
    if (officialDocLink) {
        officialDocLink.href = wikipediaSearchHelpUrls[lang] || wikipediaSearchHelpUrls['en'];
    }

    const targetLangSelect = document.getElementById('target-wiki-lang');
    if (targetLangSelect) {
        populateLanguageOptions(targetLangSelect); // Call the new function
        // targetLangSelect.value = lang; // This line is now redundant as it's set in populateLanguageOptions
    }
    
    // Update footer links
    const footerLinkIds = ['link-license-agreement', 'link-terms-of-use', 'link-non-commercial-use', 'link-faq', 'link-report-issue'];
    footerLinkIds.forEach(id => {
        const link = document.getElementById(id);
        if (link) {
            const originalHref = link.getAttribute('href').replace('_de.html', '.html');
            if (lang === 'de') {
                link.href = originalHref.replace('.html', '_de.html');
            } else {
                link.href = originalHref;
            }
            link.textContent = getTranslation(id); // Add this line to translate the link text
        }
    });

    const copyUrlButton = document.getElementById('copy-url-button');
    if (copyUrlButton) {
        copyUrlButton.title = getTranslation('copy-url-button-title');
    }

    // Explicitly translate language switch buttons
    const langDeButton = document.getElementById('lang-de');
    if (langDeButton) {
        langDeButton.textContent = getTranslation('lang-de-option');
    }
    const langEnButton = document.getElementById('lang-en');
    if (langEnButton) {
        langEnButton.textContent = getTranslation('lang-en-option');
    }
}

export function clearForm() {
    const form = document.getElementById('search-form');
    if (form) {
        form.reset();
        document.querySelectorAll('#filetype-options input').forEach(cb => cb.checked = false);
    }
    generateSearchString(); // Call generateSearchString directly
}

export async function handleSearchFormSubmit(event) {
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
}

export function addAccordionFunctionality() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            header.classList.toggle('active');
            if (content.style.display === 'block') {
                content.style.display = 'none';
            } else {
                content.style.display = 'block';
            }
        });
    });
    // Open the first accordion by default
    const firstAccordion = document.getElementById('heading-main-query');
    if(firstAccordion) {
        firstAccordion.classList.add('active');
        firstAccordion.nextElementSibling.style.display = 'block';
    }
}

// New function to populate language options dynamically
export function populateLanguageOptions(selectElement) {
    selectElement.innerHTML = ''; // Clear existing options
    const languages = [
        'de', 'en', 'fr', 'es', 'zh', 'hi', 'ar', 'ru', 'pt'
    ];

    languages.forEach(langCode => {
        const option = document.createElement('option');
        option.value = langCode;
        option.textContent = getTranslation(`lang-${langCode}-option`);
        selectElement.appendChild(option);
    });
    selectElement.value = getLanguage(); // Set selected language
}

// New function to populate category options dynamically
export function populateCategoryOptions(selectElement) {
    selectElement.innerHTML = `<option value="">${getTranslation('placeholder-category-dropdown')}</option>`; // Default placeholder
    const categories = [
        { value: 'Science', key: 'category-Science' },
        { value: 'History', key: 'category-History' },
        { value: 'Art', key: 'category-Art' },
        { value: 'Technology', key: 'category-Technology' },
        { value: 'Geography', key: 'category-Geography' }
    ];

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.value;
        option.textContent = getTranslation(cat.key);
        selectElement.appendChild(option);
    });
}