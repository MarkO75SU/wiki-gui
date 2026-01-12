// src/js/modules/network.js
import { getLanguage, getTranslation } from './state.js';

let lastAnalysisData = { nodes: [], edges: [] };

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
    console.log("Starting network analysis with", allArticles.length, "articles");
    const container = document.getElementById('network-analysis-container');
    const canvas = document.getElementById('network-canvas');
    const exportBtn = document.getElementById('export-network-button');
    if (!container || !canvas || !allArticles.length) {
        console.warn("Analysis aborted: Missing container, canvas or articles", { container, canvas, count: allArticles.length });
        return;
    }

    // Increase limit for a more comprehensive analysis
    const articles = allArticles.slice(0, 250);
    console.log("Analyzing subset of", articles.length, "articles");

    container.style.display = 'block';
    if (exportBtn) exportBtn.style.display = 'none'; // Hide export until done
    
    const explanationEl = document.getElementById('network-explanation');
    if (explanationEl) explanationEl.innerHTML = `<p><em>${getTranslation('network-loading', 'Analyse läuft...') }</em></p>`;

    const ctx = canvas.getContext('2d');
    
    // Improve resolution and size for readability
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 800 * dpr; // Increased height for better vertical spread
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const lang = getLanguage();
    
    // Wikipedia API limits titles per request to 50. We batch them.
    const batchSize = 50;
    const allPages = {};

    try {
        for (let i = 0; i < articles.length; i += batchSize) {
            const batchTitles = articles.slice(i, i + batchSize).map(a => a.title);
            console.log(`Processing batch ${i/batchSize + 1}, items ${i} to ${i + batchTitles.length}`);
            if (explanationEl) {
                explanationEl.innerHTML = `<p><em>${getTranslation('network-loading-progress', 'Lade Daten...', { current: i, total: articles.length })}</em></p>`;
            }
            const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent(batchTitles.join('|'))}&prop=categories&cllimit=50&clshow=!hidden`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.query && data.query.pages) {
                Object.assign(allPages, data.query.pages);
            }
        }
        console.log("All data batches loaded. Total pages:", Object.keys(allPages).length);
        if (exportBtn) exportBtn.style.display = 'inline-block';
        const pages = allPages;
        
        // 1. Prepare data (Initial strength calculation)
        const allNodes = articles.map((article, i) => {
            const pageId = Object.keys(pages).find(id => pages[id].title === article.title);
            const categories = pages[pageId]?.categories?.map(c => c.title) || [];
            
            return {
                title: article.title,
                categories: categories,
                totalStrength: 0,
                connectionCount: 0
            };
        });

        // 2. Calculate connections for ALL articles
        const allEdges = [];
        for (let i = 0; i < allNodes.length; i++) {
            for (let j = i + 1; j < allNodes.length; j++) {
                const shared = allNodes[i].categories.filter(cat => allNodes[j].categories.includes(cat));
                
                // Fallback: Keyword matching in title
                const wordsI = allNodes[i].title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
                const wordsJ = allNodes[j].title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
                const sharedWords = wordsI.filter(w => wordsJ.includes(w));

                const strength = shared.length + (sharedWords.length * 2);

                if (strength > 0) {
                    allNodes[i].totalStrength += strength;
                    allNodes[j].totalStrength += strength;
                    allNodes[i].connectionCount++;
                    allNodes[j].connectionCount++;
                    allEdges.push({ from: allNodes[i], to: allNodes[j], strength });
                }
            }
        }

        // 3. Filter for Top 10 for Visualization
        const visualNodes = [...allNodes]
            .sort((a, b) => b.totalStrength - a.totalStrength)
            .slice(0, 10);
        
        // Recalculate positions for visual nodes
        visualNodes.forEach((node, i) => {
            const angle = (i / visualNodes.length) * Math.PI * 2;
            const centerX = rect.width / 2;
            const centerY = 400;
            const layoutRadius = 200; // Fixed radius for small set
            node.x = centerX + Math.cos(angle) * layoutRadius;
            node.y = centerY + Math.sin(angle) * layoutRadius;
        });

        const visualEdges = allEdges.filter(e => 
            visualNodes.includes(e.from) && visualNodes.includes(e.to)
        );

        // 4. Draw Edges (Visual subset)
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

        // 5. Draw Nodes (Visual subset)
        visualNodes.forEach(node => {
            const radius = 8 + Math.min(node.totalStrength, 20);
            
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#2563eb';
            ctx.fillStyle = '#2563eb';
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            
            // Labels for top 10 are always shown and centered
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            const label = node.title.length > 25 ? node.title.slice(0, 22) + '..' : node.title;
            ctx.fillText(label, node.x, node.y + radius + 18);
        });

        // Save for export
        lastAnalysisData = { 
            timestamp: new Date().toISOString(),
            query: document.getElementById('search-query')?.value || 'N/A',
            resultsCount: articles.length,
            nodes: allNodes.map(n => ({ title: n.title, strength: n.totalStrength, connections: n.connectionCount, categories: n.categories })),
            edges: allEdges.map(e => ({ from: e.from.title, to: e.to.title, strength: e.strength }))
        };
        console.log("Analysis complete. Visual Nodes:", visualNodes.length, "Total analyzed:", allNodes.length);

        // 6. Dynamic Explanation & Table
        updateNetworkExplanation(allNodes, allEdges, visualNodes);

    } catch (err) {
        console.error('Network analysis error:', err);
    }
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

    const isDe = getLanguage() === 'de';
    
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
                    ${nodes.sort((a,b) => b.totalStrength - a.totalStrength).map(n => `
                        <tr style="border-bottom: 1px solid var(--slate-800); ${visualNodes.includes(n) ? 'background: rgba(37, 99, 235, 0.1);' : ''}">
                            <td style="padding: 0.5rem;">${n.title}</td>
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
        <ul>
            <li>${central}</li>
            <li>${categories}</li>
        </ul>
        ${tableHtml}
    `;
}