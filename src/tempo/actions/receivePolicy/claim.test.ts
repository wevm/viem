import * as AbiEvent from 'ox/AbiEvent'
import * as Address from 'ox/Address'
import * as ReceivePolicyReceipt from 'ox/tempo/ReceivePolicyReceipt'
import * as Value from 'ox/Value'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions, Abis, Addresses } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const receiverAccount = Account.fromSecp256k1(tempo.accounts[3]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const receiverClient = tempo.getClient({
  account: receiverAccount,
  feeToken: tempo.pathUsd,
})

describe('blocked transfer lifecycle', () => {
  test('behavior: block then claim by originator', async () => {
    const amount = Value.from('10', 6)

    await Actions.receivePolicy.setSync(receiverClient, {
      claimer: 'sender',
      senderPolicyId: 'reject-all',
    })

    const { receipt: transferReceipt } = await Actions.token.transferSync(
      client,
      {
        amount,
        to: receiverAccount.address,
        token: tempo.alphaUsd,
      },
    )

    const transferLogs = AbiEvent.extractLogs(
      Abis.tip20,
      transferReceipt.logs,
      {
        eventName: 'Transfer',
        strict: true,
      },
    ).filter((log) =>
      Address.isEqual(log.address, tempo.alphaUsd as Address.Address),
    )
    const blockedLogs = AbiEvent.extractLogs(
      Abis.receivePolicyGuard,
      transferReceipt.logs,
      {
        eventName: 'TransferBlocked',
        strict: true,
      },
    )
    expect(transferLogs).toHaveLength(1)
    expect(blockedLogs).toHaveLength(1)
    expect(transferLogs[0]!.args.to).toBe(Addresses.receivePolicyGuard)

    const claimReceipt = blockedLogs[0]!.args.receipt
    const blockedBalance = await Actions.receivePolicy.getBlockedBalance(
      client,
      { receipt: claimReceipt },
    )
    expect(blockedBalance).toBe(amount)

    const decoded = ReceivePolicyReceipt.decode(claimReceipt)
    expect(Address.isEqual(decoded.originator, account.address)).toBe(true)
    expect(Address.isEqual(decoded.recipient, receiverAccount.address)).toBe(
      true,
    )
    expect(decoded.kind).toBe('transfer')
    expect(decoded.blockedReason).toBe('receivePolicy')

    const { receipt, ...result } = await Actions.receivePolicy.claimSync(
      client,
      {
        receipt: claimReceipt,
        to: account.address,
      },
    )
    expect(receipt.status).toBe('success')
    const { blockedAt, blockedNonce, ...stableResult } = result
    expect(blockedAt).toBeGreaterThan(0n)
    expect(blockedNonce).toBeGreaterThan(0n)
    expect(stableResult).toMatchInlineSnapshot(`
      {
        "amount": 10000000n,
        "caller": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "originator": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "receiptVersion": 1,
        "receiver": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        "recipient": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        "recoveryAuthority": "0x0000000000000000000000000000000000000000",
        "to": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "token": "0x20C0000000000000000000000000000000000001",
      }
    `)

    const remaining = await Actions.receivePolicy.getBlockedBalance(client, {
      receipt: claimReceipt,
    })
    expect(remaining).toBe(0n)
  })
})
