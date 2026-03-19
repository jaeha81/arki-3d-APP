import { create } from 'zustand'
import type { InstalledPlugin, PluginBase, PluginManifest } from './types'

interface PluginStoreState {
  installedPlugins: Map<string, InstalledPlugin>
  installPlugin(manifest: PluginManifest, instance: PluginBase): void
  uninstallPlugin(id: string): void
  activatePlugin(id: string): void
  deactivatePlugin(id: string): void
  isInstalled(id: string): boolean
  getPlugin(id: string): InstalledPlugin | undefined
}

export const usePluginStore = create<PluginStoreState>((set, get) => ({
  installedPlugins: new Map(),

  installPlugin(manifest, instance) {
    set(state => {
      const next = new Map(state.installedPlugins)
      next.set(manifest.id, {
        manifest,
        instance,
        active: false,
        installedAt: new Date().toISOString(),
      })
      return { installedPlugins: next }
    })
  },

  uninstallPlugin(id) {
    set(state => {
      const next = new Map(state.installedPlugins)
      next.delete(id)
      return { installedPlugins: next }
    })
  },

  activatePlugin(id) {
    set(state => {
      const plugin = state.installedPlugins.get(id)
      if (!plugin) return state
      const next = new Map(state.installedPlugins)
      next.set(id, { ...plugin, active: true })
      return { installedPlugins: next }
    })
  },

  deactivatePlugin(id) {
    set(state => {
      const plugin = state.installedPlugins.get(id)
      if (!plugin) return state
      const next = new Map(state.installedPlugins)
      next.set(id, { ...plugin, active: false })
      return { installedPlugins: next }
    })
  },

  isInstalled(id) {
    return get().installedPlugins.has(id)
  },

  getPlugin(id) {
    return get().installedPlugins.get(id)
  },
}))
