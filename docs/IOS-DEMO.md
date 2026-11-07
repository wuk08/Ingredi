# Run Ingredi on your MacBook or iPhone

This setup is for your competition demo. The app bundles its interface locally and uses the existing Supabase backend. You do not need a public App Store release or TestFlight.

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

Sign in with the confirmed Ingredi email/password account you already created. The installed app has its own session storage, so it will not inherit your browser login. Supabase data is shared after signing in.

Choose **Cook → Fill up fridge → Scan a receipt → Load demo photo for live AI**, check the OpenAI consent box, then choose **Read my receipt**. This sends the bundled synthetic image through the real server-side AI pipeline. Review the items and confirm them into your fridge.

The Simulator has no physical camera. Use the bundled image or import a receipt image into its Photos app and choose **Choose Photos**. **Use the sample receipt** is the separate preset-extraction fallback.

## 3. Demo on your own iPhone

1. Connect your iPhone to the Mac and trust the computer when prompted.
2. In Xcode Settings → Accounts, sign in with your Apple Account.
3. Select the **App** target → **Signing & Capabilities**. Enable automatic signing and choose your **Personal Team**.
4. If Xcode says the bundle identifier is unavailable, choose a unique identifier, such as `com.yourname.ingredi.demo`, in `capacitor.config.json` and the Xcode target.
5. Select your iPhone as the run destination and press **Run ▶**. Follow Xcode’s device setup instructions, including enabling Developer Mode on the iPhone if requested.
6. Open Ingredi and sign in. Use **Take photo** to photograph a receipt, or **Choose Photos** for a saved image. Photo selection does not upload anything until you approve the consent box and tap **Read my receipt**.

A free Apple Account supports personal-device testing. Its provisioning profiles expire after 7 days, so rebuild/reinstall close to competition day. You do not need a paid developer membership for this route. [Apple’s Personal Team limits](https://developer.apple.com/help/account/basics/about-your-developer-account#enable-a-personal-team-in-xcode)

## Demo checklist

- Run the live scan once on the actual presentation device before the event.
- Keep the Mac/iPhone connected to Wi-Fi or a hotspot for Supabase and OpenAI.
- Use the bundled synthetic image for a predictable receipt with no personal details.
- Keep the preset sample receipt ready as a fallback. Signed in, it still saves to the real backend; signed out, it works locally.
- Sign in before presenting and keep your password/API key out of the presentation.
- Backend secrets remain in Supabase. No AI or Supabase server key belongs in Xcode or the app bundle.

## Updating the demo

After changing the web code, run `npx --yes pnpm@11.25.0 ios:prepare` on the Mac and run the app again in Xcode. The phone uses bundled files, so restarting the web server alone does not update the installed app.

## What has been checked here

The bundled JavaScript build and native configuration checks pass, including camera/gallery file validation, cancellation and permission-error handling, and root-level iOS permission descriptions. The existing receipt/backend tests also pass. The Xcode project was generated with Capacitor and uses Swift Package Manager.

This project was prepared on Windows. **Xcode compilation, Simulator execution and physical-camera testing still need to be done on the Mac.** No native build or signing success is claimed yet.

References: [Capacitor iOS setup](https://capacitorjs.com/docs/ios), [environment requirements](https://capacitorjs.com/docs/getting-started/environment-setup), [camera API and permissions](https://capacitorjs.com/docs/apis/camera).
