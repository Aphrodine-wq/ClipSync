# Graphite CLI Setup & Workflow

**Purpose**: Enable AI-powered code reviews and stacked PR management for ClipSync development.

---

## What is Graphite?

Graphite is a tool that helps you:
- **Manage stacked PRs** - Work on multiple features in parallel without waiting for merges
- **AI Code Reviews** - Integrate with AI tools (Claude, Copilot) for automated code review
- **Faster Feedback Loops** - Get quick reviews before your code reaches main
- **Clean Git History** - Keep commits organized and rebasing simplified

---

## Installation & Setup

### 1. Install Graphite CLI

✅ Already installed:
```bash
npm install -D @withgraphite/graphite-cli
```

### 2. Initialize Graphite

```bash
# From project root
npx graphite init

# You'll be prompted to:
# - Confirm your trunk branch (should be 'main')
# - Authorize with GitHub
```

### 3. Configure GitHub Token

Set up your GitHub personal access token:

```bash
# Generate a new token at: https://github.com/settings/tokens
# Permissions needed:
# - repo (full control of private repositories)
# - workflow (update GitHub action workflows)

export GITHUB_TOKEN="your-token-here"
```

---

## Workflow: Creating Stacked PRs

### Scenario: Working on ClipSync Features

Let's say you're working on:
1. Add new pricing tier
2. Update billing interface
3. Fix payment webhook

Instead of waiting for PR 1 to merge before starting PR 2, you can work in **parallel stacks**.

### Step 1: Create Feature Branch

```bash
# Start from main
git checkout main
git pull

# Create your first feature branch (Graphite-style)
npx graphite create feature/new-pricing-tier

# This creates and checks out: feature/new-pricing-tier
```

### Step 2: Make Changes & Commit

```bash
# Make your changes
git add .
git commit -m "feat: Add enterprise pricing tier"

# Graphite tracks this as part of your stack
```

### Step 3: Stack Another Feature on Top

```bash
# While still on feature/new-pricing-tier
npx graphite create feature/update-billing-ui

# This creates: feature/update-billing-ui
# But it's based on feature/new-pricing-tier (stacked!)
```

### Step 4: Commit to Second Feature

```bash
# Make billing UI changes
git add .
git commit -m "feat: Update billing interface for new tier"
```

### Step 5: Create Stacked PRs

```bash
# Create all PRs at once
npx graphite submit

# Or review what will be created first:
npx graphite status

# Output:
# └─ feature/new-pricing-tier (current: main)
#    └─ feature/update-billing-ui (current: feature/new-pricing-tier)
```

This creates **2 PRs** automatically:
- PR 1: `feature/new-pricing-tier` → main
- PR 2: `feature/update-billing-ui` → feature/new-pricing-tier

---

## AI Code Review Integration

### With Claude (via MCP)

Once your PR is created, Claude can review it:

```bash
# Claude will see your PR and can:
# 1. Review code for quality, security, performance
# 2. Suggest improvements
# 3. Identify potential bugs
# 4. Check for best practices

# In Claude Code:
# "Review PR for ClipSync pricing feature"
# "Check for security issues in payment code"
# "Suggest performance improvements"
```

### Workflow with AI Review

1. **Create Stack**:
   ```bash
   npx graphite create feature/payment-webhook
   ```

2. **Make Changes**:
   ```bash
   git add .
   git commit -m "feat: Add Stripe webhook handler"
   ```

3. **Submit PR**:
   ```bash
   npx graphite submit
   ```

4. **Get AI Review** (in Claude):
   - Copy PR diff
   - Ask for code review
   - Get suggestions for improvements
   - Apply feedback and update PR

5. **Merge When Ready**:
   ```bash
   npx graphite merge
   # Graphite handles the rebase and merge automatically
   ```

---

## Common Graphite Commands

### Status & Info

```bash
# See your current stack
npx graphite status

# Show all your stacks
npx graphite log

# See sync status with remote
npx graphite sync
```

### Making Changes

```bash
# Edit commit message of current branch
npx graphite amend

# Rebase your stack onto latest main
npx graphite rebase

# Sync all branches with remote
npx graphite sync
```

### Submitting & Managing PRs

```bash
# Create PR(s) for your stack
npx graphite submit

# Update your stack's PRs
npx graphite pr update

# Track PR feedback
npx graphite pr info

# Merge approved PR(s)
npx graphite merge
```

### Deleting & Cleanup

```bash
# Delete a branch from stack
npx graphite delete feature/old-branch

# Cleanup merged branches
npx graphite delete --merged
```

