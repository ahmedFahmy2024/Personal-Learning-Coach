import { withEve } from "eve/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

// Mounts the Eve agent in `agent/` at same-origin `/eve/v1/*` routes so the
// browser chat UI never crosses a CORS boundary or reads a server secret.
export default withEve(nextConfig);
