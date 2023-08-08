# Contributing

Thanks for your interest in contributing to viem! Please take a moment to review this document **before submitting a pull request.**

If you want to contribute, but aren't sure where to start, you can create a [new discussion](https://github.com/wagmi-dev/viem/discussions).

> **Note**
>
> **Please ask first before starting work on any significant new features.**
>
> It's never a fun experience to have your pull request declined after investing time and effort into a new feature. To avoid this from happening, we request that contributors create a [feature request](https://github.com/wagmi-dev/viem/discussions/new?category=ideas) to first discuss any API changes or significant new ideas.

<br>

## Basic guide

This guide is intended to help you get started with contributing. By following these steps, you will understand the development process and workflow.

1. [Cloning the repository](#cloning-the-repository)
2. [Installing Node.js and pnpm](#installing-nodejs-and-pnpm)
3. [Installing Foundry](#installing-foundry)
4. [Installing dependencies](#installing-dependencies)
5. [Running the test suite](#running-the-test-suite)
6. [Writing documentation](#writing-documentation)
7. [Submitting a pull request](#submitting-a-pull-request)
8. [Versioning](#versioning)

<br>

---

<br>

## Cloning the repository

To start contributing to the project, clone it to your local machine using git:

```bash
git clone https://github.com/wagmi-dev/viem.git --recurse-submodules
```

Or the [GitHub CLI](https://cli.github.com):

```bash
gh repo clone wagmi-dev/viem -- --recurse-submodules
```

<div align="right">
  <a href="#basic-guide">&uarr; back to top</a></b>
</div>

## Installing Node.js and pnpm

wagmi uses [pnpm workspaces](https://pnpm.io/workspaces) to manage multiple projects. You need to install **Node.js v18 or higher** and **pnpm v7 or higher**.

You can run the following commands in your terminal to check your local Node.js and pnpm versions:

```bash
node -v
pnpm -v
```

If the versions are not correct or you don't have Node.js or pnpm installed, download and follow their setup instructions:

- Install Node.js using [fnm](https://github.com/Schniz/fnm) or from the [official website](https://nodejs.org)
- Install [pnpm](https://pnpm.io/installation)

<div align="right">
  <a href="#basic-guide">&uarr; back to top</a></b>
</div>

## Installing Foundry

viem uses [Foundry](https://book.getfoundry.sh/) for testing. We run a local [Anvil](https://github.com/foundry-rs/foundry/tree/master/anvil) instance against a forked Ethereum node, where we can also use tools like [Forge](https://book.getfoundry.sh/forge/) to deploy test contracts to it. 

Install Foundry using the following command:

```bash
curl -L https://foundry.paradigm.xyz | bash
```

## Installing dependencies

Once in the project's root directory, run the following command to install the project's dependencies:

```bash
pnpm install
```

After the install completes, pnpm links packages across the project for development and [git hooks](https://github.com/toplenboren/simple-git-hooks) are set up.

<div align="right">
  <a href="#basic-guide">&uarr; back to top</a></b>
</div>

## Running the test suite

First, add the following to your environment (recommended to use [`direnv`](https://github.com/direnv/direnv)):

```bash
VITE_ANVIL_FORK_URL=https://rpc
VITE_ANVIL_BLOCK_TIME=1
VITE_ANVIL_BLOCK_NUMBER=16280770
VITE_NETWORK_TRANSPORT_MODE=http
```

`VITE_ANVIL_FORK_URL` can be for any RPC service provider (e.g. Alchemy or Infura) for the mainnet. Now you are ready to run the tests! 

- `pnpm test` — runs tests in watch mode

Sometimes there may be some tests which fail unexpectedly – you can press `f` to rerun them and they should pass. 

When adding new features or fixing bugs, it's important to add test cases to cover the new/updated behavior.

<div align="right">
  <a href="#basic-guide">&uarr; back to top</a></b>
</div>

## Writing documentation

Documentation is crucial to helping developers of all experience levels use viem. viem uses [VitePress](https://github.com/vuejs/vitepress) and Markdown for the documentation site (located at [`site`](../site)). To start the site in dev mode, run:

```bash
pnpm dev:docs
```

Try to keep documentation brief and use plain language so folks of all experience levels can understand. If you think something is unclear or could be explained better, you are welcome to open a pull request.

<div align="right">
  <a href="#basic-guide">&uarr; back to top</a></b>
</div>

## Submitting a pull request

When you're ready to submit a pull request, you can follow these naming conventions:

- Pull request titles use the [Imperative Mood](https://en.wikipedia.org/wiki/Imperative_mood) (e.g., `Add something`, `Fix something`).
- [Changesets](#versioning) use past tense verbs (e.g., `Added something`, `Fixed something`).

When you submit a pull request, GitHub will automatically lint, build, and test your changes. If you see an ❌, it's most likely a bug in your code. Please, inspect the logs through the GitHub UI to find the cause.

<div align="right">
  <a href="#basic-guide">&uarr; back to top</a></b>
</div>

<br>

## Versioning

When adding new features or fixing bugs, we'll need to bump the package versions. We use [Changesets](https://github.com/changesets/changesets) to do this.

> **Note**
>
> Only changes to the codebase that affect the public API or existing behavior (e.g. bugs) need changesets.

Each changeset defines which package(s) should be published and whether the change should be a major/minor/patch release, as well as providing release notes that will be added to the changelog upon release.

To create a new changeset, run `pnpm changeset`. This will run the Changesets CLI, prompting you for details about the change. You’ll be able to edit the file after it’s created — don’t worry about getting everything perfect up front.

Even though you can technically use any markdown formatting you like, headings should be avoided since each changeset will ultimately be nested within a bullet list. Instead, bold text should be used as section headings.

If your PR is making changes to an area that already has a changeset (e.g. there’s an existing changeset covering theme API changes but you’re making further changes to the same API), you should update the existing changeset in your PR rather than creating a new one.

<br>

<div>
  ✅ Now you're ready to contribute to viem!
</div>

<div align="right">
  <a href="#advanced-guide">&uarr; back to top</a></b>
</div>
