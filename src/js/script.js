// SCRIPT_VERSION_DEBUG_1145 - Unique Identifier for Cache Debugging
// FORCE CACHE CLEAR - SCRIPT VERSION FORCED REFRESH - FINAL ATTEMPT - 2023-10-27 - V3
// If the ReferenceError persists, please ensure browser cache is cleared and perform a hard refresh.
// If the issue continues, check your local development server's configuration.

// Object to hold translations
const translations = {};
let currentLang = 'de'; // Default language

// Helper function to get translated string with optional replacements
function getTranslation(key, defaultValue = '', replacements = {}) {
    let translatedString = defaultValue;
    if (translations[currentLang] && translations[currentLang][key]) {
        translatedString = translations[currentLang][key];
    }

    // Perform replacements if provided
    for (const placeholder in replacements) {
        // Regex to match {placeholder} or "{placeholder}"
        const regex = new RegExp(`{\\s*${placeholder}\\s*}`, 'g');
        translatedString = translatedString.replace(regex, replacements[placeholder]);
    }

    return translatedString;
}

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

// Preset search queries for "Space Exploration"
const presetSearches = {
    easy: {
        'search-query': 'preset-easy-search-query', // Translation key
        'exact-phrase': '',
        'without-words': '',
        'any-words': '',
        'option-intitle': false,
        'option-wildcard': false,
        'option-fuzzy': false,
        'incategory-value': '',
        'deepcat-value': '',
        'linkfrom-value': '',
        'prefix-value': '',
        'insource-value': '',
        'hastemplate-value': '',
        'filetype-value': '',
        'filesize-min': '',
        'filesize-max': ''
    },
    medium: {
        'search-query': 'preset-medium-search-query', // Translation key
        'exact-phrase': 'preset-medium-exact-phrase', // Translation key
        'without-words': 'preset-medium-without-words', // Translation key
        'any-words': 'preset-medium-any-words', // Translation key
        'option-intitle': false,
        'option-wildcard': false,
        'option-fuzzy': false,
        'incategory-value': '',
        'deepcat-value': '',
        'linkfrom-value': '',
        'prefix-value': '',
        'insource-value': '',
        'hastemplate-value': '',
        'filetype-value': '',
        'filesize-min': '',
        'filesize-max': ''
    },

};

// Function to clear all form fields
function clearForm() {
    console.log("clearForm called. Clearing all input fields."); // DEBUG
    document.querySelectorAll('#search-form input[type="text"]').forEach(input => input.value = '');
    document.querySelectorAll('#search-form input[type="number"]').forEach(input => input.value = '');
    document.querySelectorAll('#search-form input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
    document.querySelectorAll('#search-form select:not(#target-wiki-lang)').forEach(select => select.selectedIndex = 0); // Reset dropdowns, but exclude target-wiki-lang
    document.getElementById('save-search-comment').value = ''; // Clear the comment input
    generateSearchString(); // Update the generated string and explanation after clearing
}

// Function to apply a selected preset search to the form
function applyPreset(preset) {
    clearForm(); // Clear all form fields first

    // Apply preset values
    for (const key in preset) {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = preset[key];
            } else {
                // Use getTranslation for preset values
                element.value = getTranslation(preset[key], preset[key]);
            }
        }
    }
    generateSearchString(); // Update the generated string and explanation
}

// === Saved Searches (CRUD Local Storage) ===

const LOCAL_STORAGE_KEY = 'wikiGuiSavedSearches';

// Function to get current form values
function getCurrentFormValues() {
    const formValues = {};
    const inputElements = document.querySelectorAll('#search-form input, #search-form select');

    inputElements.forEach(element => {
        if (element.id && element.id !== 'save-search-comment') { // Exclude save comment input
            if (element.type === 'checkbox') {
                formValues[element.id] = element.checked;
            } else {
                formValues[element.id] = element.value;
            }
        }
    });
    return formValues;
}

