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
        
        // 1. Prepare data
        const nodes = articles.map((article, i) => {
            const pageId = Object.keys(pages).find(id => pages[id].title === article.title);
            const categories = pages[pageId]?.categories?.map(c => c.title) || [];
            
            // Circular layout with larger radius
            const angle = (i / articles.length) * Math.PI * 2;
            const centerX = rect.width / 2;
            const centerY = 400; // Centered in the new 800px height
            const layoutRadius = Math.min(centerX, centerY) - 120;
            
            return {
                title: article.title,
                categories: categories,
                x: centerX + Math.cos(angle) * layoutRadius,
                y: centerY + Math.sin(angle) * layoutRadius,
                angle: angle,
                totalStrength: 0,
                connectionCount: 0
            };
        });

        // 2. Calculate connections (Shared Categories)
        const edges = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const shared = nodes[i].categories.filter(cat => nodes[j].categories.includes(cat));
                
                // Fallback: Keyword matching in title
                const wordsI = nodes[i].title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
                const wordsJ = nodes[j].title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
                const sharedWords = wordsI.filter(w => wordsJ.includes(w));

                const strength = shared.length + (sharedWords.length * 2);

                if (strength > 0) {
                    nodes[i].totalStrength += strength;
                    nodes[j].totalStrength += strength;
                    nodes[i].connectionCount++;
                    nodes[j].connectionCount++;
                    edges.push({ from: nodes[i], to: nodes[j], strength });
                }
            }
        }

        // 3. Draw Edges
        edges.forEach(edge => {
            const hue = Math.min(200 + (edge.strength * 10), 260); 
            // Drastically reduced opacity for many edges to keep it clean
            const baseOpacity = nodes.length > 100 ? 0.03 : 0.1;
            const opacity = baseOpacity + Math.min(edge.strength * 0.02, 0.2);
            ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${opacity})`;
            ctx.lineWidth = Math.max(0.2, Math.min(edge.strength / 3, 3));
            
            ctx.beginPath();
            ctx.moveTo(edge.from.x, edge.from.y);
            ctx.lineTo(edge.to.x, edge.to.y);
            ctx.stroke();
        });

        // 4. Draw Nodes
        nodes.forEach(node => {
            const radius = nodes.length > 100 ? 2 + Math.min(node.totalStrength, 10) : 3 + Math.min(node.totalStrength, 15);
            
            ctx.shadowBlur = node.totalStrength > 0 ? 5 : 0;
            ctx.shadowColor = '#2563eb';
            
            ctx.fillStyle = node.totalStrength > 0 ? '#2563eb' : '#64748b';
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            
            // Smarter adaptive label logic
            let showLabel = false;
            const labelThreshold = nodes.length > 150 ? 12 : (nodes.length > 80 ? 6 : 2);
            
            if (nodes.length <= 20) showLabel = true;
            else if (node.totalStrength > labelThreshold) showLabel = true;

            if (showLabel) {
                ctx.fillStyle = 'white';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = node.x > (rect.width / 2) ? 'left' : 'right';
                const label = node.title.length > 20 ? node.title.slice(0, 18) + '..' : node.title;
                const offset = radius + 8;
                const labelX = node.x + (node.x > (rect.width / 2) ? offset : -offset);
                ctx.fillText(label, labelX, node.y + 3);
            }
        });

        // Save for export
        lastAnalysisData = { 
            timestamp: new Date().toISOString(),
            query: document.getElementById('search-query')?.value || 'N/A',
            resultsCount: articles.length,
            nodes: nodes.map(n => ({ title: n.title, strength: n.totalStrength, connections: n.connectionCount, categories: n.categories })),
            edges: edges.map(e => ({ from: e.from.title, to: e.to.title, strength: e.strength }))
        };
        console.log("Analysis complete. Nodes:", nodes.length, "Edges:", edges.length);

        // 5. Dynamic Explanation
        updateNetworkExplanation(nodes, edges);

    } catch (err) {
        console.error('Network analysis error:', err);
    }
}

function updateNetworkExplanation(nodes, edges) {
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

    // Find strongest node
    const strongestNode = [...nodes].sort((a, b) => b.totalStrength - a.totalStrength)[0];

    const intro = getTranslation('network-explanation-intro', '', { total: nodes.length, connected: connectedNodes.length, edges: totalConnections });
    const interpretation = getTranslation('network-explanation-interpretation');
    const central = getTranslation('network-explanation-central', '', { title: strongestNode?.title || 'N/A' });
    const categories = getTranslation('network-explanation-categories', '', { categories: topCats.join(', ') || 'N/A' });
    const note = getTranslation('network-explanation-note');

    explanationEl.innerHTML = `
        <p><strong>${intro}</strong></p>
        <p>${interpretation}</p>
        <ul>
            <li>${central}</li>
            <li>${categories}</li>
        </ul>
        <p><small>${note}</small></p>
    `;
}