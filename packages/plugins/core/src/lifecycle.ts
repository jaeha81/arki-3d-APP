import { type PluginManifest, type PluginContext, type InstalledPlugin, PluginBase } from './types'
import { globalRegistry } from './registry'
import { usePluginStore } from './store'
import { loadBuiltinPlugin } from './loader'

const STORAGE_KEY = 'arki-plugins-state'

interface PersistedPluginState {
  installed: boolean
  active: boolean
}

type PersistedState = Record<string, PersistedPluginState>

async function readStorage(): Promise<PersistedState> {
  if (typeof window === 'undefined') return {}

  const raw = window.localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as PersistedState) : {}
}

async function writeStorage(state: PersistedState): Promise<void> {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

interface RegistryJson {
  version: string
  plugins: Array<PluginManifest & { downloadUrl: string; builtin: boolean }>
}

export class PluginLifecycleManager {
  private readonly store: typeof usePluginStore
  private readonly registry: typeof globalRegistry
  private pluginContext: PluginContext | null = null

  constructor(store: typeof usePluginStore, registry: typeof globalRegistry) {
    this.store = store
    this.registry = registry
  }

  setContext(ctx: PluginContext): void {
    this.pluginContext = ctx
  }

  async initBuiltinPlugins(): Promise<void> {
    const registryModule = await import('../../registry.json')
    const registryJson: RegistryJson = registryModule.default ?? registryModule
    const builtinEntries = registryJson.plugins.filter(p => p.builtin)

    for (const entry of builtinEntries) {
      if (this.registry.has(entry.id)) {
        continue
      }

      const manifest: PluginManifest = {
        id: entry.id,
        name: entry.name,
        version: entry.version,
        description: entry.description,
        capabilities: entry.capabilities,
        entry: entry.downloadUrl,
        minAppVersion: entry.minAppVersion,
        icon: entry.icon,
        permissions: entry.permissions,
      }

      const PluginClass = await loadBuiltinPlugin(entry.id)
      this.registry.register(manifest, PluginClass)

      const storeState = this.store.getState()
      if (!storeState.isInstalled(entry.id)) {
        const instance = new PluginClass()
        storeState.installPlugin(manifest, instance)
      }
    }
  }

  async activatePlugin(id: string): Promise<void> {
    if (!this.pluginContext) {
      throw new Error('PluginContext not set. Call setContext() before activating plugins.')
    }

    const storeState = this.store.getState()
    const plugin = storeState.getPlugin(id)

    if (!plugin) {
      throw new Error(`Plugin "${id}" is not installed`)
    }

    if (plugin.active) {
      return
    }

    await plugin.instance.activate(this.pluginContext)
    storeState.activatePlugin(id)
  }

  async deactivatePlugin(id: string): Promise<void> {
    const storeState = this.store.getState()
    const plugin = storeState.getPlugin(id)

    if (!plugin) {
      throw new Error(`Plugin "${id}" is not installed`)
    }

    if (!plugin.active) {
      return
    }

    await plugin.instance.deactivate()
    storeState.deactivatePlugin(id)
  }

  async restoreState(): Promise<void> {
    const persisted = await readStorage()
    const pluginIds = Object.keys(persisted)

    for (const id of pluginIds) {
      const entry = persisted[id]
      if (entry.installed && entry.active) {
        const storeState = this.store.getState()
        if (storeState.isInstalled(id)) {
          await this.activatePlugin(id)
        }
      }
    }
  }

  async persistState(): Promise<void> {
    const storeState = this.store.getState()
    const persisted: PersistedState = {}

    storeState.installedPlugins.forEach((plugin: InstalledPlugin, id: string) => {
      persisted[id] = {
        installed: true,
        active: plugin.active,
      }
    })

    await writeStorage(persisted)
  }
}

export const pluginLifecycle = new PluginLifecycleManager(usePluginStore, globalRegistry)
