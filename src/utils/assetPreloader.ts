import { Asset } from 'expo-asset';

/**
 * List of all local image & SVG assets used throughout the Saparu application.
 * Preloading these assets into memory at app launch prevents runtime decoding lag,
 * frame drops, and Application Not Responding (ANR) lockups.
 */
export const APP_ASSETS = [
  // App Branding & Core Icons
  require('@/assets/images/splash-icon.png'),
  require('@/assets/images/icon.png'),
  require('@/assets/images/favicon.png'),
  
  // UI Backgrounds & Layout SVG Assets
  require('@/assets/images/bg-top.svg'),
  require('@/assets/images/bg-bottom.svg'),
  require('@/assets/mascot/ImgBG.svg'),
  require('@/assets/mascot/underbg.svg'),
  
  // Doctor Mascots & Avatars
  require('@/assets/mascot/dr bunga 1.svg'),
  require('@/assets/mascot/dr daffa 1.svg'),
  require('@/assets/mascot/dr erland 1.svg'),
  require('@/assets/mascot/dr ibanez.svg'),

  // Pharmacy & Medication Mascots
  require('@/assets/mascot/Apotik.svg'),
  require('@/assets/mascot/Apotik2.svg'),
  require('@/assets/mascot/Apotik3.svg'),
  require('@/assets/mascot/Apotik4.svg'),
  require('@/assets/mascot/mascotobat.svg'),
  require('@/assets/mascot/mascotobat2.svg'),
  require('@/assets/mascot/inhaler.svg'),
  require('@/assets/mascot/inhaler_full.png'),

  // Character Mascots & Illustrations
  require('@/assets/images/axolot.svg'),
  require('@/assets/mascot/axolotlcorner.svg'),
  require('@/assets/mascot/SayHi.svg'),
  require('@/assets/mascot/NameMascot.svg'),
  require('@/assets/mascot/SaparuLogo.svg'),
  require('@/assets/mascot/SaparuLogo.png'),
  require('@/assets/mascot/Detector.svg'),
  require('@/assets/mascot/finger.svg'),
  require('@/assets/images/Effect.svg'),
  require('@/assets/mascot/Gender.svg'),
  require('@/assets/mascot/Tinggi.svg'),
  require('@/assets/mascot/Berat.svg'),
  require('@/assets/mascot/Perempuan.svg'),
  require('@/assets/mascot/Laki Laki.svg'),
  require('@/assets/mascot/left.svg'),
  require('@/assets/mascot/right.svg'),
  require('@/assets/images/female.svg'),
  require('@/assets/images/male.svg'),
  require('@/assets/images/user.svg'),
  require('@/assets/images/pass.svg'),
  require('@/assets/images/eye.svg'),
];

/**
 * Asynchronously preloads and caches all registered local image/SVG assets.
 */
export async function preloadAppAssets(): Promise<void> {
  try {
    const assetPromises = APP_ASSETS.map((asset) => Asset.loadAsync(asset));
    await Promise.all(assetPromises);
  } catch (error) {
    // Non-blocking catch to ensure app continues even if a single asset fails
    console.warn('[AssetPreloader] Warning during asset preloading:', error);
  }
}
