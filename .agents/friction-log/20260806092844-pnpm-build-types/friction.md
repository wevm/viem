---
title: 'pnpm build:types is missing on v3'
severity: 'minor'
---

## Expected Behavior

The documented pnpm build:types verification command runs on v3.

## Current Behavior

The command fails because package.json does not define build:types.

## Possible Solution

Add the script or update AGENTS.md with the v3 declaration-build command.

## Minimal Reproducible Example

Run pnpm build:types on v3.

## Context

This blocks the documented post-merge type verification sequence.
