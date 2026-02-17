import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Meta tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="FitKart Admin Dashboard - Manage users, products, orders, and platform analytics" />
        <meta name="keywords" content="FitKart, Admin, Dashboard, Fitness Tracking" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://admin.fitkart.club/" />
        <meta property="og:title" content="FitKart Admin Dashboard" />
        <meta property="og:description" content="Manage your FitKart fitness platform with powerful admin tools" />
        <meta property="og:image" content="/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://admin.fitkart.club/" />
        <meta property="twitter:title" content="FitKart Admin Dashboard" />
        <meta property="twitter:description" content="Manage your FitKart fitness platform with powerful admin tools" />
        <meta property="twitter:image" content="/og-image.png" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Analytics (if enabled) */}
        {process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true' && (
          <>
            {/* Google Analytics */}
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-XXXXXXXXXX');
                `,
              }}
            />
          </>
        )}
      </Head>
      <body className="bg-gray-900 text-white">
        <Main />
        <NextScript />

        {/* Error container for global notifications */}
        <div id="error-container" />
        <div id="modal-container" />
      </body>
    </Html>
  );
}
