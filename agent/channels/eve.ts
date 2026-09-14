import { localDev, none } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

/**
 * Browser channel for the Learning Coach (Milestone 2).
 *
 * The browser is the only agent channel. The MVP has no accounts by design
 * (see `docs/project-overview.md`), so anonymous traffic is admitted
 * explicitly with `none()`; `localDev()` authenticates the synthetic local
 * principal while running `next dev`. Do not use `none()` for an agent that
 * handles private or production data.
 */
export default eveChannel({
  auth: [localDev(), none()],
});
