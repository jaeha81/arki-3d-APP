import type React from 'react'

// ─── FloorPlan 타입 (engine에서 가져오는 것처럼 로컬 정의) ───────────────────

export interface Point2D {
  x: number
  y: number
}

export interface Wall {
  id: string
  start: Point2D
  end: Point2D
  thickness: number
  height: number
  materialInner: string
  materialOuter: string
}

export interface Door {
  id: string
  wallId: string
  position: number
  width: number
  height: number
  swingAngle: number
  openDirection: 'left' | 'right'
}

export interface WindowElement {
  id: string
  wallId: string
  position: number
  width: number
  height: number
  sillHeight: number
}

export interface Room {
  id: string
  name: string
  wallIds: string[]
  area: number
  color?: string
}

export interface FurniturePlacement {
  id: string
  assetId: string
  position: Point2D
  rotation: number
  scaleX: number
  scaleY: number
}

export interface FloorPlan {
  version: string
  metadata: {
    name: string
    unit: 'mm'
    gridSize: number
  }
  walls: Wall[]
  doors: Door[]
  windows: WindowElement[]
  rooms: Room[]
  furniture: FurniturePlacement[]
}

// ─── Plugin Types ────────────────────────────────────────────────────────────

export type PluginCapability = 'panel' | 'tool' | 'ai-agent' | 'export' | 'asset-provider'

export type PluginPermission =
  | 'api:chat'
  | 'api:estimate'
  | 'api:asset'
  | 'scene:read'
  | 'scene:write'
  | 'storage:read'
  | 'storage:write'

export interface PluginManifest {
  id: string
  name: string
  version: string
  description: string
  capabilities: PluginCapability[]
  entry: string
  minAppVersion: string
  icon?: string // lucide 아이콘명
  permissions: PluginPermission[]
}

// ─── Panel Options ────────────────────────────────────────────────────────────

export type PanelPosition = 'left' | 'right' | 'bottom' | 'floating'

export interface PanelOptions {
  title: string
  position?: PanelPosition
  width?: number
  height?: number
  defaultOpen?: boolean
}

// ─── Scene API ────────────────────────────────────────────────────────────────

export interface SceneAPI {
  getFloorPlan(): FloorPlan
  updateFloorPlan(patch: Partial<FloorPlan>): void
  getFurniture(): FurniturePlacement[]
  addFurniture(item: FurniturePlacement): void
}

// ─── UI API ──────────────────────────────────────────────────────────────────

export type ToastType = 'info' | 'success' | 'error'

export interface UiAPI {
  registerPanel(id: string, component: React.ComponentType, options: PanelOptions): void
  unregisterPanel(id: string): void
  showToast(message: string, type?: ToastType): void
}

// ─── API Client ───────────────────────────────────────────────────────────────

export interface ApiClient {
  get<T>(path: string): Promise<T>
  post<T>(path: string, body: unknown): Promise<T>
}

// ─── Plugin Context ───────────────────────────────────────────────────────────

export interface PluginContext {
  scene: SceneAPI
  api: ApiClient
  ui: UiAPI
}

// ─── Plugin Base ──────────────────────────────────────────────────────────────

export abstract class PluginBase {
  abstract readonly manifest: PluginManifest
  protected ctx!: PluginContext

  async activate(ctx: PluginContext): Promise<void> {
    this.ctx = ctx
  }

  async deactivate(): Promise<void> {}
}

// ─── Installed Plugin ─────────────────────────────────────────────────────────

export interface InstalledPlugin {
  manifest: PluginManifest
  instance: PluginBase
  active: boolean
  installedAt: string
}
