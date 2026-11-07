# Keep Windows, GitHub and your Mac in sync

Repository: https://github.com/wuk08/Ingredi

Use the GitHub-backed checkout on each computer as the working copy. The ZIP is a snapshot; it will not receive future updates.

## First setup on the Mac

Install [GitHub Desktop](https://desktop.github.com/) and sign in as `wuk08`.

Choose **File → Clone Repository → URL** and enter:

```text
https://github.com/wuk08/Ingredi.git
```

Choose a new local folder, such as `Documents/GitHub/Ingredi`. Keep the ZIP-extracted folder separately until this checkout runs successfully. Do not clone into the ZIP folder or replace its files.

Choose **Repository → Open in Terminal**, then run:

```bash
npx --yes pnpm@11.25.0 install --frozen-lockfile
npx --yes pnpm@11.25.0 ios:prepare
npx --yes pnpm@11.25.0 ios:open
```

Xcode should now open the project from this cloned folder. Close the old ZIP project's Xcode window to avoid running a stale copy. Re-select your Personal Team in the cloned project if you are running on your iPhone.

## Each time you bring Windows changes to the Mac

1. Finish and commit the Windows edits, then push them to GitHub.
2. On the Mac, open GitHub Desktop, select Ingredi, and click **Fetch origin**. If **Pull origin** appears, click it.
3. Open Terminal in this cloned folder and run:

```bash
npx --yes pnpm@11.25.0 install --frozen-lockfile
npx --yes pnpm@11.25.0 ios:prepare
```

4. In Xcode, press **Command + R** to rebuild and run the new version.

Pulling changes downloads source files; preparing iOS copies the latest interface into the native project; running in Xcode updates the Simulator or phone.

## If you edit on the Mac

Before editing, fetch/pull in GitHub Desktop. After editing, review the Changes tab, enter a descriptive commit summary, click **Commit to main**, then **Push origin**. Pull those changes on Windows before starting more edits there.

Work on one computer at a time until you are comfortable resolving Git conflicts. If Desktop reports conflicting changes, stop and ask for help; preserve both copies.

## What belongs in Git

Commit the editable source, the `ios/` project, and dependency lockfiles. The `.gitignore` excludes local secrets, installed dependencies, generated bundles, test artifacts, signing keys and personal Xcode workspace data. The publishable Supabase key is intentionally public; AI and Supabase server keys stay in Supabase secrets.

Edit `public/` for the shared interface, not `dist/` or `ios/App/App/public/`, which are generated copies. Backend function code changes require a separate Supabase deployment; pushing to GitHub does not deploy them automatically. Fridge data is already shared through Supabase when both devices use the same account.
