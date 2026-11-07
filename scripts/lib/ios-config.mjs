export const photoPermissions = {
  NSCameraUsageDescription:'Ingredi uses the camera to photograph grocery receipts for ingredient extraction.',
  NSPhotoLibraryUsageDescription:'Choose a receipt photo to review and add ingredients to your fridge.',
  NSPhotoLibraryAddUsageDescription:'Ingredi can save a receipt photo only when you choose to save it.',
};
export const locationPermissions = {
  NSLocationWhenInUseUsageDescription:'When you tap Use my current location, Ingredi sends a one-time location to Photon to suggest your residence. Your confirmed building is saved on this device; your device location is not saved. Neighbors are simulated.',
  NSLocationAlwaysAndWhenInUseUsageDescription:'Ingredi only uses a one-time foreground location when you choose to find your residence. The lookup goes to Photon; only your confirmed building is saved on this device. No background tracking is used.',
};

export function ensurePhotoPermissions(plist) {
  for (const [key,description] of Object.entries({...photoPermissions,...locationPermissions})) {
    const pattern=new RegExp(`\\s*<key>${key}</key>\\s*<string>([\\s\\S]*?)</string>`,'g');
    const existing=[...plist.matchAll(pattern)][0]?.[1];
    plist=plist.replace(pattern,'');
    const rootEnd=plist.lastIndexOf('</dict>');
    if(rootEnd<0)throw new Error('The iOS Info.plist has no root dictionary.');
    const updated = key in locationPermissions && existing?.includes('when you open Nearby') ? description : existing || description;
    const entry=`\t<key>${key}</key>\n\t<string>${updated}</string>\n`;
    plist=plist.slice(0,rootEnd).trimEnd()+'\n'+entry+plist.slice(rootEnd);
  }
  return plist;
}
