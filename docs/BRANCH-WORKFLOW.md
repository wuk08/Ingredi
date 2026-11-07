# Ingredi branch workflow

Repository: https://github.com/wuk08/Ingredi.git

| Branch | Owner and purpose | Integration |
| --- | --- | --- |
| `main` | Stable shared application | Pull requests only |
| `backend` | Backend owner: Supabase, authentication, database operations, API integration, services | Open a pull request into `main` |
| `frontend` | Chloe: views, layouts, navigation, animation, interface components | Open a pull request into `main` |

The owner's local checkout should stay on `backend`, tracking `origin/backend`. Chloe's checkout should stay on `frontend`, tracking `origin/frontend`. Both branches start from the shared `main` commit `9fe2eda768a298f1e440561bd0de6ba17590b9d1` and use the same Xcode project.

## Chloe: first setup

Clone into a new folder; preserve any existing checkout or ZIP copy separately.

```bash
git clone https://github.com/wuk08/Ingredi.git
cd Ingredi
git switch --track frontend origin/frontend
git config --local push.default simple
git config --local branch.frontend.pushRemote origin
git branch --show-current
```

The last command must print `frontend`. If you already have a clone, first inspect `git status`, preserve any edits, run `git fetch origin`, and then use `git switch frontend` (or the tracking command above if the local branch does not yet exist).

## Chloe: each work session

Start on `frontend` with a clean working directory before updating:

```bash
git branch --show-current
git pull --ff-only origin frontend
```

After editing, inspect the diff and stage only the intended files. Replace `path/to/changed-file` with an actual file path; repeat `git add` as needed.

```bash
git status
git diff
git add path/to/changed-file
git diff --cached
git commit -m "Describe the frontend change"
git push origin frontend:frontend
```

Verify the current branch is `frontend` before committing or pushing. The explicit push destination above targets only `frontend`; never use `git push origin main`, `--all`, `--mirror`, or a force push. `push.default=simple` also keeps a plain `git push` tied to the matching upstream branch. Local Git settings are per clone and do not transfer automatically to another computer.

## Combining the work

Open pull requests with base `main`: [backend to main](https://github.com/wuk08/Ingredi/compare/main...backend?expand=1) and [frontend to main](https://github.com/wuk08/Ingredi/compare/main...frontend?expand=1). Review each other's changes and coordinate shared models, API contracts, dependencies, and Xcode configuration. Test the combined application before an approved manual merge. Do not enable automatic merging.

If a branch diverges or conflicts appear, preserve both sides and coordinate the resolution. Updating a development branch from `main` requires an explicit, agreed integration step; do not automatically merge, rebase, reset, or overwrite another person's work.

The branch rules in this document supersede the older **Commit to main / Push origin** advice in `docs/SYNC-WORKFLOW.md`. Its build and device preparation instructions still apply, using each person's development branch. The existing Xcode project is `ios/App/App.xcodeproj`; frontend source is currently in `public/`, with generated copies excluded from Git. Pushing a branch does not rebuild an installed iOS app or deploy backend functions.

## Main protection

GitHub should require a pull request before changes reach `main`, including for repository administrators. This requirement does not grant permission to merge: obtain approval before manually integrating work. No automatic merge, visibility changes, or collaborator-permission changes are part of this setup.

If the setting needs to be restored, an administrator can open repository **Settings > Branches**, add or edit the protection rule for `main`, enable **Require a pull request before merging** and **Do not allow bypassing the above settings**, then save. The pull-request requirement does not require an additional reviewer-count policy. Preserve any other existing protections.
