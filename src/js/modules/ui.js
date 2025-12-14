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

export function populatePresetCategories(categorySelectElement) {
    categorySelectElement.innerHTML = `<option value="">${getTranslation('placeholder-preset-category')}</option>`;
    for (const key in presetCategories) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = presetCategories[key][`name_${getLanguage()}`] || presetCategories[key].name_en;
        categorySelectElement.appendChild(option);
    }
}

export function populatePresets(categorySelectElement, presetSelectElement) {
    presetSelectElement.innerHTML = `<option value="">${getTranslation('placeholder-select-preset')}</option>`;
    const selectedCategoryKey = categorySelectElement.value;
    if (selectedCategoryKey && presetCategories[selectedCategoryKey]) {
        const categoryPresets = presetCategories[selectedCategoryKey].presets;
        for (const key in categoryPresets) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = getTranslation(key); // Translate preset name
            presetSelectElement.appendChild(option);
        }
    }
}

export function applyPreset(preset) {
    console.log("DEBUG: applyPreset received preset:", preset); // DEBUG
    clearForm(); // Clear all form fields first

    for (const key in preset) {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = preset[key];
            } else {
                // If the preset[key] is a translation key (e.g., 'preset-easy-search-query'), get its translated value.
                // Otherwise, it's a direct value (like true/false for checkboxes or a number for filesize), use it as is.
                element.value = typeof preset[key] === 'string' && preset[key].startsWith('preset-') 
                                ? getTranslation(preset[key], preset[key]) 
                                : preset[key];
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
        const translation = getTranslation(key);
        if (translation) {
            if (element.hasAttribute('placeholder')) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });

    // Translate preset category and preset select labels
    const presetCategorySelect = document.getElementById('preset-category-select');
    const presetSelect = document.getElementById('preset-select');
    if (presetCategorySelect && presetSelect) {
        populatePresetCategories(presetCategorySelect);
        populatePresets(presetCategorySelect, presetSelect); // Re-populate based on current selection
    }

    const officialDocLink = document.getElementById('official-doc-link');
    if (officialDocLink) {
        officialDocLink.href = wikipediaSearchHelpUrls[lang] || wikipediaSearchHelpUrls['en'];
    }

    const targetLangSelect = document.getElementById('target-wiki-lang');
    if (targetLangSelect) {
        targetLangSelect.value = lang;
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
        }
    });
}

export function clearForm() {
    const form = document.getElementById('search-form');
    if (form) {
        form.reset();
        document.querySelectorAll('#filetype-options input').forEach(cb => cb.checked = false);
    }
    generateSearchString();
}

export async function handleSearchFormSubmit(event) {
    event.preventDefault();
    const query = generateSearchString();
    const lang = document.getElementById('target-wiki-lang').value;
    const resultsContainer = document.getElementById('simulated-search-results');
    const searchResultsHeading = document.getElementById('search-results-heading');
    
    if (!query) return;

    resultsContainer.innerHTML = `<li><div class="loading-indicator">${getTranslation('loading-indicator')}</div></li>`;
    
    const apiResponse = await performWikipediaSearch(query, lang);
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