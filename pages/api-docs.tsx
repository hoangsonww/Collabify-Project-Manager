import { useEffect } from "react";

const SwaggerPage = () => {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.ui = SwaggerUIBundle({
      url: "/api/swagger",
      dom_id: "#swagger-ui",
      layout: "BaseLayout",
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      presets: [SwaggerUIBundle.presets.apis],
      docExpansion: "full",
    });
  }, []);

  return (
    <>
      <title>Collabify API Docs</title>
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist/swagger-ui.css"
      />
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
      <style>
        {`
          /* Force all text to be white and background to be pure black */
          body, .swagger-ui, .swagger-ui * {
            color: white !important;
            background-color: #000000 !important;
          }
          .swagger-ui .topbar {
            background-color: #000000 !important;
          }
          /* Ensure the Swagger container does not use fixed full height */
          #swagger-ui {
            margin-bottom: 5rem; /* extra space so Footer is pushed down */
          }
        `}
      </style>
      <div id="swagger-ui" />
    </>
  );
};

export default SwaggerPage;
