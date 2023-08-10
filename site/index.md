---
aside: false
editLink: false
title: viem
titleTemplate: :title · TypeScript Interface for Ethereum
description: Build reliable Ethereum apps & libraries with lightweight, composable, & type-safe modules from viem.
layout: home
---

<script setup lang="ts">
import { VPButton } from 'vitepress/theme'
import HomeSponsors from './.vitepress/theme/components/HomeSponsors.vue'
</script>

<div class="max-w-[1120px] mx-auto vp-doc relative px-[24px] mb-[96px] mt-[32px] md:px-0 md:mb-[64px]">

<div class="pt-[48px] max-sm:pt-0">
  <div class="absolute -left-28 right-0 -top-10 bottom-0 bg-[url('/colosseum-light.svg')] dark:bg-[url('/colosseum.svg')] bg-no-repeat z-[-1] max-sm:w-[200%] max-sm:-left-[200px] max-sm:hidden" />
  <div class="px-7 max-sm:px-0 flex justify-between z-0 max-md:justify-center">
    <div class="space-y-8 max-w-[400px] flex flex-col items-start max-md:items-center">
      <img class="h-[72px] logo max-sm:h-[60px]" src="/logo-light-hug.svg" alt="viem logo">
      <div class="font-medium text-[21px] max-sm:text-[18px] text-[#919193] max-md:text-center">Build reliable apps & libraries with <span class="text-black dark:text-white">lightweight</span>, <span class="text-black dark:text-white">composable</span>, and <span class="text-black dark:text-white">type-safe</span> modules that interface with Ethereum</div>
      <div class="flex justify-center space-x-2">
        <VPButton tag="a" size="medium" theme="brand" href="/docs/getting-started" text="Get Started" />
        <VPButton class="max-sm:hidden" tag="a" size="medium" theme="alt" href="/docs/introduction" text="Why viem?" />
        <VPButton tag="a" size="medium" theme="alt" href="https://github.com/wagmi-dev/viem" text="View on GitHub" />
      </div>
    </div>
    <div class="flex flex-col justify-between w-[440px] space-y-10 max-lg:w-[300px] max-md:hidden">
      <div class="h-full">

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

  </div>
  <!-- TODO: Extract Bundle Size, Coverage badge data from respective APIs. -->
  <div class="flex justify-between space-x-2">
  <a href="https://github.com/wagmi-dev/viem/stargazers" class="cursor-pointer h-10 max-w-[120px] flex-1 relative rounded-lg overflow-hidden border border-black/10 dark:border-white/20" style="color: inherit;" rel="noreferrer noopener" target="_blank">
    <div class="absolute flex z-0 p-[6px] h-full w-full">
      <div class="flex-1 bg-white/60 dark:bg-black/40 flex items-center w-full h-full rounded-md">
        <span class="font-medium text-[15px] opacity-80 w-full text-center">stars</span>
      </div>
      <div class="flex items-center h-full px-2">
        <span class="font-medium text-[15px] text-center w-full text-black dark:text-white">1.3k</span>
      </div>
    </div>
    <div class="absolute left-0 right-0 top-0 bottom-0 bg-black/5 dark:bg-white/10 z-[-1]" />
    <div class="absolute left-0 right-0 top-0 bottom-0 backdrop-blur-[2px] backdrop-filter z-[-1]" />
  </a>
  <a href="https://app.codecov.io/gh/wagmi-dev/viem" class="cursor-pointer h-10 max-w-[160px] flex-1 relative rounded-lg overflow-hidden border border-green-400/50" style="color: inherit;" rel="noreferrer noopener" target="_blank">
    <div class="absolute flex z-0 p-[6px] h-full w-full">
      <div class="flex-1 bg-white/60 dark:bg-black/40 flex items-center w-full h-full rounded-md">
        <span class="font-medium text-[15px] opacity-80 w-full text-center">coverage</span>
      </div>
      <div class="flex items-center h-full px-2">
        <span class="font-medium text-[15px] text-center w-full text-green-400">100%</span>
      </div>
    </div>
    <div class="absolute left-0 right-0 top-0 bottom-0 bg-green-400 opacity-10 z-[-1]" />
    <div class="absolute left-0 right-0 top-0 bottom-0 backdrop-blur-[2px] backdrop-filter z-[-1]" />
  </a>
  <a href="https://github.com/wagmi-dev/viem/blob/main/LICENSE" class="cursor-pointer h-10 max-w-[130px] flex-1 relative rounded-lg overflow-hidden border border-black/10 dark:border-white/20 max-lg:hidden" style="color: inherit;" rel="noreferrer noopener" target="_blank">
    <div class="absolute flex z-0 p-[6px] h-full w-full">
      <div class="flex-1 bg-white/60 dark:bg-black/40 flex items-center w-full h-full rounded-md">
        <span class="font-medium text-[15px] opacity-80 w-full text-center">license</span>
      </div>
      <div class="flex items-center h-full px-2">
        <span class="font-medium text-[15px] text-center w-full text-black dark:text-white">MIT</span>
      </div>
    </div>
    <div class="absolute left-0 right-0 top-0 bottom-0 bg-black/5 dark:bg-white/10 z-[-1]" />
    <div class="absolute left-0 right-0 top-0 bottom-0 backdrop-blur-[2px] backdrop-filter z-[-1]" />
  </a>
  </div>
  </div>
  </div>
  <div class="flex justify-between flex-wrap mt-16 max-sm:hidden">
    <div class="pr-2 w-1/4 max-lg:pb-3 max-sm:px-0 max-lg:w-1/2 max-sm:w-full">
      <div class="relative w-full h-[168px] max-lg:h-[142px] overflow-hidden">
        <div class="border-white border border-solid border-opacity-10 rounded-lg h-full px-5 py-6 absolute z-10 flex flex-col justify-between w-full">
          <div class="text-xl font-medium text-black dark:text-white">Modular</div>
          <div class="text-[17px] font-medium text-[#919193]">Composable modules to build apps & libraries with speed</div>
        </div>
        <div class="absolute left-0 right-0 top-0 bottom-0 dark:bg-[#313136] opacity-20 z-0" />
        <div class="absolute left-0 right-0 top-0 bottom-0 backdrop-filter backdrop-blur-[2px] z-0" />
      </div>
    </div>
    <div class="pl-2 pr-2 max-sm:px-0 max-lg:pb-3 max-lg:pr-0 w-1/4 max-lg:w-1/2 max-sm:w-full">
      <div class="relative w-full h-[168px] max-lg:h-[142px]">
        <div class="border-white border border-solid border-opacity-10 rounded-lg h-full px-5 py-6 absolute z-10 flex flex-col w-full">
          <div class="text-xl font-medium text-black dark:text-white">Lightweight</div>
          <div class="mt-[14px] text-[17px] font-medium text-[#919193]">Tiny bundle size optimized for tree-shaking</div>
          <a href="/docs/introduction.html#bundle-size" class="text-[17px] font-medium">See more</a>
        </div>
        <div class="absolute left-0 right-0 top-0 bottom-0 dark:bg-[#313136] opacity-20 z-0" />
        <div class="absolute left-0 right-0 top-0 bottom-0 backdrop-filter backdrop-blur-[2px] z-0" />
      </div>
    </div>
    <div class="pl-2 pr-2 max-lg:pb-3 max-sm:px-0 max-lg:pl-0 w-1/4 max-lg:w-1/2 max-sm:w-full">
      <div class="relative w-full h-[168px] max-lg:h-[142px]">
        <div class="border-white border border-solid border-opacity-10 rounded-lg h-full px-5 py-6 absolute z-10 flex flex-col justify-between w-full">
          <div class="text-xl font-medium text-black dark:text-white">Performant</div>
          <div class="text-[17px] font-medium text-[#919193]">Optimized architecture compared to alternative libraries</div>
        </div>
        <div class="absolute left-0 right-0 top-0 bottom-0 dark:bg-[#313136] opacity-20 z-0" />
        <div class="absolute left-0 right-0 top-0 bottom-0 backdrop-filter backdrop-blur-[2px] z-0" />
      </div>
    </div>
    <div class="pl-2 w-1/4 max-sm:px-0 max-lg:w-1/2 max-sm:w-full">
      <div class="relative w-full h-[168px] max-lg:h-[142px]">
        <div class="border-white border border-solid border-opacity-10 rounded-lg h-full px-5 py-6 absolute z-10 flex flex-col justify-between w-full">
          <div class="text-xl font-medium text-black dark:text-white">Typed APIs</div>
          <div class="text-[17px] font-medium text-[#919193]">Flexible programmatic APIs with extensive TypeScript typing</div>
        </div>
        <div class="absolute left-0 right-0 top-0 bottom-0 dark:bg-[#313136] opacity-20 z-0" />
        <div class="absolute left-0 right-0 top-0 bottom-0 backdrop-filter backdrop-blur-[2px] z-0" />
      </div>
    </div>
  </div>