---

## Example: ClipSync Feature Development

### Scenario: Implementing Device Limits Feature

**Branch structure you want:**
```
main
└─ feature/device-limits-api       (API changes)
   └─ feature/device-limits-ui      (Frontend changes)
      └─ feature/device-limits-test (Test coverage)
```

**Commands:**

```bash
# 1. Start first feature
git checkout main && git pull
npx graphite create feature/device-limits-api

# 2. Make API changes
# ... edit backend/services/pricingTier.js, etc.
git add .
git commit -m "feat: Add device limit enforcement to API"

# 3. Stack UI feature on top
npx graphite create feature/device-limits-ui

# ... edit clipsync-app/src/components/DeviceManagement.jsx
git add .
git commit -m "feat: Add device management UI component"

# 4. Stack tests on top
npx graphite create feature/device-limits-test

# ... add test files
git add .
git commit -m "test: Add device limit tests"

# 5. Review your stack
npx graphite status

# Output:
# Trunk: main
# Stack:
# └─ feature/device-limits-api
#    └─ feature/device-limits-ui
#       └─ feature/device-limits-test

# 6. Submit all PRs
npx graphite submit

# 7. Get each PR reviewed
# (Claude reviews each PR for quality/security)

# 8. Merge when all reviews pass
npx graphite merge
```

---

## Graphite + Screenshots Workflow

### Capture Screenshots for Your PR

```bash
# 1. Start your feature branch
npx graphite create feature/add-device-management

# 2. Make your UI changes
# ... edit DeviceManagement.jsx, etc.

# 3. Commit
git add .
git commit -m "feat: Add device management component"

# 4. Start dev server
npm run dev  # In separate terminal

# 5. Capture screenshots
npm run screenshots

# Screenshots are saved to /screenshots directory
# They're automatically included in your PR description!

# 6. Submit PR
npx graphite submit
```

---

## Integration with CI/CD

### GitHub Actions Integration

When you push with Graphite, you can set up GitHub Actions to:

1. **Run Tests**:
   ```yaml
   - Run: npm test
   - Run: npm run lint
   ```

2. **Generate Screenshots**:
   ```yaml
   - Run: npm run screenshots
   - Upload artifacts
   ```

3. **Run AI Code Review**:
   - Trigger Claude review
   - Post results as comment

### Example Workflow File

```yaml
name: Graphite CI

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Capture screenshots
        run: npm run screenshots

      - name: Upload screenshots
        uses: actions/upload-artifact@v2
        with:
          name: screenshots
          path: screenshots/
```

---

## Best Practices for Stacked PRs

### ✅ Do

- **Keep stacks small**: 1-3 related commits per branch
- **Review bottom-up**: Review the base PR first
- **Sync regularly**: Keep your stack updated with main
- **Write clear messages**: Each commit should be independently understandable
- **Test each layer**: Each PR in stack should pass tests independently

### ❌ Don't

- **Make stacks too deep**: More than 5 levels gets confusing
- **Mix unrelated changes**: Keep features separate
- **Force push without syncing**: Can cause merge conflicts
- **Leave PRs idle**: Review and merge promptly
- **Commit to wrong branch**: Always check current branch

---

## Troubleshooting

### "Merge conflict in stack"

```bash
# Fix conflicts locally
git add resolved-files
git commit -m "fix: Resolve merge conflicts"

# Sync stack with remote
npx graphite sync
```

### "PR branch got deleted"

```bash
# Restore from local tracking
npx graphite sync

# If that doesn't work, recreate from commit
git checkout -b feature/restored-branch <commit-hash>
npx graphite submit
```

### "Need to reorder PRs in stack"

```bash
# Delete current stack
npx graphite delete -r  # Delete entire stack

# Recreate in correct order
npx graphite create feature/first-thing
# ... commit
npx graphite create feature/second-thing
# ... commit
npx graphite submit
```

---

## Next Steps

1. **Initialize Graphite**: Run `npx graphite init`
2. **Set GitHub Token**: Export your GitHub token
3. **Create Your First Stack**: `npx graphite create feature/my-feature`
4. **Submit PR**: `npx graphite submit`
5. **Get AI Review**: Share PR with Claude for code review

---

## Resources

- **Graphite Docs**: https://docs.withgraphite.com
- **GitHub Stacking Concept**: https://en.wikipedia.org/wiki/Stacked_patches
- **ClipSync PR Examples**: Check GitHub PR history for examples

---

**Ready to use Graphite? Start with**: `npx graphite init`
