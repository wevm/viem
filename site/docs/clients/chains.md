---
head:
  - - meta
    - property: og:title
      content: Chains
  - - meta
    - name: description
      content: A list of chains to use with viem.
  - - meta
    - property: og:description
      content: A list of chains to use with viem.

---

# Chains

The `viem/chains` entrypoint proxies the [`@wagmi/chains` NPM package](https://npm.im/@wagmi/chains), an official wagmi package which contains references to popular EVM-compatible chains such as: Polygon, Optimism, Avalanche, and more.

## Usage

Import your chain from the entrypoint and use them in the consuming viem code:

```tsx {2,5}
import { createPublicClient, http } from 'viem'
import { avalanche } from 'viem/chains'

const client = createPublicClient({
  chain: avalanche,
  transport: http()
})
```

### Supported chains

- `mainnet`
- `goerli`
- `arbitrum`
- `arbitrumGoerli`
- `aurora`
- `auroraTestnet`
- `avalanche`
- `avalancheFuji`
- `baseGoerli`
- `boba`
- `bronos`
- `bronosTestnet`
- `bsc`
- `bscTestnet`
- `canto`
- `celo`
- `celoAlfajores`
- `crossbell`
- `evmos`
- `evmosTestnet`
- `fantom`
- `fantomTestnet`
- `filecoin`
- `filecoinCalibration`
- `filecoinHyperspace`
- `flare`
- `flareTestnet`
- `gnosis`
- `gnosisChiado`
- `harmonyOne`
- `iotex`
- `iotexTestnet`
- `metis`
- `metisGoerli`
- `moonbaseAlpha`
- `moonbeam`
- `moonriver`
- `okc`
- `optimism`
- `optimismGoerli`
- `polygon`
- `polygonMumbai`
- `polygonZkEvmTestnet`
- `sepolia`
- `shardeumSphinx`
- `songbird`
- `songbirdTestnet`
- `taraxa`
- `taraxaTestnet`
- `telos`
- `telosTestnet`
- `zhejiang`
- `zora`
- `zoraTestnet`
- `zkSync`
- `zkSyncTestnet`
- `foundry`
- `hardhat`
- `localhost`

> Want to add a chain that's not listed here? Head to the [wagmi References monorepo](https://github.com/wagmi-dev/references) and read the [Contributing Guide](https://github.com/wagmi-dev/references/blob/main/.github/CONTRIBUTING.md) before opening a pull request.

## Build your own

You can also extend wagmi to support other EVM-compatible chains by building your own chain object that inherits the `Chain` type.

```ts
import { Chain } from 'viem'

export const avalanche = {
  id: 43_114,
  name: 'Avalanche',
  network: 'avalanche',
  nativeCurrency: {
    decimals: 18,
    name: 'Avalanche',
    symbol: 'AVAX',
  },
  rpcUrls: {
    public: { http: ['https://api.avax.network/ext/bc/C/rpc'] },
    default: { http: ['https://api.avax.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    etherscan: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 11_907_934,
    },
  },
} as const satisfies Chain
```