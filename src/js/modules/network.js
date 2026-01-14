// src/js/modules/network.js
import { getLanguage, getTranslation } from './state.js';
import { fetchArticlesCategories } from './api.js';

let lastAnalysisData = { nodes: [], edges: [] };

const VIZ_CONFIG = {
    canvasHeight: 800,
    layoutRadius: 200,
    centerY: 400,
    nodeBaseRadius: 8,
    maxNodeExtraRadius: 20,
    labelOffset: 12
};

export function exportNetworkAsJSON() {
    if (!lastAnalysisData.nodes.length) return;
    
    const data = JSON.stringify(lastAnalysisData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wiki-network-analysis-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function performNetworkAnalysis(allArticles) {
    const container = document.getElementById('network-analysis-container');
    const canvas = document.getElementById('network-canvas');
    const exportBtn = document.getElementById('export-network-button');
    const explanationEl = document.getElementById('network-explanation');
    
    if (!container || !canvas || !allArticles.length) return;

    const articles = allArticles.slice(0, 250);
    container.style.display = 'block';
    if (exportBtn) exportBtn.style.display = 'none';
    
    if (explanationEl) explanationEl.innerHTML = `<p><em>${getTranslation('network-loading', 'Analyse läuft...') }</em></p>`;

    try {
        const lang = getLanguage();
        const pages = await fetchArticlesCategories(articles.map(a => a.title), lang, (current, total) => {
            if (explanationEl) {
                explanationEl.innerHTML = `<p><em>${getTranslation('network-loading-progress', 'Lade Daten...', { current, total })}</em></p>`;
            }
        });

        if (exportBtn) exportBtn.style.display = 'inline-block';

        const nodes = prepareNodes(articles, pages);
        const edges = calculateEdges(nodes);
        
        const visualNodes = nodes
            .sort((a, b) => b.totalStrength - a.totalStrength)
            .slice(0, 10);
            
        layoutNodes(visualNodes, canvas.getBoundingClientRect().width);
        drawNetwork(canvas, visualNodes, edges);

        lastAnalysisData = { 
            timestamp: new Date().toISOString(),
            query: document.getElementById('search-query')?.value || 'N/A',
            resultsCount: articles.length,
            nodes: nodes.map(n => ({ title: n.title, strength: n.totalStrength, connections: n.connectionCount, categories: n.categories })),
            edges: edges.map(e => ({ from: e.from.title, to: e.to.title, strength: e.strength }))
        };

        updateNetworkExplanation(nodes, edges, visualNodes);

    } catch (err) {
        console.error('Network analysis error:', err);
    }
}

function prepareNodes(articles, pages) {
    return articles.map(article => {
        const pageId = Object.keys(pages).find(id => pages[id].title === article.title);
        const categories = pages[pageId]?.categories?.map(c => c.title) || [];
        return {
            title: article.title,
            categories: categories,
            totalStrength: 0,
            connectionCount: 0
        };
    });
}

function calculateEdges(nodes) {
    const edges = [];
    const n = nodes.length;
    for (let i = 0; i < n; i++) {
        const nodeI = nodes[i];
        const wordsI = nodeI.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        
        for (let j = i + 1; j < n; j++) {
            const nodeJ = nodes[j];
            const shared = nodeI.categories.filter(cat => nodeJ.categories.includes(cat));
            const wordsJ = nodeJ.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            const sharedWords = wordsI.filter(w => wordsJ.includes(w));

            const strength = shared.length + (sharedWords.length * 2);

            if (strength > 0) {
                nodeI.totalStrength += strength;
                nodeJ.totalStrength += strength;
                nodeI.connectionCount++;
                nodeJ.connectionCount++;
                edges.push({ from: nodeI, to: nodeJ, strength });
            }
        }
    }
    return edges;
}

function layoutNodes(nodes, width) {
    nodes.forEach((node, i) => {
        const angle = (i / nodes.length) * Math.PI * 2;
        const centerX = width / 2;
        const centerY = VIZ_CONFIG.centerY;
        const layoutRadius = VIZ_CONFIG.layoutRadius;
        node.x = centerX + Math.cos(angle) * layoutRadius;
        node.y = centerY + Math.sin(angle) * layoutRadius;
    });
}

function drawNetwork(canvas, visualNodes, allEdges) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = VIZ_CONFIG.canvasHeight * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const visualEdges = allEdges.filter(e => 
        visualNodes.includes(e.from) && visualNodes.includes(e.to)
    );

    visualEdges.forEach(edge => {
        const hue = Math.min(200 + (edge.strength * 10), 260); 
        const opacity = 0.2 + Math.min(edge.strength * 0.05, 0.4);
        ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${opacity})`;
        ctx.lineWidth = Math.max(1, Math.min(edge.strength, 5));
        ctx.beginPath();
        ctx.moveTo(edge.from.x, edge.from.y);
        ctx.lineTo(edge.to.x, edge.to.y);
        ctx.stroke();
    });

    visualNodes.forEach(node => {
        const radius = VIZ_CONFIG.nodeBaseRadius + Math.min(node.totalStrength, VIZ_CONFIG.maxNodeExtraRadius);
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#2563eb';
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px sans-serif';
        const dx = node.x - (rect.width / 2);
        const dy = node.y - VIZ_CONFIG.centerY;
        const angle = Math.atan2(dy, dx);
        const labelDist = radius + VIZ_CONFIG.labelOffset;
        const labelX = node.x + Math.cos(angle) * labelDist;
        const labelY = node.y + Math.sin(angle) * labelDist;
        
        if (Math.abs(Math.cos(angle)) < 0.3) {
            ctx.textAlign = 'center';
            ctx.textBaseline = Math.sin(angle) > 0 ? 'top' : 'bottom';
        } else {
            ctx.textAlign = Math.cos(angle) > 0 ? 'left' : 'right';
            ctx.textBaseline = 'middle';
        }

        const label = node.title.length > 25 ? node.title.slice(0, 22) + '..' : node.title;
        ctx.fillText(label, labelX, labelY);
    });
}

function updateNetworkExplanation(nodes, edges, visualNodes) {
    const explanationEl = document.getElementById('network-explanation');
    if (!explanationEl) return;

    const connectedNodes = nodes.filter(n => n.connectionCount > 0);
    const totalConnections = edges.length;
    
    // Find top categories
    const catCounts = {};
    nodes.forEach(n => {
        n.categories.forEach(c => {
            const cleanCat = c.replace(/^Kategorie:/i, '').replace(/^Category:/i, '');
            catCounts[cleanCat] = (catCounts[cleanCat] || 0) + 1;
        });
    });
    
    const topCats = Object.entries(catCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);

    // Strongest node overall
    const strongestNode = [...nodes].sort((a, b) => b.totalStrength - a.totalStrength)[0];

    const lang = getLanguage();
    const isDe = lang === 'de';
    
    const intro = getTranslation('network-explanation-intro', '', { total: nodes.length, connected: connectedNodes.length, edges: totalConnections });
    const interpretation = isDe ? "Die Visualisierung zeigt die 10 am stärksten vernetzten Themen." : "The visualization shows the top 10 most connected topics.";
    const central = getTranslation('network-explanation-central', '', { title: strongestNode?.title || 'N/A' });
    const categories = getTranslation('network-explanation-categories', '', { categories: topCats.join(', ') || 'N/A' });

    // Build Table
    let tableHtml = `
        <div style="margin-top: 2rem; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; color: var(--slate-300);">
                <thead>
                    <tr style="border-bottom: 1px solid var(--slate-700);">
                        <th style="text-align: left; padding: 0.5rem;">${isDe ? 'Artikel' : 'Article'}</th>
                        <th style="text-align: right; padding: 0.5rem;">${isDe ? 'Verknüpfungen' : 'Connections'}</th>
                        <th style="text-align: right; padding: 0.5rem;">${isDe ? 'Relevanz' : 'Strength'}</th>
                    </tr>
                </thead>
                <tbody>
                    ${nodes
                        .filter(n => n.connectionCount > 0 && n.totalStrength > 0)
                        .sort((a,b) => b.totalStrength - a.totalStrength)
                        .map(n => `
                        <tr style="border-bottom: 1px solid var(--slate-800); ${visualNodes.includes(n) ? 'background: var(--bg-element);' : ''}">
                            <td style="padding: 0.5rem;"><a href="https://${lang}.wikipedia.org/wiki/${encodeURIComponent(n.title)}" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: 600;">${n.title}</a></td>
                            <td style="text-align: right; padding: 0.5rem;">${n.connectionCount}</td>
                            <td style="text-align: right; padding: 0.5rem;">${n.totalStrength}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    explanationEl.innerHTML = `
        <p><strong>${intro}</strong></p>
        <p>${interpretation}</p>
        <p style="margin-left: 2rem; margin-top: 0.5rem;">${central}</p>
        <p style="margin-left: 2rem; margin-top: 0.25rem;">${categories}</p>
        ${tableHtml}
    `;
}