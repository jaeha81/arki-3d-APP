import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

export const platform = Capacitor.getPlatform()

export const isNative = Capacitor.isNativePlatform()
export const isAndroid = platform === 'android'
export const isIos = platform === 'ios'
export const isWeb = platform === 'web'

export async function getPreference(key: string): Promise<string | null> {
  const { value } = await Preferences.get({ key })
  return value
}

export async function setPreference(key: string, value: string): Promise<void> {
  await Preferences.set({ key, value })
}

export async function removePreference(key: string): Promise<void> {
  await Preferences.remove({ key })
}

export async function clearPreferences(): Promise<void> {
  await Preferences.clear()
}
