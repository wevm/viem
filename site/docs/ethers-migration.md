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

This is a long document. Feel free to use the search bar above (⌘ K) or the Table of Contents to the side. If there is an API you need which is missing or cannot find, create a [Parity Request here](https://github.com/wevm/viem/discussions/new?category=feature-request&title=Parity%20Request:).

You may notice some of the APIs in viem are a little more verbose than Ethers. We prefer boring code and we want to strongly embrace [clarity & composability](/docs/introduction.html#developer-experience). We believe that [verbose APIs are more flexible](https://www.youtube.com/watch?v=4anAwXYqLG8&t=789s) to move, change and remove compared to code that is prematurely abstracted and hard to change.

## Provider → Client

### getDefaultProvider 

#### Ethers

```ts {3}
import { getDefaultProvider } from 'ethers'

const provider = getDefaultProvider()
```

#### viem

```ts {4-7}
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

This is also interchangeable with `StaticJsonRpcProvider`.

```ts {3}
import { providers } from 'ethers'

const provider = new providers.JsonRpcProvider('https://cloudflare-eth.com')
```

Custom Chain:

```ts {3-6}
import { providers } from 'ethers'

const provider = new providers.JsonRpcProvider('https://rpc.ankr.com/fantom/​', {
  name: 'Fantom',
  id: 250
})
```


#### viem

```ts {4-7}
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://cloudflare-eth.com')
})
```

Custom Chain:

```ts {4-7}
import { createPublicClient, http } from 'viem'
import { fantom } from 'viem/chains'

const client = createPublicClient({
  chain: fantom,
  transport: http('https://rpc.ankr.com/fantom/​')
})
```

> viem exports custom EVM chains in the `viem/chains` entrypoint.

### InfuraProvider

#### Ethers

```ts {3}
import { providers } from 'ethers'

const provider = new providers.InfuraProvider('homestead', '<apiKey>')
```

#### viem

```ts {4-7}
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

```ts {3}
import { providers } from 'ethers'

const provider = new providers.AlchemyProvider('homestead', '<apiKey>')
```

#### viem

```ts {4-7}
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http('https://eth-mainnet.g.alchemy.com/v2/<apiKey>')
})
```

> viem does not have custom API Provider clients – you can just pass in their RPC URL.

### CloudflareProvider

#### Ethers

```ts {3}
import { providers } from 'ethers'

const provider = new providers.CloudflareProvider()
```

#### viem

```ts {4-7}
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

```ts {3}
import { providers } from 'ethers'

const provider = new providers.PocketProvider('homestead', '<apiKey>')
```

#### viem

```ts {4-7}
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

```ts {3}
import { providers } from 'ethers'

const provider = new providers.AnkrProvider('homestead', '<apiKey>')
```

#### viem

```ts {4-7}
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

```ts {3-5}
import { providers } from 'ethers'

const alchemy = new providers.AlchemyProvider('homestead', '<apiKey>')
const infura = new providers.InfuraProvider('homestead', '<apiKey>')
const provider = new providers.FallbackProvider([alchemy, infura])
```

#### viem

```ts {4-5,9}
import { createPublicClient, http, fallback } from 'viem'
import { mainnet } from 'viem/chains'

const alchemy = http('https://eth-mainnet.g.alchemy.com/v2/<apiKey>')
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

```ts {3}
import { providers } from 'ethers'

const provider = new providers.Web3Provider(window.ethereum)
```

#### viem

```ts {4-7}
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const client = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})
```

### WebSocketProvider

#### Ethers

```ts {3}
import { providers } from 'ethers'

const provider = new providers.WebSocketProvider('wss://eth-mainnet.g.alchemy.com/v2/<apiKey>')
```

#### viem

```ts {4-7}
import { createPublicClient, webSocket } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: webSocket('wss://eth-mainnet.g.alchemy.com/v2/<apiKey>')
})
```

## Signers → Accounts

### JsonRpcSigner

#### Ethers