</div>

<div class="h-16" />

<div class="max-w-2xl mx-auto">
<h1>Overview</h1>
<hr class="h-2" />

```ts
// 1. Import modules.
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

// 2. Set up your client with desired chain & transport.
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
})

// 3. Consume an action!
const blockNumber = await client.getBlockNumber()
```

<div class="h-8" />
<h1>Features</h1>
<hr class="h-2" />

viem supports all these features out-of-the-box:

- Abstractions over the [JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) to make your life easier
- First-class APIs for interacting with [Smart Contracts](https://ethereum.org/en/glossary/#smart-contract)
- Language closely aligned to official [Ethereum terminology](https://ethereum.org/en/glossary/)
- Import your Browser Extension, WalletConnect or Private Key Wallet
- Browser native [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt), instead of large BigNumber libraries
- Utilities for working with [ABIs](https://ethereum.org/en/glossary/#abi) (encoding/decoding/inspection)
- TypeScript ready ([infer types](/docs/typescript) from ABIs and EIP-712 Typed Data)
- First-class support for [Anvil](https://book.getfoundry.sh/), [Hardhat](https://hardhat.org/) & [Ganache](https://trufflesuite.com/ganache/)
- Test suite running against [forked](https://ethereum.org/en/glossary/#fork) Ethereum network

<div class="h-8" />
<h1>Community</h1>
<hr class="h-2" />

Check out the following places for more wagmi-related content:

- Follow [@wagmi_sh](https://twitter.com/wagmi_sh), [@jakemoxey](https://twitter.com/jakemoxey), and [@awkweb](https://twitter.com/awkweb) on Twitter for project updates
- Join the [discussions on GitHub](https://github.com/wagmi-dev/viem/discussions)
- [Share your project/organization](https://github.com/wagmi-dev/viem/discussions/104) that uses viem

<div class="h-8" />
<h1>Support</h1>
<hr class="h-2" />

Help support future development and make wagmi a sustainable open-source project:

- [GitHub Sponsors](https://github.com/sponsors/wagmi-dev?metadata_campaign=docs_support)
- [Gitcoin Grant](https://wagmi.sh/gitcoin)
- [wagmi-dev.eth](https://etherscan.io/enslookup-search?search=wagmi-dev.eth)

<div class="h-8" />

<HomeSponsors />
</div>

<style scoped>
  html:not(.dark) img.dark {
    display: none;
  }
  .dark img.light {
    display: none;
  }

  .dark .logo {
    filter: invert(1);
  }

  .card {
    background-color: var(--vp-c-bg-soft);
  }

  .language-bash {
    overflow-y: hidden;
  }

  .vp-code-group, .vp-code-group .language-bash {
    height: 100%;
  }

  .vp-code-group .language-bash {
    height: 100%;
    margin-bottom: 0px;
  }

  .vp-code-group {
    margin-top: 0px;
  }

  .vp-code-group .blocks {
    height: calc(100% - 37px);
  }

  .vp-code-group .tabs label {
    font-size: 16px;
  }

  .vp-code-group .tabs {
    justify-content: left;
  }

  .vp-code-group .shiki {
    padding-top: 16px;
  }

  .vp-code-group code {
    font-size: 22px;
  }
  
  /*.vp-code-group {
    width: 100% !important;
}*/

  .tabs {
    display: flex;
    justify-content: center;
  }
</style>

</div>
