import type { PluginNormalization, PluginRegistration } from "./pluginContract";

const _registry: PluginRegistration[] = [];

/**
 * Register a plugin normalization implementation.
 * Future cycles (Apple Health, Oura, LabCorp, etc.) call this once at
 * module load to make their data available to the engine.
 */
export function registerPlugin(plugin: PluginNormalization): void {
  _registry.push({ plugin, registeredAt: new Date().toISOString() });
}

/**
 * Return a snapshot of all registered plugins.
 * The engine calls this when collecting tagged inputs from all sources.
 */
export function getActivePlugins(): PluginNormalization[] {
  return _registry.map((r) => r.plugin);
}
