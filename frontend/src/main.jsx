import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { GetPlatform } from "../bindings/hyperion-downloader/services/configservice";

// Very very dangerous to have an async function here, but it was the best way to get the platform before rendering the app. It should be fast enough.
GetPlatform().then((platform) =>
    createRoot(document.getElementById("root")).render(
        <StrictMode>
            <App platform={platform} />
        </StrictMode>,
    ),
);
