# WikiGUI Roadmap

This document outlines the planned improvements and future features for WikiGUI, categorized by their impact on user experience and functionality.

## 1. Advanced Data Visualizations
- [ ] **Timeline View:** A visual timeline of search results based on their last modification date to identify historical trends or recent topic updates.
- [ ] **Interactive Knowledge Map:** Integration of a map (e.g., Leaflet) to show the geographical distribution of results when coordinates are available (from Geo Search).
- [ ] **Category Heatmap:** A treemap or heatmap showing how results are distributed across different Wikipedia categories to help narrow research focus.

## 2. Result Set Refinement
- [ ] **Smart Sorting:** Option to sort results by "Network Relevance" (calculated during analysis) rather than just Wikipedia’s default ranking.
- [ ] **In-Result Filtering:** A quick filter bar to hide/show articles by keyword within the current result set without triggering a new API request.

## 3. Enhanced Network Analysis
- [ ] **Connection Details:** Interactive nodes or table rows that show the specific **shared categories** or keywords that created the link.
- [ ] **Analysis Depth Control:** Toggle between "Quick" (50 articles) and "Deep" (up to 500 articles) analysis with a visible progress bar.

## 4. Usability & Academic Export
- [ ] **Citation Export:** Support for exporting results in **BibTeX**, **RIS**, or enhanced **CSV** formats for researchers using tools like Zotero or Mendeley.
- [ ] **Search "Drill-down":** A "Find Similar" button on results that automatically populates the search form with that article's categories and keywords.
- [ ] **Journal Sync:** Options to sync the Search Journal via local file or cloud-based storage (e.g., GitHub Gist).

## 5. "Discovery" Features
- [ ] **Topic Explorer ("Surprise Me"):** A feature that generates a high-quality, complex search query for a random, well-documented niche topic to demonstrate the power of the tool.

## 6. Stability & Maintenance (Ongoing)
- [ ] Centralize all API logic in `src/js/modules/api.js`.
- [ ] Improve error handling with user-friendly toast notifications for network failures.
- [ ] Standardize asynchronous patterns across all modules.
