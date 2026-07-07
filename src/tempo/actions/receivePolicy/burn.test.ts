import * as AbiEvent from 'ox/AbiEvent'
import * as Value from 'ox/Value'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions, Abis } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const receiverAccount = Account.fromSecp256k1(tempo.accounts[4]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const receiverClient = tempo.getClient({
  account: receiverAccount,
  feeToken: tempo.pathUsd,
})

async function createBlockedTransfer(amount = Value.from('10', 6)) {
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: 'Blocked Burn Token',
    symbol: 'BBURN',
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: account.address,
    token,
  })
  await Actions.token.mintSync(client, {
    amount: Value.from('100', 6),
    to: account.address,
    token,
  })
  await Actions.receivePolicy.setSync(receiverClient, {
    senderPolicyId: 'reject-all',
  })
  const { receipt } = await Actions.token.transferSync(client, {
    amount,
    to: receiverAccount.address,
    token,
  })
  const [log] = AbiEvent.extractLogs(Abis.receivePolicyGuard, receipt.logs, {
    eventName: 'TransferBlocked',
    strict: true,
  })
  return {
    amount,
    claimReceipt: log!.args.receipt,
    token,
  }
}

describe('burnSync', () => {
  test('default', async () => {
    const { token, amount, claimReceipt } = await createBlockedTransfer()

    await Actions.token.grantRolesSync(client, {
      roles: ['burnBlocked'],
      to: account.address,
      token,
    })

    const { policyId } = await Actions.policy.createSync(client, {
      type: 'blacklist',
    })
    await Actions.policy.modifyBlacklistSync(client, {
      address: account.address,
      policyId,
      restricted: true,
    })
    await Actions.token.changeTransferPolicySync(client, {
      policyId,
      token,
    })

    const { receipt, ...result } = await Actions.receivePolicy.burnSync(
      client,
      {
        receipt: claimReceipt,
      },
    )
    expect(receipt.status).toBe('success')
    const {
      blockedAt,
      blockedNonce,
      token: burnedToken,
      ...stableResult
    } = result
    expect(blockedAt).toBeGreaterThan(0n)
    expect(blockedNonce).toBeGreaterThan(0n)
    expect(burnedToken).toBe(token)
    expect(stableResult).toMatchInlineSnapshot(`
      {
        "amount": 10000000n,
        "caller": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "originator": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "receiptVersion": 1,
        "receiver": "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        "recipient": "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        "recoveryAuthority": "0x0000000000000000000000000000000000000000",
      }
    `)
    expect(result.amount).toBe(amount)

    const remaining = await Actions.receivePolicy.getBlockedBalance(client, {
      receipt: claimReceipt,
    })
    expect(remaining).toBe(0n)
  })
})
