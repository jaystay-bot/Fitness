// N=012: plugin registry singleton. Starts EMPTY this cycle and stays
// empty — no concrete plugin implementations ship until N=014+.
//
// The engine deliberately does NOT import this module. Engine purity is
// preserved: registries are read by API routes that orchestrate plugin
// ingestion in later cycles, transforming raw plugin output into
// TaggedUserInput entries that are then passed into `recommend(input,
// taggedInputs)`. The pure recommendation pipeline never sees the
// registry directly.

import {
  isPluginNormalization,
  type PluginNormalization,
} from "./pluginContract";

const registered: PluginNormalization[] = [];

export function registerPlugin(plugin: PluginNormalization): void {
  if (!isPluginNormalization(plugin)) {
    throw new TypeError(
      "registerPlugin: argument does not satisfy PluginNormalization contract",
    );
  }
  // Names are unique. Re-registering a plugin with the same name replaces
  // the prior entry — useful for hot-reload during plugin development.
  const existingIdx = registered.findIndex((p) => p.name === plugin.name);
  if (existingIdx >= 0) registered.splice(existingIdx, 1, plugin);
  else registered.push(plugin);
}

export function getActivePlugins(): ReadonlyArray<PluginNormalization> {
  return registered;
}

// Test-only helper. Not used by product code.
export function clearRegistry(): void {
  registered.length = 0;
}
