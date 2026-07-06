import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Actions } from 'viem/tempo'

const client = tempo.getClient()

/** Waits until `done` returns true, polling every 100ms (5s cap). */
async function waitFor(done: () => boolean) {
  for (let i = 0; i < 50 && !done(); i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('create', () => {
  test('default', async () => {
    const { policyId, receipt, ...result } = await Actions.policy.createSync(
      client,
      {
        feeToken: tempo.alphaUsd,
        type: 'whitelist',
      } as never,
    )
    expect(receipt.status).toBe('success')
    expect(policyId).toBeGreaterThan(1n)
    expect(result).toMatchInlineSnapshot(`
      {
        "policyType": 0,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    await expect(Actions.policy.getData(client, { policyId })).resolves
      .toMatchInlineSnapshot(`
      {
        "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "type": "whitelist",
      }
    `)
  })

  test('behavior: blacklist', async () => {
    const { policyId, receipt, ...result } = await Actions.policy.createSync(
      client,
      {
        feeToken: tempo.alphaUsd,
        type: 'blacklist',
      } as never,
    )
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "policyType": 1,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    await expect(Actions.policy.getData(client, { policyId })).resolves
      .toMatchInlineSnapshot(`
      {
        "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "type": "blacklist",
      }
    `)
  })

  test('behavior: explicit admin', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      admin: tempo.accounts[1].address,
      feeToken: tempo.alphaUsd,
      type: 'whitelist',
    } as never)

    await expect(Actions.policy.getData(client, { policyId })).resolves
      .toMatchInlineSnapshot(`
      {
        "admin": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "type": "whitelist",
      }
    `)
  })

  test('behavior: with initial addresses', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      addresses: [tempo.accounts[1].address, tempo.accounts[2].address],
      feeToken: tempo.alphaUsd,
      type: 'whitelist',
    } as never)

    await expect(
      Actions.policy.isAuthorized(client, {
        policyId,
        user: tempo.accounts[1].address,
      }),
    ).resolves.toBe(true)
    await expect(
      Actions.policy.isAuthorized(client, {
        policyId,
        user: tempo.accounts[2].address,
      }),
    ).resolves.toBe(true)
    await expect(
      Actions.policy.isAuthorized(client, {
        policyId,
        user: tempo.accounts[0].address,
      }),
    ).resolves.toBe(false)
  })
})

describe('setAdmin', () => {
  test('default', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      feeToken: tempo.alphaUsd,
      type: 'whitelist',
    } as never)

    const {
      policyId: updatedPolicyId,
      receipt,
      ...result
    } = await Actions.policy.setAdminSync(client, {
      admin: tempo.accounts[1].address,
      feeToken: tempo.alphaUsd,
      policyId,
    } as never)
    expect(receipt.status).toBe('success')
    expect(updatedPolicyId).toBe(policyId)
    expect(result).toMatchInlineSnapshot(`
      {
        "admin": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    await expect(Actions.policy.getData(client, { policyId })).resolves
      .toMatchInlineSnapshot(`
      {
        "admin": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "type": "whitelist",
      }
    `)
  })
})

describe('modifyWhitelist', () => {
  test('default', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      feeToken: tempo.alphaUsd,
      type: 'whitelist',
    } as never)
    const user = tempo.accounts[1].address

    await expect(
      Actions.policy.isAuthorized(client, { policyId, user }),
    ).resolves.toBe(false)

    const {
      policyId: addedPolicyId,
      receipt: addReceipt,
      ...addResult
    } = await Actions.policy.modifyWhitelistSync(client, {
      address: user,
      allowed: true,
      feeToken: tempo.alphaUsd,
      policyId,
    } as never)
    expect(addReceipt.status).toBe('success')
    expect(addedPolicyId).toBe(policyId)
    expect(addResult).toMatchInlineSnapshot(`
      {
        "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "allowed": true,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    await expect(
      Actions.policy.isAuthorized(client, { policyId, user }),
    ).resolves.toBe(true)

    const {
      policyId: removedPolicyId,
      receipt: removeReceipt,
      ...removeResult
    } = await Actions.policy.modifyWhitelistSync(client, {
      address: user,
      allowed: false,
      feeToken: tempo.alphaUsd,
      policyId,
    } as never)
    expect(removeReceipt.status).toBe('success')
    expect(removedPolicyId).toBe(policyId)
    expect(removeResult).toMatchInlineSnapshot(`
      {
        "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "allowed": false,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    await expect(
      Actions.policy.isAuthorized(client, { policyId, user }),
    ).resolves.toBe(false)
  })
})

describe('modifyBlacklist', () => {
  test('default', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      feeToken: tempo.alphaUsd,
      type: 'blacklist',
    } as never)
    const user = tempo.accounts[1].address

    await expect(
      Actions.policy.isAuthorized(client, { policyId, user }),
    ).resolves.toBe(true)

    const {
      policyId: addedPolicyId,
      receipt: addReceipt,
      ...addResult
    } = await Actions.policy.modifyBlacklistSync(client, {
      address: user,
      feeToken: tempo.alphaUsd,
      policyId,
      restricted: true,
    } as never)
    expect(addReceipt.status).toBe('success')
    expect(addedPolicyId).toBe(policyId)
    expect(addResult).toMatchInlineSnapshot(`
      {
        "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "restricted": true,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    await expect(
      Actions.policy.isAuthorized(client, { policyId, user }),
    ).resolves.toBe(false)

    const {
      policyId: removedPolicyId,
      receipt: removeReceipt,
      ...removeResult
    } = await Actions.policy.modifyBlacklistSync(client, {
      address: user,
      feeToken: tempo.alphaUsd,
      policyId,
      restricted: false,
    } as never)
    expect(removeReceipt.status).toBe('success')
    expect(removedPolicyId).toBe(policyId)
    expect(removeResult).toMatchInlineSnapshot(`
      {
        "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "restricted": false,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    await expect(
      Actions.policy.isAuthorized(client, { policyId, user }),
    ).resolves.toBe(true)
  })
})

