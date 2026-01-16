// src/js/modules/autocomplete.js
import { getLanguage } from './state.js';
import { fetchWikipediaOpenSearch } from './api.js';

let debounceTimer;

export function setupCategoryAutocomplete(inputElement) {
    if (!inputElement) return;

    const listId = 'category-autocomplete-list';
    let dataList = document.getElementById(listId);
    if (!dataList) {
        dataList = document.createElement('datalist');
        dataList.id = listId;
        document.body.appendChild(dataList);
        inputElement.setAttribute('list', listId);
    }

    inputElement.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) return;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const lang = getLanguage();
            
            try {
                const data = await fetchWikipediaOpenSearch(`Category:${query}`, lang, 10);
                if (!data) return;

                const categories = data[1].map(cat => cat.replace(/^Category:|Kategorie:/i, ''));
                
                dataList.innerHTML = categories.map(cat => `<option value="${cat}">`).join('');
            } catch (err) {
                console.error('Autocomplete error:', err);
            }
        }, 300);
    });
}
