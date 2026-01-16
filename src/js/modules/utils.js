// src/js/modules/utils.js

/**
 * A promisified version of navigator.geolocation.getCurrentPosition.
 * @returns {Promise<GeolocationPosition>} A promise that resolves with the position object.
 */
export function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            return reject(new Error('Geolocation is not supported by your browser.'));
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}
