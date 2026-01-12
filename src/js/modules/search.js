// src/js/modules/search.js
import { getTranslation, getLanguage } from './state.js';

/**
 * Generates the search string from form inputs.
 * @returns {{apiQuery: string, browserQuery: string, wikiSearchUrlParams: string}} An object containing the generated search queries.
 */
export function generateSearchString() {
    const apiQueryParts = []; // For the programmatic API (action=query&list=search)
    const browserQueryParts = []; // For user display and copying to clipboard
    const explanationParts = [];

    // Structured parameters for Wikipedia's Special:Search URL
    const wikiSearchParams = new URLSearchParams();

    const getValue = (id) => {
        const element = document.getElementById(id);
        if (!element) return '';
        return element.type === 'checkbox' ? element.checked : element.value.trim();
    };

    const mainQuery = getValue('search-query');
    const exactPhrase = getValue('exact-phrase');
    const withoutWords = getValue('without-words');
    const anyWords = getValue('any-words');
    const optionFuzzy = getValue('option-fuzzy');
    const optionIntitle = getValue('option-intitle');

    // --- Main Query & Basic Operators ---
    let mainSearchTermForApi = mainQuery; // Base for API's main search term
    let mainSearchTermForBrowser = mainQuery; // Base for browser display

    if (mainQuery) {
        if (optionFuzzy) {
            // Apply fuzzy to each word, don't quote as a single phrase
            mainSearchTermForApi = mainQuery.split(/\s+/).map(word => `${word}~`).join(' ');
            explanationParts.push(getTranslation('explanation-fuzzy-applied', '', { mainQuery }));
        } else if (!optionIntitle && (mainSearchTermForApi.includes(' ') || /[\(\)]/.test(mainSearchTermForApi))) {
            // Quote main query if it contains spaces and not already quoted
            if (!(mainSearchTermForApi.startsWith('"') && mainSearchTermForApi.endsWith('"'))) {
                mainSearchTermForApi = `"${mainSearchTermForApi}"`;
            }
        }
        
        if (optionIntitle) {
            // intitle is a separate parameter for Special:Search, but a prefix for API query
            wikiSearchParams.set('intitle', mainSearchTermForBrowser); // Use non-fuzzy, non-quoted for direct intitle param
            apiQueryParts.push(`intitle:${mainSearchTermForApi}`); // For programmatic API call
            explanationParts.push(getTranslation('explanation-intitle', '', { mainQuery }));
        } else {
            // If not intitle, main query goes directly into Special:Search's 'search' param
            wikiSearchParams.set('search', mainSearchTermForBrowser); // For Special:Search
            apiQueryParts.push(mainSearchTermForApi); // For programmatic API call
            explanationParts.push(getTranslation('explanation-main-query', '', { mainQuery }));
        }
        browserQueryParts.push(mainSearchTermForBrowser); // For display, simple version
    }

    if (exactPhrase) {
        let cleanPhrase = exactPhrase.replace(/^"+|"+$/g, ''); // Remove existing quotes
        wikiSearchParams.append('search', `"${cleanPhrase}"`); 
        apiQueryParts.push(`"${cleanPhrase}"`);
        browserQueryParts.push(`"${cleanPhrase}"`);
        explanationParts.push(getTranslation('explanation-exact-phrase', '', { exactPhrase: cleanPhrase }));
    }

    if (withoutWords) {
        // Split by spaces, handle words that might already have a minus
        const words = withoutWords.split(/\s+/).map(word => {
            let cleanWord = word.replace(/^-+/, ''); // Remove existing minuses
            return cleanWord ? `-${cleanWord}` : '';
        }).filter(w => w).join(' ');
        
        if (words) {
            wikiSearchParams.append('search', words);
            apiQueryParts.push(words);
            browserQueryParts.push(words);
            explanationParts.push(getTranslation('explanation-without-words', '', { withoutWords: words.replace(/-/g, '') }));
        }
    }

    if (anyWords) {
        // Split by space OR comma, join with OR
        const wordsArray = anyWords.split(/[\s,]+/).map(word => word.trim()).filter(word => word);
        if (wordsArray.length > 0) {
            let anyWordsQueryApi = wordsArray.join(' OR ');
            let anyWordsQueryBrowser = anyWordsQueryApi;
            if (wordsArray.length > 1) {
                anyWordsQueryApi = `(${anyWordsQueryApi})`;
                anyWordsQueryBrowser = `(${anyWordsQueryApi})`;
            }
            wikiSearchParams.append('search', anyWordsQueryApi);
            apiQueryParts.push(anyWordsQueryApi);
            browserQueryParts.push(anyWordsQueryBrowser);
            explanationParts.push(getTranslation('explanation-any-words', '', { anyWords: wordsArray.join(', ') }));
        }
    }
    
    // --- Advanced Parameters (for both API and Special:Search) ---
    const rawParams = {
        incategory: getValue('incategory-value'),
        deepcat: getValue('deepcat-value'),
        linkfrom: getValue('linkfrom-value'),
        prefix: getValue('prefix-value'),
        insource: getValue('insource-value'),
        hastemplate: getValue('hastemplate-value'),
        filetype: Array.from(document.querySelectorAll('#filetype-options input:checked')).map(cb => cb.value), // Get filetypes directly
        dateafter: getValue('dateafter-value'),
        datebefore: getValue('datebefore-value')
    };

    Object.entries(rawParams).forEach(([key, value]) => {
        if (value) {
            if (Array.isArray(value)) { // Handle filetype array
                 if (value.length > 0) {
                    wikiSearchParams.set(key, value.join('|')); // Special:Search uses |
                    apiQueryParts.push(`filetype:${value.join('|')}`);
                    explanationParts.push(getTranslation('explanation-filetype', '', { fileType: value.join('|') }));
                 }
            } else if (key === 'incategory' || key === 'deepcat') {
                value.split(';').forEach(cat => {
                    const trimmedCat = cat.trim();
                    if (trimmedCat) {
                        wikiSearchParams.append(key, trimmedCat); // Append each category
                        apiQueryParts.push(`${key}:"${trimmedCat}"`);
                        explanationParts.push(getTranslation(`explanation-${key}`, '', { [key]: trimmedCat }));
                    }
                });
            } else if (key === 'dateafter' || key === 'datebefore') {
                 wikiSearchParams.set(key, value); // Special:Search might support these directly as params
                 apiQueryParts.push(`${key}:${value}`);
                 explanationParts.push(getTranslation(`explanation-${key}`, '', { [key]: value }));
            }
            else {
                wikiSearchParams.set(key, value); // Direct mapping for other params
                apiQueryParts.push(`${key}:"${value}"`);
                const explanationKey = `explanation-${key}`;
                explanationParts.push(getTranslation(explanationKey, '', { [key]: value }));
            }
        }
    });

    // File Size
    const fileSizeMin = getValue('filesize-min');
    if (fileSizeMin) {
        apiQueryParts.push(`filesize:>=${fileSizeMin}`);
        // Special:Search typically takes filesize into its main 'search' parameter, not separate.
        // For consistency, keep it in apiQuery and append to wikiSearchParams's main 'search' if needed.
        wikiSearchParams.append('search', `filesize:>=${fileSizeMin}`);
        explanationParts.push(getTranslation('explanation-filesize-min', '', { fileSizeMin }));
    }
    const fileSizeMax = getValue('filesize-max');
    if (fileSizeMax) {
        apiQueryParts.push(`filesize:<=${fileSizeMax}`);
        // Special:Search typically takes filesize into its main 'search' parameter, not separate.
        wikiSearchParams.append('search', `filesize:<=${fileSizeMax}`);
        explanationParts.push(getTranslation('explanation-filesize-max', '', { fileSizeMax }));
    }

    // Namespaces
    const selectedNamespaces = Array.from(document.querySelectorAll('#namespaces-options input:checked')).map(cb => cb.value);
    if (selectedNamespaces.length > 0) {
        selectedNamespaces.forEach(ns => {
            wikiSearchParams.append(`ns${ns}`, '1'); // Special:Search uses nsX=1
        });
        // No direct API query equivalent for namespaces here, handled by API search.
    }

    // Final construction of API query string
    const finalApiQuery = apiQueryParts.join(' ').trim();

    // Final construction of Browser query string (for display/copy)
    // This should be a clean version without advanced operators
    const finalBrowserQuery = browserQueryParts.join(' ').trim();

    const targetLang = getLanguage();
    const searchUrl = finalApiQuery ? `https://${targetLang}.wikipedia.org/wiki/Special:Search?${wikiSearchParams.toString()}` : '';

    // Update the UI with the generated string and explanation
    const displayElement = document.getElementById('generated-search-string-display');
    if (displayElement) {
        displayElement.value = searchUrl || getTranslation('generated-string-placeholder');
    }

    const explanationElement = document.getElementById('generated-string-explanation');
    if (explanationElement) {
        if (explanationParts.length > 0) {
            explanationElement.innerHTML = `<h4>${getTranslation('explanation-heading')}</h4><ul>${explanationParts.map(exp => `<li>${exp}</li>`).join('')}</ul>`;
        } else {
            explanationElement.innerHTML = '';
        }
    }
    
    return { apiQuery: finalApiQuery, browserQuery: finalBrowserQuery, wikiSearchUrlParams: wikiSearchParams.toString() };
}