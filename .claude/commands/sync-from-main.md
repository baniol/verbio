Sync demo and priv branches with main (merge to both).

This command merges latest changes from main into both demo and priv branches.
The `.gitattributes` file ensures branch-specific data is preserved:
- `lang_data/**`
- `lang_data_arch/**`
- `frontend/audio/**`
- `docs/curriculum/**`

---

## Steps

1. **Save current branch**
   ```bash
   git branch --show-current
   ```
   Save as `original_branch`.

2. **Check for uncommitted changes**
   ```bash
   git status --porcelain
   ```
   
   If there are uncommitted changes, ask user: "You have uncommitted changes. Commit them first or stash?"
   - If user says stash: `git stash`
   - If user says commit: help them commit first
   - If user says abort: exit

3. **Fetch latest**
   ```bash
   git fetch origin
   ```

4. **Sync demo branch**
   ```bash
   git checkout demo
   git merge origin/main -m "Merge main into demo"
   ```
   
   Handle conflicts:
   - For protected paths (lang_data/, docs/curriculum/, frontend/audio/, lang_data_arch/): 
     `git checkout --ours <file>` then `git add <file>`
   - For other conflicts: show to user and help resolve
   
   ```bash
   git push origin demo
   ```

5. **Sync priv branch**
   ```bash
   git checkout priv
   git merge origin/main -m "Merge main into priv"
   ```
   
   Handle conflicts same way as demo.
   
   ```bash
   git push origin priv
   ```

6. **Return to original branch**
   ```bash
   git checkout <original_branch>
   ```
   
   If stashed: `git stash pop`

7. **Summary**
   
   Display:
   - ✓ demo synced with main (X commits)
   - ✓ priv synced with main (X commits)
   - Back on <original_branch>
