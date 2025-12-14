// src/js/modules/ui.js
import { getTranslation, getLanguage } from './state.js';
import { generateSearchString } from './search.js';
import { performWikipediaSearch, fetchArticleSummary } from './api.js';

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

    document.querySelectorAll('.preset-button').forEach(button => {
        const presetKey = `preset-${button.dataset.presetType}`;
        const translation = getTranslation(presetKey);
        if (translation) {
            button.textContent = translation;
        }
    });

    const officialDocLink = document.getElementById('official-doc-link');
    if (officialDocLink) {
        officialDocLink.href = wikipediaSearchHelpUrls[lang] || wikipediaSearchHelpUrls['en'];
    }

    const targetLangSelect = document.getElementById('target-wiki-lang');
    if (targetLangSelect) {
        targetLangSelect.value = lang;
    }
    
    // Update footer links
    const footerLinkIds = ['link-license-agreement', 'link-terms-of-use', 'link-non-commercial-use', 'link-faq'];
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