// Function to save the current search
function saveCurrentSearch() {
    console.log("saveCurrentSearch called."); // DEBUG
    const query = document.getElementById('generated-search-string-display').textContent;
    const comment = document.getElementById('save-search-comment').value.trim();
    const formState = getCurrentFormValues();

    console.log("Query to save:", query); // DEBUG
    console.log("Comment to save:", comment); // DEBUG
    console.log("Form State to save:", formState); // DEBUG

    if (!query) {
        alert(getTranslation('alert-generate-search-string', 'Please generate a search string first before saving.')); // Use translation
        console.warn("Save cancelled: No query generated."); // DEBUG
        return;
    }

    let savedSearches = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    console.log("Saved searches BEFORE attempting to save:", savedSearches); // DEBUG
    
    // Check if a search with the same query and comment already exists to avoid duplicates
    const isDuplicate = savedSearches.some(
        s => s.query === query && s.comment === comment && JSON.stringify(s.formState) === JSON.stringify(formState)
    );

    if (isDuplicate) {
        alert(getTranslation('alert-search-already-saved', 'This exact search (query and comment) is already saved!')); // Use translation
        console.warn("Save cancelled: Duplicate search detected."); // DEBUG
        return;
    }

    const newSearch = {
        id: Date.now().toString(), // Simple unique ID
        query: query,
        comment: comment || getTranslation('no-comment-provided', 'No comment provided'), // Use translation
        timestamp: Date.now(),
        formState: formState // Save the full form state
    };

    savedSearches.push(newSearch);
    console.log("Saved searches AFTER new search added (before localStorage update):", savedSearches); // DEBUG
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedSearches));
    console.log("localStorage AFTER saving:", localStorage.getItem(LOCAL_STORAGE_KEY)); // DEBUG
    document.getElementById('save-search-comment').value = ''; // Clear comment input
    loadSavedSearches(); // Refresh the list
    alert(getTranslation('alert-search-saved', 'Search saved successfully!')); // Use translation
}

// Function to load a saved search into the form
function loadSearch(searchId) {
    let savedSearches = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const searchToLoad = savedSearches.find(search => search.id === searchId);

    if (searchToLoad) {
        clearForm(); // Clear current form state

        // Apply saved form state
        for (const key in searchToLoad.formState) {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = searchToLoad.formState[key];
                } else {
                    element.value = searchToLoad.formState[key];
                }
            }
        }
        generateSearchString(); // Update the generated string and explanation
        alert('Search loaded successfully!');
    } else {
        alert('Saved search not found!');
    }
}

// Function to edit a saved search's comment
function editSearchComment(searchId) {
    console.log("Attempting to edit comment for search with ID:", searchId); // DEBUG
    let savedSearches = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const searchIndex = savedSearches.findIndex(search => search.id === searchId);

    if (searchIndex !== -1) {
        console.log("Current comment for search ID", searchId, ":", savedSearches[searchIndex].comment); // DEBUG
        const newComment = prompt('Enter new comment for this search:', savedSearches[searchIndex].comment);
        console.log("Prompt returned newComment:", newComment); // DEBUG
        if (newComment !== null) { // User didn't cancel
            savedSearches[searchIndex].comment = newComment.trim() || 'No comment provided';
            console.log("Saved searches AFTER comment modification:", savedSearches); // DEBUG
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedSearches));
            console.log("localStorage AFTER comment update:", localStorage.getItem(LOCAL_STORAGE_KEY)); // DEBUG
            loadSavedSearches(); // Refresh the list
            alert('Comment updated successfully!');
        } else {
            console.log("Edit comment action cancelled for search ID:", searchId); // DEBUG
        }
    } else {
        alert('Saved search not found!');
    }
}

// Function to delete a saved search
function deleteSearch(searchId) {
    console.log("Attempting to delete search with ID:", searchId); // DEBUG
    if (confirm('Are you sure you want to delete this saved search?')) {
        let savedSearches = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        console.log("Saved searches BEFORE deletion:", savedSearches); // DEBUG
        savedSearches = savedSearches.filter(search => search.id !== searchId);
        console.log("Saved searches AFTER deletion (filtered array):", savedSearches); // DEBUG
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedSearches));
        console.log("localStorage AFTER deletion:", localStorage.getItem(LOCAL_STORAGE_KEY)); // DEBUG
        loadSavedSearches(); // Refresh the list
        alert('Search deleted successfully!');
    } else {
        console.log("Delete action cancelled for search ID:", searchId); // DEBUG
    }
}

