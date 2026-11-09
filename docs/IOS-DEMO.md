# Run Ingredi on your MacBook or iPhone

This setup is for the current React interface running as a bundled iOS app. It uses the same screens and interactions as `web/`. Signed-in kitchen, profile, receipt, and recipe data use the existing Supabase backend; the clearly labeled sample community remains local to the device. You do not need a public App Store release or TestFlight.

## 1. Put the project on your Mac

Copy and unzip `Ingredi-iOS-Demo.zip` on your Mac, or copy this repository without `node_modules`, `.tools`, `.git`, `.env` or generated build folders. The ZIP includes the source, pinned dependency lockfile, Xcode project and synthetic receipt. Install dependencies again on the Mac; Windows dependencies cannot be copied across.

Install **Xcode 26 or newer** from the Mac App Store and open it once to finish setup. Install an iOS Simulator when Xcode offers it. Install **Node.js 24 LTS** (or a supported newer version) from [nodejs.org](https://nodejs.org/).

Open Terminal in the extracted project folder and run:

```bash
npx --yes pnpm@11.25.0 install --frozen-lockfile
npx --yes pnpm@11.25.0 ios:prepare
npx --yes pnpm@11.25.0 ios:open
```

The prepare command builds the frontend, synchronizes Capacitor, and configures camera/photo permission descriptions. Xcode resolves the Swift packages on your Mac. Keep the project folder and its `node_modules` folder together.

## 2. Easiest demo: iPhone Simulator on your Mac

In Xcode, choose the **App** scheme and an installed **iPhone Simulator**, then click **Run ▶**. A Simulator does not need a physical iPhone or signing team.

Sign in with an existing Supabase account, create one, or choose the device demo. Then explore Home, Cook, Nearby, Message, and My. Choose **Cook → Fill up fridge → Scan receipt** to exercise the updated scan UI.

The Simulator has no physical camera. Import a receipt into its Photos app and use the gallery button. On a real iPhone, the shutter button opens the native camera. After explicit consent, **Read my receipt** uploads a signed-in user’s image to the private Supabase receipt bucket and invokes the existing extraction function. **Use sample receipt** needs no personal image; signed-in sample confirmations still save through Supabase.

## 3. Demo on your own iPhone

1. Connect your iPhone to the Mac and trust the computer when prompted.
2. In Xcode Settings → Accounts, sign in with your Apple Account.
3. Select the **App** target → **Signing & Capabilities**. Enable automatic signing and choose your **Personal Team**.
4. If Xcode says the bundle identifier is unavailable, choose a unique identifier, such as `com.yourname.ingredi.demo`, in `capacitor.config.json` and the Xcode target.
5. Select your iPhone as the run destination and press **Run ▶**. Follow Xcode’s device setup instructions, including enabling Developer Mode on the iPhone if requested.
6. Open Ingredi and sign in or choose the device demo. Use the shutter button to photograph a receipt, or the gallery button for a saved image. Live extraction is available only after Supabase sign-in and explicit image-processing consent.

A free Apple Account supports personal-device testing. Its provisioning profiles expire after 7 days, so rebuild/reinstall close to competition day. You do not need a paid developer membership for this route. [Apple’s Personal Team limits](https://developer.apple.com/help/account/basics/about-your-developer-account#enable-a-personal-team-in-xcode)

## Demo checklist

- Run the camera and gallery transitions once on the actual presentation device before the event.
- Walk through all five tabs once after reinstalling so the presentation path is familiar.
- Keep passwords and API keys out of the presentation and out of the app bundle.

## Updating the demo

After changing the web code, run `npx --yes pnpm@11.25.0 ios:prepare` on the Mac and run the app again in Xcode. The phone uses bundled files, so restarting the web server alone does not update the installed app.

## What has been checked here

The bundled React build and native configuration checks cover the Supabase/community state bridge, camera/gallery cancellation, permission-error handling, the backend CSP allow-list, and root-level iOS permission descriptions. The Xcode project uses Capacitor and Swift Package Manager.

References: [Capacitor iOS setup](https://capacitorjs.com/docs/ios), [environment requirements](https://capacitorjs.com/docs/getting-started/environment-setup), [camera API and permissions](https://capacitorjs.com/docs/apis/camera).
