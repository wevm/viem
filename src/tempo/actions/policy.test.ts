import { setTimeout } from 'node:timers/promises'
import { beforeAll, describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/tempo/config.js'
import * as Prool from '~test/tempo/prool.js'
import * as actions from './index.js'

const account = accounts[0]
const account2 = accounts[1]
const account3 = accounts[2]

const client = getClient({
  account,
})

describe('create', () => {
  test('default', async () => {
    // create whitelist policy
    const { receipt, ...result } = await actions.policy.createSync(client, {
      type: 'whitelist',
    })
    expect(receipt).toBeDefined()
    expect(result).toMatchInlineSnapshot(`
      {
        "policyId": 2n,
        "policyType": 0,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    const { policyId } = result

    // verify policy was created
    const data = await actions.policy.getData(client, {
      policyId,
    })
    expect(data.admin).toBe(account.address)
    expect(data.type).toBe('whitelist')
  })

  test('behavior: blacklist', async () => {
    // create blacklist policy
    const { receipt: blacklistReceipt, ...blacklistResult } =
      await actions.policy.createSync(client, {
        type: 'blacklist',
      })
    expect(blacklistReceipt).toBeDefined()
    expect(blacklistResult).toMatchInlineSnapshot(`
      {
        "policyId": 3n,
        "policyType": 1,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    const { policyId } = blacklistResult

    // verify policy was created
    const data = await actions.policy.getData(client, {
      policyId,
    })
    expect(data.admin).toBe(account.address)
    expect(data.type).toBe('blacklist')
  })

  test.skip('behavior: with initial addresses', async () => {
    // create policy with initial addresses
    const { policyId } = await actions.policy.createSync(client, {
      type: 'whitelist',
      addresses: [account2.address, account3.address],
    })

    // verify addresses are whitelisted
    const isAuthorized2 = await actions.policy.isAuthorized(client, {
      policyId,
      user: account2.address,
    })
    expect(isAuthorized2).toBe(true)

    const isAuthorized3 = await actions.policy.isAuthorized(client, {
      policyId,
      user: account3.address,
    })
    expect(isAuthorized3).toBe(true)

    // verify other address is not whitelisted
    const isAuthorized = await actions.policy.isAuthorized(client, {
      policyId,
      user: account.address,
    })
    expect(isAuthorized).toBe(false)
  })
})

describe('setAdmin', () => {
  test('default', async () => {
    // create policy
    const { policyId } = await actions.policy.createSync(client, {
      type: 'whitelist',
    })

    // set new admin
    const { receipt: setAdminReceipt, ...setAdminResult } =
      await actions.policy.setAdminSync(client, {
        policyId,
        admin: account2.address,
      })
    expect(setAdminReceipt).toBeDefined()
    expect(setAdminResult).toMatchInlineSnapshot(`
      {
        "admin": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        "policyId": 4n,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    {
      // verify new admin
      const data = await actions.policy.getData(client, {
        policyId,
      })
      expect(data.admin).toBe(account2.address)
    }
  })
})

describe('modifyWhitelist', () => {
  test('default', async () => {
    // create whitelist policy
    const { policyId } = await actions.policy.createSync(client, {
      type: 'whitelist',
    })

    {
      // verify account2 is not authorized
      const isAuthorized = await actions.policy.isAuthorized(client, {
        policyId,
        user: account2.address,
      })
      expect(isAuthorized).toBe(false)
    }

    // add account2 to whitelist
    const { receipt: addReceipt, ...addResult } =
      await actions.policy.modifyWhitelistSync(client, {
        policyId,
        address: account2.address,
        allowed: true,
      })
    expect(addReceipt).toBeDefined()
    expect(addResult).toMatchInlineSnapshot(`
      {
        "account": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        "allowed": true,
        "policyId": 5n,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    {
      // verify account2 is authorized
      const isAuthorized = await actions.policy.isAuthorized(client, {
        policyId,
        user: account2.address,
      })
      expect(isAuthorized).toBe(true)
    }

    // remove account2 from whitelist
    const { receipt: removeReceipt, ...removeResult } =
      await actions.policy.modifyWhitelistSync(client, {
        policyId,
        address: account2.address,
        allowed: false,
      })
    expect(removeReceipt).toBeDefined()
    expect(removeResult).toMatchInlineSnapshot(`
      {
        "account": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        "allowed": false,
        "policyId": 5n,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    {
      // verify account2 is no longer authorized
      const isAuthorized = await actions.policy.isAuthorized(client, {
        policyId,
        user: account2.address,
      })
      expect(isAuthorized).toBe(false)
    }
  })
})

describe('modifyBlacklist', () => {
  test('default', async () => {
    // create blacklist policy
    const { policyId } = await actions.policy.createSync(client, {
      type: 'blacklist',
    })

    {
      // verify account2 is authorized (not blacklisted)
      const isAuthorized = await actions.policy.isAuthorized(client, {
        policyId,
        user: account2.address,
      })
      expect(isAuthorized).toBe(true)
    }

    // add account2 to blacklist
    const { receipt: addBlacklistReceipt, ...addBlacklistResult } =
      await actions.policy.modifyBlacklistSync(client, {
        policyId,
        address: account2.address,
        restricted: true,
      })
    expect(addBlacklistReceipt).toBeDefined()
    expect(addBlacklistResult).toMatchInlineSnapshot(`
      {
        "account": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        "policyId": 6n,
        "restricted": true,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    {
      // verify account2 is not authorized (blacklisted)
      const isAuthorized = await actions.policy.isAuthorized(client, {
        policyId,
        user: account2.address,
      })
      expect(isAuthorized).toBe(false)
    }

    // remove account2 from blacklist
    const { receipt: removeBlacklistReceipt, ...removeBlacklistResult } =
      await actions.policy.modifyBlacklistSync(client, {
        policyId,
        address: account2.address,
        restricted: false,
      })
    expect(removeBlacklistReceipt).toBeDefined()
    expect(removeBlacklistResult).toMatchInlineSnapshot(`
      {
        "account": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        "policyId": 6n,
        "restricted": false,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    {
      // verify account2 is authorized again
      const isAuthorized = await actions.policy.isAuthorized(client, {
        policyId,
        user: account2.address,
      })
      expect(isAuthorized).toBe(true)
    }
  })
})

describe('getData', () => {
  test('default', async () => {
    // create policy
    const { policyId } = await actions.policy.createSync(client, {
      type: 'whitelist',
    })

    {
      // get policy data
      const data = await actions.policy.getData(client, {
        policyId,
      })
      expect(data.admin).toBe(account.address)
      expect(data.type).toBe('whitelist')
    }
  })

  test('behavior: blacklist', async () => {
    // create blacklist policy
    const { policyId } = await actions.policy.createSync(client, {
      type: 'blacklist',
    })

    {
      // get policy data
      const data = await actions.policy.getData(client, {
        policyId,
      })
      expect(data.admin).toBe(account.address)
      expect(data.type).toBe('blacklist')
    }
  })
})

describe('isAuthorized', () => {
  test('special policy: always-reject (policyId 0)', async () => {
    const isAuthorized = await actions.policy.isAuthorized(client, {
      policyId: 0n,
      user: account.address,
    })
    expect(isAuthorized).toBe(false)
  })

  test('special policy: always-allow (policyId 1)', async () => {
    const isAuthorized = await actions.policy.isAuthorized(client, {
      policyId: 1n,
      user: account.address,
    })
    expect(isAuthorized).toBe(true)
  })

  test.skip('whitelist policy', async () => {
    // create whitelist policy
    const { policyId } = await actions.policy.createSync(client, {
      type: 'whitelist',
      addresses: [account2.address],
    })

    {
      // verify whitelisted address is authorized
      const isAuthorized = await actions.policy.isAuthorized(client, {
        policyId,
        user: account2.address,
      })
      expect(isAuthorized).toBe(true)
    }

    {
      // verify non-whitelisted address is not authorized
      const isAuthorized = await actions.policy.isAuthorized(client, {
        policyId,
        user: account.address,
      })
      expect(isAuthorized).toBe(false)
    }
  })

  test.skip('blacklist policy', async () => {
    // create blacklist policy
    const { policyId } = await actions.policy.createSync(client, {
      type: 'blacklist',
      addresses: [account2.address],
    })

    {
      // verify blacklisted address is not authorized
      const isAuthorized = await actions.policy.isAuthorized(client, {
        policyId,
        user: account2.address,
      })
      expect(isAuthorized).toBe(false)
    }

    {
      // verify non-blacklisted address is authorized
      const isAuthorized = await actions.policy.isAuthorized(client, {
        policyId,
        user: account.address,
      })
      expect(isAuthorized).toBe(true)
    }
  })
})

describe('watchCreate', () => {
  test('default', async () => {
    const logs: any[] = []
    const unwatch = actions.policy.watchCreate(client, {
      onPolicyCreated: (args, log) => {
        logs.push({ args, log })
      },
    })

    // create policy
    await actions.policy.createSync(client, {
      type: 'whitelist',
    })

    await setTimeout(500)
    unwatch()

    expect(logs.length).toBe(1)
    expect(logs[0].args.policyId).toBeDefined()
    expect(logs[0].args.updater).toBe(account.address)
    expect(logs[0].args.type).toBe('whitelist')
  })
})

describe('watchAdminUpdated', () => {
  beforeAll(async () => {
    await Prool.restart(client)
  })

  test('default', async () => {
    // create policy
    const { policyId } = await actions.policy.createSync(client, {
      type: 'whitelist',
    })

    const logs: any[] = []
    const unwatch = actions.policy.watchAdminUpdated(client, {
      onAdminUpdated: (args, log) => {
        logs.push({ args, log })
      },
    })

    // set new admin
    await actions.policy.setAdminSync(client, {
      policyId,
      admin: account2.address,
    })

    await setTimeout(500)
    unwatch()

    expect(logs[0].args.policyId).toBeDefined()
    expect(logs[0].args.updater).toBe(account.address)
    expect(logs[0].args.admin).toBe(account2.address)
  })
})

describe('watchWhitelistUpdated', () => {
  test('default', async () => {
    // create whitelist policy
    const { policyId } = await actions.policy.createSync(client, {
      type: 'whitelist',
    })

    const logs: any[] = []
    const unwatch = actions.policy.watchWhitelistUpdated(client, {
      onWhitelistUpdated: (args, log) => {
        logs.push({ args, log })
      },
    })

    // add address to whitelist
    await actions.policy.modifyWhitelistSync(client, {
      policyId,
      address: account2.address,
      allowed: true,
    })

    // remove address from whitelist
    await actions.policy.modifyWhitelistSync(client, {
      policyId,
      address: account2.address,
      allowed: false,
    })

    await setTimeout(500)
    unwatch()

    expect(logs.length).toBe(2)
    expect(logs[0].args.policyId).toBeDefined()
    expect(logs[0].args.updater).toBe(account.address)
    expect(logs[0].args.account).toBe(account2.address)
    expect(logs[0].args.allowed).toBe(true)
    expect(logs[1].args.allowed).toBe(false)
  })
})

describe('watchBlacklistUpdated', () => {
  test('default', async () => {
    // create blacklist policy
    const { policyId } = await actions.policy.createSync(client, {
      type: 'blacklist',
    })

    const logs: any[] = []
    const unwatch = actions.policy.watchBlacklistUpdated(client, {
      onBlacklistUpdated: (args, log) => {
        logs.push({ args, log })
      },
    })

    // add address to blacklist
    await actions.policy.modifyBlacklistSync(client, {
      policyId,
      address: account2.address,
      restricted: true,
    })

    // remove address from blacklist
    await actions.policy.modifyBlacklistSync(client, {
      policyId,
      address: account2.address,
      restricted: false,
    })

    await setTimeout(500)
    unwatch()

    expect(logs.length).toBe(2)
    expect(logs[0].args.policyId).toBeDefined()
    expect(logs[0].args.updater).toBe(account.address)
    expect(logs[0].args.account).toBe(account2.address)
    expect(logs[0].args.restricted).toBe(true)
    expect(logs[1].args.restricted).toBe(false)
  })
})
