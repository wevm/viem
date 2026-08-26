import { MultisigConfig } from 'ox/tempo'
import { toHex } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'
import { beforeAll, describe, expect, test } from 'vitest'
import { accounts, feeToken, getClient } from '~test/tempo/config.js'
import * as Account from '../Account.js'
import * as actions from './index.js'

const client = getClient()
const account = Account.fromMultisig({
  address: 'initial',
  owners: [accounts[17], accounts[18]],
  salt: toHex(0x502200, { size: 32 }),
  threshold: 2,
})

beforeAll(async () => {
  await actions.token.transferSync(client, {
    account: accounts[0],
    amount: { formatted: '10000' },
    to: account.address,
    token: feeToken,
  })
})

describe('getConfigCommitment', () => {
  test('behavior: initial account', async () => {
    await expect(
      actions.multisig.getConfigCommitment(client, {
        account: account.address,
      }),
    ).resolves.toMatchInlineSnapshot(
      `"0x0000000000000000000000000000000000000000000000000000000000000000"`,
    )
  })
})

describe('updateConfig', () => {
  test('behavior: commits the first current config', async () => {
    const hash = await actions.multisig.updateConfig(client, {
      account,
      currentConfig: account.config,
      nextConfig: {
        owners: account.config.owners,
        threshold: account.config.threshold,
      },
    })
    const receipt = await waitForTransactionReceipt(client, { hash })
    const config = MultisigConfig.from({ ...account.config, version: 1n })
    const commitment = await actions.multisig.getConfigCommitment(client, {
      account: account.address,
    })

    expect({
      commitment,
      expectedCommitment: MultisigConfig.getCommitment(config),
      status: receipt.status,
    }).toMatchInlineSnapshot(`
      {
        "commitment": "0x5a38e16dc18d0e222d64845b5676a7771d16e640bb4d67a7e4952bd128c99f9b",
        "expectedCommitment": "0x5a38e16dc18d0e222d64845b5676a7771d16e640bb4d67a7e4952bd128c99f9b",
        "status": "success",
      }
    `)
  })
})

describe('updateConfigSync', () => {
  test('behavior: returns the committed config', async () => {
    const account = Account.fromMultisig({
      address: 'initial',
      owners: [accounts[17], accounts[18]],
      salt: toHex(0x502201, { size: 32 }),
      threshold: 2,
    })
    await actions.token.transferSync(client, {
      account: accounts[0],
      amount: { formatted: '10000' },
      to: account.address,
      token: feeToken,
    })

    const result = await actions.multisig.updateConfigSync(client, {
      account,
      currentConfig: account.config,
      nextConfig: {
        owners: account.config.owners,
        threshold: account.config.threshold,
      },
    })

    expect(result).toMatchInlineSnapshot(
      {
        receipt: {
          blockHash: expect.any(String),
          blockNumber: expect.any(BigInt),
          cumulativeGasUsed: expect.any(BigInt),
          effectiveGasPrice: expect.any(BigInt),
          gasUsed: expect.any(BigInt),
          logs: expect.any(Array),
          logsBloom: expect.any(String),
          transactionHash: expect.any(String),
          transactionIndex: expect.any(Number),
        },
      },
      `
      {
        "account": "0xBbD245945e7f542449E896416F993B01C1D46fbB",
        "config": {
          "owners": [
            {
              "owner": "0x1e2A9422ebCF2Bb0F435d624910eE5086E523248",
              "weight": 1,
            },
            {
              "owner": "0x2d6776fd5eA3C530b990268078Ac39aC2AE1E6A8",
              "weight": 1,
            },
          ],
          "salt": "0x0000000000000000000000000000000000000000000000000000000000502201",
          "threshold": 2,
          "version": 1n,
        },
        "receipt": {
          "blockHash": Any<String>,
          "blockNumber": Any<BigInt>,
          "contractAddress": null,
          "cumulativeGasUsed": Any<BigInt>,
          "effectiveGasPrice": Any<BigInt>,
          "feePayer": "0xbbd245945e7f542449e896416f993b01c1d46fbb",
          "feeToken": "0x20c0000000000000000000000000000000000000",
          "from": "0xbbd245945e7f542449e896416f993b01c1d46fbb",
          "gasUsed": Any<BigInt>,
          "logs": Any<Array>,
          "logsBloom": Any<String>,
          "multisig": undefined,
          "status": "success",
          "to": "0xaacc000000000000000000000000000000000000",
          "transactionHash": Any<String>,
          "transactionIndex": Any<Number>,
          "type": "0x76",
        },
      }
    `,
    )
    await expect(
      actions.multisig.getConfigCommitment(client, {
        account: account.address,
      }),
    ).resolves.toBe(MultisigConfig.getCommitment(result.config))

    const rotated = await actions.multisig.updateConfigSync(client, {
      account,
      currentConfig: result.config,
      nextConfig: {
        owners: result.config.owners,
        threshold: result.config.threshold,
      },
    })
    expect(rotated.config.version).toMatchInlineSnapshot(`2n`)
    await expect(
      actions.multisig.getConfigCommitment(client, {
        account: account.address,
      }),
    ).resolves.toBe(MultisigConfig.getCommitment(rotated.config))
  })
})
