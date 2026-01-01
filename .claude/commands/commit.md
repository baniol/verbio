# /commit

Create a git commit with an auto-generated message based on staged/unstaged changes.

## Steps

1. **Check git status**
   ```bash
   git status --short
   ```

2. **Review changes**
   - If there are unstaged changes, show them and ask: "Stage all changes? (y/n)"
   - If user confirms, run `git add -A`

3. **Analyze diff for commit message**
   ```bash
   git diff --cached --stat
   git diff --cached
   ```

4. **Generate commit message**
   
   Format: `<type>: <short description>`
   
   Types:
   - `feat` - new feature
   - `fix` - bug fix
   - `docs` - documentation changes
   - `refactor` - code refactoring
   - `style` - formatting, no code change
   - `chore` - maintenance, config, dependencies
   
   Rules:
   - First line max 50 chars
   - Use imperative mood ("Add feature" not "Added feature")
   - If multiple changes, use most significant type
   - Add body with bullet points if >3 files changed

5. **Show proposed commit**
   ```
   Proposed commit:
   ─────────────────
   <commit message>
   ─────────────────
   
   Proceed with commit? (y/n)
   ```

6. **Execute commit** (only if user confirms)
   ```bash
   git commit -m "<message>"
   ```

7. **Determine if version tag is needed**

   After committing, check if a version tag should be created.
   
   **Get current version:**
   ```bash
   git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0"
   ```
   
   **Tag rules:**
   - Only tag for CODE changes (files in `frontend/js/`, `frontend/index.html`, `deployment/`, `frontend/sw.js`, `frontend/manifest.json`)
   - Do NOT tag for:
     - Learning data changes (`lang_data/*.json`)
     - Documentation changes (`*.md`, `docs/`)
     - Config files only (`.gitignore`, etc.)
   
   **Version bump rules:**
   - `minor` (v1.X.0): New features (`feat:` commits)
   - `patch` (v1.0.X): Bug fixes, refactoring, chore (`fix:`, `refactor:`, `chore:`, `style:` commits)
   
   **If tag is warranted, propose:**
   ```
   Version tag recommended: vX.Y.Z (patch/minor)
   Reason: <brief explanation>
   
   Create tag? (y/n)
   ```

8. **Create tag** (only if user confirms)
   ```bash
   git tag vX.Y.Z
   ```

## Examples

Single file change:
```
feat: add German B1 travel planning set
```

Multiple related changes:
```
docs: update CLAUDE.md with correct paths

- Fix deployment script paths
- Add missing localStorage keys
- Update project structure
```

Code change with version tag:
```
Proposed commit:
─────────────────
feat: add dark mode toggle
─────────────────

Proceed with commit? (y/n)

[After commit]

Version tag recommended: v1.1.0 (minor)
Reason: New feature added to frontend code

Create tag? (y/n)
```