// Function to display saved searches
function loadSavedSearches() {
    console.log("loadSavedSearches called."); // DEBUG
    const savedSearchesList = document.getElementById('saved-searches-list');
    if (!savedSearchesList) {
        console.error("Element with ID 'saved-searches-list' not found.");
        return;
    }
    savedSearchesList.innerHTML = ''; // Clear existing list

    let savedSearches = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    console.log("Retrieved saved searches from localStorage:", savedSearches); // DEBUG

    if (savedSearches.length === 0) {
        savedSearchesList.innerHTML = `<li>${getTranslation('no-searches-saved', 'No searches saved yet.')}</li>`;
        return;
    }

    savedSearches.sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first

    savedSearches.forEach(search => {
        const listItem = document.createElement('li');
        listItem.dataset.searchId = search.id; // Store ID for actions

        const date = new Date(search.timestamp).toLocaleString();

        listItem.innerHTML = `
            <div>
                <strong>${getTranslation('query-label', 'Query')}:</strong> <span>${search.query}</span><br>
                <strong>${getTranslation('comment-label', 'Comment')}:</strong> <span class="search-comment" data-id="${search.id}">${search.comment}</span><br>
                <small>${date}</small>
            </div>
            <div class="search-actions">
                <button class="load-search-btn" data-id="${search.id}">${getTranslation('load-button', 'Load')}</button>
                <button class="edit-search-btn" data-id="${search.id}">${getTranslation('edit-button', 'Edit Comment')}</button>
                <button class="delete-search-btn" data-id="${search.id}">${getTranslation('delete-button', 'Delete')}</button>
            </div>
        `;
        savedSearchesList.appendChild(listItem);
    });

    // Attach event listeners using event delegation to the parent ul
    // This is more efficient than attaching to each button individually
    // And it will handle dynamically added/removed list items
    savedSearchesList.removeEventListener('click', handleSavedSearchActions); // Prevent multiple listeners
    savedSearchesList.addEventListener('click', handleSavedSearchActions);

    function handleSavedSearchActions(event) {
        const target = event.target;
        const searchId = target.dataset.id;
        console.log("Clicked button with searchId:", searchId, "Class:", target.classList); // DEBUG

        if (target.classList.contains('load-search-btn')) {
            loadSearch(searchId);
        } else if (target.classList.contains('edit-search-btn')) {
            editSearchComment(searchId);
        } else if (target.classList.contains('delete-search-btn')) {
            deleteSearch(searchId);
        }
    }
}


// === Import/Export Functions ===

