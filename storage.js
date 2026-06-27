/**
 * Storage Manager for resolving media links (Images and Audio)
 * Currently configured for Google Drive and local fallbacks.
 * Easily switch to Firebase, AWS S3, or Cloudflare R2 here.
 */
const StorageManager = {
    // Flag to choose storage provider: 'gdrive' | 's3' | 'firebase'
    provider: 'gdrive',

    /**
     * Resolves a photo URL based on the provider
     * @param {string} idOrUrl - The file ID or raw URL from customers.js
     * @returns {string} - The resolved direct download/stream URL
     */
    resolvePhoto: function(idOrUrl) {
        if (!idOrUrl) return 'images/photo.jpeg'; // Default fallback image
        
        if (this.provider === 'gdrive') {
            const id = this.extractId(idOrUrl);
            return `https://drive.google.com/uc?export=view&id=${id}`;
        }
        
        return idOrUrl;
    },

    /**
     * Resolves a voice URL based on the provider
     * @param {string} idOrUrl - The file ID or raw URL from customers.js
     * @returns {string} - The resolved direct download/stream URL
     */
    resolveVoice: function(idOrUrl) {
        if (!idOrUrl) return '';
        
        if (this.provider === 'gdrive') {
            const id = this.extractId(idOrUrl);
            return `https://drive.google.com/uc?export=download&id=${id}`;
        }
        
        return idOrUrl;
    },

    /**
     * Helper to safely extract Google Drive file ID from a URL or return it if it's already an ID.
     */
    extractId: function(url) {
        if (!url) return '';
        
        const drivePattern = /\/file\/d\/([a-zA-Z0-9_-]+)/;
        const openPattern = /[?&]id=([a-zA-Z0-9_-]+)/;
        
        if (drivePattern.test(url)) {
            return url.match(drivePattern)[1];
        } else if (openPattern.test(url)) {
            return url.match(openPattern)[1];
        } else if (url.includes('drive.google.com/uc')) {
            return url.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1] || url;
        }
        
        // Assume it's already a clean ID if it contains no slashes
        return url;
    }
};