```ts {5-6}
import { providers } from 'ethers'

const provider = new providers.Web3Provider(window.ethereum)

const [address] = await provider.listAccounts()
const signer = provider.getSigner(address)

signer.sendTransaction({ ... })
```

#### viem

```ts {4,7}
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: custom(window.ethereum)
})

client.sendTransaction({ ... })
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

```ts {6,9}
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'

const account = privateKeyToAccount('0x...')

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: custom(window.ethereum)
})

client.sendTransaction({ ... })
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

```ts {8-9}
import { providers } from 'ethers'

const provider = new providers.Web3Provider(window.ethereum)

const [address] = await provider.listAccounts()
const signer = provider.getSigner(address)

signer.sendTransaction(...)
signer.signMessage(...)
...
```

#### viem

```ts {12-13}
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })

const client = createWalletClient({
  account,
  chain: mainnet,
  transport: custom(window.ethereum)
})

client.sendTransaction({ ... })
client.signMessage({ ... })
...
```

> Methods that extend off the Wallet Client are **Wallet Actions**. [Read more](/docs/actions/wallet/introduction).

> There are API differences in all of these methods. Use the search bar at the top of the page to learn more about them.

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

```ts {10-13}
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

const [address] = await provider.listAccounts()
const signer = provider.getSigner(address)

const { abi, address } = wagmiContractConfig
const contract = new Contract(address, abi, signer)
const hash = await contract.mint()
```

#### viem

```ts {17-22}
import { createPublicClient, createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { wagmiContractConfig } from './abi'

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
const walletClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})

const [address] = await walletClient.getAddresses()

const { request } = await publicClient.simulateContract({
  ...wagmiContractConfig,
  functionName: 'mint',
  account: address,
})
const hash = await walletClient.writeContract(request)
```

### Deploying Contracts

#### Ethers

```ts {9-10}
import { ContractFactory, providers } from 'ethers'
import { abi, bytecode } from './abi'

const provider = new providers.Web3Provider(window.ethereum)

const [address] = await provider.listAccounts()
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
  chain: mainnet,
  transport: custom(window.ethereum)
})

const [address] = await walletClient.getAddresses()

await walletClient.deployContract({
  abi,
  account: address,
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

```ts {10-20}
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { wagmiContractConfig } from './abi'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

