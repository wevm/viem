<br/>

<p align="center">
  <a href="https://viem.sh">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/wagmi-dev/viem/blob/main/.github/gh-logo-dark.svg">
        <img alt="viem logo" src="https://github.com/wagmi-dev/viem/blob/main/.github/gh-logo-light.svg" width="auto" height="60">
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
  <a href="https://app.codecov.io/gh/wagmi-dev/viem">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/codecov/c/github/wagmi-dev/viem?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/codecov/c/github/wagmi-dev/viem?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="Code coverage">
    </picture>
  </a>
  <a href="https://github.com/wagmi-dev/viem/blob/main/LICENSE">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/npm/l/viem?colorA=21262d&colorB=21262d&style=flat">
      <img src="https://img.shields.io/npm/l/viem?colorA=f6f8fa&colorB=f6f8fa&style=flat" alt="MIT License">
    </picture>
  </a>
  <a href="https://bestofjs.org/projects/viem">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/endpoint?colorA=21262d&colorB=21262d&style=flat&url=https://bestofjs-serverless.now.sh/api/project-badge?fullName=wagmi-dev%2Fviem%26since=daily">
      <img src="https://img.shields.io/endpoint?colorA=f6f8fa&colorB=f6f8fa&style=flat&url=https://bestofjs-serverless.now.sh/api/project-badge?fullName=wagmi-dev%2Fviem%26since=daily" alt="Best of JS">
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
- First-class support for [Anvil](https://book.getfoundry.sh/) & [Hardhat](https://hardhat.org/)
- Test suite running against [forked](https://ethereum.org/en/glossary/#fork) Ethereum network

... and a lot lot more.

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

## Community

Check out the following places for more viem-related content:

- Follow [@wagmi_sh](https://twitter.com/wagmi_sh), [@jakemoxey](https://twitter.com/jakemoxey), and [@awkweb](https://twitter.com/awkweb) on Twitter for project updates
- Join the [discussions on GitHub](https://github.com/wagmi-dev/viem/discussions)
- [Share your project/organization](https://github.com/wagmi-dev/viem/discussions/104) that uses viem

## Support

- [GitHub Sponsors](https://github.com/sponsors/wagmi-dev?metadata_campaign=docs_support)
- [Gitcoin Grant](https://wagmi.sh/gitcoin)
- [wagmi-dev.eth](https://etherscan.io/enslookup-search?search=wagmi-dev.eth)

## Sponsors

<a href="https://paradigm.xyz">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/paradigm-dark.svg">
    <img alt="paradigm logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/paradigm-light.svg" width="auto" height="70">
  </picture>
</a>

<br>

<a href="https://twitter.com/family">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/family-dark.svg">
    <img alt="family logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/family-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://twitter.com/context">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/context-dark.svg">
    <img alt="context logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/context-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://walletconnect.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/walletconnect-dark.svg">
    <img alt="WalletConnect logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/walletconnect-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://looksrare.org">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/looksrare-dark.svg">
    <img alt="LooksRare logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/8923685e23fe9708b74d456c3f9e7a2b90f6abd9/content/sponsors/looksrare-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://twitter.com/prtyDAO">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/partydao-dark.svg">
    <img alt="PartyDAO logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/partydao-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://dynamic.xyz">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/dynamic-dark.svg">
    <img alt="Dynamic logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/dynamic-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://sushi.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/sushi-dark.svg">
    <img alt="Sushi logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/sushi-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://stripe.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/stripe-dark.svg">
    <img alt="Stripe logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/stripe-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://bitkeep.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/bitkeep-dark.svg">
    <img alt="BitKeep logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/bitkeep-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://privy.io">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/privy-dark.svg">
    <img alt="Privy logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/privy-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://spruceid.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/spruce-dark.svg">
    <img alt="Spruce logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/spruce-light.svg" width="auto" height="50">
  </picture>
</a>
<a href="https://rollup.id">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/rollup.id-dark.svg">
    <img alt="rollup.id logo" src="https://raw.githubusercontent.com/wagmi-dev/.github/main/content/sponsors/rollup.id-light.svg" width="auto" height="50">
  </picture>
</a>

## Contributing

If you're interested in contributing, please read the [contributing docs](/.github/CONTRIBUTING.md) **before submitting a pull request**.

## Authors

- [@jxom](https://github.com/jxom) (jxom.eth, [Twitter](https://twitter.com/jakemoxey))
- [@tmm](https://github.com/tmm) (awkweb.eth, [Twitter](https://twitter.com/awkweb))

## License

[MIT](/LICENSE) License
