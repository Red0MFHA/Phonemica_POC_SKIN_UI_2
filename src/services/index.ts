// Engine client singleton for this skin.
//
// POC: the mock client is used. In production, swap in a real HTTP client that
// implements the SAME `EngineClient` interface (see engineClient.ts) driven by
// NEXT_PUBLIC_ENGINE_API_URL — no UI component changes required.
//
// This interface is intentionally IDENTICAL between Jungle Quest and Cosmic Rescue.

import { MockEngineClient } from "./mockEngineClient";

export const engineClient = new MockEngineClient();

export type { EngineClient } from "./engineClient";