const unwatch = client.watchContractEvent({
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
const gas = await contract.estimateGas.mint()
```

#### viem

```ts {10-13}
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { wagmiContractConfig } from './abi'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

const gas = await client.estimateContractGas({
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

```ts {10-13}
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

### Contract Instances

#### Ethers

```ts {6-7}
import { getDefaultProvider } from 'ethers'
import { wagmiContractConfig } from './abi'

const provider = getDefaultProvider()

const { abi, address } = wagmiContractConfig
const contract = new Contract(address, abi, provider)

const supply = await contract.totalSupply()
const listener = (from, to, amount, event) => {
  // ...
}
contract.on('Transfer', listener)
contract.off('Transfer', listener)
```

#### viem

```ts {10-13}
import { createPublicClient, http, getContract } from 'viem'
import { mainnet } from 'viem/chains'
import { wagmiContractConfig } from './abi'

const client = createPublicClient({
  chain: mainnet,
  transport: http()
})

const contract = getContract({
  ...wagmiContractConfig,
  publicClient: client,
})

const supply = await contract.read.totalSupply()
const unwatch = contract.watchEvent.Transfer({
  onLogs: logs => {
    const { args: { from, to, amount }, eventName } = logs[0]
    // ...
  },
})
unwatch()
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

Notice: different from ethers, viem only supports [standard tuple expression](https://docs.soliditylang.org/en/latest/grammar.html#a4.SolidityParser.tupleExpression) for Human Readable.
example: `(uint a, string b)` is valid, but `tuple(uint a, string b)` is not.

### Fragments & Interfaces

In viem, there is no concept of "fragments" & "interfaces". We want to stick as close to the wire as possible and not introduce middleware abstractions and extra layers over ABIs. Instead of working with "fragments", we encourage you to work with the ABI itself.
We provide utilities such as `getAbiItem`, `parseAbi` `parseAbiItem`, `parseAbiParameters` and `parseAbiParameter` which covers the use cases of interfaces & fragments.

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

### Fragment.from

#### ethers

```ts {3}
import { utils } from 'ethers'

const fragment = utils.Fragment.from('function balanceOf(address owner) view returns (uint)')
```

#### viem

```ts {3}
import { parseAbiItem } from 'viem'

const abiItem = parseAbiItem('function balanceOf(address owner) view returns (uint)')
```

### ParamType.from

#### ethers

```ts {3}
import { utils } from 'ethers'

const param = utils.ParamType.from('address owner')
```

#### viem

```ts {3}
import { parseAbiParameter } from 'viem'

const param = parseAbiParameter('address owner')
```

### Fragment Access

#### Ethers

```ts {4-6}
import { utils } from 'ethers'
import { abi } from './abi'

const interface = new utils.Interface(abi) 
interface.getFunction('transferFrom')
interface.getEvent('Transfer')
```

#### viem

```ts {4-5}
import { getAbiItem } from 'viem'
import { abi } from './abi'

getAbiItem({ abi, name: 'transferFrom' }) 
getAbiItem({ abi, name: 'Transfer' })
```

### Interface.encodeDeploy

#### Ethers

```ts {4-5}
import { utils } from 'ethers'
import { abi } from './abi'

const iface = new utils.Interface(abi); 
const data = iface.encodeDeploy(['SYM', 'Some Name'])
```

#### viem

```ts {4-8}
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

```ts {4-8}
import { utils } from 'ethers'
import { abi } from './abi'

const iface = new utils.Interface(abi); 
const data = iface.encodeErrorResult('AccountLocked', [
  '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
  utils.parseEther('1.0')
]);
```

#### viem

```ts {4-11}
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

#### Ethers

```ts {4-8}
import { utils } from 'ethers'
import { abi } from './abi'

const iface = new utils.Interface(abi); 
const data = iface.encodeFilterTopics('Transfer', [
  null,
  '0x8ba1f109551bD432803012645Ac136ddd64DBA72'
])
```

#### viem

```ts {4-10}
import { encodeEventTopics } from 'viem'
import { abi } from './abi'

const data = encodeEventTopics({ 
  abi,
  eventName: 'Transfer',
  args: {
    to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72'
  }
})
```

### Interface.encodeFunctionData

#### Ethers

```ts {4-9}
import { utils } from 'ethers'
import { abi } from './abi'

const iface = new utils.Interface(abi); 
const data = iface.encodeFunctionData('transferFrom', [
  '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
  '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C',
  parseEther('1.0')
])
```

#### viem

```ts {4-12}
import { encodeFunctionData, parseEther } from 'viem'
import { abi } from './abi'

const data = encodeFunctionData({ 
  abi,
  functionName: 'transferFrom',
  args: [
    '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    '0xaB7C8803962c0f2F5BBBe3FA8bf41cd82AA1923C',
    parseEther('1.0')
  ]
})
```

### Interface.encodeFunctionResult

#### Ethers

```ts {4-7}
import { utils } from 'ethers'
import { abi } from './abi'

const iface = new utils.Interface(abi); 
const data = iface.encodeFunctionResult('balanceOf', [
  '0x8ba1f109551bD432803012645Ac136ddd64DBA72'
])
```

#### viem

```ts {4-8}
import { encodeFunctionResult, parseEther } from 'viem'
import { abi } from './abi'

const data = encodeFunctionResult({ 
  abi,
  functionName: 'balanceOf',
  value: ['0x8ba1f109551bD432803012645Ac136ddd64DBA72']
})
```

### Interface.decodeErrorResult

#### Ethers

```ts {4-5}
import { utils } from 'ethers'
import { abi } from './abi'

const iface = new utils.Interface(abi); 
const result = iface.decodeErrorResult("AccountLocked", '0xf7c3865a0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000de0b6b3a7640000')
```

#### viem

```ts {4-7}
import { decodeErrorResult, parseEther } from 'viem'
import { abi } from './abi'

const result = decodeErrorResult({ 
  abi,
  data: '0xf7c3865a0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000de0b6b3a7640000'
})
```

### Interface.decodeEventLog

#### Ethers

```ts {4-13}
import { utils } from 'ethers'
import { abi } from './abi'

const iface = new utils.Interface(abi); 
const result = iface.decodeEventLog(
  'Transfer', 
  data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000', 
  topics: [
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    '0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72',
    '0x000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c'
  ]
);
```

#### viem

```ts {4-12}
import { decodeEventLog, parseEther } from 'viem'
import { abi } from './abi'

const result = decodeEventLog({ 
  abi,
  data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000', 
  topics: [
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    '0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72',
    '0x000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c'
  ]
})
```

### Interface.decodeFunctionData

#### Ethers

```ts {4-5}
import { utils } from 'ethers'
import { abi } from './abi'

const iface = new utils.Interface(abi); 
const result = iface.decodeFunctionData('transferFrom', '0x23b872dd0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c0000000000000000000000000000000000000000000000000de0b6b3a7640000');
```

#### viem

```ts {4-7}
import { decodeFunctionData, parseEther } from 'viem'
import { abi } from './abi'

const result = decodeFunctionData({ 
  abi,
  data: '0x23b872dd0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72000000000000000000000000ab7c8803962c0f2f5bbbe3fa8bf41cd82aa1923c0000000000000000000000000000000000000000000000000de0b6b3a7640000',
})
```

### Interface.decodeFunctionResult

#### Ethers

```ts {4-5}
import { utils } from 'ethers'
import { abi } from './abi'

const iface = new utils.Interface(abi); 
const result = iface.decodeFunctionResult('balanceOf', '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000');
```

#### viem

```ts {4-8}
import { decodeFunctionResult, parseEther } from 'viem'
import { abi } from './abi'

const result = decodeFunctionResult({ 
  abi,
  functionName: 'balanceOf',
  data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
})
```

## Address Utilities

### getAddress

#### Ethers

```ts {3}
import { utils } from 'ethers'

const address = utils.getAddress('0x8ba1f109551bd432803012645ac136ddd64dba72')
```

#### viem

```ts {3}
import { getAddress } from 'viem'

const address = getAddress('0x8ba1f109551bd432803012645ac136ddd64dba72')
```

### isAddress

#### Ethers

```ts {3}
import { utils } from 'ethers'

const address = utils.isAddress('0x8ba1f109551bd432803012645ac136ddd64dba72')
```

#### viem

```ts {3}
import { isAddress } from 'viem'

const address = isAddress('0x8ba1f109551bd432803012645ac136ddd64dba72')
```

### getContractAddress

#### Ethers

```ts {3}
import { utils } from 'ethers'

const address = utils.getContractAddress({ from: '0x...', nonce: 5 });
```

#### viem

```ts {3}
import { getContractAddress } from 'viem'

const address = getContractAddress({ from: '0x...', nonce: 5 })
```

### getCreate2Address

#### Ethers

```ts {3-8}
import { utils } from 'ethers'

const from = '0x8ba1f109551bD432803012645Ac136ddd64DBA72';
const salt = '0x7c5ea36004851c764c44143b1dcb59679b11c9a68e5f41497f6cf3d480715331';
const initCode = '0x6394198df16000526103ff60206004601c335afa6040516060f3';
const initCodeHash = utils.keccak256(initCode);

const address = utils.getCreate2Address(from, salt, initCodeHash);
```

#### viem

```ts {3-8}
import { getContractAddress } from 'viem'

const address = getContractAddress({
  bytecode: '0x6394198df16000526103ff60206004601c335afa6040516060f3',
  from: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
  opcode: 'CREATE2',
  salt: '0x7c5ea36004851c764c44143b1dcb59679b11c9a68e5f41497f6cf3d480715331',
});
```

## BigNumber Utilities

### Ethers

Many.

### viem

None. We use browser native [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt).

## Byte Manipulation Utilities

### isBytes

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.isBytes(new Uint8Array([1, 69, 420]))
```

#### viem

```ts {3}
import { isBytes } from 'viem'

isBytes(new Uint8Array([1, 69, 420]))
```

### isHexString

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.isHexString('0xdeadbeef')
```

#### viem

```ts {3}
import { isHex } from 'viem'

isHex('0xdeadbeef')
```

### isBytesLike

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.isBytesLike('0xdeadbeef')
```

#### viem

```ts {3}
import { isBytes, isHex } from 'viem'

isBytes('0xdeadbeef') || isHex('0xdeadbeef')
```

### arrayify

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.arrayify('0xdeadbeef')
```

#### viem

```ts {3}
import { toBytes } from 'viem'

toBytes('0xdeadbeef')
```

### hexlify

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.hexlify(new Uint8Array([1, 69, 420]))
```

#### viem

```ts {3}
import { toHex } from 'viem'

toHex(new Uint8Array([1, 69, 420]))
```

### hexValue

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.hexValue(1)
```

#### viem

```ts {3}
import { toHex } from 'viem'

toHex(1)
```

### formatBytes32String

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.formatBytes32String('Hello world')
// 0x48656c6c6f20776f726c642e0000000000000000000000000000000000000000
```

#### viem

```ts {3-6}
import { stringToHex } from 'viem'

stringToHex(
  'Hello world', 
  { size: 32 }
)
// 0x48656c6c6f20776f726c642e0000000000000000000000000000000000000000
```

### parseBytes32String

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.parseBytes32String('0x48656c6c6f20776f726c642e0000000000000000000000000000000000000000')
// "Hello world"
```

#### viem

```ts {3-6}
import { hexToString } from 'viem'

hexToString(
  '0x48656c6c6f20776f726c642e0000000000000000000000000000000000000000', 
  { size: 32 }
)
// "Hello world"
```

### concat

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.concat([new Uint8Array([69]), new Uint8Array([420])])
```

#### viem

```ts {3}
import { concat, toBytes } from 'viem'

concat([new Uint8Array([69]), new Uint8Array([420])])
```

### stripZeros

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.stripZeros(new Uint8Array([0, 0, 0, 0, 0, 69]))
```

#### viem

```ts {3}
import { trim } from 'viem'

trim(new Uint8Array([0, 0, 0, 0, 0, 69]))
```

### zeroPad

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.zeroPad(new Uint8Array([69]), 32)
```

#### viem

```ts {3}
import { pad } from 'viem'

pad(new Uint8Array([69]), { size: 32 })
```

### hexConcat

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.hexConcat(['0x00000069', '0x00000420'])
```

#### viem

```ts {3}
import { concat, toBytes } from 'viem'

concat(['0x00000069', '0x00000420'])
```

### hexDataLength

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.hexDataLength('0x00000069')
```

#### viem

```ts {3}
import { size } from 'viem'

size('0x00000069')
```

### hexDataSlice

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.hexDataSlice('0x00000069', 4)
```

#### viem

```ts {3}
import { slice } from 'viem'

slice('0x00000069', 4)
```

### hexStripZeros

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.hexStripZeros('0x00000069')
```

#### viem

```ts {3}
import { trim } from 'viem'

trim('0x00000069')
```

### hexZeroPad

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.hexZeroPad('0x69', 32)
```

#### viem

```ts {3}
import { pad } from 'viem'

pad('0x69', { size: 32 })
```

## Display Logic & Input Utilities

### formatUnits

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.formatUnits(BigNumber.from('1000000000'), 9)
```

#### viem

```ts {3}
import { formatUnits } from 'viem'

formatUnits(1000000000n, 9)
```

### formatEther

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.formatEther(BigNumber.from('1000000000000000000'))
```

#### viem

```ts {3}
import { formatEther } from 'viem'

formatEther(1000000000000000000n)
```

### parseUnits

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.parseUnits('1.0', 18)
```

#### viem

```ts {3}
import { parseUnits } from 'viem'

parseUnits('1', 18)
```

### parseEther

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.parseEther('1.0')
```

#### viem

```ts {3}
import { parseEther } from 'viem'

parseEther('1')
```

## Encoding Utilities

### RLP.encode

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.RLP.encode('0x12345678')
```

#### viem

```ts {3}
import { toRlp } from 'viem'

toRlp('0x12345678')
```

### RLP.decode

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.RLP.decode('0x8412345678')
```

#### viem

```ts {3}
import { fromRlp } from 'viem'

fromRlp('0x8412345678')
```

## Hashing Utilities

### id

#### Ethers

```ts {3,5-6}
import { utils } from 'ethers'

utils.id('function ownerOf(uint256 tokenId)')

// hash utf-8 data
utils.id('hello world')
```

#### viem

```ts {3,5-6}
import { getFunctionSelector, keccak256, toHex } from 'viem'

getFunctionSelector('function ownerOf(uint256 tokenId)')

// hash utf-8 data
keccak256(toHex('hello world'))
```

### keccak256

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.keccak256(utils.toUtf8Bytes('hello world'))
```

#### viem

```ts {3}
import { keccak256, toBytes } from 'viem'

keccak256(toBytes('hello world'))
```

### encodeBase64/decodeBase64

viem does not provide Base64 encoding utilities. 

You can use browser native [`atob`](https://developer.mozilla.org/en-US/docs/Web/API/atob) and [`btoa`](https://developer.mozilla.org/en-US/docs/Web/API/btoa) instead.

### encodeBase58/decodeBase58

viem does not provide Base58 encoding utilities.

You can use libraries such as [`base58-js`](https://www.npmjs.com/package/base58-js) or [`bs58`](https://github.com/cryptocoinjs/bs58) instead.

### namehash

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.namehash('awkweb.eth')
```

#### viem

```ts {3}
import { namehash } from 'viem'

namehash('awkweb.eth')
```

### solidityPack & solidityKeccak256

#### Ethers

```ts {3,4}
import { utils } from 'ethers'

utils.solidityPack(['int16', 'uint48'], [-1, 12])
utils.solidityKeccak256(['int16', 'uint48'], [-1, 12])
```

#### viem

```ts {3,4}
import { encodePacked, keccak256 } from 'viem'

encodePacked(['int16', 'uint48'], [-1, 12])
keccak256(encodePacked(['int16', 'uint48'], [-1, 12]))
```

## String Utilities

### toUtf8Bytes

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.toUtf8Bytes('Hello World')
```

#### viem

```ts {3}
import { stringToBytes } from 'viem'

stringToBytes('Hello World')
```

### toUtf8String

#### Ethers

```ts {3}
import { utils } from 'ethers'

utils.toUtf8String(new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]))
```

#### viem

```ts {3}
import { bytesToString } from 'viem'

bytesToString(new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]))
```

## Transaction Utilities

### serializeTransaction

#### Ethers

```ts
import { utils } from 'ethers'

const serialized = utils.serializeTransaction({
  chainId: 1,
  maxFeePerGas: utils.parseGwei('20'),
  maxPriorityFeePerGas: utils.parseGwei('2'),
  nonce: 69,
  to: "0x1234512345123451234512345123451234512345",
  type: 2,
  value: utils.parseEther('0.01'),
})
```

#### viem

```ts
import { serializeTransaction, parseEther, parseGwei } from 'viem'

const serialized = serializeTransaction({
  chainId: 1,
  gas: 21001n,
  maxFeePerGas: parseGwei('20'),
  maxPriorityFeePerGas: parseGwei('2'),
  nonce: 69,
  to: "0x1234512345123451234512345123451234512345",
  value: parseEther('0.01'),
})
```

### parseTransaction

#### Ethers

```ts
import { utils } from 'ethers'

const transaction = utils.parseTransaction('0x02ef0182031184773594008477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0')
```

#### viem

```ts
import { parseTransaction } from 'viem'

const transaction = parseTransaction('0x02ef0182031184773594008477359400809470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a764000080c0')
```
