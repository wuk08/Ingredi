# Ingredi collaboration rules

These instructions apply throughout this repository.

## Branches and authorization

- Perform the owner's development work on `backend` unless the user explicitly requests another branch. Verify the active branch before editing or committing.
- `main` is the stable shared application branch. Integrate completed work through pull requests targeting `main`.
- Never push directly to `main` without the user's explicit approval.
- `frontend` belongs to Chloe. Never modify or push to `frontend` without the user's explicit approval. Initial creation of that branch was authorized as part of the collaboration setup; this does not authorize future changes to it.
- Do not automatically merge branches or pull requests. Do not enable automatic merging.
- Inspect status and fetch the current remote state before branch operations. Preserve existing branches, commits, files, staged edits, unstaged edits, and untracked files.
- Do not discard work, reset branches, force-push, delete branches, or automatically commit unrelated changes. If changes prevent a branch switch, preserve them safely before proceeding.

## Ownership and compatibility

- Backend work covers Supabase, authentication, database operations, API integration, and backend services.
- Chloe owns frontend views, layouts, navigation, animations, and interface components.
- Keep existing frontend functionality intact during backend changes. Avoid unnecessary changes to SwiftUI views or the current interface files.
- Both development branches must remain compatible with the same Xcode project. Coordinate changes to shared models, API contracts, dependencies, and project configuration.
- The current checkout contains a Capacitor iOS project and shared web interface. Preserve the existing architecture unless an application task explicitly authorizes changing it.
- Never commit credentials, private keys, local secrets, generated dependencies, or personal Xcode state.

## Workflow reference

See [docs/BRANCH-WORKFLOW.md](docs/BRANCH-WORKFLOW.md) for branch usage and Chloe's setup commands. Its branch rules supersede the older direct-to-main instructions in `docs/SYNC-WORKFLOW.md`.
