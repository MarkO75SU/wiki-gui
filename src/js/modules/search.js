// src/js/modules/search.js
import { getTranslation, getLanguage } from './state.js';
import { performWikipediaSearch } from './api.js';

let countDebounceTimer;

export function generateSearchString() {
    const apiQueryParts = []; 
    const browserSearchParts = []; // NEU: Sammelt alle Text-Teile für den EINEN search-Parameter
    const explanationParts = [];
    const wikiSearchParams = new URLSearchParams();

    const getValue = (id) => {
        let element = document.getElementById(id);
        // Fallback for search-query if we are in advanced mode
        if (id === 'search-query' && (!element || !element.value.trim())) {
            const advElement = document.getElementById('search-query-adv');
            if (advElement && advElement.value.trim()) element = advElement;
        }
        if (!element) return '';
        return element.type === 'checkbox' ? element.checked : element.value.trim();
    };

    const mainQuery = getValue('search-query');
    const exactPhrase = getValue('exact-phrase');
    const withoutWords = getValue('without-words');
    const anyWords = getValue('any-words');
    const optionFuzzy = getValue('option-fuzzy');
    const optionWildcard = getValue('option-wildcard');
    const optionIntitle = getValue('option-intitle');

    // --- 1. Text-Komponenten sammeln ---
    
    // Hauptsuchbegriff
    if (mainQuery) {
        let term = mainQuery;
        if (optionFuzzy) term = mainQuery.split(/\s+/).map(w => `${w}~`).join(' ');
        else if (optionWildcard) term = mainQuery.split(/\s+/).map(w => w.endsWith('*') ? w : `${w}*`).join(' ');
        
        if (optionIntitle) {
            apiQueryParts.push(`intitle:${term}`);
            browserSearchParts.push(`intitle:${term}`);
            explanationParts.push(getTranslation('explanation-intitle', '', { mainQuery }));
        } else {
            apiQueryParts.push(term);
            browserSearchParts.push(term);
            explanationParts.push(getTranslation('explanation-main-query', '', { mainQuery }));
        }
    }

    // Exakte Phrase
    if (exactPhrase) {
        const clean = exactPhrase.replace(/^"+|"+$/g, '');
        apiQueryParts.push(`"${clean}"`);
        browserSearchParts.push(`"${clean}"`);
        explanationParts.push(getTranslation('explanation-exact-phrase', '', { exactPhrase: clean }));
    }

    // Ausschlüsse
    if (withoutWords) {
        const words = withoutWords.split(/\s+/).map(w => `-${w.replace(/^-+/, '')}`).join(' ');
        apiQueryParts.push(words);
        browserSearchParts.push(words);
        explanationParts.push(getTranslation('explanation-without-words', '', { withoutWords: withoutWords.replace(/-/g, '') }));
    }

    // ODER-Suche
    if (anyWords) {
        const wordsArray = anyWords.split(/[\s,]+/).filter(w => w);
        if (wordsArray.length > 0) {
            const orQuery = wordsArray.length > 1 ? `(${wordsArray.join(' OR ')})` : wordsArray[0];
            apiQueryParts.push(orQuery);
            browserSearchParts.push(orQuery);
            explanationParts.push(getTranslation('explanation-any-words', '', { anyWords: wordsArray.join(', ') }));
        }
    }

    // --- 2. Den EINEN search-Parameter setzen ---
    if (browserSearchParts.length > 0) {
        wikiSearchParams.set('search', browserSearchParts.join(' '));
    }

    // --- 3. Fortgeschrittene Parameter (bleiben separat) ---
    const rawParams = {
        incategory: getValue('incategory-value'),
        deepcat: getValue('deepcat-value'),
        linkfrom: getValue('linkfrom-value'),
        prefix: getValue('prefix-value'),
        insource: getValue('insource-value'),
        hastemplate: getValue('hastemplate-value'),
        filetype: Array.from(document.querySelectorAll('#filetype-options input:checked')).map(cb => cb.value),
        dateafter: getValue('dateafter-value'),
        datebefore: getValue('datebefore-value')
    };

    // Geo Search
    const geoCoord = getValue('geo-coord');
    if (geoCoord) {
        let radiusKm = parseFloat(getValue('geo-radius')); // Get value from input, convert to float
        if (isNaN(radiusKm) || radiusKm <= 0) {
            radiusKm = 5; // Default to 5 km if input is invalid or empty
        }
        const radiusMeters = radiusKm * 1000; // Convert km to meters
        wikiSearchParams.set('nearcoord', `${radiusMeters},${geoCoord}`);
        apiQueryParts.push(`nearcoord:${radiusMeters},${geoCoord}`);
    }

    Object.entries(rawParams).forEach(([key, value]) => {
        if (value && value.length > 0) {
            if (Array.isArray(value)) {
                wikiSearchParams.set(key, value.join('|'));
                apiQueryParts.push(`${key}:${value.join('|')}`);
            } else {
                wikiSearchParams.set(key, value);
                apiQueryParts.push(`${key}:"${value}"`);
            }
            explanationParts.push(getTranslation(`explanation-${key}`, '', { [key]: value }));
        }
    });

    // --- 4. Abschluss ---
    wikiSearchParams.set('fulltext', 'Search');
    wikiSearchParams.set('ns0', '1'); // Standardmäßig Artikel durchsuchen

    const finalApiQuery = apiQueryParts.join(' ').trim();
    const targetLang = getLanguage();
    const searchUrl = `https://${targetLang}.wikipedia.org/wiki/Special:Search?${wikiSearchParams.toString()}`;

    // Browser URL für Sharing (live)
    const shareParams = new URLSearchParams();
    document.querySelectorAll('#search-form input, #search-form select').forEach(input => {
        if (input.type === 'checkbox' && input.checked) shareParams.set(input.id, 'true');
        else if (input.value && input.type !== 'checkbox') shareParams.set(input.id, input.value);
    });
    window.history.replaceState({}, '', `${window.location.pathname}?${shareParams.toString()}`);

    // UI Update
    const display = document.getElementById('generated-search-string-display');
    if (display) display.value = finalApiQuery ? searchUrl : getTranslation('generated-string-placeholder');

    // Treffer-Vorschau
    const badge = document.getElementById('results-preview-badge');
    if (finalApiQuery) {
        clearTimeout(countDebounceTimer);
        countDebounceTimer = setTimeout(async () => {
            const res = await performWikipediaSearch(finalApiQuery, targetLang, 1);
            const count = res?.query?.searchinfo?.totalhits || 0;
            document.getElementById('results-preview-count').textContent = count.toLocaleString();
            badge.style.display = 'flex';
        }, 1000);
    } else {
        badge.style.display = 'none';
    }

    if (document.getElementById('generated-string-explanation')) {
        const expEl = document.getElementById('generated-string-explanation');
        expEl.innerHTML = explanationParts.length ? `<h4>${getTranslation('explanation-heading')}</h4><ul>${explanationParts.map(e => `<li>${e}</li>`).join('')}</ul>` : '';
    }
    
    return { apiQuery: finalApiQuery, wikiSearchUrlParams: wikiSearchParams.toString(), shareParams: shareParams.toString() };
}