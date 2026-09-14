import { defineAgent } from "eve";

/**
 * Learning Coach agent configuration (Milestone 2).
 *
 * - `model` routes through the Vercel AI Gateway, so only the server needs
 *   `AI_GATEWAY_API_KEY`. Nothing here is readable from the browser.
 * - `openai/gpt-5-mini` is the low-cost default for short tutoring replies.
 * - `defaultTools: false` keeps the agent least-privileged: no shell,
 *   file-write, web-browsing, connector, subagent, or scheduling capability.
 * - `limits` bounds every durable session so replies stay short and costs
 *   stay inside the AI Gateway free allowance.
 */
export default defineAgent({
  model: "openai/gpt-5-mini",
  defaultTools: false,
  limits: {
    maxInputTokensPerSession: 100_000,
    maxOutputTokensPerSession: 8_000,
    maxTokenCostUsdPerSession: 0.5,
  },
});
