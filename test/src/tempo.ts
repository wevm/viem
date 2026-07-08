import { Server } from 'prool'
import * as TestContainers from 'prool/testcontainers'

import { Actions, Token } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'

import * as constants from './constants.js'

export const port = Number(process.env.VITE_TEMPO_PORT ?? 9545)

/** Pool-scoped RPC URL (one node instance per vitest pool). */
export const rpcUrl = `http://localhost:${port}/${constants.poolId}`

/** Tempo localnet dev accounts (the anvil "test … junk" mnemonic). */
export const accounts = constants.accounts

export const alphaUsd = '0x20c0000000000000000000000000000000000001'
export const pathUsd = '0x20c0000000000000000000000000000000000000'

/** Genesis token declarations (drive `decimals`/`formatted` inference). */
const tokens = [
  Token.from({
    addresses: { [tempoLocalnet.id]: pathUsd },
    currency: 'USD',
    decimals: 6,
    name: 'pathUSD',
    symbol: 'pathUSD',
  }),
  Token.from({
    addresses: { [tempoLocalnet.id]: alphaUsd },
    currency: 'USD',
    decimals: 6,
    name: 'AlphaUSD',
    symbol: 'AlphaUSD',
  }),
]

const feeAmmAbi = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'userToken' },
      { type: 'address', name: 'validatorToken' },
      { type: 'uint256', name: 'validatorTokenAmount' },
      { type: 'address', name: 'to' },
    ],
    outputs: [],
  },
] as const

const validatorConfigAbi = [
  {
    name: 'addValidator',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'newValidatorAddress' },
      { type: 'bytes32', name: 'publicKey' },
      { type: 'bool', name: 'active' },
      { type: 'string', name: 'inboundAddress' },
      { type: 'string', name: 'outboundAddress' },
    ],
    outputs: [],
  },
] as const

/** Creates a Client for the pool's Tempo node instance. */
export function getClient(options: getClient.Options = {}) {
  const { account = Account.fromSecp256k1(accounts[0].privateKey), feeToken } =
    options
  return Client.create({
    account,
    chain: tempoLocalnet,
    ...(feeToken ? { feeToken } : {}),
    pollingInterval: 100,
    tokens,
    transport: http(rpcUrl),
  })
}

export declare namespace getClient {
  type Options = {
    /** Account for the Client. @default dev account 0 */
    account?: Account.Account | undefined
    /** Default fee token for the Client. */
    feeToken?: `0x${string}` | undefined
  }
}

/** Registers `address` as a validator (dev account 0 is the config owner). */
export async function registerValidator(
  client: ReturnType<typeof getClient>,
  options: { address: `0x${string}` },
) {
  await Actions.contract.writeSync(client, {
    abi: validatorConfigAbi,
    address: '0xcccccccc00000000000000000000000000000000',
    args: [
      options.address,
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      true,
      '192.168.1.100:8080',
      '192.168.1.100:8080',
    ],
    feeToken: pathUsd,
    functionName: 'addValidator',
    nonceKey: 'expiring',
  })
}

/** Mints fee-AMM liquidity for `token` (fee-token validity). */
export async function mintLiquidity(
  client: ReturnType<typeof getClient>,
  options: { token: string },
) {
  await Actions.contract.writeSync(client, {
    abi: feeAmmAbi,
    address: '0xfeec000000000000000000000000000000000000',
    args: [options.token, pathUsd, 1_000_000_000n, client.account!.address],
    feeToken: pathUsd,
    functionName: 'mint',
    nonceKey: 'expiring',
  } as never)
}

/** Mints fee-AMM liquidity for the genesis tokens (fee-token validity). */
export async function setup() {
  const client = getClient()
  await Promise.all(
    [1n, 2n, 3n].map((id) =>
      mintLiquidity(client, {
        token: `0x20c000000000000000000000000000000000000${id}`,
      }),
    ),
  )
}

/** Restarts the pool's Tempo node instance (fresh genesis state). */
export async function restart() {
  await fetch(`${rpcUrl}/restart`)
}

/** Creates the pooled Tempo node server (Dockerized via testcontainers). */
export function createServer() {
  return Server.create({
    instance: TestContainers.Instance.tempo({
      blockTime: '2ms',
      image: 'ghcr.io/tempoxyz/tempo:latest',
      port,
    }),
    port,
  })
}
