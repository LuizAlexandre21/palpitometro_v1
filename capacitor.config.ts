import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.palpitometro.app',
  appName: 'Palpitômetro',
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
};

export default config;
