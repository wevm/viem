---
head:
  - - meta
    - property: og:title
      content: Ethers v5 → viem
  - - meta
    - name: description
      content: Migrate from Ethers v5 to viem
  - - meta
    - property: og:description
      content: Migrate from Ethers v5 to viem
---

# Ethers v5 → viem Migration Guide

This is a long document. Feel free to use the search bar above (⌘ K) or the Table of Contents to the side.

You may notice some of the APIs in viem are a little more verbose than Ethers. We prefer boring code over clever code, and we want to strongly embrace clarity & composability. We believe that [verbose APIs are more flexible](https://www.youtube.com/watch?v=4anAwXYqLG8&t=789s) to move, change and remove compared to code that is prematurely abstracted and hard to change.

## Provider → Client

### getDefaultProvider 

#### Ethers

```ts
import { getDefaultProvider } from 'ethers'

const provider = getDefaultProvider()
```

#### viem

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

> We are more verbose here – we want to be explicit and clear what chain you are connecting to & what transport you are using to avoid any confusion. :)

### JsonRpcProvider

#### Ethers

This is also interchangable with `StaticJsonRpcProvider`.

```ts
import { providers } from 'ethers'

const provider = new providers.JsonRpcProvider('https://cloudflare-eth.com')

// with chain:
const provider = new providers.JsonRpcProvider('https://rpc.ankr.com/fantom/​', {
  name: 'Fantom',
  id: 250
})
```

Custom Chain:

```ts
const provider = new providers.JsonRpcProvider('https://rpc.ankr.com/fantom/​', {
  name: 'Fantom',
  id: 250
})
```


#### viem

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://cloudflare-eth.com')
})
```

Custom Chain:

```ts
import { fantom } from 'viem/chains'

const client = createPublicClient({
  chain: fantom,
  transport: http('https://rpc.ankr.com/fantom/​')
})
```

> viem exports custom EVM chains in the `viem/chains` entrypoint.

### InfuraProvider

#### Ethers

```ts
import { providers } from 'ethers'

const provider = new providers.InfuraProvider('homestead', '<apiKey>')
```

#### viem

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://mainnet.infura.io/v3/<apiKey>')
})
```

> viem does not have custom API Provider clients – you can just pass in their RPC URL.

### AlchemyProvider

#### Ethers

```ts
import { providers } from 'ethers'

const provider = new providers.AlchemyProvider('homestead', '<apiKey>')
```

#### viem

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://eth-mainnet.alchemyapi.io/v2/<apiKey>')
})
```

> viem does not have custom API Provider clients – you can just pass in their RPC URL.

### CloudflareProvider

#### Ethers

```ts
import { providers } from 'ethers'

const provider = new providers.CloudflareProvider()
```

#### viem

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://cloudflare-eth.com/')
})
```

> viem does not have custom API Provider clients – you can just pass in their RPC URL.

### PocketProvider

#### Ethers

```ts
import { providers } from 'ethers'

const provider = new providers.PocketProvider('homestead', '<apiKey>')
```

#### viem

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://eth-mainnet.gateway.pokt.network/v1/lb/<apiKey>')
})
```

> viem does not have custom API Provider clients – you can just pass in their RPC URL.

### AnkrProvider

#### Ethers

```ts
import { providers } from 'ethers'

const provider = new providers.AnkrProvider('homestead', '<apiKey>')
```

#### viem

```ts
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://rpc.ankr.com/eth/<apiKey>')
})
```

> viem does not have custom API Provider clients – you can just pass in their RPC URL.

### FallbackProvider

#### Ethers

```ts
import { providers } from 'ethers'

const alchemy = new providers.AlchemyProvider('homestead', '<apiKey>')
const infura = new providers.AlchemyProvider('homestead', '<apiKey>')
const provider = new providers.FallbackProvider([alchemy, infura])
```

#### viem

```ts
import { createPublicClient, http, fallback } from 'viem'
import { mainnet } from 'viem/chains'

const alchemy = http('https://eth-mainnet.alchemyapi.io/v2/<apiKey>')
const infura = http('https://mainnet.infura.io/v3/<apiKey>')

const client = createPublicClient({
  chain: mainnet,
  transport: fallback([alchemy, infura])
})
```

### IpcProvider

Coming soon.

### JsonRpcBatchProvider

Coming soon.

### Web3Provider

#### Ethers

```ts
import { providers } from 'ethers'

