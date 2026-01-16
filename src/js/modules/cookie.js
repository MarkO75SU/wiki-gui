// src/js/modules/cookie.js
import { showToast } from './toast.js';
import { getTranslation } from './state.js';

export function initializeCookieBanner() {
    const cookieBanner = document.getElementById('cookie-banner');
    const cookieAccept = document.getElementById('cookie-accept');
    const cookieDecline = document.getElementById('cookie-decline');
    
    // If the banner is not on the page, do nothing.
    if (!cookieBanner) {
        return;
    }

    const cookieConsent = localStorage.getItem('cookieConsent');

    if (!cookieConsent) {
        cookieBanner.style.display = 'flex';
    }

    cookieAccept?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieBanner.style.display = 'none';
        // The toast and translation might not be available everywhere, so guard it.
        if (typeof showToast === 'function' && typeof getTranslation === 'function') {
            showToast(getTranslation('toast-cookies-accepted') || 'Cookies akzeptiert.');
        }
    });

    cookieDecline?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'declined');
        cookieBanner.style.display = 'none';
    });
}
