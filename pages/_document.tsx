import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Basic Meta Tags */}
        <meta charSet="UTF-8" />
        <meta
          name="description"
          content="The ultimate platform to seamlessly plan, organize, and collaborate on projects with your team – all in one place."
        />
        <meta
          name="keywords"
          content="project management, collaboration, team planning, productivity, organization"
        />
        <meta name="author" content="Son Nguyen" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Open Graph / Facebook Meta Tags */}
        <meta
          property="og:title"
          content="Collabify - Seamlessly Collaborate & Manage Projects"
        />
        <meta
          property="og:description"
          content="The ultimate platform to seamlessly plan, organize, and collaborate on projects with your team – all in one place."
        />
        <meta
          property="og:site_name"
          content="Collabify | Your Project Management Solution"
        />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="vi_VN" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://collabify-pm.vercel.app/" />
        <meta
          property="og:image"
          content="https://collabify-pm.vercel.app/apple-touch-icon.png"
        />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@hoangsonw" />
        <meta
          name="twitter:title"
          content="Collabify - Seamlessly Collaborate & Manage Projects"
        />
        <meta
          name="twitter:description"
          content="The ultimate platform to seamlessly plan, organize, and collaborate on projects with your team – all in one place."
        />
        <meta
          name="twitter:image"
          content="https://collabify-pm.vercel.app/apple-touch-icon.png"
        />

        {/* Manifest and Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Theme Color */}
        <meta name="theme-color" content="#000000" />
      </Head>
      <body className="bg-background text-foreground">
        <Main />

        {/* Google Analytics Scripts with next/script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JN7SCDKCQ3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JN7SCDKCQ3');
          `}
        </Script>

        <NextScript />
      </body>
    </Html>
  );
}
