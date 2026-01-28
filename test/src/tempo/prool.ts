import { RpcTransport } from 'ox'
import { type Instance, Server } from 'prool'
import * as TestContainers from 'prool/testcontainers'
import {
  type Chain,
  type Client,
  parseUnits,
  type Transport,
} from '../../../src/index.js'
import { pathUsd } from '../../../src/tempo/Addresses.js'
import * as actions from '../../../src/tempo/actions/index.js'
import { accounts, nodeEnv } from './config.js'

export const port = 9545

export const rpcUrl = (() => {
  if (import.meta.env.VITE_TEMPO_ENV === 'mainnet')
    return 'https://rpc.tempo.xyz'
  if (import.meta.env.VITE_TEMPO_ENV === 'devnet')
    return 'https://rpc.devnet.tempoxyz.dev'
  if (import.meta.env.VITE_TEMPO_ENV === 'testnet')
    return 'https://rpc.moderato.tempo.xyz'
  const id =
    (typeof import.meta !== 'undefined' &&
      Number(import.meta.env.VITEST_POOL_ID ?? 1) +
        Math.floor(Math.random() * 10_000)) ||
    1 + Math.floor(Math.random() * 10_000)
  return `http://localhost:${port}/${id}`
})()

export async function createServer() {
  const tag = await (async () => {
    if (!import.meta.env.VITE_TEMPO_TAG?.startsWith('http'))
      return import.meta.env.VITE_TEMPO_TAG

    const transport = RpcTransport.fromHttp(import.meta.env.VITE_TEMPO_TAG)
    const result = (await transport.request({
      method: 'web3_clientVersion',
    })) as string
    const sha = result.match(/tempo\/v[\d.]+-([a-f0-9]+)\//)?.[1]
    return `sha-${sha}`
  })()

  const args = {
    blockTime: '2ms',
    log: import.meta.env.VITE_TEMPO_LOG,
    port,
  } satisfies Instance.tempo.Parameters

  return Server.create({
    instance: TestContainers.Instance.tempo({
      ...args,
      image: `ghcr.io/tempoxyz/tempo:${tag ?? 'latest'}`,
    }),
    port,
  })
}

export async function restart(client: Client<Transport, Chain>) {
  if (nodeEnv !== 'localnet') return
  await fetch(`${client.chain.rpcUrls.default.http[0]}/restart`)
  await setup(client)
}

export async function setup(client: Client<Transport, Chain>) {
  // Mint liquidity for fee tokens.
  await Promise.all(
    [1n, 2n, 3n].map((id) =>
      actions.amm.mintSync(client, {
        account: accounts[0],
        feeToken: pathUsd,
        nonceKey: 'expiring',
        userTokenAddress: id,
        validatorTokenAddress: pathUsd,
        validatorTokenAmount: parseUnits('1000', 6),
        to: accounts[0].address,
      }),
    ),
  )

  await actions.validator.add(client, {
    account: accounts[0],
    newValidatorAddress: accounts[19].address,
    publicKey:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    active: true,
    inboundAddress: '192.168.1.100:8080',
    outboundAddress: '192.168.1.100:8080',
  })
}
