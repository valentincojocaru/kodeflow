---
name: Git restrictions in agent
description: Which git operations are blocked for the agent vs allowed for the user in Shell
---

# Git Restrictions

**Why:** Replit blocks destructive git operations for the main agent to protect repo integrity.

## Blocked for agent (use Shell instead)
- `git remote add`
- `git remote set-url`
- `git reset`
- `git checkout`
- `git commit`
- Editing `.git/config` directly

## Allowed for agent
- Reading `.git/config`
- `git log`, `git status`, `git branch` (read-only with --no-optional-locks)
- `git fetch` (read-only)
- Cloning to /tmp (separate directory)

## Workaround
All git write operations go into shell scripts (push.sh) that the USER runs in Shell.
The agent can write/modify shell scripts freely.
