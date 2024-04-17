export const accounts = [
  {
    address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    balance: 10000000000000000000000n,
    privateKey:
      '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  {
    address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    balance: 10000000000000000000000n,
  },
  {
    address: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
    balance: 10000000000000000000000n,
  },
  {
    address: '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
    balance: 10000000000000000000000n,
  },
  {
    address: '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
    balance: 10000000000000000000000n,
  },
  {
    address: '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc',
    balance: 10000000000000000000000n,
  },
  {
    address: '0x976ea74026e726554db657fa54763abd0c3a0aa9',
    balance: 10000000000000000000000n,
  },
  {
    address: '0x14dc79964da2c08b23698b3d3cc7ca32193d9955',
    balance: 10000000000000000000000n,
  },
  {
    address: '0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f',
    balance: 10000000000000000000000n,
  },
  {
    address: '0xa0ee7a142d267c1f36714e4a8f75612f20a79720',
    balance: 10000000000000000000000n,
  },
] as const

export const address = {
  burn: '0x0000000000000000000000000000000000000000',
  daiHolder: '0x66F62574ab04989737228D18C3624f7FC1edAe14',
  usdcHolder: '0x5414d89a8bf7e99d732bc52f3e6a3ef461c0c078',
  vitalik: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  notDeployed: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
} as const

const messages = new Map()
export function warn(message: string) {
  if (!messages.has(message)) {
    messages.set(message, true)
    console.warn(message)
  }
}

export let forkBlockNumber: bigint
if (process.env.VITE_ANVIL_BLOCK_NUMBER) {
  forkBlockNumber = BigInt(Number(process.env.VITE_ANVIL_BLOCK_NUMBER))
} else {
  forkBlockNumber = 16280770n
  warn(
    `\`VITE_ANVIL_BLOCK_NUMBER\` not found. Falling back to \`${forkBlockNumber}\`.`,
  )
}

// TODO(fault-proofs): remove when fault proofs deployed to mainnet.
export let forkBlockNumberSepolia: bigint
if (process.env.VITE_ANVIL_BLOCK_NUMBER_SEPOLIA) {
  forkBlockNumberSepolia = BigInt(
    Number(process.env.VITE_ANVIL_BLOCK_NUMBER_SEPOLIA),
  )
} else {
  forkBlockNumberSepolia = 5528803n
  warn(
    `\`VITE_ANVIL_BLOCK_NUMBER_SEPOLIA\` not found. Falling back to \`${forkBlockNumber}\`.`,
  )
}

export let forkUrl: string
if (process.env.VITE_ANVIL_FORK_URL) {
  forkUrl = process.env.VITE_ANVIL_FORK_URL
} else {
  forkUrl = 'https://cloudflare-eth.com'
  warn(`\`VITE_ANVIL_FORK_URL\` not found. Falling back to \`${forkUrl}\`.`)
}

// TODO(fault-proofs): remove when fault proofs deployed to mainnet.
export let forkUrlSepolia: string
if (process.env.VITE_ANVIL_FORK_URL_SEPOLIA) {
  forkUrlSepolia = process.env.VITE_ANVIL_FORK_URL_SEPOLIA
} else {
  forkUrlSepolia = 'https://rpc.sepolia.org'
  warn(
    `\`VITE_ANVIL_FORK_URL_SEPOLIA\` not found. Falling back to \`${forkUrlSepolia}\`.`,
  )
}

export let blockTime: number
if (process.env.VITE_ANVIL_BLOCK_TIME) {
  blockTime = Number(process.env.VITE_ANVIL_BLOCK_TIME)
} else {
  blockTime = 1
  warn(`\`VITE_ANVIL_BLOCK_TIME\` not found. Falling back to \`${blockTime}\`.`)
}

export let anvilPort: number
if (process.env.VITE_ANVIL_PORT) {
  anvilPort = Number(process.env.VITE_ANVIL_PORT)
} else {
  anvilPort = 8545
  warn(`\`VITE_ANVIL_PORT\` not found. Falling back to \`${anvilPort}\`.`)
}

// TODO(fault-proofs): remove when fault proofs deployed to mainnet.
export let anvilPortSepolia: number
if (process.env.VITE_ANVIL_PORT_SEPOLIA) {
  anvilPortSepolia = Number(process.env.VITE_ANVIL_PORT_SEPOLIA)
} else {
  anvilPortSepolia = 8845
  warn(`\`VITE_ANVIL_PORT\` not found. Falling back to \`${anvilPort}\`.`)
}

export const poolId = Number(process.env.VITEST_POOL_ID ?? 1)
export const localHttpUrl = `http://127.0.0.1:${anvilPort}/${poolId}`
export const localHttpUrlSepolia = `http://127.0.0.1:${anvilPortSepolia}/${poolId}`
export const localWsUrl = `ws://127.0.0.1:${anvilPort}/${poolId}`
export const localIpcPath = `/tmp/anvil-${poolId}.ipc`

export const typedData = {
  basic: {
    domain: {
      name: 'Ether Mail',
      version: '1',
      chainId: 1,
      verifyingContract: '0x0000000000000000000000000000000000000000',
    },
    types: {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
      ],
    },
    message: {
      from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: 'Hello, Bob!',
    },
  },
  complex: {
    domain: {
      name: 'Ether Mail 🥵',
      version: '1.1.1',
      chainId: 1,
      verifyingContract: '0x0000000000000000000000000000000000000000',
    },
    types: {
      Name: [
        { name: 'first', type: 'string' },
        { name: 'last', type: 'string' },
      ],
      Person: [
        { name: 'name', type: 'Name' },
        { name: 'wallet', type: 'address' },
        { name: 'favoriteColors', type: 'string[3]' },
        { name: 'foo', type: 'uint256' },
        { name: 'age', type: 'uint8' },
        { name: 'isCool', type: 'bool' },
      ],
      Mail: [
        { name: 'timestamp', type: 'uint256' },
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
        { name: 'hash', type: 'bytes' },
      ],
    },
    message: {
      timestamp: 1234567890n,
      contents: 'Hello, Bob! 🖤',
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      from: {
        name: {
          first: 'Cow',
          last: 'Burns',
        },
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        age: 69,
        foo: 123123123123123123n,
        favoriteColors: ['red', 'green', 'blue'],
        isCool: false,
      },
      to: {
        name: { first: 'Bob', last: 'Builder' },
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        age: 70,
        foo: 123123123123123123n,
        favoriteColors: ['orange', 'yellow', 'green'],
        isCool: true,
      },
    },
  },
} as const
