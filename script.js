// FORCE CACHE CLEAR - SCRIPT VERSION FORCED REFRESH - LAST UPDATED 2023-10-27-14:35
// script.js

// Object to hold translations
const translations = {};
let currentLang = 'de'; // Default language

// Mapping of language codes to Wikipedia search help URLs
const wikipediaSearchHelpUrls = {
    'de': 'https://de.wikipedia.org/wiki/Hilfe:Suche',
    'en': 'https://en.wikipedia.org/wiki/Help:Searching',
    'fr': 'https://fr.wikipedia.org/wiki/Aide:Recherche',
    // Add more languages if supported
    'es': 'https://es.wikipedia.org/wiki/Ayuda:Búsqueda',
    'zh': 'https://zh.wikipedia.org/wiki/Help:Search',
    'hi': 'https://hi.wikipedia.org/wiki/Help:Search',
    'ar': 'https://ar.wikipedia.org/wiki/Help:Search',
    'ru': 'https://ru.wikipedia.org/wiki/Help:Search',
    'pt': 'https://pt.wikipedia.org/wiki/Ajuda:Pesquisa'
};

/**
 * Generates a Wikipedia search string based on user input from various form fields.
 *
 * @returns {string} The constructed search string.
 */
function generateSearchString() {
    const queryParts = [];

    // Main search query
    const searchQuery = document.getElementById('search-query')?.value.trim();
    if (searchQuery) {
        queryParts.push(searchQuery);
    }

    // Exact phrase
    const exactPhrase = document.getElementById('exact-phrase')?.value.trim();
    if (exactPhrase) {
        queryParts.push(`"${exactPhrase}"`);
    }

    // Without words
    const withoutWords = document.getElementById('without-words')?.value.trim();
    if (withoutWords) {
        withoutWords.split(/\s+/).forEach(word => {
            if (word) queryParts.push(`-${word}`);
        });
    }

    // Any words (OR logic)
    const anyWords = document.getElementById('any-words')?.value.trim();
    if (anyWords) {
        const words = anyWords.split(/\s+/).filter(word => word);
        if (words.length > 0) {
            queryParts.push(`(${words.join(' OR ')})`);
        }
    }

    // In category
    const incategory = document.getElementById('incategory-value')?.value.trim();
    if (incategory) {
        queryParts.push(`incategory:"${incategory}"`);
    }

    // Deep category
    const deepcat = document.getElementById('deepcat-value')?.value.trim();
    if (deepcat) {
        queryParts.push(`deepcat:"${deepcat}"`);
    }

    // Prefix
    const prefix = document.getElementById('prefix-value')?.value.trim();
    if (prefix) {
        queryParts.push(`prefix:"${prefix}"`);
    }

    // Subpage of
    const subpageof = document.getElementById('subpageof-value')?.value.trim();
    if (subpageof) {
        queryParts.push(`subpageof:"${subpageof}"`);
    }

    // Link from
    const linkfrom = document.getElementById('linkfrom-value')?.value.trim();
    if (linkfrom) {
        queryParts.push(`linkfrom:"${linkfrom}"`);
    }

    // In source
    const insource = document.getElementById('insource-value')?.value.trim();
    if (insource) {
        queryParts.push(`insource:"${insource}"`);
    }

    // Has template
    const hastemplate = document.getElementById('hastemplate-value')?.value.trim();
    if (hastemplate) {
        queryParts.push(`hastemplate:"${hastemplate}"`);
    }

    // File type
    const filetype = document.getElementById('filetype-value')?.value.trim();
    if (filetype) {
        queryParts.push(`filetype:${filetype}`);
    }

    // File size min and max
    const filesizeMin = document.getElementById('filesize-min')?.value.trim();
    const filesizeMax = document.getElementById('filesize-max')?.value.trim();
    if (filesizeMin && filesizeMax) {
        queryParts.push(`filesize:${filesizeMin}-${filesizeMax}`);
    } else if (filesizeMin) {
        queryParts.push(`filesize:>${filesizeMin}`);
    } else if (filesizeMax) {
        queryParts.push(`filesize:<${filesizeMax}`);
    }

    // Category select (dropdown)
    const categorySelect = document.getElementById('category-select');
    if (categorySelect && categorySelect.value && categorySelect.value !== "") {
        queryParts.push(`incategory:"${categorySelect.value}"`);
    }

    return queryParts.join(' ').trim();
}

