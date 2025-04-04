import { Html, Head, Main, NextScript } from "next/document";

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
        <NextScript />
      </body>
    </Html>
  );
}
