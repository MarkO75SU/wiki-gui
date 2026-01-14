// src/js/modules/journal.js
import { getTranslation, getLanguage } from './state.js';
import { showToast } from './toast.js';
import { generateSearchString } from './search.js';

const STORAGE_KEY = 'wikiGuiJournal';

export function addJournalEntry(queryText, wikiUrl, shareParams) {
    if (!queryText || !wikiUrl) return;
    
    let journal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newEntry = {
        id: Date.now(),
        name: queryText,
        wikiUrl: wikiUrl,
        appUrl: shareParams || '', // Speichert den Zustand der App-Felder
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
    if (!appUrlSuffix) {
        showToast('Keine Detail-Daten für diesen alten Eintrag vorhanden.');
        return;
    }
    
    const params = new URLSearchParams(appUrlSuffix);
    let hasAdvanced = false;

    params.forEach((value, key) => {
        const el = document.getElementById(key);
        if (el) {
            if (el.type === 'checkbox') el.checked = value === 'true';
            else el.value = value;
            
            // Prüfen, ob ein erweitertes Feld befüllt wurde
            if (el.closest('[data-advanced]')) hasAdvanced = true;
        }
    });

    // Falls fortgeschrittene Felder genutzt wurden, Modus umschalten
    const advancedToggle = document.getElementById('advanced-mode-toggle');
    if (hasAdvanced && advancedToggle && !advancedToggle.checked) {
        advancedToggle.click(); // Simuliert Klick um UI-Logik (Klassen etc.) zu triggern
    }
    
    // UI aktualisieren (Vorschau-Badge etc.)
    generateSearchString();
    showToast(getTranslation('toast-loaded') || 'Suche in Felder geladen.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function deleteSelectedEntries() {
    const selectedIds = Array.from(document.querySelectorAll('.journal-checkbox:checked')).map(cb => Number(cb.dataset.id));
    if (selectedIds.length === 0) {
        showToast(getTranslation('alert-no-selection') || 'Nichts ausgewählt.');
        return;
    }
    if (confirm(getTranslation('journal-delete-selected') + '?')) {
        let journal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        journal = journal.filter(entry => !selectedIds.includes(entry.id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(journal));
        renderJournal();
        showToast(selectedIds.length + ' Einträge gelöscht.');
    }
}

export function exportJournal(format = 'json') {
    const selectedIds = Array.from(document.querySelectorAll('.journal-checkbox:checked')).map(cb => Number(cb.dataset.id));
    let journal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const dataToExport = selectedIds.length > 0 ? journal.filter(entry => selectedIds.includes(entry.id)) : journal;

    if (dataToExport.length === 0) {
        showToast(getTranslation('alert-no-searches-to-export') || 'Keine Daten.');
        return;
    }

    let content = '';
    let fileName = `wikigui-journal-${new Date().toISOString().slice(0,10)}`;
    if (format === 'json') {
        content = JSON.stringify(dataToExport, null, 2);
        fileName += '.json';
    } else {
        content = 'Name,URL,Datum\n' + dataToExport.map(e => `"${e.name}","${e.wikiUrl}","${e.time}"`).join('\n');
        fileName += '.csv';
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

export async function importJournal(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            let currentJournal = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const combined = [...importedData, ...currentJournal];
            const unique = Array.from(new Map(combined.map(item => [item.wikiUrl, item])).values());
            localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
            renderJournal();
            showToast('Import erfolgreich.');
        } catch (err) { showToast('Fehler beim Import.'); }
    };
    reader.readAsText(file);
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
    if (confirm(getTranslation('confirm-clear-journal') || 'Journal leeren?')) {
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
        list.innerHTML = `<li style="color: var(--text-secondary); padding: 3rem; text-align: center;">${getTranslation('no-history')}</li>`;
        return;
    }

    list.innerHTML = journal.map((entry, index) => {
        const showSep = index > 0 && !entry.favorite && journal[index-1].favorite;
        return `
            ${showSep ? '<li style="border-bottom: 1px solid var(--border-color); margin: 1rem 0; list-style: none;"></li>' : ''}
            <li class="journal-item ${entry.favorite ? 'is-favorite' : ''}">
                <div class="journal-item-header">
                    <div class="journal-item-info">
                        <input type="checkbox" class="journal-checkbox" data-id="${entry.id}">
                        <div class="journal-item-text">
                            <strong>${entry.name}</strong>
                            <small>${entry.time}</small>
                        </div>
                    </div>
                    <div class="journal-item-actions">
                        <button class="journal-item-btn fav-journal-btn" data-id="${entry.id}" title="Favorit">${entry.favorite ? '⭐' : '☆'}</button>
                        <button class="journal-item-btn edit-journal-btn" data-id="${entry.id}" title="Bearbeiten">✏️</button>
                        <button class="journal-item-btn delete-journal-btn" data-id="${entry.id}" title="Löschen">🗑️</button>
                    </div>
                </div>
                <div class="journal-item-footer">
                    <button class="btn-journal-action btn-journal-load load-to-fields-btn" data-appurl="${entry.appUrl || ''}">${getTranslation('load-button', 'Laden')}</button>
                    <button class="btn-journal-action btn-journal-wiki open-wiki-btn" data-wikiurl="${entry.wikiUrl}">${getTranslation('open-in-wikipedia-link', 'Wiki öffnen')}</button>
                </div>
            </li>
        `;
    }).join('');

    // Listeners
    list.querySelectorAll('.open-wiki-btn').forEach(btn => btn.onclick = () => window.open(btn.dataset.wikiurl, '_blank'));
    list.querySelectorAll('.load-to-fields-btn').forEach(btn => btn.onclick = () => loadEntryIntoForm(btn.dataset.appurl));
    list.querySelectorAll('.delete-journal-btn').forEach(btn => btn.onclick = () => deleteJournalEntry(Number(btn.dataset.id)));
    list.querySelectorAll('.edit-journal-btn').forEach(btn => btn.onclick = () => editJournalName(Number(btn.dataset.id)));
    list.querySelectorAll('.fav-journal-btn').forEach(btn => btn.onclick = () => toggleFavorite(Number(btn.dataset.id)));
}

document.getElementById('journal-select-all-checkbox')?.addEventListener('change', (e) => {
    document.querySelectorAll('.journal-checkbox').forEach(cb => cb.checked = e.target.checked);
});
