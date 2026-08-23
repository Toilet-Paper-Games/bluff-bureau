import "@fontsource-variable/archivo-narrow";
import "@fontsource-variable/source-sans-3";
import "./presentation/styles.css";

import { bootSurface } from "./platform/bootSurface";
import { PublicSurfaceRenderer } from "./presentation/publicSurface";

const root = document.getElementById("app");
if (!root) throw new Error("Missing host application root.");
bootSurface("host", "host-display", new PublicSurfaceRenderer(root));
