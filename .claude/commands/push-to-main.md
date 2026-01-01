Push code changes from current branch to main (excluding branch-specific data).

This command cherry-picks or merges code changes to main while preserving main's data files.

---

## Steps

1. **Check current branch**
   ```bash
   git branch --show-current
   ```
   
   If on `main`, inform user: "You're already on main. Switch to demo or priv first."
   Exit.

2. **Check for uncommitted changes**
   ```bash
   git status --porcelain
   ```
   
   If there are uncommitted changes, ask user to commit or stash first.

3. **Identify commits to push**
   
   Show commits on current branch that are not on main:
   ```bash
   git log origin/main..HEAD --oneline
   ```
   
   If no commits, inform user: "No new commits to push to main."
   Exit.

4. **Review commits**
   
   Ask user: "These commits will be merged to main. Proceed? (y/n)"
   
   Show the list and let user confirm.

5. **Switch to main and merge**
   ```bash
   git checkout main
   git pull origin main
   git merge <source_branch> -m "Merge <source_branch> code changes into main"
   ```

6. **Handle conflicts**
   
   If merge conflicts occur:
   - For data files (lang_data/, docs/curriculum/, frontend/audio/): keep main's version
     ```bash
     git checkout --ours <file>
     git add <file>
     ```
   - For code conflicts: show to user and help resolve

7. **Push to origin**
   
   Ask user: "Push to origin/main now? (y/n)"
   ```bash
   git push origin main
   ```

8. **Return to original branch**
   ```bash
   git checkout <original_branch>
   ```

9. **Summary**
   
   Display:
   - Commits merged to main
   - Files kept from main (data files)
   - Push status
   - Current branch restored
