# WikiGUI Setup & SEO Checklist

Follow these steps to finalize your website for Google AdSense and Google Search Console (SEO).

## 1. Google AdSense (Passive Income)
**To be gathered:**
- [ ] **Publisher ID:** Sign up at [google.com/adsense](https://www.google.com/adsense). Once approved, you will get an ID like `ca-pub-1234567890123456`.

**Where to put it:**
- **`index.html`**: Find the line `<!-- <script async src="...client=ca-pub-YOUR_PUBLISHER_ID" ...></script> -->`. Remove the comments (`<!--` and `-->`) and replace `YOUR_PUBLISHER_ID` with your real ID.
- **`ads.txt`**: Open this file and replace `pub-0000000000000000` with your real ID.

**Important:**
- Enable the "GDPR Consent Message" in your AdSense Dashboard under "Privacy & messaging".

---

## 2. Google Search Console (SEO & Indexing)
**To be gathered:**
- [ ] **Verification Tag:** Add your site to [search.google.com](https://search.google.com/search-console). Google will give you an HTML tag like `<meta name="google-site-verification" content="..." />`.

**Where to put it:**
- **`index.html`**: Paste the meta tag inside the `<head>` section.

**Actions:**
- [ ] **Submit Sitemap:** In Search Console, go to "Sitemaps" and submit `sitemap.xml`.

---

## 3. SEO Metadata (Search Results)
**To be delivered (decide on these):**
- [ ] **English Description:** A short (150 chars) summary of the tool.
- [ ] **German Description:** A short (150 chars) summary in German.

**Where to put it:**
- **`translations/en.json`**: Update the `seo-description` key.
- **`translations/de.json`**: Update the `seo-description` key.

---

## 4. Legal (Impressum & Privacy)
**To be delivered:**
- [ ] **Contact Details:** Name, Address, E-Mail.

**Where to put it:**
- **`src/html/impressum_de.html`**: Replace all placeholders in `[brackets]`.
- **`src/html/impressum.html`**: Replace all placeholders in `[brackets]`.
- **`src/html/privacy_de.html`**: Replace the placeholders under "Hinweis zur verantwortlichen Stelle".

---

## 5. Deployment
- [ ] **Push changes:** Run `git add .`, `git commit -m "update site"`, and `git push origin main`.
- [ ] **Verify Live Site:** Check `https://MarkO75SU.github.io/wiki-gui/` to ensure everything looks correct.
