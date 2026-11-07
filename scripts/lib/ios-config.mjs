export const photoPermissions = {
  NSCameraUsageDescription:'Ingredi uses the camera to photograph grocery receipts for ingredient extraction.',
  NSPhotoLibraryUsageDescription:'Choose a receipt photo to review and add ingredients to your fridge.',
  NSPhotoLibraryAddUsageDescription:'Ingredi can save a receipt photo only when you choose to save it.',
};
export const locationPermissions = {
  NSLocationWhenInUseUsageDescription:'Ingredi uses your location when you tap Use my location to center the Nearby map. Demo posts remain in Ann Arbor.',
  NSLocationAlwaysAndWhenInUseUsageDescription:'Ingredi uses your location when you tap Use my location to center the Nearby map. Demo posts remain in Ann Arbor.',
};

export function ensurePhotoPermissions(plist) {
  for (const [key,description] of Object.entries({...photoPermissions,...locationPermissions})) {
    const pattern=new RegExp(`\\s*<key>${key}</key>\\s*<string>([\\s\\S]*?)</string>`,'g');
    const existing=[...plist.matchAll(pattern)][0]?.[1];
    plist=plist.replace(pattern,'');
    const rootEnd=plist.lastIndexOf('</dict>');
    if(rootEnd<0)throw new Error('The iOS Info.plist has no root dictionary.');
    const entry=`\t<key>${key}</key>\n\t<string>${existing || description}</string>\n`;
    plist=plist.slice(0,rootEnd).trimEnd()+'\n'+entry+plist.slice(rootEnd);
  }
  return plist;
}
