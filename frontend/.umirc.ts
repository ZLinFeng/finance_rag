import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { 
      path: "/", 
      component: "@/layouts/layout", 
      routes: [
      {
        path: "/", component: "@/pages/index",
      },
      {
        path: "ner", component: "@/pages/ner",
      },
      {
        path: "docs", component: "@/pages/docs",
      },
      {
        path: "std", component: "@/pages/std",
      }
    ] 
  },
  ],

  proxy: {
    "/api/": {
      target: "https://proapi.azurewebsites.net",
      changeOrigin: true,
      pathRewrite: { "^/api": "" },
    },
  },
  npmClient: "pnpm",
  tailwindcss: {},
  plugins: ["@umijs/plugins/dist/tailwindcss"],
});
