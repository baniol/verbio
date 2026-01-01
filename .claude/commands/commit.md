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
