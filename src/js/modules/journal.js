// src/js/modules/journal.js
import { getTranslation, getLanguage } from './state.js';
import { showToast } from './toast.js';
import { generateSearchString } from './search.js';

const STORAGE_KEY = 'wikiGuiJournal';

export function addJournalEntry(queryText, wikiUrl) {
    if (!queryText || !wikiUrl) return;
    
    // Wir speichern die aktuelle Browser-URL (mit allen Feld-Parametern)
    const appUrl = window.location.search;
    
    let journal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newEntry = {
        id: Date.now(),
        name: queryText,
        wikiUrl: wikiUrl,
        appUrl: appUrl, // Diese URL enthält alle ID=Wert Paare der Felder
        time: new Date().toLocaleString(getLanguage(), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
        favorite: false
    };

    journal = [newEntry, ...journal.filter(entry => entry.wikiUrl !== wikiUrl)];
    const favorites = journal.filter(e => e.favorite);
    const nonFavorites = journal.filter(e => !e.favorite).slice(0, 50);
    journal = [...favorites, ...nonFavorites];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(journal));
    renderJournal();
}

export function loadEntryIntoForm(appUrlSuffix) {
    if (!appUrlSuffix) return;
    const params = new URLSearchParams(appUrlSuffix);
    
    params.forEach((value, key) => {
        const el = document.getElementById(key);
        if (el) {
            if (el.type === 'checkbox') el.checked = value === 'true';
            else el.value = value;
        }
    });
    
    // UI aktualisieren (Vorschau-Badge etc.)
    generateSearchString();
    showToast(getTranslation('toast-loaded') || 'Suche in Felder geladen.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function toggleFavorite(id) {
    let journal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const entry = journal.find(e => e.id === id);
    if (entry) {
        entry.favorite = !entry.favorite;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(journal));
        renderJournal();
    }
}

export function deleteJournalEntry(id) {
    let journal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    journal = journal.filter(entry => entry.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journal));
    renderJournal();
}

export function editJournalName(id) {
    let journal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const entry = journal.find(e => e.id === id);
    if (!entry) return;
    const newName = prompt(getTranslation('history-edit-prompt') || 'Neuer Name:', entry.name);
    if (newName && newName.trim()) {
        entry.name = newName.trim();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(journal));
        renderJournal();
    }
}

export function clearJournal() {
    if (confirm(getTranslation('confirm-clear-journal') || 'Gesamtes Journal leeren?')) {
        localStorage.removeItem(STORAGE_KEY);
        renderJournal();
    }
}

export function renderJournal() {
    const list = document.getElementById('journal-list');
    if (!list) return;

    let journal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    journal.sort((a, b) => (a.favorite === b.favorite) ? b.id - a.id : (a.favorite ? -1 : 1));

    if (journal.length === 0) {
        list.innerHTML = `<li style="color: var(--slate-400); padding: 2rem; text-align: center;">${getTranslation('no-history')}</li>`;
        return;
    }

    list.innerHTML = journal.map((entry, index) => {
        const showSeparator = index > 0 && !entry.favorite && journal[index-1].favorite;
        const separatorHtml = showSeparator ? '<li style="border-bottom: 2px dashed var(--slate-200); margin: 1.5rem 0 1rem 0; list-style: none;"></li>' : '';

        return `
            ${separatorHtml}
            <li class="journal-item" style="display: flex; flex-direction: column; padding: 1rem; background: ${entry.favorite ? 'var(--primary-light)' : 'var(--slate-50)'}; border-radius: var(--radius-md); margin-bottom: 0.75rem; border: 1px solid ${entry.favorite ? 'var(--primary)' : 'var(--border)'}; border-left: 5px solid ${entry.favorite ? '#f59e0b' : 'var(--primary)'};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <div style="display: flex; gap: 0.75rem; align-items: flex-start; flex-grow: 1; overflow: hidden;">
                        <input type="checkbox" class="journal-checkbox" data-id="${entry.id}" style="margin-top: 0.3rem; width: 1.1rem; height: 1.1rem; cursor: pointer;">
                        <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            <strong style="color: var(--slate-900); font-size: 1rem;">${entry.name}</strong>
                            <br><small style="color: var(--slate-400); font-size: 0.75rem;">${entry.time}</small>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                        <button class="fav-journal-btn" data-id="${entry.id}" title="Favorit" style="background:none; border:none; cursor:pointer; font-size:1.1rem;">${entry.favorite ? '⭐' : '☆'}</button>
                        <button class="edit-journal-btn" data-id="${entry.id}" title="Bearbeiten" style="background:none; border:none; cursor:pointer; font-size:1rem;">✏️</button>
                        <button class="delete-journal-btn" data-id="${entry.id}" title="Löschen" style="background:none; border:none; cursor:pointer; font-size:1rem;">🗑️</button>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                    <button class="header-button load-to-fields-btn" data-appurl="${entry.appUrl || ''}" style="padding: 0.5rem; font-size: 0.8rem; background: var(--primary); border: none;">In Felder laden</button>
                    <button class="header-button open-wiki-btn" data-wikiurl="${entry.wikiUrl}" style="padding: 0.5rem; font-size: 0.8rem; background: var(--slate-800); border: none;">Wiki öffnen</button>
                </div>
            </li>
        `;
    }).join('');

    // Listeners
    list.querySelectorAll('.open-wiki-btn').forEach(btn => btn.onclick = (e) => window.open(e.target.dataset.wikiurl, '_blank'));
    list.querySelectorAll('.load-to-fields-btn').forEach(btn => btn.onclick = (e) => loadEntryIntoForm(e.target.dataset.appurl));
    list.querySelectorAll('.delete-journal-btn').forEach(btn => btn.onclick = (e) => deleteJournalEntry(Number(e.target.dataset.id)));
    list.querySelectorAll('.edit-journal-btn').forEach(btn => btn.onclick = (e) => editJournalName(Number(e.target.dataset.id)));
    list.querySelectorAll('.fav-journal-btn').forEach(btn => btn.onclick = (e) => toggleFavorite(Number(e.target.dataset.id)));
}
