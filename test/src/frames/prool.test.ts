import { http } from 'viem'
import {
  getBalance,
  getBlockNumber,
  getChainId,
  getTransactionCount,
  sendTransaction,
  waitForTransactionReceipt,
} from 'viem/actions'
import { expect, test } from 'vitest'
import { accounts, getClient } from './config.js'
import { port, rpcUrl } from './prool.js'

const client = getClient()

test('starts a funded development chain', async () => {
  expect(await client.request({ method: 'web3_clientVersion' })).toContain(
    'reth/',
  )
  expect(await getChainId(client)).toMatchInlineSnapshot('8141')
  expect(await getBlockNumber(client)).toMatchInlineSnapshot('0n')
  for (const account of accounts)
    expect(
      await getBalance(client, { address: account.address }),
    ).toMatchInlineSnapshot('1000000000000000000000n')
})

test('mines transactions, isolates instances, and resets state', async ({
  onTestFinished,
}) => {
  const url = `http://localhost:${port}/${10_000 + Number(import.meta.env.VITEST_POOL_ID ?? 1)}`
  const isolated = getClient({ transport: http(url) })

  onTestFinished(async () => {
    const response = await fetch(`${url}/destroy`)
    if (!response.ok) throw new Error(await response.text())
  })

  const start = await fetch(`${url}/start`)
  expect(start.status).toMatchInlineSnapshot('200')

  const hash = await sendTransaction(client, {
    account: accounts[0],
    gas: 21_000n,
    maxFeePerGas: 2_000_000_000n,
    maxPriorityFeePerGas: 1_000_000_000n,
    to: accounts[1].address,
    value: 1n,
  })
  const receipt = await waitForTransactionReceipt(client, {
    hash,
    timeout: 30_000,
  })
  expect(receipt.status).toMatchInlineSnapshot('"success"')
  expect(receipt.blockNumber).toMatchInlineSnapshot('1n')
  expect(
    await getBalance(client, { address: accounts[1].address }),
  ).toMatchInlineSnapshot('1000000000000000000001n')

  expect(await getBlockNumber(isolated)).toMatchInlineSnapshot('0n')
  expect(
    await getBalance(isolated, { address: accounts[1].address }),
  ).toMatchInlineSnapshot('1000000000000000000000n')
  expect(
    await getTransactionCount(isolated, { address: accounts[0].address }),
  ).toMatchInlineSnapshot('0')

  const restart = await fetch(`${rpcUrl}/restart`)
  expect(restart.status).toMatchInlineSnapshot('200')
  expect(await getBlockNumber(client)).toMatchInlineSnapshot('0n')
  expect(
    await getBalance(client, { address: accounts[1].address }),
  ).toMatchInlineSnapshot('1000000000000000000000n')
  expect(
    await getTransactionCount(client, { address: accounts[0].address }),
  ).toMatchInlineSnapshot('0')

  const { url: directUrl } = await start.json()
  expect(
    await getChainId(getClient({ transport: http(directUrl) })),
  ).toMatchInlineSnapshot('8141')
  const stop = await fetch(`${url}/destroy`)
  expect(stop.status).toMatchInlineSnapshot('200')
  await expect(
    fetch(directUrl, { signal: AbortSignal.timeout(1_000) }),
  ).rejects.toThrow()
})
