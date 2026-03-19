import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.arki.spaceplanner',
  appName: 'Arki-3D',
  webDir: 'packages/web/out',
  server: {
    androidScheme: 'https',
    cleartext: false,
    // SPA fallback: unknown paths serve index.html (handled in android/app/src/main/assets/capacitor.config.json)
    errorPath: 'index.html',
  },
  android: {
    buildOptions: {
      releaseType: 'APK',
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#09090b',
    },
  },
}

export default config
