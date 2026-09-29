import { createRequestListener } from '@remix-run/node-fetch-server'
import { http, parseUnits, toHex } from 'viem'
import { generatePrivateKey } from 'viem/accounts'
import {
  fillTransaction,
  sendTransaction,
  sendTransactionSync,
  waitForTransactionReceipt,
} from 'viem/actions'
import { Account, Actions, Addresses, Relay, Store } from 'viem/tempo'
import { beforeAll, describe, expect, onTestFinished, test } from 'vitest'
import * as Tempo from '~test/tempo/config.js'
import { nodeEnv } from '~test/tempo/config.js'
import { createHttpServer } from '~test/utils.js'

const caller = Tempo.getClient({ chain: Tempo.chain })
const userAccount = Tempo.accounts[9]!
const feePayerAccount = Tempo.accounts[0]!
const recipient = Tempo.accounts[7]!

describe.skipIf(nodeEnv !== 'localnet')('plain HTTP transport', () => {
  beforeAll(async () => {
    await Promise.all(
      [feePayerAccount, userAccount].map((account) =>
        Actions.faucet.fundSync(caller, { account, timeout: 60_000 }),
      ),
    )
  })

  async function createRelayClient(plugin: Relay.Plugin) {
    const relay = Relay.create({
      client: caller,
      plugins: [plugin],
      resolveTokens: () => [Addresses.pathUsd, Tempo.addresses.alphaUsd],
    })
    const server = await createHttpServer(createRequestListener(relay.fetch))
    onTestFinished(async () => {
      await server.close()
    })
    return Tempo.getClient({
      chain: Tempo.chain,
      transport: http(server.url),
    })
  }

  test.each(['sendTransaction', 'sendTransactionSync'] as const)(
    'feePayer: %s sponsors a sender without a fee-token balance',
    async (action) => {
      const client = await createRelayClient(
        Relay.feePayer({
          account: feePayerAccount,
          feeToken: Addresses.pathUsd,
        }),
      )
      const account = Account.fromSecp256k1(generatePrivateKey())
      const token = Tempo.addresses.alphaUsd
      await Actions.token.transferSync(caller, {
        account: feePayerAccount,
        token,
        to: account.address,
        amount: 1n,
      })
      expect(
        (
          await Actions.token.getBalance(client, {
            account: account.address,
            token: Addresses.pathUsd,
          })
        ).amount,
      ).toMatchInlineSnapshot(`0n`)
      const balance = await Actions.token.getBalance(client, {
        account: recipient.address,
        token,
      })
      const sponsorBalance = await Actions.token.getBalance(client, {
        account: feePayerAccount.address,
        token: Addresses.pathUsd,
      })
      const parameters = {
        account,
        calls: [
          Actions.token.transfer.call(client, {
            token,
            to: recipient.address,
            amount: 1n,
          }),
        ],
        feePayer: true,
      } as const
      const receipt =
        action === 'sendTransactionSync'
          ? await sendTransactionSync(client, parameters)
          : await waitForTransactionReceipt(client, {
              hash: await sendTransaction(client, parameters),
            })

      expect(receipt.status).toMatchInlineSnapshot(`"success"`)
      expect(receipt.feePayer).toBe(feePayerAccount.address.toLowerCase())
      expect(receipt.feeToken).toBe(Addresses.pathUsd)
      expect(
        (
          await Actions.token.getBalance(client, {
            account: account.address,
            token,
          })
        ).amount,
      ).toMatchInlineSnapshot(`0n`)
      expect(
        (
          await Actions.token.getBalance(client, {
            account: recipient.address,
            token,
          })
        ).amount - balance.amount,
      ).toMatchInlineSnapshot(`1n`)
      expect(
        (
          await Actions.token.getBalance(client, {
            account: feePayerAccount.address,
            token: Addresses.pathUsd,
          })
        ).amount,
      ).toBeLessThan(sponsorBalance.amount)
    },
  )

  test('feeToken: selects a funded token and broadcasts the transaction', async () => {
    const client = await createRelayClient(Relay.feeToken())
    const account = Account.fromSecp256k1(generatePrivateKey())
    const token = Tempo.addresses.alphaUsd
    await Actions.token.transferSync(caller, {
      account: feePayerAccount,
      token,
      to: account.address,
      amount: parseUnits('1', 6),
    })
    expect(
      (
        await Actions.token.getBalance(client, {
          account: account.address,
          token: Addresses.pathUsd,
        })
      ).amount,
    ).toMatchInlineSnapshot(`0n`)
    const balance = await Actions.token.getBalance(client, {
      account: recipient.address,
      token,
    })
    const receipt = await sendTransactionSync(client, {
      account,
      calls: [
        Actions.token.transfer.call(client, {
          token,
          to: recipient.address,
          amount: 1n,
        }),
      ],
    })

    expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    expect(receipt.feeToken).toBe(token)
    expect(receipt.feePayer).toBe(account.address.toLowerCase())
    expect(
      (
        await Actions.token.getBalance(client, {
          account: recipient.address,
          token,
        })
      ).amount - balance.amount,
    ).toMatchInlineSnapshot(`1n`)
  })

  test('simulate: returns balance changes without executing the transaction', async () => {
    const client = await createRelayClient(Relay.simulate())
    const token = Tempo.addresses.alphaUsd
    const balance = await Actions.token.getBalance(client, {
      account: recipient.address,
      token,
    })
    const result = await fillTransaction(client, {
      account: userAccount.address,
      feeToken: token,
      calls: [
        Actions.token.transfer.call(client, {
          token,
          to: recipient.address,
          amount: 100n,
        }),
      ],
    })

    expect(
      Object.entries(result.capabilities?.balanceDiffs ?? {}).find(
        ([address]) =>
          address.toLowerCase() === userAccount.address.toLowerCase(),
      )?.[1],
    ).toMatchObject([{ address: token, direction: 'outgoing', value: '0x64' }])
    expect(result.capabilities?.fee).toMatchObject({
      decimals: 6,
      symbol: 'AlphaUSD',
    })
    expect(
      (
        await Actions.token.getBalance(client, {
          account: recipient.address,
          token,
        })
      ).amount,
    ).toBe(balance.amount)
  })

  test.runIf(import.meta.env.VITE_TEMPO_MULTISIG === 'true')(
    'multisig: collects approvals and broadcasts at quorum',
    async () => {
      const client = await createRelayClient(
        Relay.multisig({ store: Store.memory() }),
      )
      const owner_1 = Tempo.accounts[1]!
      const owner_2 = Tempo.accounts[2]!
      const account = Account.fromMultisig({
        address: 'infer',
        owners: [owner_1.address, owner_2.address],
        salt: toHex(0x109701, { size: 32 }),
        threshold: 2,
      })
      const token = Tempo.addresses.alphaUsd
      await Actions.token.transferSync(caller, {
        account: feePayerAccount,
        token,
        to: account.address,
        amount: parseUnits('1', 6),
      })
      const balance = await Actions.token.getBalance(client, {
        account: recipient.address,
        token,
      })
      const pending = await sendTransactionSync(client, {
        account,
        owner: owner_1,
        feeToken: token,
        calls: [
          Actions.token.transfer.call(client, {
            token,
            to: recipient.address,
            amount: 1n,
          }),
        ],
      })
      expect(pending.status).toMatchInlineSnapshot(`"pending"`)
      expect(pending.multisig).toMatchObject({
        signatureCount: 1,
        threshold: 2,
        weight: 1,
      })
      expect(
        (
          await Actions.token.getBalance(client, {
            account: recipient.address,
            token,
          })
        ).amount,
      ).toBe(balance.amount)

      const receipt = await sendTransactionSync(client, {
        account,
        hash: pending.transactionHash,
        owner: owner_2,
      })
      expect(receipt.status).toMatchInlineSnapshot(`"success"`)
      expect(receipt.multisig).toMatchObject({
        signatureCount: 2,
        threshold: 2,
        weight: 2,
      })
      expect(
        (
          await Actions.token.getBalance(client, {
            account: recipient.address,
            token,
          })
        ).amount - balance.amount,
      ).toMatchInlineSnapshot(`1n`)
      expect(
        await Actions.multisig.getOperation(client, {
          hash: pending.transactionHash,
        }),
      ).toMatchObject({ status: 'success' })
    },
  )
})
