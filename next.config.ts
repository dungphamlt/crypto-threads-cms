import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    "@ckeditor/ckeditor5-react",
    "@ckeditor/ckeditor5-editor-classic",
    "@ckeditor/ckeditor5-essentials",
    "@ckeditor/ckeditor5-paragraph",
    "@ckeditor/ckeditor5-heading",
    "@ckeditor/ckeditor5-basic-styles",
    "@ckeditor/ckeditor5-link",
    "@ckeditor/ckeditor5-list",
    "@ckeditor/ckeditor5-indent",
    "@ckeditor/ckeditor5-block-quote",
    "@ckeditor/ckeditor5-table",
    "@ckeditor/ckeditor5-media-embed",
    "@ckeditor/ckeditor5-image",
    "@ckeditor/ckeditor5-font",
  ],
  webpack: (config) => {
    // Inline CKEditor SVG icons as raw string
    config.module.rules.push({
      test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