// Helper function to trigger file download
function downloadFile(filename, content, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export searches to JSON
function exportSearchesToJson() {
    const savedSearches = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    if (savedSearches.length === 0) {
        alert('No searches to export!');
        return;
    }
    const jsonContent = JSON.stringify(savedSearches, null, 2);
    downloadFile('wiki_gui_searches.json', jsonContent, 'application/json');
    alert('Searches exported as JSON!');
}

// Export searches to CSV
function exportSearchesToCsv() {
    const savedSearches = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    if (savedSearches.length === 0) {
        alert('No searches to export!');
        return;
    }

    const headers = ['id', 'query', 'comment', 'timestamp', 'formState'];
    const csvRows = [];
    csvRows.push(headers.join(',')); // Add header row

    savedSearches.forEach(search => {
        const row = headers.map(header => {
            let value = search[header];
            if (header === 'formState') {
                value = JSON.stringify(value); // Stringify formState object
            }
            // Basic CSV escaping: double quotes and wrap in quotes if contains comma
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    downloadFile('wiki_gui_searches.csv', csvContent, 'text/csv');
    alert('Searches exported as CSV!');
}

// Helper function to validate an imported search object
function isValidSearchObject(obj) {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'string' &&
        typeof obj.query === 'string' &&
        typeof obj.comment === 'string' &&
        typeof obj.timestamp === 'number' &&
        typeof obj.formState === 'object' &&
        obj.formState !== null
    );
}

// Function to merge and deduplicate imported searches
function mergeAndDeduplicateSearches(importedSearches) {
    let existingSearches = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    let mergedSearches = [...existingSearches];
    let importedCount = 0;

    importedSearches.forEach(importedSearch => {
        if (!isValidSearchObject(importedSearch)) {
            console.warn('Skipping invalid imported search object:', importedSearch);
            return;
        }

        const isDuplicate = mergedSearches.some(
            existingSearch =>
                existingSearch.query === importedSearch.query &&
                existingSearch.comment === importedSearch.comment &&
                JSON.stringify(existingSearch.formState) === JSON.stringify(importedSearch.formState)
        );

        if (!isDuplicate) {
            // Assign a new ID to imported searches to prevent ID conflicts with existing ones
            // and ensure uniqueness in the current context.
            // If the original ID needs to be preserved for some reason, a more complex strategy is needed.
            importedSearch.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
            mergedSearches.push(importedSearch);
            importedCount++;
        }
    });

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedSearches));
    loadSavedSearches(); // Refresh display
    alert(`Successfully imported ${importedCount} new searches.`);
}

// Import searches from JSON
function importSearchesFromJson(jsonString) {
    try {
        const importedData = JSON.parse(jsonString);
        if (!Array.isArray(importedData)) {
            throw new Error('JSON is not an array.');
        }
        mergeAndDeduplicateSearches(importedData);
    } catch (error) {
        alert(`Failed to import JSON: ${error.message}`);
        console.error('JSON import error:', error);
    }
}

// Import searches from CSV
function importSearchesFromCsv(csvString) {
    try {
        const lines = csvString.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV is empty or has no data rows.');
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const importedSearches = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split by comma, but not if within quotes
            const search = {};
            headers.forEach((header, index) => {
                let value = values[index] ? values[index].trim() : '';
                // Remove surrounding quotes if present and unescape internal quotes
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1).replace(/""/g, '"');
                }

                if (header === 'formState') {
                    try {
                        search[header] = JSON.parse(value);
                    } catch (e) {
                        console.warn('Failed to parse formState in CSV row:', value, e);
                        search[header] = {}; // Default to empty object on error
                    }
                } else if (header === 'timestamp') {
                    search[header] = parseInt(value, 10);
                } else {
                    search[header] = value;
                }
            });
            importedSearches.push(search);
        }
        mergeAndDeduplicateSearches(importedSearches);

    } catch (error) {
        alert(`Failed to import CSV: ${error.message}`);
        console.error('CSV import error:', error);
    }
}

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
    console.log("applyTranslations called."); // DEBUG
    // Select elements with an ID or the 'preset-button' class
    const elementsToTranslate = document.querySelectorAll('[id], .preset-button');

    elementsToTranslate.forEach(element => {
        const key = element.id || element.dataset.presetType;
        console.log(`Processing element. ID: ${key}, Classes: ${element.className}`); // DEBUG

        // Check for placeholder translation specifically for input elements
        if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
            const placeholderKey = `${key}-placeholder`; // e.g., 'search-query-placeholder'
            if (translations[currentLang] && translations[currentLang][placeholderKey]) {
                element.placeholder = translations[currentLang][placeholderKey];
                console.log(`  - Placeholder translated for ID ${key}: ${element.placeholder}`); // DEBUG
            }
        } else if (translations[currentLang] && translations[currentLang][key]) {
            // Default: translate textContent for other elements
            element.textContent = translations[currentLang][key];
            console.log(`  - TextContent translated for ID ${key}: ${element.textContent}`); // DEBUG
        } else {
            console.log(`  - No direct ID translation found for ${key}.`); // DEBUG
        }
        
        // Translate title attributes for elements with data-info-id (info-icons)
        if (element.hasAttribute('data-info-id')) {
            const infoId = element.dataset.infoId;
            if (translations[currentLang] && translations[currentLang][infoId]) {
                element.title = translations[currentLang][infoId];
                console.log(`  - Title attribute translated for ID ${key} (data-info-id: ${infoId}): ${element.title}`); // DEBUG
            } else {
                console.log(`  - No title translation found for data-info-id ${infoId} on element ID ${key}.`); // DEBUG
            }
        }
        
        // Translate preset buttons by data-preset-type
        if (element.classList.contains('preset-button') && element.dataset.presetType) {
            const presetKey = `preset-${element.dataset.presetType}`;
            console.log(`  - Processing preset button. ID: ${key}, data-preset-type: ${element.dataset.presetType}, Looking for key: ${presetKey}`); // DEBUG
            if (translations[currentLang] && translations[currentLang][presetKey]) {
                element.textContent = translations[currentLang][presetKey];
                console.log(`  - Preset button translated! ID: ${key}, TextContent: ${element.textContent}`); // DEBUG
            } else {
                console.warn(`  - WARNING: Translation not found for preset button with key ${presetKey} in ${currentLang}.json`); // DEBUG
            }
        }

        // Translate import label
        if (element.classList.contains('import-label') && element.id) {
            const importLabelKey = element.id;
            if (translations[currentLang] && translations[currentLang][importLabelKey]) {
                element.textContent = translations[currentLang][importLabelKey];
                console.log(`  - Import label translated for ID ${key}: ${element.textContent}`); // DEBUG
            }
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
                    if (translations[currentLang] && translations[currentLang][placeholderKey]) {
                        option.textContent = translations[currentLang][placeholderKey];
                    }
                } else {
                    const translationKey = `category-${optionValue}`; // e.g., "category-Science"
                    if (translations[currentLang] && translations[currentLang][translationKey]) {
                        option.textContent = translations[currentLang][translationKey];
                    }
                }
            });
        }

        // Translate options for the target wiki language dropdown
        const targetWikiLangSelect = document.getElementById('target-wiki-lang');
        if (targetWikiLangSelect) {
            console.log(`Translating 'target-wiki-lang' dropdown to ${currentLang}.`); // DEBUG
             targetWikiLangSelect.querySelectorAll('option').forEach(option => {
                const langCode = option.value;
                const translationKey = `lang-${langCode}-option`; // e.g., "lang-de-option"
                if (langCode && translations[currentLang] && translations[currentLang][translationKey]) {
                    console.log(`Translating option ${langCode} with key ${translationKey}`); // DEBUG
                    option.textContent = translations[currentLang][translationKey];
                } else {
                    console.warn(`Translation not found for option ${langCode} with key ${translationKey} in ${currentLang}.js`); // DEBUG
                }
            });
            
            // Sync the selected option of target-wiki-lang to match the app's currentLang
            // This makes the default target wiki language change with the app's UI language.
            const currentAppLangCode = currentLang; // e.g., 'de', 'en', 'fr'
            const optionValues = Array.from(targetWikiLangSelect.options).map(option => option.value);

            console.log(`DEBUG: currentAppLangCode = ${currentAppLangCode}`); // NEW DEBUG
            console.log(`DEBUG: optionValues = ${optionValues}`); // NEW DEBUG
            console.log(`DEBUG: optionValues.includes(currentAppLangCode) = ${optionValues.includes(currentAppLangCode)}`); // NEW DEBUG

            if (optionValues.includes(currentAppLangCode)) {
                console.log(`DEBUG: Assigning ${currentAppLangCode} to targetWikiLangSelect.value`); // NEW DEBUG
                targetWikiLangSelect.value = currentAppLangCode;
            } else {
                console.log(`DEBUG: Fallback to 'de' for targetWikiLangSelect.value`); // NEW DEBUG
                targetWikiLangSelect.value = 'de';
            }
            console.log(`DEBUG: targetWikiLangSelect.value AFTER assignment = ${targetWikiLangSelect.value}`); // NEW DEBUG
        }
    }
    
    // Update dynamic links, like the Wikipedia search help link
    const officialDocLink = document.getElementById('official-doc-link');
    if (officialDocLink) {
        officialDocLink.href = wikipediaSearchHelpUrls[currentLang] || wikipediaSearchHelpUrls['en']; // Fallback to English if language not found
        console.log(`  - Official documentation link updated for ${currentLang}: ${officialDocLink.href}`); // DEBUG
    }
}

