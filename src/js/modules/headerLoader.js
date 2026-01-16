import { fetchResource } from './api.js';

export async function loadHeader(placeholderId, headerHtmlPath) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        console.error(`Header placeholder with ID '${placeholderId}' not found.`);
        return;
    }

    try {
        const headerHtml = await fetchResource(`${headerHtmlPath}?v=${Date.now()}`);
        if (headerHtml) {
            placeholder.innerHTML = headerHtml;
        }
    } catch (error) {
        console.error("Could not load header:", error);
    }
}