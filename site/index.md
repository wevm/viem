---
aside: false
editLink: false
title: viem
titleTemplate: TypeScript Interface for Ethereum
---

<script setup lang="ts">
import { VPButton } from 'vitepress/theme'
</script>

<div class="flex justify-center mx-auto text-center">
  <div class="flex space-y-6 flex-col items-center">
    <div class="flex flex-col space-y-4 items-center">
      <img class="h-14 w-min logo" src="/logo-light-hug.svg" alt="viem logo">
      <span class="text-2xl opacity-80">TypeScript Interface for Ethereum</span>
    </div>
    <div class="flex gap-2 max-w-xl">
      <a aria-label="Version" href="https://www.npmjs.com/package/viem">
        <img
          alt="version"
          src="https://img.shields.io/npm/v/viem?colorA=2B323B&colorB=1e2329&style=flat&label=Version"
        />
      </a>
      <a aria-label="Coverage" href="https://codecov.io/github/wagmi-dev/viem">
        <img
          alt="coverage"
          src="https://codecov.io/github/wagmi-dev/viem/branch/main/graph/badge.svg?token=iUTN9R4Qfg"
        />
      </a>
      <a aria-label="License" href="https://www.npmjs.com/package/viem">
        <img
          alt=""
          src="https://img.shields.io/github/license/wagmi-dev/viem?colorA=2B323B&colorB=1e2329&style=flat&label=License"
        />
      </a>
    </div>
    <span class="text-xl max-w-xl">Build reliable Ethereum apps & libraries with <span class="text-yellow-500 dark:text-yellow-400 font-medium">lightweight</span>, <span class="text-yellow-500 dark:text-yellow-400 font-medium">composable</span>, & <span class="text-yellow-500 dark:text-yellow-400 font-medium">type-safe</span> modules from viem.</span>
  </div>
</div>

<div class="install h-6" />

::: code-group

```bash [npm]
npm i viem
```

```bash [pnpm]
pnpm i viem
```

```bash [yarn]
yarn add viem
```

:::

<div class="h-4" />

<div class="flex justify-center space-x-2">
  <VPButton tag="a" size="medium" theme="brand" href="/docs/getting-started" text="Get Started" />
  <VPButton class="max-lg:hidden" tag="a" size="medium" theme="alt" href="/docs/introduction" text="Why viem?" />
  <VPButton tag="a" size="medium" theme="alt" href="https://github.com/wagmi-dev/viem" text="View on GitHub" />
</div>

<div class="h-16" />

<div class="flex flex-wrap lg:-mx-[190px]">
  <div class="p-1 w-1/4 max-lg:w-1/2 max-sm:w-full">
    <div class="card rounded-l sm:h-32 p-6 space-y-2">
      <span class="font-semibold">Modular</span>
      <p class="text-[14px] font-medium leading-6" style="color: var(--vp-c-text-2)">
        Composable modules to build apps & libraries with speed.
      </p>
    </div>
  </div>
  <div class="p-1 w-1/4 max-lg:w-1/2 max-sm:w-full">
    <div class="card rounded-l sm:h-32 p-6 space-y-2">
      <span class="font-semibold">Lightweight</span>
      <p class="text-[14px] font-medium leading-6" style="color: var(--vp-c-text-2)">
        Tiny 14kB bundle – optimized for tree-shaking.
      </p>
    </div>
  </div>
  <div class="p-1 w-1/4 max-lg:w-1/2 max-sm:w-full">
    <div class="card rounded-l sm:h-32 p-6 space-y-2">
      <span class="font-semibold">Performant</span>
      <p class="text-[14px] font-medium leading-6" style="color: var(--vp-c-text-2)">
        Optimized architecture compared to alternate libraries.
      </p>
    </div>
  </div>
  <div class="p-1 w-1/4 max-lg:w-1/2 max-sm:w-full">
    <div class="card rounded-l sm:h-32 p-6 space-y-2">
      <span class="font-semibold">Typed APIs</span>
      <p class="text-[14px] font-medium leading-6" style="color: var(--vp-c-text-2)">
        Flexible programmatic APIs with full TypeScript typing.
      </p>
    </div>
  </div>
</div>

<div class="h-16" />

<h1>Overview</h1>
<hr class="h-2" />

```ts
// 1. Import modules.
import { createPublicClient, getBlockNumber, http } from 'viem'
import { mainnet } from 'viem/chains'

// 2. Set up your client with desired chain & transport.
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

// 3. Consume an action!
const blockNumber = await getBlockNumber(client)
```

<style scoped>
  .dark .logo {
    filter: invert(1);
  }

  .card {
    background-color: var(--vp-c-bg-soft);
  }

  .language-bash {
    overflow-y: hidden;
  }

  .vp-code-group .tabs label {
    line-height: 36px;
  }

  .install + .vp-code-group {
    font-size: 18px;
    margin: 0 auto;
    max-width: 300px;
  }

  .install + .vp-code-group .vp-doc [class*='language-'] pre {
    overflow: hidden;
  }

  .install + .vp-code-group [class*='language-'] code {
    display: flex;
    justify-content: center;
  }

  .tabs {
    display: flex;
    justify-content: center;
  }
</style>
