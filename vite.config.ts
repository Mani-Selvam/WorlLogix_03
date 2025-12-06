import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const apiUrl =
        "https://worllogix-03.onrender.com" || "http://localhost:3000";
    const isExternalApi = !!apiUrl;

    const proxyConfig: Record<string, any> = {
        "/api": {
            target: apiUrl,
            changeOrigin: true,
            secure: false,
        },
        "/ws": {
            target: apiUrl,
            changeOrigin: true,
            secure: false,
        },
    };

    if (!isExternalApi) {
        proxyConfig["/ws"] = {
            target: "ws://localhost:3000",
            ws: true,
        };
    }

    return {
        plugins: [
            react(),
            runtimeErrorOverlay(),
            ...(process.env.NODE_ENV !== "production" &&
            process.env.REPL_ID !== undefined
                ? [
                      import("@replit/vite-plugin-cartographer").then((m) =>
                          m.cartographer()
                      ),
                      import("@replit/vite-plugin-dev-banner").then((m) =>
                          m.devBanner()
                      ),
                  ]
                : []),
        ],
        resolve: {
            alias: {
                "@": path.resolve(import.meta.dirname, "client", "src"),
                "@shared": path.resolve(import.meta.dirname, "shared"),
                "@assets": path.resolve(import.meta.dirname, "attached_assets"),
            },
        },
        root: path.resolve(import.meta.dirname, "client"),
        build: {
            outDir: path.resolve(import.meta.dirname, "dist"),
            emptyOutDir: true,
        },
        server: {
            host: "0.0.0.0",
            port: 5000,
            strictPort: true,
            hmr:
                mode === "production"
                    ? {
                          protocol: "wss",
                          clientPort: 443,
                      }
                    : true,

            fs: {
                strict: true,
                deny: ["**/.*"],
            },
            proxy: proxyConfig,
            allowedHosts: true,
        },
    };
});