describe('getData', () => {
  test('default', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      feeToken: tempo.alphaUsd,
      type: 'whitelist',
    } as never)

    await expect(Actions.policy.getData(client, { policyId })).resolves
      .toMatchInlineSnapshot(`
      {
        "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "type": "whitelist",
      }
    `)
  })

  test('behavior: blacklist', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      feeToken: tempo.alphaUsd,
      type: 'blacklist',
    } as never)

    await expect(Actions.policy.getData(client, { policyId })).resolves
      .toMatchInlineSnapshot(`
      {
        "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "type": "blacklist",
      }
    `)
  })
})

describe('isAuthorized', () => {
  test('behavior: always-reject policy (id 0)', async () => {
    await expect(
      Actions.policy.isAuthorized(client, {
        policyId: 0n,
        user: tempo.accounts[0].address,
      }),
    ).resolves.toBe(false)
  })

  test('behavior: always-allow policy (id 1)', async () => {
    await expect(
      Actions.policy.isAuthorized(client, {
        policyId: 1n,
        user: tempo.accounts[0].address,
      }),
    ).resolves.toBe(true)
  })

  test('behavior: whitelist policy', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      addresses: [tempo.accounts[1].address],
      feeToken: tempo.alphaUsd,
      type: 'whitelist',
    } as never)

    await expect(
      Actions.policy.isAuthorized(client, {
        policyId,
        user: tempo.accounts[1].address,
      }),
    ).resolves.toBe(true)
    await expect(
      Actions.policy.isAuthorized(client, {
        policyId,
        user: tempo.accounts[0].address,
      }),
    ).resolves.toBe(false)
  })

  test('behavior: blacklist policy', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      addresses: [tempo.accounts[1].address],
      feeToken: tempo.alphaUsd,
      type: 'blacklist',
    } as never)

    await expect(
      Actions.policy.isAuthorized(client, {
        policyId,
        user: tempo.accounts[1].address,
      }),
    ).resolves.toBe(false)
    await expect(
      Actions.policy.isAuthorized(client, {
        policyId,
        user: tempo.accounts[0].address,
      }),
    ).resolves.toBe(true)
  })
})

