import type { PluginManifest, PluginBase } from './types'

type PluginClass = new () => PluginBase

interface RegistryEntry {
  manifest: PluginManifest
  PluginClass: PluginClass
}

export class PluginRegistry {
  private readonly entries = new Map<string, RegistryEntry>()

  register(manifest: PluginManifest, PluginClass: PluginClass): void {
    if (this.entries.has(manifest.id)) {
      throw new Error(`Plugin "${manifest.id}" is already registered`)
    }
    this.entries.set(manifest.id, { manifest, PluginClass })
  }

  unregister(id: string): void {
    if (!this.entries.has(id)) {
      throw new Error(`Plugin "${id}" is not registered`)
    }
    this.entries.delete(id)
  }

  get(id: string): PluginClass | undefined {
    return this.entries.get(id)?.PluginClass
  }

  getManifest(id: string): PluginManifest | undefined {
    return this.entries.get(id)?.manifest
  }

  getAll(): PluginManifest[] {
    return Array.from(this.entries.values()).map(e => e.manifest)
  }

  has(id: string): boolean {
    return this.entries.has(id)
  }
}

export const globalRegistry = new PluginRegistry()
