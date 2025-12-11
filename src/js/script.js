// SCRIPT_VERSION_DEBUG_1145 - Unique Identifier for Cache Debugging
// FORCE CACHE CLEAR - SCRIPT VERSION FORCED REFRESH - FINAL ATTEMPT - 2023-10-27 - V3
// If the ReferenceError persists, please ensure browser cache is cleared and perform a hard refresh.
// If the issue continues, check your local development server's configuration.

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

// Helper function to fetch translations
async function fetchTranslations(lang) {
    try {
        const response = await fetch(`translations/${lang}.json`);
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
            console.log(`Translating 'target-wiki-lang' dropdown to ${currentLang}.`);
             targetWikiLangSelect.querySelectorAll('option').forEach(option => {
                const langCode = option.value;
                const translationKey = `lang-${langCode}-option`; // e.g., "lang-de-option"
                if (langCode && translations[currentLang] && translations[currentLang][translationKey]) {
                    console.log(`Translating option ${langCode} with key ${translationKey}`);
                    option.textContent = translations[currentLang][translationKey];
                } else {
                    console.warn(`Translation not found for option ${langCode} with key ${translationKey} in ${currentLang}.json`);
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

// Function to add Enter key listener to trigger form submission

function addEnterKeySubmitListener() {

    console.log("Inside addEnterKeySubmitListener function."); // Debug log

    const searchForm = document.getElementById('search-form');

    // Exit if the search form is not found to prevent errors

    if (!searchForm) {

        console.error("Search form element not found. Cannot attach Enter key listener.");

        return;

    }

    console.log("Search form found."); // Debug log



    const inputFieldsToWatch = [

        'search-query',

        'exact-phrase',

        'without-words',

        'any-words',

        'incategory-value',

        'deepcat-value',

        'linkfrom-value',

        'insource-value',

        'hastemplate-value',

        'filetype-value',

        'filesize-min',

                                'filesize-max',

                                'category-select', // The new dropdown

                                'prefix-value' // Input for prefix search

                            ];

                        

                            inputFieldsToWatch.forEach(id => {

                                console.log(`Checking for input element with ID: ${id}`); // Debug log

                                const inputElement = document.getElementById(id);

                                if (inputElement) {

                                    console.log(`Element with ID '${id}' found.`); // Debug log

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



// Function to add accordion functionality



function addAccordionFunctionality() {



    const accordionHeaders = document.querySelectorAll('.accordion-header');







    accordionHeaders.forEach(header => {



        header.addEventListener('click', () => {



            const content = header.nextElementSibling; // Get the next sibling element, which should be the content



            if (content && content.classList.contains('accordion-content')) {



                // Toggle the 'active' class on the header



                header.classList.toggle('active');







                // Toggle the display of the content



                if (content.style.display === 'block') {



                    content.style.display = 'none';



                } else {



                    content.style.display = 'block';



                }



            }



        });



    });



    console.log("Accordion functionality initiated.");







    // Automatically open the first accordion (Main Search Query) on page load



    const mainQueryHeader = document.getElementById('heading-main-query');



    if (mainQueryHeader) {



        const mainQueryContent = mainQueryHeader.nextElementSibling;



        if (mainQueryContent && mainQueryContent.classList.contains('accordion-content')) {



            mainQueryContent.style.display = 'block';



            mainQueryHeader.classList.add('active');



        }



    }



}



// Function to generate the search string from form inputs

function generateSearchString() {

    const queryParts = [];



    // Helper to get value from an element

    const getValue = (id) => {

        const element = document.getElementById(id);

        if (element) {

            if (element.type === 'checkbox') {

                return element.checked;

            }

            return element.value.trim();

        }

        return '';

    };



    const mainQuery = getValue('search-query');

    const exactPhrase = getValue('exact-phrase');

    const withoutWords = getValue('without-words');

    const anyWords = getValue('any-words');
    const optionFuzzy = getValue('option-fuzzy');
    const optionWildcard = getValue('option-wildcard');
    const optionIntitle = getValue('option-intitle');

    let processedQuery = mainQuery;

    if (optionIntitle) {
        processedQuery = `intitle:"${processedQuery}"`;
    }

    if (optionFuzzy && processedQuery) {
        processedQuery += '~';
    }

    // If wildcard is enabled, we assume the user has already included '*' in the mainQuery
    // No special handling is needed here, as processedQuery already contains the mainQuery.

    if (processedQuery) {
        queryParts.push(processedQuery);
    }

    if (exactPhrase) {
        queryParts.push(`"${exactPhrase}"`);
    }

    if (withoutWords) {
        const words = withoutWords.split(/\s+/).map(word => `-${word}`);
        queryParts.push(words.join(' '));
    }

    if (anyWords) {
        const words = anyWords.split(/\s+/).join(' OR ');
        queryParts.push(`(${words})`);
    }

    // Scope & Location
    const inCategory = getValue('incategory-value');
    if (inCategory) {
        queryParts.push(`incategory:"${inCategory}"`);
    }
    
    const deepCat = getValue('deepcat-value');
    if (deepCat) {
        queryParts.push(`deepcat:"${deepCat}"`);
    }

    const linkFrom = getValue('linkfrom-value');
    if (linkFrom) {
        queryParts.push(`linksto:"${linkFrom}"`);
    }

    const prefixValue = getValue('prefix-value');
    if (prefixValue) {
        queryParts.push(`prefix:"${prefixValue}"`);
    }

    const selectedCategory = getValue('category-select');
    if (selectedCategory) {
        queryParts.push(`incategory:"${selectedCategory}"`);
    }

    // Content & Technical
    const inSource = getValue('insource-value');
    if (inSource) {
        queryParts.push(`insource:${inSource}`);
    }

    const hasTemplate = getValue('hastemplate-value');
    if (hasTemplate) {
        queryParts.push(`hastemplate:"${hasTemplate}"`);
    }

    const fileType = getValue('filetype-value');
    if (fileType) {
        queryParts.push(`filetype:${fileType}`);
    }

    const fileSizeMin = getValue('filesize-min');
    if (fileSizeMin) {
        queryParts.push(`filesize:>=${fileSizeMin}`);
    }

    const fileSizeMax = getValue('filesize-max');
    if (fileSizeMax) {
        queryParts.push(`filesize:<=${fileSizeMax}`);
    }

    const generatedString = queryParts.join(' ').trim();
    
    const displayElement = document.getElementById('generated-search-string-display');
    if (displayElement) {
        let fallbackText = ''; // Default English fallback
        if (translations[currentLang] && translations[currentLang]['']) {
            fallbackText = translations[currentLang][''];
        }
        displayElement.textContent = generatedString || fallbackText;
    }
    
    console.log("Generated search string:", generatedString);
    return generatedString;
}

// Function to perform a Wikipedia search using the API
async function performWikipediaSearch(query, lang) {
    const endpoint = `https://${lang}.wikipedia.org/w/api.php`;
    const params = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        origin: '*' // This is needed for CORS
    });

    try {
        const response = await fetch(`${endpoint}?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.query.search;
    } catch (error) {
        console.error("Error during Wikipedia search:", error);
        return [];
    }
}

// Function to fetch a summary for a given article title
async function fetchArticleSummary(title, lang) {
    const endpoint = `https://${lang}.wikipedia.org/w/api.php`;
    const params = new URLSearchParams({
        action: 'query',
        prop: 'extracts',
        exintro: true,
        explaintext: true,
        titles: title,
        format: 'json',
        origin: '*' // CORS
    });

    try {
        const response = await fetch(`${endpoint}?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        return pages[pageId].extract;
    } catch (error) {
        console.error(`Could not fetch summary for ${title}:`, error);
        return "Summary could not be retrieved.";
    }
}


// Event listener for form submission
const searchForm = document.getElementById('search-form');
if (searchForm) {
    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission
        console.log("Form submit event captured. Generating search query...");

        const generatedQuery = generateSearchString();
        console.log(`Generated query inside submit listener: "${generatedQuery}"`); // Debug log

        // ... (rest of the function remains the same)
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
                console.log("Search query or target language missing.");
                if (resultsContainer) {
                    resultsContainer.innerHTML = '<li>Please enter some search parameters or select a target language.</li>';
                }
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
    addAccordionFunctionality(); // Add accordion functionality
});