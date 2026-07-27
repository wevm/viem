# Friction log

Friction hit while working in this repository, one directory per item:

```
<id>/
  friction.md   the write-up
  artifacts/    optional, whatever reproduces it
```

Reporting an entry gives it an owner. The write-up then carries an `issue:` link and mirrors what happens
to it. The whole directory is deleted once the friction is resolved. Every entry left here is still
outstanding, including friction in dependencies.

Do not maintain an index here. This directory is the index.

Prompt the user to choose one automation method. Do not install the App or add a workflow before they
answer.

Choose the **GitHub App** for pull-request feedback, forks, cross-repository reporting, or durable event
processing. Choose **Action-only** when same-repository automation and avoiding an external write grant
matter most. Choose one method per repository; concurrent App and Action-only runs can create duplicate
issues.

| Area | GitHub App | Action-only |
| --- | --- | --- |
| Trust | Grants the Frog App access to selected repositories. | Uses this repository's `GITHUB_TOKEN`; no third-party App installation. |
| Scope | Cross-repository reporting and reconciliation where installed and allowed. | Same repository only; `target:` entries stay deferred. |
| Pull requests | Reports during the pull request and posts or updates one comment. | Reports after merge, without commenting on the author's pull request. |
| Forks | Installation credentials work independently of the fork token. | Cannot safely report from fork pull requests. |
| Reconciliation | Webhooks react immediately, with durable retries and serialization. | Workflows plus a daily sweep; issue edits wait for the next run. |
| Delivery | Commits through GitHub's API, directly or through an accumulating pull request. | Commits locally, then pushes directly or updates `frog/sync`. |
| Setup | Needs the App installed with its requested repository permissions. | Needs workflow write permissions and Actions-created pull requests enabled. |
| Operations | Requires the Worker, queues, secrets, and App installation. | Uses Actions minutes and installs Frog from npm; no service to run. |

## GitHub App

Install the [Frog GitHub App](https://github.com/apps/frog-fm/installations/new) and entries are reported, linked, and removed as their issues
close, without anyone running anything.

## Action-only

Create `.github/workflows/frog.yml`:

```yaml
name: Frog
on:
  push:
  issues:
    types: [closed, reopened]
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * *'

concurrency:
  group: frog
  cancel-in-progress: false

permissions: {}

jobs:
  frog:
    name: Frog
    if: github.event_name != 'push' || github.ref_name == github.event.repository.default_branch
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write

    steps:
      - name: Clone repository
        uses: actions/checkout@v6
        with:
          persist-credentials: false
          ref: ${{ github.event.repository.default_branch }}

      - name: Report and reconcile friction
        uses: wevm/frog/action@v1
```

The workflow uses this repository's `GITHUB_TOKEN` and handles same-repository friction only. Before
the first run, enable "Allow GitHub Actions to create and approve pull requests" under Settings >
Actions > General. Pull-request checks need a write user to approve each action-created run. Push-only
workflows do not run; pass a personal access token or App token as `token` when they are required.

## Logging Friction

```sh
frog list    # what is already known
frog log     # add one
```

`frog log` writes the sections to fill in. Each id is when the friction was hit plus its title, so
the directory reads oldest-first.

Put anything that reproduces the friction in that entry's `artifacts/` and reference it from the
write-up. The next reader runs the reproduction instead of rebuilding it.

## For Agents

Add this to `AGENTS.md` under the appropriate section:

- Log papercuts and friction (tooling, docs, APIs, tests, conventions) as you hit them with `frog log`.
- Do not add global, system, or internal friction.
- Run `frog list` first to see what is already known.

Managed by [Frog](https://github.com/wevm/frog).