// Function to update the active state of language buttons
function updateLanguageButtonState() {
    document.querySelectorAll('.lang-button').forEach(button => {
        if (button.dataset.lang === currentLang) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// Function to add Enter key listener to trigger form submission
function addEnterKeySubmitListener() {
    console.log("Inside addEnterKeySubmitListener function."); // DEBUG
    const searchForm = document.getElementById('search-form');

    if (!searchForm) {
        console.error("Search form element not found. Cannot attach Enter key listener."); // DEBUG
        return;
    }
    console.log("Search form found. Attaching listeners."); // DEBUG

    const inputFieldsToWatch = [
        'search-query', 'exact-phrase', 'without-words', 'any-words',
        'incategory-value', 'deepcat-value', 'linkfrom-value', 'prefix-value',
        'insource-value', 'hastemplate-value', 'filetype-value',
        'filesize-min', 'filesize-max', 'category-select'
    ];

    inputFieldsToWatch.forEach(id => {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            console.log(`Attaching keydown listener to input element with ID: ${id}`); // DEBUG
            inputElement.addEventListener('keydown', (event) => {
                console.log(`Keydown event on ${id}. Key: ${event.key}, Target: ${event.target.id}`); // DEBUG
                if (event.key === 'Enter') {
                    console.log(`Enter key pressed on ${id}. Preventing default and triggering generate-search-string-button click.`); // DEBUG
                    event.preventDefault();
                    document.getElementById('generate-search-string-button').click();
                }
            });
        } else {
            console.warn(`Input element with ID '${id}' not found. Enter key listener not attached for this field.`); // DEBUG
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



    const explanationParts = [];







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



    const optionWildcard = getValue('option-wildcard'); // Not directly used in query construction as per comment



    const optionIntitle = getValue('option-intitle');







    let processedQuery = mainQuery;







    if (processedQuery) {



        if (optionIntitle) {



                                    processedQuery = `intitle:"${processedQuery}"`;



                                    explanationParts.push(getTranslation('explanation-intitle', `Searching for pages with "${mainQuery}" specifically in their title.`, { mainQuery }));



                                } else {



                                    explanationParts.push(getTranslation('explanation-main-query', `Searching for pages containing the terms "${mainQuery}".`, { mainQuery }));



                                }



                            }



    



            if (optionFuzzy && mainQuery) { // Apply fuzzy only if there's a main query



    



                processedQuery += '~';



    



                explanationParts.push(getTranslation('explanation-fuzzy-applied', `Applying fuzzy search to "${mainQuery}" to include similar terms.`, { mainQuery }));



    



            }







            if (exactPhrase) {







                queryParts.push(`"${exactPhrase}"`);







                explanationParts.push(getTranslation('explanation-exact-phrase', `Including the exact phrase "${exactPhrase}".`, { exactPhrase }));







            }







        







            if (withoutWords) {







                const words = withoutWords.split(/\s+/).map(word => `-${word}`);







                queryParts.push(words.join(' '));







                explanationParts.push(getTranslation('explanation-without-words', `Excluding pages containing any of these words: "${withoutWords}".`, { withoutWords }));







            }







        







                        if (anyWords) {







        







                            // Split by "OR" (case-insensitive), trim each part, filter out empty strings, then join with " OR "







        







                            const words = anyWords.split(/ OR /i).map(word => word.trim()).filter(word => word !== '').join(' OR ');







        







                            if (words) {







        







                                queryParts.push(`(${words})`);







        







                                explanationParts.push(getTranslation('explanation-any-words', `Including pages with at least one of these words: "${anyWords}".`, { anyWords }));







        







                            }







        







                        }







    // Scope & Location



            const inCategory = getValue('incategory-value');



            if (inCategory) {



                queryParts.push(`incategory:"${inCategory}"`);



                explanationParts.push(getTranslation('explanation-incategory', `Limiting results to articles within the category "${inCategory}".`, { inCategory }));



            }



            



            const deepCat = getValue('deepcat-value');



            if (deepCat) {



                queryParts.push(`deepcat:"${deepCat}"`);



                explanationParts.push(getTranslation('explanation-deepcat', `Limiting results to articles within "${deepCat}" and its subcategories.`, { deepCat }));



            }



        



            const linkFrom = getValue('linkfrom-value');



            if (linkFrom) {



                queryParts.push(`linksto:"${linkFrom}"`);



                explanationParts.push(getTranslation('explanation-linkfrom', `Showing pages that link to "${linkFrom}".`, { linkFrom }));



            }







            const prefixValue = getValue('prefix-value');







            if (prefixValue) {







                queryParts.push(`prefix:"${prefixValue}"`);







                explanationParts.push(getTranslation('explanation-prefix', `Only showing pages whose titles start with "${prefixValue}".`, { prefixValue }));







            }







        







            const selectedCategory = getValue('category-select');







            if (selectedCategory) {







                // This is a duplicate of incategory, but still add explanation if used.







                // The actual query part is handled by incategory already.







                explanationParts.push(getTranslation('explanation-selected-category', `Filtering by selected category: "${selectedCategory}".`, { selectedCategory }));







            }







    // Content & Technical



                        const inSource = getValue('insource-value');



                        if (inSource) {



                            const quotedInSource = inSource.includes(' ') ? `"${inSource}"` : inSource;



                            queryParts.push(`insource:${quotedInSource}`);



                            explanationParts.push(getTranslation('explanation-insource', `Searching for pages containing "${inSource}" in their wikitext source.`, { inSource }));



                        }



        



            const hasTemplate = getValue('hastemplate-value');



            if (hasTemplate) {



                queryParts.push(`hastemplate:"${hasTemplate}"`);



                explanationParts.push(getTranslation('explanation-hastemplate', `Including pages that use the template "${hasTemplate}".`, { hastemplate: hasTemplate }));



            }



        



            const fileType = getValue('filetype-value');



            if (fileType) {



                queryParts.push(`filetype:${fileType}`);



                explanationParts.push(getTranslation('explanation-filetype', `Filtering for files of type: "${fileType}".`, { fileType }));



            }







            const fileSizeMin = getValue('filesize-min');







            if (fileSizeMin) {







                queryParts.push(`filesize:>=${fileSizeMin}`);







                explanationParts.push(getTranslation('explanation-filesize-min', `Including files with a size greater than or equal to ${fileSizeMin} bytes.`, { fileSizeMin }));







            }







        







            const fileSizeMax = getValue('filesize-max');







            if (fileSizeMax) {







                queryParts.push(`filesize:<=${fileSizeMax}`);







                explanationParts.push(getTranslation('explanation-filesize-max', `Including files with a size less than or equal to ${fileSizeMax} bytes.`, { fileSizeMax }));







            }







    // Add processedQuery at the beginning if it exists



    if (processedQuery && !optionIntitle) { // If intitle was used, it's already added with main query part



        queryParts.unshift(processedQuery);



    } else if (processedQuery && optionIntitle && queryParts[0] !== processedQuery) {



         // Ensure it's not duplicated if already added by optionIntitle logic



        queryParts.unshift(processedQuery);



    }



    



    const generatedString = queryParts.join(' ').trim();



    



        const displayElement = document.getElementById('generated-search-string-display');



    



        if (displayElement) {



    



            let fallbackText = getTranslation('generated-string-placeholder', 'Generated string will appear here.');



    



            displayElement.textContent = generatedString || fallbackText;



    



        }



    



    



    



        const explanationElement = document.getElementById('generated-string-explanation');



    



        if (explanationElement) {



    



            if (explanationParts.length > 0) {



    



                explanationElement.innerHTML = `<h4>${getTranslation('explanation-heading', 'Explanation:')}</h4><ul>` + explanationParts.map(exp => `<li>${exp}</li>`).join('') + '</ul>';



        } else {



            explanationElement.innerHTML = ''; // Clear if no explanation



        }



    }



    



    console.log("Generated search string:", generatedString);



    console.log("Explanation:", explanationParts.join('; '));



    return generatedString;



}

// Helper function to parse advanced search parameters from the query string
function parseAdvancedSearchParams(query) {
    const params = {
        srsearch: query, // Default to the full query
        srincategory: '',
        srdeepcategory: '',
        srhastemplate: '',
        srprefix: '',
        srincontent: '' // MediaWiki API uses srincontent for insource
    };

    let remainingQuery = query;

    // Regex to extract parameters like "param:value" or "param:"value with spaces""
    const extractParam = (regex, paramName) => {
        const match = remainingQuery.match(regex);
        if (match && match[1]) {
            params[paramName] = match[1].replace(/^"|"$/g, ''); // Remove quotes if present
            remainingQuery = remainingQuery.replace(match[0], '').trim();
        }
    };

    // Extract incategory
    extractParam(/incategory:("([^"]+)"|([^\s]+))/i, 'srincategory');
    // Extract deepcat
    extractParam(/deepcat:("([^"]+)"|([^\s]+))/i, 'srdeepcategory');
    // Extract hastemplate
    extractParam(/hastemplate:("([^"]+)"|([^\s]+))/i, 'srhastemplate');
    // Extract prefix
    extractParam(/prefix:("([^"]+)"|([^\s]+))/i, 'srprefix');
    // Extract insource (maps to srincontent for list=search)
    // Note: insource can also take regex, but srsearch with srincontent is usually for literal text
    extractParam(/insource:("([^"]+)"|([^\s]+))/i, 'srincontent');
    
    // The remaining part of the query goes into srsearch
    params.srsearch = remainingQuery.trim();

    return params;
}

// Function to perform a Wikipedia search using the API
async function performWikipediaSearch(query, lang) {
    const endpoint = `https://${lang}.wikipedia.org/w/api.php`;
    
    // Parse the advanced parameters from the query string
    const parsedParams = parseAdvancedSearchParams(query);
    console.log("Parsed Search Parameters:", parsedParams); // DEBUG

    const apiParams = {
        action: 'query',
        list: 'search',
        format: 'json',
        origin: '*' // This is needed for CORS
    };

    // Conditionally add parameters if they have a value
    if (parsedParams.srsearch) {
        apiParams.srsearch = parsedParams.srsearch;
    }
    if (parsedParams.srincategory) {
        apiParams.srincategory = parsedParams.srincategory;
    }
    if (parsedParams.srdeepcategory) {
        apiParams.srdeepcategory = parsedParams.srdeepcategory;
    }
    if (parsedParams.srhastemplate) {
        apiParams.srhastemplate = parsedParams.srhastemplate;
    }
    if (parsedParams.srprefix) {
        apiParams.srprefix = parsedParams.srprefix;
    }
    if (parsedParams.srincontent) {
        apiParams.srincontent = parsedParams.srincontent;
    }

    const params = new URLSearchParams(apiParams);
    const url = `${endpoint}?${params}`;
    console.log("Wikipedia Search API URL:", url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Wikipedia Search API Response Data:", data);
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
    const url = `${endpoint}?${params}`;
    console.log("Wikipedia Summary API URL:", url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Wikipedia Summary API Response Data for title:", title, data);
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
    document.documentElement.lang = currentLang; // Set initial HTML lang attribute
    updateLanguageButtonState(); // Set initial active language button
    generateSearchString(); // Generate initial string on load
    console.log("generateSearchString called from DOMContentLoaded."); // Debug log
    addEnterKeySubmitListener(); // Add the new listener for Enter key
    console.log("Enter key listener attached.");
    addAccordionFunctionality(); // Add accordion functionality

    // Event listeners for language selection buttons
    document.querySelectorAll('.lang-button').forEach(button => {
        button.addEventListener('click', async () => {
            const newLang = button.dataset.lang;
            if (newLang && newLang !== currentLang) {
                currentLang = newLang;
                if (!translations[currentLang]) {
                    await fetchTranslations(currentLang);
                }
                document.documentElement.lang = currentLang; // Update HTML lang attribute
                applyTranslations();
                updateLanguageButtonState(); // Update active class for buttons
            }
        });
    });

    // Event listeners for preset buttons
    document.querySelectorAll('.preset-button').forEach(button => {
        button.addEventListener('click', () => {
            const presetType = button.dataset.presetType;
            if (presetSearches[presetType]) {
                applyPreset(presetSearches[presetType]);
            }
        });
    });

    // Event listener for copying generated search string to clipboard
    const generatedStringWrapper = document.querySelector('.generated-string-wrapper');
    const generatedSearchStringDisplay = document.getElementById('generated-search-string-display');
    const copyIcon = document.querySelector('.copy-icon');

    if (generatedStringWrapper && generatedSearchStringDisplay && copyIcon) {
        generatedStringWrapper.style.cursor = 'pointer'; // Indicate clickability
        generatedStringWrapper.title = 'Click to copy to clipboard';

        generatedStringWrapper.addEventListener('click', async () => {
            const rawSearchQuery = generatedSearchStringDisplay.textContent;
            const targetLang = document.getElementById('target-wiki-lang').value;
            const wikipediaSearchUrl = `https://${targetLang}.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(rawSearchQuery)}`;
            
            console.log("Attempting to copy URL:"); // DEBUG
            console.log("Raw Search Query:", rawSearchQuery); // DEBUG
            console.log("Target Language:", targetLang); // DEBUG
            console.log("Constructed Wikipedia Search URL:", wikipediaSearchUrl); // DEBUG

            try {
                await navigator.clipboard.writeText(wikipediaSearchUrl);
                copyIcon.textContent = '✅'; // Change icon to a checkmark
                setTimeout(() => {
                    copyIcon.textContent = '📋'; // Revert icon after a short delay
                }, 1500);
                alert('Wikipedia search URL copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy text to clipboard:', err);
                copyIcon.textContent = '❌';
                setTimeout(() => {
                    copyIcon.textContent = '📋';
                }, 1500);
                alert('Failed to copy Wikipedia search URL.');
            }
        });
    }

    // Event listener for saving current search
    const saveSearchButton = document.getElementById('save-search-button');
    if (saveSearchButton) {
        saveSearchButton.addEventListener('click', saveCurrentSearch);
    }

    // Event listener for clear form button
    const clearFormButton = document.getElementById('clear-form-button');
    if (clearFormButton) {
        clearFormButton.addEventListener('click', clearForm);
    }



    const exportJsonButton = document.getElementById('export-json-button');
    if (exportJsonButton) {
        exportJsonButton.addEventListener('click', exportSearchesToJson);
    }

    const exportCsvButton = document.getElementById('export-csv-button');
    if (exportCsvButton) {
        exportCsvButton.addEventListener('click', exportSearchesToCsv);
    }

    // Event listener for import file input
    const importFileInput = document.getElementById('import-file-input');
    if (importFileInput) {
        importFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const fileName = file.name;
                
                if (fileName.endsWith('.json')) {
                    importSearchesFromJson(content);
                } else if (fileName.endsWith('.csv')) {
                    importSearchesFromCsv(content);
                } else {
                    alert('Unsupported file type. Please select a .json or .csv file.');
                }
                // Reset file input to allow re-importing the same file
                event.target.value = '';
            };
            reader.onerror = () => {
                alert('Failed to read file.');
                event.target.value = '';
            };
            reader.readAsText(file);
        });
    }

    loadSavedSearches(); // Load saved searches on initial page load
});