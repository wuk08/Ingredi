import { validateImage, MAX_IMAGE_BYTES } from './domain.mjs';

export function isNativeApp() {
  return Boolean(globalThis.Capacitor?.isNativePlatform?.());
}

// Lazy imports keep the standalone web preview usable without a bundler.
export async function captureNativeReceipt(source, { loadCamera = () => import('@capacitor/camera'), fetchImage = (...args) => fetch(...args) } = {}) {
  if (!['camera','photos'].includes(source)) throw new Error('Choose the camera or photo library.');
  try {
    const { Camera } = await loadCamera();
    const options = { quality:85, targetWidth:1800, targetHeight:2400, correctOrientation:true };
    const photo = source === 'camera'
      ? await Camera.takePhoto({...options,saveToGallery:false})
      : (await Camera.chooseFromGallery({...options,allowMultipleSelection:false})).results?.[0];
    if (!photo) return null;
    if (!photo.webPath) throw new Error('The selected photo could not be opened.');
    const response = await fetchImage(photo.webPath);
    if (!response.ok) throw new Error('The selected photo could not be opened.');
    const blob = await response.blob();
    if (blob.size > MAX_IMAGE_BYTES) throw new Error('Choose a receipt photo under 6 MB.');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const mime = bytes[0]===255&&bytes[1]===216&&bytes[2]===255 ? 'image/jpeg'
      : bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71 ? 'image/png'
      : String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP' ? 'image/webp' : null;
    if (!mime) throw new Error('Choose a JPEG, PNG or WebP photo. You can also take a new receipt photo.');
    validateImage(bytes,mime);
    const extension = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[mime];
    return new File([blob],`receipt.${extension}`,{type:mime});
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error?.message || '');
    if (/cancel|no image picked|no media selected/i.test(message)) return null;
    if (/permission|denied|access.*(off|disable)/i.test(message)) throw new Error('Photo access is unavailable. Check Ingredi’s camera/photo permissions in Settings, or choose a receipt from Photos.');
    if (/camera.*(unavailable|not available|not supported)|simulator/i.test(message)) throw new Error('The camera is unavailable here. Choose a receipt from Photos instead.');
    if (/^(Choose |The selected photo |This file |Your receipt photo )/.test(message)) throw error;
    throw new Error('The receipt photo could not be opened. Choose another photo.');
  }
}
