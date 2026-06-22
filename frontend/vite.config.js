import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import wails from "@wailsio/runtime/plugins/vite";

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        host: "127.0.0.1",
        port: Number(process.env.WAILS_VITE_PORT) || 9245,
        strictPort: true,
    },
    plugins: [react(), wails("./bindings")],

    resolve: {
        alias: {
            // Use the local repo runtime sources instead of the published package
            "@wailsio/runtime": resolve(
                __dirname,
                "../../wails/v3/internal/runtime/desktop/@wailsio/runtime/src/index.ts",
            ),
        },
    },
});
