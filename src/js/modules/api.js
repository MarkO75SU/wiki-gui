// src/js/modules/api.js

/**
 * Performs a search on the Wikipedia API.
 * @param {string} query - The search query string.
 * @param {string} lang - The language of the Wikipedia to search.
 * @returns {Promise<Array>} A promise that resolves to an array of search results.
 */
export async function performWikipediaSearch(query, lang) {
    const endpoint = `https://${lang}.wikipedia.org/w/api.php`;
    
    const apiParams = {
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        origin: '*',
        srinfo: 'totalhits', // Request totalhits for display
    };

    const params = new URLSearchParams(apiParams);
    const url = `${endpoint}?${params}`;
    console.log("Wikipedia Search API URL:", url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Return the full data object to access totalhits
        return data;
    } catch (error) {
        console.error("Error during Wikipedia search:", error);
        return { query: { search: [], searchinfo: { totalhits: 0 } } };
    }
}

/**
 * Fetches a brief summary for a given article title.
 * @param {string} title - The title of the article.
 * @param {string} lang - The language of the Wikipedia.
 * @returns {Promise<string>} A promise that resolves to the article summary.
 */
export async function fetchArticleSummary(title, lang) {
    const endpoint = `https://${lang}.wikipedia.org/w/api.php`;
    const params = new URLSearchParams({
        action: 'query',
        prop: 'extracts',
        exintro: true,
        explaintext: true,
        titles: title,
        format: 'json',
        origin: '*'
    });
    const url = `${endpoint}?${params}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        // Handle cases where the page doesn't exist or has no extract
        if (pageId === "-1" || !pages[pageId].extract) {
            return "No summary available.";
        }
        return pages[pageId].extract;
    } catch (error) {
        console.error(`Could not fetch summary for ${title}:`, error);
        return "Summary could not be retrieved.";
    }
}