const provider = new providers.Web3Provider(window.ethereum)
```

#### viem

```ts
import { createWalletClient, custom } from 'viem'

const client = createWalletClient({
  transport: custom(window.ethereum)
})
```

### WebSocketProvider

#### Ethers

```ts
import { providers } from 'ethers'

const provider = new providers.WebSocketProvider('wss://eth-mainnet.alchemyapi.io/v2/<apiKey>')
```

#### viem

```ts
import { createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: webSocket('wss://eth-mainnet.alchemyapi.io/v2/<apiKey>')
})
```

## Signers → getAccount

### JsonRpcSigner

#### Ethers

```ts {5-6}
import { providers } from 'ethers'

const provider = new providers.Web3Provider(window.ethereum)

const [address] = await provider.listAcconts()
const signer = provider.getSigner(address)

signer.sendTransaction({ ... })
```

#### viem

```ts {7-8}
import { createWalletClient, custom, getAccount } from 'viem'

const client = createWalletClient({
  transport: custom(window.ethereum)
})

const [address] = await client.getAddresses()
const account = getAccount(address)

client.sendTransaction({ account, ... })
```

> viem uses the term ["Account"](https://ethereum.org/en/developers/docs/accounts/) rather than "Signer".

### Wallet

#### Ethers

```ts {5}
import { providers, Wallet } from 'ethers'

const provider = new providers.Web3Provider(window.ethereum)

const wallet = new Wallet('0x...', provider)

wallet.sendTransaction({ ... })
```

#### viem

viem does not currently support client-side signing – until then, you can use an Ethers `Wallet`:

```ts {8}
import { Wallet } from 'ethers'
import { createWalletClient, custom, getAccount } from 'viem'

const client = createWalletClient({
  transport: custom(window.ethereum)
})

const account = getAccount(new Wallet('0x...'))

client.sendTransaction({ account, ... })
```

> viem uses the term ["Account"](https://ethereum.org/en/developers/docs/accounts/) rather than "Signer".

## Provider Methods

#### Ethers

```ts {5-7}
import { getDefaultProvider } from 'ethers'

const provider = getDefaultProvider()

provider.getBlock(...)
provider.getTransaction(...)
...
```

#### viem

```ts {9-11}
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

client.getBlock(...)
client.getTransaction(...)
...
```

> Methods that extend off the Public Client are **Public Actions**. [Read more](/docs/actions/public/introduction).

> There are API differences in all of these methods. Use the search bar at the top of the page to learn more about them.

## Signer Methods

### JsonRpcSigner

#### Ethers

```ts {7-10}
import { providers } from 'ethers'

const provider = new providers.Web3Provider(window.ethereum)

const [address] = await provider.listAcconts()
const signer = provider.getSigner(address)

signer.sendTransaction(...)
signer.signMessage(...)
...
```

#### viem

```ts {9-12}
import { createWalletClient, custom, getAccount } from 'viem'

const client = createWalletClient({
  transport: custom(window.ethereum)
})

const [address] = await client.getAddresses()
const account = getAccount(address)

client.sendTransaction({ account, ... })
client.signMessage({ account, ... })
...
```

> Methods that extend off the Wallet Client are **Wallet Actions**. [Read more](/docs/actions/wallet/introduction).

> There are API differences in all of these methods. Use the search bar at the top of the page to learn more about them.

### Wallet

#### Ethers

```ts {7-9}
import { providers, Wallet } from 'ethers'

const provider = new providers.Web3Provider(window.ethereum)

const wallet = new Wallet('0x...', provider)

wallet.sendTransaction(...)
wallet.signMessage(...)
...
```

#### viem

viem does not currently support client-side signing – until then, you can use an Ethers `Wallet`:

```ts {10-12}
import { Wallet } from 'ethers'
import { createWalletClient, custom, getAccount } from 'viem'

const client = createWalletClient({
  transport: custom(window.ethereum)
})

const account = getAccount(new Wallet('0x...'))

client.sendTransaction({ account, ... })
client.signMessage({ account, ... })
...
```

## Contract Interaction

### Reading from Contracts

#### Ethers

```ts {6-8}
import { getDefaultProvider } from 'ethers'
import { wagmiContractConfig } from './abi'

const provider = getDefaultProvider()

const { abi, address } = wagmiContractConfig
const contract = new Contract(address, abi, provider)
const supply = await contract.totalSupply()
```

#### viem

```ts {9-13}
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { wagmiContractConfig } from './abi'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

