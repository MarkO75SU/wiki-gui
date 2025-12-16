// src/js/modules/search.js
import { getTranslation, getLanguage } from './state.js';

/**
 * Generates the search string from form inputs.
 * @returns {{apiQuery: string, browserQuery: string}} An object containing the generated search queries.
 */
export function generateSearchString() {
    const apiQueryParts = []; // For the Wikipedia API
    const browserQueryParts = []; // For user display and direct browser search
    const explanationParts = [];

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

    // --- Build API Query Parts (with advanced syntax) ---
    if (mainQuery) {
        let mainQueryTermApi = mainQuery;
        let mainQueryTermBrowser = mainQuery;

        if (optionFuzzy) {
            mainQueryTermApi += '~';
            explanationParts.push(getTranslation('explanation-fuzzy-applied', '', { mainQuery }));
        }

        if (!optionIntitle && (mainQueryTermApi.includes(' ') || /[\(\)]/.test(mainQueryTermApi))) {
            if (!(mainQueryTermApi.startsWith('"') && mainQueryTermApi.endsWith('"'))) {
                mainQueryTermApi = `"${mainQueryTermApi}"`;
            }
        }
        
        if (optionIntitle) {
            apiQueryParts.push(`intitle:${mainQueryTermApi}`);
            explanationParts.push(getTranslation('explanation-intitle', '', { mainQuery }));
        } else {
            apiQueryParts.push(mainQueryTermApi);
            explanationParts.push(getTranslation('explanation-main-query', '', { mainQuery }));
        }
        browserQueryParts.push(mainQueryTermBrowser); // Add to browser query as plain text
    }

    if (exactPhrase) {
        apiQueryParts.push(`"${exactPhrase}"`);
        browserQueryParts.push(`"${exactPhrase}"`);
        explanationParts.push(getTranslation('explanation-exact-phrase', '', { exactPhrase }));
    }

    if (withoutWords) {
        const wordsApi = withoutWords.split(/\s+/).map(word => `-${word}`).join(' ');
        apiQueryParts.push(wordsApi);
        const wordsBrowser = withoutWords.split(/\s+/).map(word => `-${word}`).join(' '); // Keep for browser display
        browserQueryParts.push(wordsBrowser);
        explanationParts.push(getTranslation('explanation-without-words', '', { withoutWords }));
    }

    if (anyWords) {
        const currentLang = getLanguage();
        const orOperator = currentLang === 'de' ? 'ODER' : 'OR'; // Use ODER for German, OR for others
        const wordsArray = anyWords.split(new RegExp(` ${orOperator} `, 'i')).map(word => word.trim()).filter(word => word);
        if (wordsArray.length > 0) {
            let anyWordsQueryApi = wordsArray.join(' OR '); // Wikipedia API always expects 'OR'
            let anyWordsQueryBrowser = wordsArray.join(` ${orOperator} `); // For display, respect user's 'ODER'
            if (wordsArray.length > 1) {
                anyWordsQueryApi = `(${anyWordsQueryApi})`;
                anyWordsQueryBrowser = `(${anyWordsQueryBrowser})`;
            }
            apiQueryParts.push(anyWordsQueryApi);
            browserQueryParts.push(anyWordsQueryBrowser);
            explanationParts.push(getTranslation('explanation-any-words', '', { anyWords }));
        }
    }
    
    // The rest of the parameter logic... (mostly for API, won't go into browserQuery as direct syntax)
    const params = {
        incategory: getValue('incategory-value'),
        deepcat: getValue('deepcat-value'),
        linksto: getValue('linkfrom-value'),
        prefix: getValue('prefix-value'),
        insource: getValue('insource-value'),
        hastemplate: getValue('hastemplate-value')
    };

    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            // Special handling for date fields
            if (key === 'dateafter') {
                apiQueryParts.push(`after:${value}`);
                explanationParts.push(getTranslation('explanation-dateafter', '', { dateafter: value }));
            } else if (key === 'datebefore') {
                apiQueryParts.push(`before:${value}`);
                explanationParts.push(getTranslation('explanation-datebefore', '', { datebefore: value }));
            } else {
                apiQueryParts.push(`${key}:"${value}"`);
                const explanationKey = `explanation-${key}`;
                explanationParts.push(getTranslation(explanationKey, '', { [key]: value }));
            }
        }
    });

    const selectedFileTypes = Array.from(document.querySelectorAll('#filetype-options input:checked')).map(cb => cb.value);
    if (selectedFileTypes.length > 0) {
        const fileTypeQuery = selectedFileTypes.join('|');
        apiQueryParts.push(`filetype:${fileTypeQuery}`);
        explanationParts.push(getTranslation('explanation-filetype', '', { fileType: fileTypeQuery }));
    }

    const fileSizeMin = getValue('filesize-min');
    if (fileSizeMin) {
        apiQueryParts.push(`filesize:>=${fileSizeMin}`);
        explanationParts.push(getTranslation('explanation-filesize-min', '', { fileSizeMin }));
    }

    const fileSizeMax = getValue('filesize-max');
    if (fileSizeMax) {
        apiQueryParts.push(`filesize:<=${fileSizeMax}`);
        explanationParts.push(getTranslation('explanation-filesize-max', '', { fileSizeMax }));
    }

    const dateafter = getValue('dateafter-value');
    if (dateafter) {
        apiQueryParts.push(`after:${dateafter}`);
        explanationParts.push(getTranslation('explanation-dateafter', '', { dateafter: dateafter }));
    }

    const datebefore = getValue('datebefore-value');
    if (datebefore) {
        apiQueryParts.push(`before:${datebefore}`);
        explanationParts.push(getTranslation('explanation-datebefore', '', { datebefore: datebefore }));
    }

    const finalApiQuery = apiQueryParts.join(' ').trim();
    const finalBrowserQuery = browserQueryParts.join(' ').trim();

    // Update the UI with the generated string and explanation
    const displayElement = document.getElementById('generated-search-string-display');
    if (displayElement) {
        displayElement.value = finalBrowserQuery || getTranslation('generated-string-placeholder');
    }

    const openInWikipediaLink = document.getElementById('open-in-wikipedia-link');
    if(openInWikipediaLink) {
        if(finalApiQuery) {
            const targetLang = getLanguage();
            // Use Special:Search for advanced queries in browser
            const searchUrl = `https://${targetLang}.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(finalApiQuery)}`;
            openInWikipediaLink.href = searchUrl;
            openInWikipediaLink.textContent = getTranslation('open-in-wikipedia-link');
            openInWikipediaLink.style.display = 'inline-block';
        } else {
            openInWikipediaLink.style.display = 'none';
        }
    }

    const explanationElement = document.getElementById('generated-string-explanation');
    if (explanationElement) {
        if (explanationParts.length > 0) {
            explanationElement.innerHTML = `<h4>${getTranslation('explanation-heading')}</h4><ul>${explanationParts.map(exp => `<li>${exp}</li>`).join('')}</ul>`;
        } else {
            explanationElement.innerHTML = '';
        }
    }
    
    return { apiQuery: finalApiQuery, browserQuery: finalBrowserQuery };
}