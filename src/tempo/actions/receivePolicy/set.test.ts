import * as Address from 'ox/Address'
import * as AbiEvent from 'ox/AbiEvent'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions, Abis, Addresses } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const receiverAccount = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const receiverClient = tempo.getClient({
  account: receiverAccount,
  feeToken: tempo.pathUsd,
})

describe('set / get', () => {
  test('default', async () => {
    const { receipt, ...result } = await Actions.receivePolicy.setSync(
      receiverClient,
      {
        claimer: 'self',
        senderPolicyId: 'allow-all',
        tokenPolicyId: 'allow-all',
      },
    )
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "claimer": "self",
        "recoveryAuthority": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "senderPolicyId": "allow-all",
        "tokenPolicyId": "allow-all",
      }
    `)

    const policy = await Actions.receivePolicy.get(client, {
      account: receiverAccount.address,
    })
    expect(policy).toMatchInlineSnapshot(`
      {
        "claimer": "self",
        "hasReceivePolicy": true,
        "recoveryAuthority": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "senderPolicyId": "allow-all",
        "senderPolicyType": "blacklist",
        "tokenPolicyId": "allow-all",
        "tokenPolicyType": "blacklist",
      }
    `)
  })

  test('behavior: reject-all sender policy', async () => {
    await Actions.receivePolicy.setSync(receiverClient, {
      senderPolicyId: 'reject-all',
    })

    expect(
      await Actions.receivePolicy.get(client, {
        account: receiverAccount.address,
      }),
    ).toMatchInlineSnapshot(`
      {
        "claimer": "sender",
        "hasReceivePolicy": true,
        "recoveryAuthority": "0x0000000000000000000000000000000000000000",
        "senderPolicyId": "reject-all",
        "senderPolicyType": "whitelist",
        "tokenPolicyId": "allow-all",
        "tokenPolicyType": "blacklist",
      }
    `)
  })

  test('behavior: custom policy id', async () => {
    const { policyId } = await Actions.policy.createSync(receiverClient, {
      type: 'whitelist',
    })
    await Actions.receivePolicy.setSync(receiverClient, {
      senderPolicyId: policyId,
    })

    const policy = await Actions.receivePolicy.get(client, {
      account: receiverAccount.address,
    })
    expect(policy.senderPolicyId).toBe(policyId)
  })

  test('behavior: claimer sender (default)', async () => {
    await Actions.receivePolicy.setSync(receiverClient, {
      senderPolicyId: 'allow-all',
      tokenPolicyId: 'allow-all',
    })

    const policy = await Actions.receivePolicy.get(client, {
      account: receiverAccount.address,
    })
    expect(policy.claimer).toBe('sender')
    expect(policy.recoveryAuthority).toBe(
      '0x0000000000000000000000000000000000000000',
    )
  })

  test('behavior: claimer explicit address', async () => {
    await Actions.receivePolicy.setSync(receiverClient, {
      claimer: account3.address,
    })

    const policy = await Actions.receivePolicy.get(client, {
      account: receiverAccount.address,
    })
    expect(
      Address.isEqual(policy.claimer as Address.Address, account3.address),
    ).toBe(true)
    expect(Address.isEqual(policy.recoveryAuthority, account3.address)).toBe(
      true,
    )
  })

  test('behavior: claimer zero address (sender)', async () => {
    await Actions.receivePolicy.setSync(receiverClient, {
      claimer: '0x0000000000000000000000000000000000000000',
    })

    const policy = await Actions.receivePolicy.get(client, {
      account: receiverAccount.address,
    })
    expect(policy.claimer).toBe('sender')
    expect(policy.recoveryAuthority).toBe(
      '0x0000000000000000000000000000000000000000',
    )
  })

  test('behavior: rejects unclaimable claimer addresses', async () => {
    await expect(
      Actions.receivePolicy.set(receiverClient, {
        claimer: Addresses.tip20ChannelReserve,
      }),
    ).rejects.toThrow('Tempo system precompile')

    await expect(
      Actions.receivePolicy.set(receiverClient, {
        claimer: Addresses.receivePolicyGuard,
      }),
    ).rejects.toThrow('Tempo system precompile')

    await expect(
      Actions.receivePolicy.set(receiverClient, {
        claimer: '0x20c0000000000000000000000000000000000001',
      }),
    ).rejects.toThrow('TIP-20 token address')

    await expect(
      Actions.receivePolicy.set(receiverClient, {
        claimer: '0x20C000000000000000000000033AbB6ac7d235e5',
      }),
    ).rejects.toThrow('TIP-20 token address')

    await expect(
      Actions.receivePolicy.set(receiverClient, {
        claimer: '0x12345678fdfdfdfdfdfdfdfdfdfd000000000001',
      }),
    ).rejects.toThrow('TIP-1022 virtual address')
  })

  test('behavior: repeated identical set emits ReceivePolicyUpdated', async () => {
    const first = await Actions.receivePolicy.setSync(receiverClient, {
      claimer: 'self',
      senderPolicyId: 'allow-all',
      tokenPolicyId: 'allow-all',
    })
    const second = await Actions.receivePolicy.setSync(receiverClient, {
      claimer: 'self',
      senderPolicyId: 'allow-all',
      tokenPolicyId: 'allow-all',
    })
    expect(
      AbiEvent.extractLogs(Abis.tip403Registry, first.receipt.logs, {
        eventName: 'ReceivePolicyUpdated',
        strict: true,
      }),
    ).toHaveLength(1)
    expect(
      AbiEvent.extractLogs(Abis.tip403Registry, second.receipt.logs, {
        eventName: 'ReceivePolicyUpdated',
        strict: true,
      }),
    ).toHaveLength(1)
  })

  test('behavior: setSync resets unspecified fields to defaults', async () => {
    await Actions.receivePolicy.setSync(receiverClient, {
      claimer: 'self',
      senderPolicyId: 'reject-all',
      tokenPolicyId: 'reject-all',
    })
    const { receipt, ...result } = await Actions.receivePolicy.setSync(
      receiverClient,
      {
        senderPolicyId: 'reject-all',
      },
    )
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "claimer": "sender",
        "recoveryAuthority": "0x0000000000000000000000000000000000000000",
        "senderPolicyId": "reject-all",
        "tokenPolicyId": "allow-all",
      }
    `)
  })
})
