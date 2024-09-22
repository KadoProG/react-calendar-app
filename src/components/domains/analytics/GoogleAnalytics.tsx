import React from 'react';

const gaTrackingId = import.meta.env.VITE_GA_TRACKING_ID;

export const GoogleAnalytics = () => {
  React.useEffect(() => {
    if (gaTrackingId && gaTrackingId !== '') {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`;
      document.head.appendChild(script);

      const inlineScript = document.createElement('script');
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', '${gaTrackingId}');
      `;
      document.head.appendChild(inlineScript);
    }
  }, []);

  return null;
};