const supply = await client.readContract({
  ...wagmiContractConfig,
  functionName: 'totalSupply'
})
```

### Writing to Contracts

#### Ethers

```ts {9-11}
import { Contract, providers } from 'ethers'
import { wagmiContractConfig } from './abi'

const provider = new providers.Web3Provider(window.ethereum)

const [address] = await provider.listAcconts()
const signer = provider.getSigner(address)

const { abi, address } = wagmiContractConfig
const contract = new Contract(address, abi, signer)
const hash = await contract.mint()
```

#### viem

```ts {15-21}
import { createPublicClient, createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { wagmiContractConfig } from './abi'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
const walletClient = createWalletClient({
  transport: custom(window.ethereum)
})

const [address] = await walletClient.getAddresses()
const account = getAccount(address)

const request = await publicClient.simulateContract({
  ...wagmiContractConfig,
  functionName: 'mint',
  account,
})
const supply = await walletClient.writeContract(request)
```

### Deploying Contracts

#### Ethers

```ts {9-10}
import { ContractFactory, providers } from 'ethers'
import { abi, bytecode } from './abi'

const provider = new providers.Web3Provider(window.ethereum)

const [address] = await provider.listAcconts()
const signer = provider.getSigner(address)

const contract = new ContractFactory(abi, bytecode, signer)
await contract.deploy()
```

#### viem

```ts {12-16}
import { createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { abi, bytecode } from './abi'

const walletClient = createWalletClient({
  transport: custom(window.ethereum)
})

const [address] = await walletClient.getAddresses()
const account = getAccount(address)

await walletClient.deployContract({
  abi,
  account,
  bytecode,
})
```

### Contract Events

#### Ethers

```ts {6-15}
import { getDefaultProvider } from 'ethers'
import { wagmiContractConfig } from './abi'

const provider = getDefaultProvider()

const { abi, address } = wagmiContractConfig
const contract = new Contract(address, abi, provider)

const listener = (from, to, amount, event) => {
  // ...
}
contract.on('Transfer', listener)

// unsubscribe
contract.off('Transfer', listener)
```

#### viem

```ts {9-20}
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { wagmiContractConfig } from './abi'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

const unwatch = await client.watchContractEvent({
  ...wagmiContractConfig,
  eventName: 'Transfer',
  onLogs: logs => {
    const { args: { from, to, amount }, eventName } = logs[0]
    // ...
  },
})

// unsubscribe
unwatch()
```

> Note: Logs are batched between polling intervals in viem to avoid excessive callback invocations. You can disable this behavior with `batch: false` however.

### Gas Estimation

#### Ethers

```ts {6-8}
import { getDefaultProvider } from 'ethers'
import { wagmiContractConfig } from './abi'

const provider = getDefaultProvider()

const { abi, address } = wagmiContractConfig
const contract = new Contract(address, abi, provider)
const gas = contract.estimateGas.mint()
```

#### viem

```ts {9-13}
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { wagmiContractConfig } from './abi'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

const gas = client.estimateContractGas({
  ...wagmiContractConfig, 
  functionName: 'mint'
})
```

### Call

#### Ethers

```ts {6-8}
import { getDefaultProvider } from 'ethers'
import { wagmiContractConfig } from './abi'

const provider = getDefaultProvider()

const { abi, address } = wagmiContractConfig
const contract = new Contract(address, abi, provider)
await contract.callStatic.mint()
```

#### viem

```ts {9-13}
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { wagmiContractConfig } from './abi'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

await client.simulateContract({
  ...wagmiContractConfig, 
  functionName: 'mint'
})
```

## ABI Utilities

### abiCoder.encode

#### Ethers

```ts
import { utils } from 'ethers'

const abiCoder = utils.defaultAbiCoder()

// Object
abiCoder.encode(
  [{ type: 'uint', name: 'x' }, { type: 'string', name: 'y' }],
  [1234, 'Hello world']
)

// Human Readable
abiCoder.encode(
  ['uint', 'string'], 
  [1234, 'Hello World']
);
```

#### viem

```ts
import { encodeAbiParameters, parseAbiParameters } from 'viem'

// Object
encodeAbiParameters(
  [{ type: 'uint', name: 'x' }, { type: 'string', name: 'y' }],
  [1234, 'Hello world']
)

// Human Readable
encodeAbiParameters(
  parseAbiParameters('uint, string'),
  [1234, 'Hello world']
)
```

### abiCoder.decode

#### Ethers

```ts
import { utils } from 'ethers'

const abiCoder = utils.defaultAbiCoder()

// Object
abiCoder.decode(
  [{ type: 'uint', name: 'x' }, { type: 'string', name: 'y' }],
  '0x00000000000000000000000000000000000000000000000000000000000004d20000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000'
)

// Human Readable
abiCoder.decode(
  ['uint', 'string'], 
  '0x00000000000000000000000000000000000000000000000000000000000004d20000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000'
);
```

#### viem

```ts
import { decodeAbiParameters, parseAbiParameters } from 'viem'

// Object
decodeAbiParameters(
  [{ type: 'uint', name: 'x' }, { type: 'string', name: 'y' }],
  '0x00000000000000000000000000000000000000000000000000000000000004d20000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000'
)

// Human Readable
decodeAbiParameters(
  parseAbiParameters('uint, string'),
  '0x00000000000000000000000000000000000000000000000000000000000004d20000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b48656c6c6f20576f726c64000000000000000000000000000000000000000000'
)
```

### Fragments & Interfaces

In viem, there is no concept of "fragments" & "interfaces". We want to stick as close to the wire as possible and not introduce middleware abstractions and extra layers over ABIs. Instead of working with "fragments", we encourage you to work with the ABI itself.
We provide utilities such as `getAbiItem`, `inspectAbiItem`, `parseAbiItem`, `parseAbiParameters` and `parseAbiParameter` which covers the use cases of fragments.

### Interface.format

viem only supports Human Readable → Object format.

#### Ethers

```ts {3-10}
import { utils } from 'ethers'

const interface = new Interface([
  'constructor(string symbol, string name)',
  'function transferFrom(address from, address to, uint amount)',
  'function transferFrom(address from, address to, uint amount, bool x)',
  'function mint(uint amount) payable',
  'function balanceOf(address owner) view returns (uint)'
])
const json = interface.format(utils.FormatTypes.json)
```

#### viem

```ts {3-10}
import { parseAbi } from 'viem'

const json = parseAbi([
  'constructor(string symbol, string name)',
  'function transferFrom(address from, address to, uint amount)',
  'function transferFrom(address from, address to, uint amount, bool x)',
  'function mint(uint amount) payable',
  'function balanceOf(address owner) view returns (uint)',
  'event Transfer(address indexed from, address indexed to, uint256 amount)'
])
```

### Fragment Access

#### Ethers

```ts {9-10}
import { utils } from 'ethers'
import { abi } from './abi'

const interface = new Interface(abi)
interface.getFunction('transferFrom')
interface.getEvent('Transfer')
```

#### viem

```ts {11-12}
import { getAbiItem } from 'viem'
import { abi } from './abi'

getAbiItem({ abi, name: 'transferFrom' })
getAbiItem({ abi, name: 'Transfer' })
```

### Interface.encodeDeploy

#### Ethers

```ts
import { utils } from 'ethers'
import { abi } from './abi'

const iface = new utils.Interface(abi);
const data = iface.encodeDeploy(['SYM', 'Some Name'])
```

#### viem

```ts
import { encodeDeployData } from 'viem'
import { abi, bytecode } from './abi'

const data = encodeDeployData({
  abi,
  bytecode,
  args: ['SYM', 'Some Name']
})
```

> Note: viem concatinates the contract bytecode onto the ABI encoded data.

### Interface.encodeErrorResult

#### Ethers

```ts
import { utils } from 'ethers'
import { abi } from './abi'

const iface = new utils.Interface(abi);
const data = iface.encodeErrorResult('AccountLocked', [
  '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
  utils.parseEther('1.0')
]);
```

#### viem

```ts
import { encodeErrorResult, parseEther } from 'viem'
import { abi } from './abi'

const data = encodeErrorResult({
  abi: wagmiAbi,
  errorName: 'AccountLocked',
  args: [
    '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    parseEther('1.0')
  ]
})
```

### Interface.encodeFilterTopics

### Interface.encodeFunctionData

### Interface.encodeFunctionResult

### Decoding Data

## Address Utilities

## BigNumber Utilities

## Byte Manipulation Utilities

## Display Logic & Input Utilities

## Encoding Utilities

## FixedNumber Utilities

## Hashing Utilities

## String Utilities

## Transaction Utilities

## 