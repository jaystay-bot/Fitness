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
import { appleHealthPlugin } from "./plugins/appleHealth";
import { amazonPlugin } from "./plugins/amazon";
import { telehealthPlugin } from "./plugins/telehealth";
import type { ActionPluginNormalization } from "./types";

// N=014: Apple Health is the first plugin to register against the locked
// PluginNormalization contract. Subsequent cycles add more plugins by
// importing them here (or by calling registerPlugin at runtime). The
// engine never reads this registry directly — engine purity preserved.
//
// N=015: Amazon registers as the second entry — the first action plugin.
// Action plugins implement an outbound URL surface (ActionPluginNormalization)
// rather than the inbound TaggedUserInput[] surface signal plugins emit.
// The registry now holds a discriminated union; the runtime guard
// `isPluginNormalization` continues to validate ONLY the signal variant
// (action plugins skip the guard since their shape is different and the
// `kind: "action"` discriminator narrows the union at the type level).
//
// N=016: telehealth registers as the third entry — the second action plugin.
// Confirms the contract supports multiple action plugins simultaneously
// without further contract modification.

export type RegisteredPlugin = PluginNormalization | ActionPluginNormalization;

const registered: RegisteredPlugin[] = [
  appleHealthPlugin,
  amazonPlugin,
  telehealthPlugin,
];

export function registerPlugin(plugin: RegisteredPlugin): void {
  // Signal plugins are validated at runtime by the N=012 type guard.
  // Action plugins are checked structurally: name + kind discriminator +
  // generateActionUrl function.
  const isSignal = isPluginNormalization(plugin as PluginNormalization);
  const isAction =
    typeof plugin === "object" &&
    plugin !== null &&
    typeof (plugin as ActionPluginNormalization).name === "string" &&
    (plugin as ActionPluginNormalization).kind === "action" &&
    typeof (plugin as ActionPluginNormalization).generateActionUrl === "function";
  if (!isSignal && !isAction) {
    throw new TypeError(
      "registerPlugin: argument does not satisfy PluginNormalization or ActionPluginNormalization contract",
    );
  }
  // Names are unique. Re-registering a plugin with the same name replaces
  // the prior entry — useful for hot-reload during plugin development.
  const existingIdx = registered.findIndex((p) => p.name === plugin.name);
  if (existingIdx >= 0) registered.splice(existingIdx, 1, plugin);
  else registered.push(plugin);
}

export function getActivePlugins(): ReadonlyArray<RegisteredPlugin> {
  return registered;
}

// Test-only helper. Not used by product code.
export function clearRegistry(): void {
  registered.length = 0;
}
