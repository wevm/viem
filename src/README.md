<br/>

<p align="center">
  <a href="https://viem.sh">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/viem/main/.github/gh-logo-dark.svg">
        <img alt="viem logo" src="https://raw.githubusercontent.com/wevm/viem/main/.github/gh-logo-light.svg" width="auto" height="60">
      </picture>
</a>
</p>

<p align="center">
  TypeScript Interface for Ethereum
<p>

<p align="center">
  <a href="https://www.npmjs.com/package/viem">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/v/viem?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/npm/v/viem?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="Version">
    </picture>
  </a>
  <a href="https://app.codecov.io/gh/wevm/viem">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/codecov/c/github/wevm/viem?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/codecov/c/github/wevm/viem?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="Code coverage">
    </picture>
  </a>
  <a href="https://github.com/wevm/viem/blob/main/LICENSE">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/l/viem?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/npm/l/viem?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="MIT License">
    </picture>
  </a>
  <a href="https://www.npmjs.com/package/viem">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/dm/viem?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/npm/dm/viem?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="Downloads per month">
    </picture>
  </a>
  <a href="https://bestofjs.org/projects/viem">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/endpoint?colorA=21262d&colorB=21262d&style=flat&url=https://bestofjs-serverless.now.sh/api/project-badge?fullName=wevm%2Fviem%26since=daily">
      <img src="https://img.shields.io/endpoint?colorA=f6f8fa&colorB=f6f8fa&style=flat&url=https://bestofjs-serverless.now.sh/api/project-badge?fullName=wevm%2Fviem%26since=daily" alt="Best of JS">
    </picture>
  </a>
</p>

<br>

## Features

- Abstractions over the [JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) to make your life easier
- First-class APIs for interacting with [Smart Contracts](https://ethereum.org/en/glossary/#smart-contract)
- Language closely aligned to official [Ethereum terminology](https://ethereum.org/en/glossary/)
- Import your Browser Extension, WalletConnect or Private Key Wallet
- Browser native [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt), instead of large BigNumber libraries
- Utilities for working with [ABIs](https://ethereum.org/en/glossary/#abi) (encoding/decoding/inspection)
- TypeScript ready ([infer types](https://viem.sh/docs/typescript) from ABIs and EIP-712 Typed Data)
- First-class support for [Anvil](https://book.getfoundry.sh/), [Hardhat](https://hardhat.org/) & [Ganache](https://trufflesuite.com/ganache/)
- Test suite running against [forked](https://ethereum.org/en/glossary/#fork) Ethereum network

... and a lot more.

## Overview

```ts
// 1. Import modules.
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

// 2. Set up your client with desired chain & transport.
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// 3. Consume an action!
const blockNumber = await client.getBlockNumber();
```

## Documentation

[Head to the documentation](https://viem.sh/docs/getting-started) to read and learn more about viem.

## Community

Check out the following places for more viem-related content:

- Follow [@wevm_dev](https://twitter.com/wevm_dev), [@jakemoxey](https://twitter.com/jakemoxey), and [@awkweb](https://twitter.com/awkweb) on Twitter for project updates
- Join the [discussions on GitHub](https://github.com/wevm/viem/discussions)
- [Share your project/organization](https://github.com/wevm/viem/discussions/104) that uses viem

## Support

- [GitHub Sponsors](https://github.com/sponsors/wevm?metadata_campaign=docs_support)
- [Gitcoin Grant](https://wagmi.sh/gitcoin)
- [wevm.eth](https://etherscan.io/enslookup-search?search=wevm.eth)

## Sponsors

<a href="https://paradigm.xyz">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/paradigm-dark.svg">
    <img alt="paradigm logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/paradigm-light.svg" width="auto" height="70">
  </picture>
</a>

<br>

<a href="https://twitter.com/family">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/family-dark.svg">
    <img alt="family logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/family-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://twitter.com/context">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/context-dark.svg">
    <img alt="context logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/context-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://walletconnect.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/walletconnect-dark.svg">
    <img alt="WalletConnect logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/walletconnect-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://zksync.io">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/zksync-dark.svg">
    <img alt="zksync logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/zksync-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://twitter.com/prtyDAO">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/partydao-dark.svg">
    <img alt="PartyDAO logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/partydao-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://dynamic.xyz">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/dynamic-dark.svg">
    <img alt="Dynamic logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/dynamic-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://sushi.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/sushi-dark.svg">
    <img alt="Sushi logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/sushi-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://stripe.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/stripe-dark.svg">
    <img alt="Stripe logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/stripe-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://privy.io">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/privy-dark.svg">
    <img alt="Privy logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/privy-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://pancakeswap.finance">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/pancake-dark.svg">
    <img alt="pancake logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/pancake-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://celo.org">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/celo-dark.svg">
    <img alt="celo logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/celo-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://pimlico.io">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/pimlico-dark.svg">
    <img alt="pimlico logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/pimlico-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://zora.co">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/zora-dark.svg">
    <img alt="zora logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/zora-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://lattice.xyz">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/lattice-dark.svg">
    <img alt="lattice logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/lattice-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://twitter.com/supafinance">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/supa-dark.svg">
    <img alt="supa logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/supa-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://syndicate.io">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/syndicate-dark.svg">
    <img alt="syndicate logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/syndicate-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://reservoir.tools">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/reservoir-dark.svg">
    <img alt="reservoir logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/reservoir-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://brave.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/brave-dark.svg">
    <img alt="brave logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/brave-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://linea.build">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/linea-dark.svg">
    <img alt="linea logo" src="https://raw.githubusercontent.com/wevm/.github/main/content/sponsors/linea-light.svg" width="auto" height="50">
  </picture>
</a>

## Contributing

If you're interested in contributing, please read the [contributing docs](/.github/CONTRIBUTING.md) **before submitting a pull request**.

## Authors

- [@jxom](https://github.com/jxom) (jxom.eth, [Twitter](https://twitter.com/_jxom))
- [@tmm](https://github.com/tmm) (awkweb.eth, [Twitter](https://twitter.com/awkweb))

## License

[MIT](/LICENSE) License