// Helper function to fetch translations
async function fetchTranslations(lang) {
    try {
        const response = await fetch(`${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        translations[lang] = await response.json();
    } catch (error) {
        console.error(`Could not fetch translations for ${lang}:`, error);
    }
}

// Function to apply translations and update dynamic content
function applyTranslations() {
    const elements = document.querySelectorAll('[id]');
    elements.forEach(element => {
        const key = element.id;
        // Check for placeholder translation specifically for input elements
        if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
            const placeholderKey = `${key}-placeholder`; // e.g., 'search-query-placeholder'
            if (translations[currentLang] && translations[currentLang][placeholderKey]) {
                element.placeholder = translations[currentLang][placeholderKey];
            }
        } else if (translations[currentLang] && translations[currentLang][key]) {
            // Default: translate textContent for other elements
            element.textContent = translations[currentLang][key];
        }
    });

    // Handle translation for select options and placeholders
    if (currentLang && translations[currentLang]) {
        // Translate options for the category dropdown
        const categorySelectElement = document.getElementById('category-select');
        if (categorySelectElement) {
            categorySelectElement.querySelectorAll('option').forEach(option => {
                const optionValue = option.value;
                if (optionValue === "") {
                    // Translate placeholder option "Select a category"
                    const placeholderKey = 'placeholder-category-dropdown';
                    if (translations[currentLang][placeholderKey]) {
                        option.textContent = translations[currentLang][placeholderKey];
                    }
                } else {
                    const translationKey = `category-${optionValue}`; // e.g., "category-Science"
                    if (translations[currentLang][translationKey]) {
                        option.textContent = translations[currentLang][translationKey];
                    }
                }
            });
        }

        // Translate options for the target wiki language dropdown
        const targetWikiLangSelect = document.getElementById('target-wiki-lang');
        if (targetWikiLangSelect) {
             targetWikiLangSelect.querySelectorAll('option').forEach(option => {
                const langCode = option.value;
                const translationKey = `lang-${langCode}-option`; // e.g., "lang-de-option"
                if (langCode && translations[currentLang][translationKey]) {
                    option.textContent = translations[currentLang][translationKey];
                }
            });
            
            // Sync the selected option of target-wiki-lang to match the app's currentLang
            // This makes the default target wiki language change with the app's UI language.
            const currentAppLangCode = currentLang; // e.g., 'de', 'en', 'fr'
            const optionValues = Array.from(targetWikiLangSelect.options).map(option => option.value);

            if (optionValues.includes(currentAppLangCode)) {
                targetWikiLangSelect.value = currentAppLangCode;
            } else {
                // If currentAppLangCode is not a direct option, reset to default 'de'
                // or choose a sensible fallback. Assuming 'de' is the most robust default.
                targetWikiLangSelect.value = 'de';
            }
        }
    }
    
    // Update dynamic links, like the Wikipedia search help link
    const officialDocLink = document.getElementById('official-doc-link');
    if (officialDocLink) {
        officialDocLink.href = wikipediaSearchHelpUrls[currentLang] || wikipediaSearchHelpUrls['en']; // Fallback to English if language not found
    }
}

// Language switcher functionality
document.querySelectorAll('.lang-button').forEach(button => {
    button.addEventListener('click', async (event) => {
        currentLang = event.target.dataset.lang;
        await fetchTranslations(currentLang);
        applyTranslations();
    });
});

// Info popup functionality
document.querySelectorAll('.info-icon').forEach(icon => {
    icon.addEventListener('mouseover', (event) => {
        const infoId = event.target.dataset.infoId;
        const popup = document.getElementById(`${infoId}-popup`);
        if (popup) {
            popup.style.display = 'block';
        }
    });

    icon.addEventListener('mouseout', (event) => {
        const infoId = event.target.dataset.infoId;
        const popup = document.getElementById(`${infoId}-popup`);
        if (popup) {
            popup.style.display = 'none';
        }
    });
});

// Function to add Enter key listener to trigger form submission
function addEnterKeySubmitListener() {
    const searchForm = document.getElementById('search-form');
    // Exit if the search form is not found to prevent errors
    if (!searchForm) {
        console.error("Search form element not found. Cannot attach Enter key listener.");
        return;
    }

    const inputFieldsToWatch = [
        'search-query',
        'exact-phrase',
        'without-words',
        'any-words',
        'incategory-value',
        'deepcat-value',
        'prefix-value',
        'subpageof-value',
        'linkfrom-value',
        'insource-value',
        'hastemplate-value',
        'filetype-value',
        'filesize-min',
        'filesize-max',
        'category-select' // The new dropdown
    ];

    inputFieldsToWatch.forEach(id => {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            inputElement.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    // Prevent default browser behavior for Enter key in forms
                    event.preventDefault();
                    // Manually trigger the form submission to initiate search
                    console.log(`Enter key pressed on ${id}. Triggering form submit.`);
                    searchForm.submit();
                }
            });
        } else {
            // Log if an expected input element is not found
            console.warn(`Input element with ID '${id}' not found. Enter key listener not attached for this field.`);
        }
    });
}

/**
 * Performs a Wikipedia search using the MediaWiki API.
 *
 * @param {string} query The search query string.
 * @param {string} lang The language code for the Wikipedia domain (e.g., 'en', 'de').
 * @returns {Array<Object>} An array of search result objects, each with at least a 'title'.
 */
async function performWikipediaSearch(query, lang) {
    const endpoint = `https://${lang}.wikipedia.org/w/api.php`;
    const params = {
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        origin: '*' // Required for CORS
    };

    const url = new URL(endpoint);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    try {
        console.log(`Fetching Wikipedia search results from: ${url.toString()}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Wikipedia API response:", data);
        return data.query.search || [];
    } catch (error) {
        console.error("Error performing Wikipedia search:", error);
        return [];
    }
}

/**
 * Fetches a summary for a given Wikipedia article title.
 *
 * @param {string} title The title of the Wikipedia article.
 * @param {string} lang The language code for the Wikipedia domain (e.g., 'en', 'de').
 * @returns {string} The summary of the article, or an empty string if not found.
 */
async function fetchArticleSummary(title, lang) {
    const endpoint = `https://${lang}.wikipedia.org/w/api.php`;
    const params = {
        action: 'query',
        prop: 'extracts',
        exsentences: 2, // Limit to 2 sentences
        exintro: true, // Return only content before the first section
        explaintext: true, // Return plain text
        titles: title,
        format: 'json',
        origin: '*' // Required for CORS
    };

    const url = new URL(endpoint);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    try {
        console.log(`Fetching article summary for: "${title}" from: ${url.toString()}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId && pages[pageId].extract) {
            return pages[pageId].extract;
        }
        return '';
    } catch (error) {
        console.error(`Error fetching summary for "${title}":`, error);
        return '';
    }
}


// Event listener for form submission
const searchForm = document.getElementById('search-form');
if (searchForm) {
    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission
        console.log("Form submit event captured. Generating search query...");

        const generatedQuery = generateSearchString();
        console.log("generateSearchString returned:", generatedQuery); // Debug log for generated query

        const targetLangInput = document.getElementById('target-wiki-lang');
        // Safely get targetLang, default to 'en' if element not found or value is empty
        const targetLang = targetLangInput ? targetLangInput.value || 'en' : 'en';
        console.log("Target Wiki Language selected:", targetLang);

        const resultsContainer = document.getElementById('simulated-search-results');
        
        if (resultsContainer) {
            resultsContainer.innerHTML = '<li>Searching...</li>'; // Display loading indicator
        }

        if (generatedQuery && targetLang) {
            console.log(`Initiating Wikipedia search with query: "${generatedQuery}" in language: "${targetLang}"`);
            const searchResults = await performWikipediaSearch(generatedQuery, targetLang);
            if (resultsContainer) {
                resultsContainer.innerHTML = ''; // Clear loading message
            }

            if (searchResults && searchResults.length > 0) {
                console.log(`Found ${searchResults.length} search results.`);
                for (const result of searchResults) {
                    const summary = await fetchArticleSummary(result.title, targetLang);
                    const listItem = document.createElement('li');
                    // Link to the Wikipedia article
                    listItem.innerHTML = `
                        <a href="https://${targetLang}.wikipedia.org/wiki/${encodeURIComponent(result.title)}" target="_blank">
                            <strong>${result.title}</strong>
                        </a>
                        <p>${summary}</p>
                    `;
                    if (resultsContainer) {
                        resultsContainer.appendChild(listItem);
                    }
                }
            } else {
                console.log("No search results found.");
                if (resultsContainer) {
                    resultsContainer.innerHTML = '<li>No results found.</li>';
                }
            }
        } else {
            console.log("Search query or target language missing.");
            if (resultsContainer) {
                resultsContainer.innerHTML = '<li>Please enter some search parameters or select a target language.</li>';
            }
        }
    });
} else {
    console.error("Element with ID 'search-form' not found. Submit listener not attached.");
}

// Initial load
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM fully loaded. Initializing application...");
    await fetchTranslations(currentLang);
    applyTranslations();
    generateSearchString(); // Generate initial string on load
    console.log("generateSearchString called from DOMContentLoaded."); // Debug log
    addEnterKeySubmitListener(); // Add the new listener for Enter key
    console.log("Enter key listener attached.");
});
