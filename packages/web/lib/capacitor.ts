/**
 * @deprecated Use lib/tauri-bridge.ts for new code.
 * This file is kept for migration compatibility.
 * Project migrated from Capacitor (Android) to Tauri (Desktop).
 */
export { isTauri as isNativeApp, storeGet, storeSet, storeDelete } from './tauri-bridge'

export const isAndroid = () => false
export const isIOS = () => false
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false
  return '__TAURI__' in window
}
