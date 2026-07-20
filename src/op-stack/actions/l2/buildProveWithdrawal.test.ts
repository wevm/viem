import { Rlp } from 'ox'
import { afterAll, expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as Http from '~test/http.js'
import { Actions as CoreActions, Client, http } from 'viem'
import { optimism } from 'viem/chains'
import { Actions, Withdrawal } from 'viem/op-stack'

import {
  maybeAddProofNode,
  TimestampMismatchError,
} from './buildProveWithdrawal.js'

const client = Client.create({
  chain: optimism,
  transport: http(anvil.optimism.rpcUrl.http),
})
const withdrawal = {
  data: '0x',
  gasLimit: 0n,
  nonce: 0n,
  sender: constants.accounts[0].address,
  target: constants.accounts[1].address,
  value: 0n,
  withdrawalHash:
    '0x0000000000000000000000000000000000000000000000000000000000000000',
} satisfies Withdrawal.Withdrawal

/** Proxies real node responses while removing the requested storage proof. */
function createEmptyProofServer() {
  return Http.createServer(async (req, res) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', async () => {
      const request = JSON.parse(body)
      const response = await fetch(anvil.optimism.rpcUrl.http, {
        body,
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      res.setHeader('Content-Type', 'application/json')
      if (request.method !== 'eth_getProof') {
        res.end(await response.text())
        return
      }

      type ProofResponse = {
        result: { storageProof: unknown[]; [key: string]: unknown }
      }
      const json = (await response.json()) as ProofResponse
      json.result.storageProof = []
      res.end(JSON.stringify(json))
    })
  })
}

afterAll(async () => {
  await CoreActions.state.reset(client, {
    blockNumber: anvil.optimism.forkBlockNumber,
    jsonRpcUrl: anvil.optimism.forkUrl,
  })
}, 60_000)

test('builds a legacy withdrawal proof', async () => {
  // Proof availability is windowed, so this test must fork the current head.
  await CoreActions.state.reset(client, {
    jsonRpcUrl: anvil.optimism.forkUrl,
  })
  const block = await CoreActions.block.get(client)
  if (block.number === null) throw new Error('Expected a block number.')
  const receipt = await CoreActions.transaction.getReceipt(client, {
    hash: '0x71490b686eaefd6e20d05aeb3feb898bfc7801e50b967d2f9eb5a057b8a7e855',
  })
  const [withdrawal] = Withdrawal.getWithdrawals({ logs: receipt.logs })
  if (!withdrawal) throw new Error('Expected a withdrawal.')

  const proof = await Actions.l2.buildProveWithdrawal(client, {
    account: constants.accounts[0].address,
    output: {
      l2BlockNumber: block.number,
      outputIndex: 4529n,
      outputRoot:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: block.timestamp,
    },
    withdrawal,
  })
  const {
    outputRootProof,
    targetChain,
    withdrawal: withdrawal_,
    withdrawalProof,
    ...rest
  } = proof

  expect(rest).toMatchInlineSnapshot(`
      {
        "account": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "l2OutputIndex": 4529n,
      }
    `)
  expect(withdrawal_).toEqual(withdrawal)
  expect({
    proofPresent: withdrawalProof.length > 0,
    targetChain: targetChain?.id,
    version: outputRootProof.version,
  }).toMatchInlineSnapshot(`
      {
        "proofPresent": true,
        "targetChain": 10,
        "version": "0x0000000000000000000000000000000000000000000000000000000000000000",
      }
    `)
}, 60_000)

test('appends an embedded proof node from a branch', () => {
  const node = ['0x20ab', '0x01'] as const
  const branch = [
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    '0x',
    node,
  ] as const
  const proof = [Rlp.fromHex(branch)]
  const key =
    '0x00000000000000000000000000000000000000000000000000000000000000ab'

  expect(maybeAddProofNode(key, proof)).toMatchInlineSnapshot(`
    [
      "0xd580808080808080808080808080808080c48220ab01",
      "0xc48220ab01",
    ]
  `)
})

test('preserves a proof ending in a leaf', () => {
  const proof = [Rlp.fromHex(['0x20ab', '0x01'])]
  const key =
    '0x00000000000000000000000000000000000000000000000000000000000000ab'

  expect(maybeAddProofNode(key, proof)).toMatchInlineSnapshot(`
    [
      "0xc48220ab01",
    ]
  `)
})

test('preserves an empty proof', () => {
  expect(maybeAddProofNode('0x00', [])).toMatchInlineSnapshot(`[]`)
})

test('rejects when the storage proof is unavailable', async () => {
  await CoreActions.state.reset(client, {
    jsonRpcUrl: anvil.optimism.forkUrl,
  })
  const block = await CoreActions.block.get(client)
  if (block.number === null) throw new Error('Expected a block number.')
  const server = await createEmptyProofServer()
  const proxyClient = Client.create({
    chain: optimism,
    transport: http(server.url),
  })

  try {
    await expect(
      Actions.l2.buildProveWithdrawal(proxyClient, {
        output: {
          l2BlockNumber: block.number,
          outputIndex: 0n,
          outputRoot:
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          timestamp: block.timestamp,
        },
        withdrawal,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [Actions.l2.buildProveWithdrawal.StorageProofNotFoundError: Withdrawal storage proof is unavailable.

    Version: viem@2.52.1]
  `)
  } finally {
    await server.close()
  }
}, 60_000)

test('rejects when a super-root timestamp maps to a mismatched block', async () => {
  await CoreActions.state.reset(client, {
    jsonRpcUrl: anvil.optimism.forkUrl,
  })
  const head = await CoreActions.block.get(client)
  if (head.number === null) throw new Error('Expected a block number.')

  await CoreActions.block.setNextTimestamp(client, {
    timestamp: head.timestamp + 10n,
  })
  await CoreActions.block.mine(client, { blocks: 1 })
  await CoreActions.block.setNextTimestamp(client, {
    timestamp: head.timestamp + 12n,
  })
  await CoreActions.block.mine(client, { blocks: 1 })

  const gameTimestamp = head.timestamp + 8n
  await expect(
    Actions.l2.buildProveWithdrawal(client, {
      game: {
        extraData: '0x',
        index: 0n,
        l2BlockNumber: gameTimestamp,
        metadata: '0x',
        rootClaim:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        timestamp: head.timestamp,
        usesSuperRoots: true,
      },
      withdrawal,
    }),
  ).rejects.toThrow(
    new TimestampMismatchError({
      blockTimestamp: head.timestamp,
      gameTimestamp,
    }),
  )
}, 60_000)
