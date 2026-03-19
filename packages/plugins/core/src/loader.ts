import type { PluginBase } from './types'

type PluginModule = { default: new () => PluginBase }
type PluginClass = new () => PluginBase

export class PluginLoadError extends Error {
  constructor(
    message: string,
    public readonly pluginId: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'PluginLoadError'
  }
}

function assertValidPluginModule(mod: unknown, pluginId: string): asserts mod is PluginModule {
  if (
    typeof mod !== 'object' ||
    mod === null ||
    !('default' in mod) ||
    typeof (mod as Record<string, unknown>).default !== 'function'
  ) {
    throw new PluginLoadError(`Plugin "${pluginId}" module must export a default class`, pluginId)
  }
}

export async function loadPlugin(pluginId: string, url: string): Promise<PluginClass> {
  let mod: unknown
  try {
    mod = await import(/* @vite-ignore */ url)
  } catch (cause) {
    throw new PluginLoadError(`Failed to load plugin "${pluginId}" from "${url}"`, pluginId, cause)
  }

  assertValidPluginModule(mod, pluginId)
  return mod.default
}

const BUILTIN_PLUGIN_IDS = new Set(['ai-design', 'estimation', 'pdf-export', 'furniture-lib'])

export async function loadBuiltinPlugin(pluginId: string): Promise<PluginClass> {
  if (!BUILTIN_PLUGIN_IDS.has(pluginId)) {
    throw new PluginLoadError(`Unknown builtin plugin "${pluginId}"`, pluginId)
  }

  const url = `../../../${pluginId}/src/index`
  return loadPlugin(pluginId, url)
}
