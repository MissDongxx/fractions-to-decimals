/**
 * Google Analytics 4 (GA4) Integration Script
 *
 * Setup Instructions:
 * 1. Create a GA4 property at https://analytics.google.com/
 * 2. Get your Measurement ID (format: G-XXXXXXXXXX)
 * 3. Replace 'G-XXXXXXXXXX' below with your actual Measurement ID
 * 4. This script will automatically track page views on all pages
 */

// Replace this with your actual GA4 Measurement ID
const GA_MEASUREMENT_ID = 'G-VKX111M5M1';

// Initialize Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag() {
    window.dataLayer.push(arguments);
}

// Load GA4 script
(function() {
    // Don't load in development or if Measurement ID is not configured
    if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
        console.warn('Google Analytics: Measurement ID not configured. Please update analytics.js with your GA_MEASUREMENT_ID.');
        return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.onerror = function() {
        console.error('Google Analytics: Failed to load');
    };
    document.head.appendChild(script);

    // Configure GA4
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        // Send page view by default
        send_page_view: true,
        // Anonymize IP for privacy (GDPR compliance)
        anonymize_ip: true,
        // Disable ad personalization
        allow_google_signals: false
    });

    console.log('Google Analytics: Initialized with ID:', GA_MEASUREMENT_ID);
})();

/**
 * Helper function to track custom events
 * Usage: trackEvent('button_click', { button_name: 'convert', page: 'decimal-to-fraction' });
 *
 * @param {string} eventName - The name of the event
 * @param {object} eventParameters - Additional parameters to send with the event
 */
function trackEvent(eventName, eventParameters = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventParameters);
        console.log('Google Analytics: Event tracked', eventName, eventParameters);
    }
}
