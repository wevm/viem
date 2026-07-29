---
title: 'simple-git-hooks cannot install hooks in a Git worktree'
severity: 'minor'
---

## Description

Running `pnpm install --frozen-lockfile` in a linked worktree reports `ENOTDIR` while trying to create `.git/hooks` because `.git` is a file.
