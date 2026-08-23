import "@fontsource-variable/archivo-narrow";
import "@fontsource-variable/source-sans-3";
import "./presentation/styles.css";

import { ControllerSurfaceRenderer } from "./presentation/controllerSurface";
import { PublicSurfaceRenderer } from "./presentation/publicSurface";
import { fixtureSnapshot, type GalleryScenario } from "./testing/fixtures";
import { staticCoordinator } from "./testing/staticCoordinator";

const params = new URLSearchParams(location.search);
const surface = params.get("surface") === "controller" || params.get("surface") === "spectator" ? params.get("surface")! : "host";
const scenario = (params.get("scenario") ?? "lobby") as GalleryScenario;
const playerId = params.get("player") ?? "p1";
const root = document.getElementById("app");
if (!root) throw new Error("Missing gallery root.");

const snapshot = fixtureSnapshot(scenario, surface as "host" | "controller" | "spectator", playerId);
const coordinator = staticCoordinator(snapshot);
if (surface === "controller") new ControllerSurfaceRenderer(root).connect(coordinator);
else new PublicSurfaceRenderer(root, surface === "spectator").connect(coordinator);

document.documentElement.dataset.gallerySurface = surface;
