import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MetaTags = () => {
    const location = useLocation();

    useEffect(() => {
        // Update Open Graph URL
        const ogUrlMeta = document.querySelector('meta[property="og:url"]');
        if (ogUrlMeta) {
            ogUrlMeta.setAttribute('content', window.location.origin + location.pathname);
        }

        // Update Open Graph Image
        const ogImageMeta = document.querySelector('meta[property="og:image"]');
        if (ogImageMeta) {
            ogImageMeta.setAttribute('content', window.location.origin + '/static/assets/images/logo-og.png');
        }

        // Update Twitter Image
        const twitterImageMeta = document.querySelector('meta[property="twitter:image"]');
        if (twitterImageMeta) {
            twitterImageMeta.setAttribute('content', window.location.origin + '/static/assets/images/logo-og.png');
        }
    }, [location]);

    return null;
};

export default MetaTags;