describe('watchCreate', () => {
  test('default', async () => {
    const watcher = Actions.policy.watchCreate(client)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      const { policyId } = await Actions.policy.createSync(client, {
        feeToken: tempo.alphaUsd,
        type: 'whitelist',
      } as never)

      await waitFor(() => logs.some((log) => log.args.policyId === policyId))

      const log = logs.find((log) => log.args.policyId === policyId)
      const { policyId: loggedPolicyId, ...args } = log!.args
      expect(loggedPolicyId).toBe(policyId)
      expect(args).toMatchInlineSnapshot(`
        {
          "policyType": 0,
          "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
    } finally {
      watcher.off()
    }
  })
})

describe('watchAdminUpdated', () => {
  test('default', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      feeToken: tempo.alphaUsd,
      type: 'whitelist',
    } as never)

    const watcher = Actions.policy.watchAdminUpdated(client, {
      args: { policyId },
    } as never)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.policy.setAdminSync(client, {
        admin: tempo.accounts[1].address,
        feeToken: tempo.alphaUsd,
        policyId,
      } as never)

      await waitFor(() => logs.length > 0)

      expect(logs).toHaveLength(1)
      const { policyId: loggedPolicyId, ...args } = logs[0]!.args
      expect(loggedPolicyId).toBe(policyId)
      expect(args).toMatchInlineSnapshot(`
        {
          "admin": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
    } finally {
      watcher.off()
    }
  })
})

describe('watchWhitelistUpdated', () => {
  test('default', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      feeToken: tempo.alphaUsd,
      type: 'whitelist',
    } as never)

    const watcher = Actions.policy.watchWhitelistUpdated(client, {
      args: { policyId },
    } as never)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.policy.modifyWhitelistSync(client, {
        address: tempo.accounts[1].address,
        allowed: true,
        feeToken: tempo.alphaUsd,
        policyId,
      } as never)
      await Actions.policy.modifyWhitelistSync(client, {
        address: tempo.accounts[1].address,
        allowed: false,
        feeToken: tempo.alphaUsd,
        policyId,
      } as never)

      await waitFor(() => logs.length >= 2)

      expect(logs).toHaveLength(2)
      const { policyId: addedPolicyId, ...addArgs } = logs[0]!.args
      expect(addedPolicyId).toBe(policyId)
      expect(addArgs).toMatchInlineSnapshot(`
        {
          "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "allowed": true,
          "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
      const { policyId: removedPolicyId, ...removeArgs } = logs[1]!.args
      expect(removedPolicyId).toBe(policyId)
      expect(removeArgs).toMatchInlineSnapshot(`
        {
          "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "allowed": false,
          "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
    } finally {
      watcher.off()
    }
  })
})

describe('watchBlacklistUpdated', () => {
  test('default', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      feeToken: tempo.alphaUsd,
      type: 'blacklist',
    } as never)

    const watcher = Actions.policy.watchBlacklistUpdated(client, {
      args: { policyId },
    } as never)
    type Log = Parameters<Parameters<(typeof watcher)['onLogs']>[0]>[0][number]
    const logs: Log[] = []
    watcher.onLogs((received) => logs.push(...received))

    try {
      await Actions.policy.modifyBlacklistSync(client, {
        address: tempo.accounts[1].address,
        feeToken: tempo.alphaUsd,
        policyId,
        restricted: true,
      } as never)
      await Actions.policy.modifyBlacklistSync(client, {
        address: tempo.accounts[1].address,
        feeToken: tempo.alphaUsd,
        policyId,
        restricted: false,
      } as never)

      await waitFor(() => logs.length >= 2)

      expect(logs).toHaveLength(2)
      const { policyId: addedPolicyId, ...addArgs } = logs[0]!.args
      expect(addedPolicyId).toBe(policyId)
      expect(addArgs).toMatchInlineSnapshot(`
        {
          "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "restricted": true,
          "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
      const { policyId: removedPolicyId, ...removeArgs } = logs[1]!.args
      expect(removedPolicyId).toBe(policyId)
      expect(removeArgs).toMatchInlineSnapshot(`
        {
          "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "restricted": false,
          "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
    } finally {
      watcher.off()
    }
  })
})
