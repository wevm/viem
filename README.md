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

... and a lot more.

## Overview

```ts
// 1. Import modules.
import { Client, http, publicActions } from 'viem'
import { mainnet } from 'viem/chains'

// 2. Set up your client with desired chain & transport.
const client = Client.create({
  chain: mainnet,
  transport: http(),
}).extend(publicActions())

// 3. Consume an action!
const blockNumber = await client.block.getNumber()
```

## Documentation

[Head to the documentation](https://viem.sh/docs/getting-started) to read and learn more about Viem.

## Community

Check out the following places for more Viem-related content:

- Follow [@wevm_dev](https://twitter.com/wevm_dev), [@_jxom](https://twitter.com/_jxom), and [@awkweb](https://twitter.com/awkweb) on Twitter for project updates
- Join the [discussions on GitHub](https://github.com/wevm/viem/discussions)
- [Share your project/organization](https://github.com/wevm/viem/discussions/104) that uses Viem

## Support

- [GitHub Sponsors](https://github.com/sponsors/wevm?metadata_campaign=docs_support)
- [wevm.eth](https://etherscan.io/name-lookup-search?id=wevm.eth)

## Contributing

If you're interested in contributing, please read the [contributing docs](/.github/CONTRIBUTING.md) **before submitting a pull request**.

## Authors

- [@jxom](https://github.com/jxom) (jxom.eth, [Twitter](https://twitter.com/_jxom))
- [@tmm](https://github.com/tmm) (awkweb.eth, [Twitter](https://twitter.com/awkweb))

## License

MIT License
