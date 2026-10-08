import { Hex } from 'ox'
import { zeroAddress } from 'viem'
import { getBlock, waitForTransactionReceipt } from 'viem/actions'
import { Oidc, PublisherId } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import {
  accounts,
  getClient,
  nodeEnv,
  setupFeeToken,
} from '~test/tempo/config.js'
import { withResolvers } from '../../utils/promise/withResolvers.js'
import * as actions from './index.js'

// The Key Publisher precompile activates at T14.
const hardfork = import.meta.env.VITE_TEMPO_HARDFORK
const supported = nodeEnv === 'localnet' && (!hardfork || hardfork === 'Tnext')

const account = accounts[0]
const account2 = accounts[1]

const client = getClient({ account })
const client2 = getClient({ account: account2 })

const google = Oidc.hashIssuer('https://accounts.google.com')
const apple = Oidc.hashIssuer('https://appleid.apple.com')

describe.runIf(supported)('create', () => {
  test('default', async () => {
    const salt = toSalt(1)

    const { receipt, ...result } = await actions.keyPublisher.createSync(
      client,
      {
        keys: [{ issuer: google, keyHashes: [toKeyHash(2), toKeyHash(1)] }],
        salt,
      },
    )

    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "creator": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "publisherId": "0xa3c1274aadd82e4d12c8004c33fb244ca686dad4fcc8957fc5668588c11d9502",
      }
    `)
    expect(result.publisherId).toBe(
      PublisherId.from({ creator: account.address, salt }),
    )
    expect(
      await actions.keyPublisher.getActiveKeys(client, {
        issuer: google,
        publisherId: result.publisherId,
      }),
    ).toMatchInlineSnapshot(`
      [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000000000000000000000000000002",
      ]
    `)
  })

  test('behavior: transaction hash', async () => {
    const hash = await actions.keyPublisher.create(client, {
      keys: [{ issuer: google, keyHashes: [toKeyHash(1)] }],
      salt: toSalt(2),
    })
    const receipt = await waitForTransactionReceipt(client, { hash })

    const { args } = actions.keyPublisher.create.extractEvent(receipt.logs)
    expect(args).toMatchInlineSnapshot(`
      {
        "creator": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "publisherId": "0xbc40fbf4394cd00f78fae9763b0c2c71b21ea442c42fdadc5b720537240ebac1",
      }
    `)
  })

  test('behavior: initial owner', async () => {
    const { owner, publisherId } = await actions.keyPublisher.createSync(
      client,
      {
        initialOwner: account2.address,
        keys: [],
        salt: toSalt(3),
      },
    )

    expect(owner).toBe(account2.address)
    expect(await actions.keyPublisher.getOwner(client, { publisherId })).toBe(
      account2.address,
    )
  })

  test('behavior: sorts issuers and key hashes, dropping repeats', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [
        { issuer: google, keyHashes: [toKeyHash(3), toKeyHash(1)] },
        { issuer: apple, keyHashes: [toKeyHash(5), toKeyHash(4)] },
        { issuer: google, keyHashes: [toKeyHash(2), toKeyHash(1)] },
      ],
      salt: toSalt(4),
    })

    expect(
      await actions.keyPublisher.getActiveKeys(client, {
        issuer: google,
        publisherId,
      }),
    ).toMatchInlineSnapshot(`
      [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000000000000000000000000000002",
        "0x0000000000000000000000000000000000000000000000000000000000000003",
      ]
    `)
    expect(
      await actions.keyPublisher.getActiveKeys(client, {
        issuer: apple,
        publisherId,
      }),
    ).toMatchInlineSnapshot(`
      [
        "0x0000000000000000000000000000000000000000000000000000000000000004",
        "0x0000000000000000000000000000000000000000000000000000000000000005",
      ]
    `)
  })

  test('behavior: issuers in either order', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [
        { issuer: apple, keyHashes: [toKeyHash(1)] },
        { issuer: google, keyHashes: [toKeyHash(1)] },
      ],
      salt: toSalt(5),
    })

    expect(
      await actions.keyPublisher.isKeyActive(client, {
        issuer: apple,
        keyHash: toKeyHash(1),
        publisherId,
      }),
    ).toBe(true)
    expect(
      await actions.keyPublisher.isKeyActive(client, {
        issuer: google,
        keyHash: toKeyHash(1),
        publisherId,
      }),
    ).toBe(true)
  })

  test('behavior: publisher exists', async () => {
    await actions.keyPublisher.createSync(client, {
      keys: [],
      salt: toSalt(6),
    })

    await expect(
      actions.keyPublisher.createSync(client, {
        keys: [],
        salt: toSalt(6),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "createPublisher" reverted.

      Error: PublisherExists()
       
      Contract Call:
        address:   0x1132000000000000000000000000000000000000
        function:  createPublisher(bytes32 salt, address owner, (bytes32 issuer, bytes32[] keyHashes)[])
        args:                     (0x0000000000000000000000000000000000000000000000000000000000000006, 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, [])
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

      Details: execution reverted: Key publisher error: PublisherExists(PublisherExists)
      Version: viem@x.y.z]
    `)
  })

  test('behavior: invalid field element', async () => {
    await expect(
      actions.keyPublisher.createSync(client, {
        keys: [{ issuer: google, keyHashes: [toKeyHash(0)] }],
        salt: toSalt(7),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "createPublisher" reverted.

      Error: InvalidFieldElement()
       
      Contract Call:
        address:   0x1132000000000000000000000000000000000000
        function:  createPublisher(bytes32 salt, address owner, (bytes32 issuer, bytes32[] keyHashes)[])
        args:                     (0x0000000000000000000000000000000000000000000000000000000000000007, 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, [{"issuer":"0x2ff3ac6e640a4a5d80c0a97cdf74754c3126bde1d8772872a7b3d8afe0714da4","keyHashes":["0x0000000000000000000000000000000000000000000000000000000000000000"]}])
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

      Details: execution reverted: Key publisher error: InvalidFieldElement(InvalidFieldElement)
      Version: viem@x.y.z]
    `)
  })
})

describe.runIf(supported)('getActiveKeys', () => {
  test('behavior: unknown issuer', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [{ issuer: google, keyHashes: [toKeyHash(1)] }],
      salt: toSalt(10),
    })

    expect(
      await actions.keyPublisher.getActiveKeys(client, {
        issuer: apple,
        publisherId,
      }),
    ).toMatchInlineSnapshot(`[]`)
  })
})

describe.runIf(supported)('getKeyValidUntil', () => {
  test('default', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [{ issuer: google, keyHashes: [toKeyHash(1)] }],
      salt: toSalt(20),
    })

    expect(
      await actions.keyPublisher.getKeyValidUntil(client, {
        issuer: google,
        keyHash: toKeyHash(1),
        publisherId,
      }),
    ).toMatchInlineSnapshot(`18446744073709551615n`)
  })

  test('behavior: never listed', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [{ issuer: google, keyHashes: [toKeyHash(1)] }],
      salt: toSalt(21),
    })

    expect(
      await actions.keyPublisher.getKeyValidUntil(client, {
        issuer: google,
        keyHash: toKeyHash(2),
        publisherId,
      }),
    ).toMatchInlineSnapshot(`0n`)
  })
})

describe.runIf(supported)('getOwner', () => {
  test('default', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [],
      salt: toSalt(30),
    })

    expect(await actions.keyPublisher.getOwner(client, { publisherId })).toBe(
      account.address,
    )
  })

  test('behavior: unknown publisher', async () => {
    expect(
      await actions.keyPublisher.getOwner(client, {
        publisherId: PublisherId.from({
          creator: account2.address,
          salt: toSalt(30),
        }),
      }),
    ).toBe(zeroAddress)
  })
})

describe.runIf(supported)('isKeyActive', () => {
  test('default', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [{ issuer: google, keyHashes: [toKeyHash(1)] }],
      salt: toSalt(40),
    })

    expect(
      await actions.keyPublisher.isKeyActive(client, {
        issuer: google,
        keyHash: toKeyHash(1),
        publisherId,
      }),
    ).toBe(true)
    expect(
      await actions.keyPublisher.isKeyActive(client, {
        issuer: google,
        keyHash: toKeyHash(2),
        publisherId,
      }),
    ).toBe(false)
  })
})

describe.runIf(supported)('revokeKey', () => {
  test('default', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [{ issuer: google, keyHashes: [toKeyHash(1), toKeyHash(2)] }],
      salt: toSalt(50),
    })

    const { receipt, ...result } = await actions.keyPublisher.revokeKeySync(
      client,
      {
        issuer: google,
        keyHash: toKeyHash(1),
        publisherId,
      },
    )

    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "issuer": "0x2ff3ac6e640a4a5d80c0a97cdf74754c3126bde1d8772872a7b3d8afe0714da4",
        "keyHash": "0x0000000000000000000000000000000000000000000000000000000000000001",
        "publisherId": "0x4963bc27a7dd5ac95af1d79241fc3bbdc02497c390fa12e189b8703b25318721",
      }
    `)
    expect(
      await actions.keyPublisher.getActiveKeys(client, {
        issuer: google,
        publisherId,
      }),
    ).toMatchInlineSnapshot(`
      [
        "0x0000000000000000000000000000000000000000000000000000000000000002",
      ]
    `)
    expect(
      await actions.keyPublisher.getKeyValidUntil(client, {
        issuer: google,
        keyHash: toKeyHash(1),
        publisherId,
      }),
    ).toBe(0n)
  })

  test('behavior: dropped key in its grace period', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [{ issuer: google, keyHashes: [toKeyHash(1), toKeyHash(2)] }],
      salt: toSalt(51),
    })
    await actions.keyPublisher.setKeysSync(client, {
      issuer: google,
      keyHashes: [toKeyHash(2)],
      publisherId,
    })

    await actions.keyPublisher.revokeKeySync(client, {
      issuer: google,
      keyHash: toKeyHash(1),
      publisherId,
    })

    expect(
      await actions.keyPublisher.isKeyActive(client, {
        issuer: google,
        keyHash: toKeyHash(1),
        publisherId,
      }),
    ).toBe(false)
  })

  test('behavior: not owner', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [{ issuer: google, keyHashes: [toKeyHash(1)] }],
      salt: toSalt(52),
    })

    await expect(
      actions.keyPublisher.revokeKeySync(client2, {
        issuer: google,
        keyHash: toKeyHash(1),
        publisherId,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "revokeKey" reverted.

      Error: Unauthorized()
       
      Contract Call:
        address:   0x1132000000000000000000000000000000000000
        function:  revokeKey(bytes32 publisherId, bytes32 issuer, bytes32 keyHash)
        args:               (0xe5bd6c14e3ab2ace4a314c8ee54348c450ac2d79754037f82011b9e14c116bf4, 0x2ff3ac6e640a4a5d80c0a97cdf74754c3126bde1d8772872a7b3d8afe0714da4, 0x0000000000000000000000000000000000000000000000000000000000000001)
        sender:    0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650

      Details: execution reverted: Key publisher error: Unauthorized(Unauthorized)
      Version: viem@x.y.z]
    `)
  })
})

describe.runIf(supported)('setKeys', () => {
  test('default', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [{ issuer: google, keyHashes: [toKeyHash(1), toKeyHash(2)] }],
      salt: toSalt(60),
    })

    const { graceUntil, receipt, ...result } =
      await actions.keyPublisher.setKeysSync(client, {
        issuer: google,
        keyHashes: [toKeyHash(4), toKeyHash(2), toKeyHash(3), toKeyHash(4)],
        publisherId,
      })

    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "issuer": "0x2ff3ac6e640a4a5d80c0a97cdf74754c3126bde1d8772872a7b3d8afe0714da4",
        "keyHashes": [
          "0x0000000000000000000000000000000000000000000000000000000000000002",
          "0x0000000000000000000000000000000000000000000000000000000000000003",
          "0x0000000000000000000000000000000000000000000000000000000000000004",
        ],
        "publisherId": "0x85f21d87f1015f9892033dddb24c02c846a20e02aa097d28bd077bc927b6ede4",
      }
    `)
    const { timestamp } = await getBlock(client, {
      blockNumber: receipt.blockNumber,
    })
    expect(graceUntil - timestamp).toBe(3600n)
    expect(
      await actions.keyPublisher.getActiveKeys(client, {
        issuer: google,
        publisherId,
      }),
    ).toMatchInlineSnapshot(`
      [
        "0x0000000000000000000000000000000000000000000000000000000000000002",
        "0x0000000000000000000000000000000000000000000000000000000000000003",
        "0x0000000000000000000000000000000000000000000000000000000000000004",
      ]
    `)
    expect(
      await actions.keyPublisher.isKeyActive(client, {
        issuer: google,
        keyHash: toKeyHash(1),
        publisherId,
      }),
    ).toBe(true)
    expect(
      await actions.keyPublisher.getKeyValidUntil(client, {
        issuer: google,
        keyHash: toKeyHash(1),
        publisherId,
      }),
    ).toBe(graceUntil)
  })

  test('behavior: transaction hash', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [],
      salt: toSalt(61),
    })

    const hash = await actions.keyPublisher.setKeys(client, {
      issuer: google,
      keyHashes: [toKeyHash(1)],
      publisherId,
    })
    const receipt = await waitForTransactionReceipt(client, { hash })

    const { args } = actions.keyPublisher.setKeys.extractEvent(receipt.logs)
    expect(args.keyHashes).toMatchInlineSnapshot(`
      [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      ]
    `)
  })

  test('behavior: too many keys', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [],
      salt: toSalt(62),
    })

    await expect(
      actions.keyPublisher.setKeysSync(client, {
        issuer: google,
        keyHashes: Array.from({ length: 17 }, (_, index) =>
          toKeyHash(index + 1),
        ),
        publisherId,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "setKeys" reverted.

      Error: TooManyKeys()
       
      Contract Call:
        address:   0x1132000000000000000000000000000000000000
        function:  setKeys(bytes32 publisherId, bytes32 issuer, bytes32[] keyHashes)
        args:             (0xcbd83fa2991999a874195b9e65dc04b7349b0ff177faa3ee04b2201210c92017, 0x2ff3ac6e640a4a5d80c0a97cdf74754c3126bde1d8772872a7b3d8afe0714da4, ["0x0000000000000000000000000000000000000000000000000000000000000001","0x0000000000000000000000000000000000000000000000000000000000000002","0x0000000000000000000000000000000000000000000000000000000000000003","0x0000000000000000000000000000000000000000000000000000000000000004","0x0000000000000000000000000000000000000000000000000000000000000005","0x0000000000000000000000000000000000000000000000000000000000000006","0x0000000000000000000000000000000000000000000000000000000000000007","0x0000000000000000000000000000000000000000000000000000000000000008","0x0000000000000000000000000000000000000000000000000000000000000009","0x000000000000000000000000000000000000000000000000000000000000000a","0x000000000000000000000000000000000000000000000000000000000000000b","0x000000000000000000000000000000000000000000000000000000000000000c","0x000000000000000000000000000000000000000000000000000000000000000d","0x000000000000000000000000000000000000000000000000000000000000000e","0x000000000000000000000000000000000000000000000000000000000000000f","0x0000000000000000000000000000000000000000000000000000000000000010","0x0000000000000000000000000000000000000000000000000000000000000011"])
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

      Details: execution reverted: Key publisher error: TooManyKeys(TooManyKeys)
      Version: viem@x.y.z]
    `)
  })

  test('behavior: unknown publisher', async () => {
    await expect(
      actions.keyPublisher.setKeysSync(client, {
        issuer: google,
        keyHashes: [toKeyHash(1)],
        publisherId: PublisherId.from({
          creator: account.address,
          salt: toSalt(63),
        }),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "setKeys" reverted.

      Error: UnknownPublisher()
       
      Contract Call:
        address:   0x1132000000000000000000000000000000000000
        function:  setKeys(bytes32 publisherId, bytes32 issuer, bytes32[] keyHashes)
        args:             (0xc3fa8b3a64ad890135dbab0905e0aaba45257def953688f3ded46f7cf9996fca, 0x2ff3ac6e640a4a5d80c0a97cdf74754c3126bde1d8772872a7b3d8afe0714da4, ["0x0000000000000000000000000000000000000000000000000000000000000001"])
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

      Details: execution reverted: Key publisher error: UnknownPublisher(UnknownPublisher)
      Version: viem@x.y.z]
    `)
  })
})

describe.runIf(supported)('transferOwnership', () => {
  test('default', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [],
      salt: toSalt(70),
    })

    const { receipt, ...result } =
      await actions.keyPublisher.transferOwnershipSync(client, {
        newOwner: account2.address,
        publisherId,
      })

    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "newOwner": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        "previousOwner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "publisherId": "0xf90b08847c1e1a594d61fbcabab4b7868de34e7d5bbae7f78e5966b601b3b477",
      }
    `)
    expect(await actions.keyPublisher.getOwner(client, { publisherId })).toBe(
      account2.address,
    )

    await setupFeeToken(client, { account: account2 })
    await actions.keyPublisher.setKeysSync(client2, {
      issuer: google,
      keyHashes: [toKeyHash(1)],
      publisherId,
    })
    await expect(
      actions.keyPublisher.setKeysSync(client, {
        issuer: google,
        keyHashes: [toKeyHash(2)],
        publisherId,
      }),
    ).rejects.toThrow('The contract function "setKeys" reverted')
  })

  test('behavior: zero address', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [],
      salt: toSalt(71),
    })

    await expect(
      actions.keyPublisher.transferOwnershipSync(client, {
        newOwner: zeroAddress,
        publisherId,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "transferOwnership" reverted.

      Error: ZeroAddress()
       
      Contract Call:
        address:   0x1132000000000000000000000000000000000000
        function:  transferOwnership(bytes32 publisherId, address newOwner)
        args:                       (0x38381081f2b2a9c75a17796cf1018a704770e729821f112cffca2a84b0001183, 0x0000000000000000000000000000000000000000)
        sender:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

      Details: execution reverted: Key publisher error: ZeroAddress(ZeroAddress)
      Version: viem@x.y.z]
    `)
  })
})

describe.runIf(supported)('watchCreate', () => {
  test('default', async () => {
    const salt = toSalt(80)
    const publisherId = PublisherId.from({ creator: account.address, salt })

    const event = withResolvers<actions.keyPublisher.watchCreate.Args>()
    const unwatch = actions.keyPublisher.watchCreate(client, {
      args: { publisherId },
      onPublisherCreated: (args) => event.resolve(args),
    })
    await actions.keyPublisher.createSync(client, { keys: [], salt })
    const args = await event.promise
    unwatch()

    expect(args).toMatchInlineSnapshot(`
      {
        "creator": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "publisherId": "0xdaab3703a9689527b3b8c5a3faf502b1739f5b9cd8b58c35bafe1acab19ab1bb",
      }
    `)
  })
})

describe.runIf(supported)('watchKeyRevoked', () => {
  test('default', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [{ issuer: google, keyHashes: [toKeyHash(1)] }],
      salt: toSalt(81),
    })

    const event = withResolvers<actions.keyPublisher.watchKeyRevoked.Args>()
    const unwatch = actions.keyPublisher.watchKeyRevoked(client, {
      args: { publisherId },
      onKeyRevoked: (args) => event.resolve(args),
    })
    await actions.keyPublisher.revokeKeySync(client, {
      issuer: google,
      keyHash: toKeyHash(1),
      publisherId,
    })
    const args = await event.promise
    unwatch()

    expect(args).toMatchInlineSnapshot(`
      {
        "issuer": "0x2ff3ac6e640a4a5d80c0a97cdf74754c3126bde1d8772872a7b3d8afe0714da4",
        "keyHash": "0x0000000000000000000000000000000000000000000000000000000000000001",
        "publisherId": "0x510b108aafea8bc13bc20034404234452ea222cfa836c032181f98a3886686e4",
      }
    `)
  })
})

describe.runIf(supported)('watchKeysSet', () => {
  test('default', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [],
      salt: toSalt(82),
    })

    const event = withResolvers<actions.keyPublisher.watchKeysSet.Args>()
    const unwatch = actions.keyPublisher.watchKeysSet(client, {
      args: { publisherId },
      onKeysSet: (args) => event.resolve(args),
    })
    await actions.keyPublisher.setKeysSync(client, {
      issuer: google,
      keyHashes: [toKeyHash(2), toKeyHash(1)],
      publisherId,
    })
    const { graceUntil, ...args } = await event.promise
    unwatch()

    expect(graceUntil).toBeGreaterThan(0n)
    expect(args).toMatchInlineSnapshot(`
      {
        "issuer": "0x2ff3ac6e640a4a5d80c0a97cdf74754c3126bde1d8772872a7b3d8afe0714da4",
        "keyHashes": [
          "0x0000000000000000000000000000000000000000000000000000000000000001",
          "0x0000000000000000000000000000000000000000000000000000000000000002",
        ],
        "publisherId": "0xc40c864707fda4da1fa1aa6c83e22a88bab633a2e71867b5f15534464a2cf01d",
      }
    `)
  })
})

describe.runIf(supported)('watchOwnershipTransferred', () => {
  test('default', async () => {
    const { publisherId } = await actions.keyPublisher.createSync(client, {
      keys: [],
      salt: toSalt(83),
    })

    const event =
      withResolvers<actions.keyPublisher.watchOwnershipTransferred.Args>()
    const unwatch = actions.keyPublisher.watchOwnershipTransferred(client, {
      args: { publisherId },
      onOwnershipTransferred: (args) => event.resolve(args),
    })
    await actions.keyPublisher.transferOwnershipSync(client, {
      newOwner: account2.address,
      publisherId,
    })
    const args = await event.promise
    unwatch()

    expect(args).toMatchInlineSnapshot(`
      {
        "newOwner": "0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650",
        "previousOwner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "publisherId": "0x11d5f3d58e4cd8f7910d3532e0fdfd141a3b4fc0a12f29916b4bbc857cf080a8",
      }
    `)
  })
})

function toKeyHash(value: number) {
  return Hex.fromNumber(value, { size: 32 })
}

function toSalt(value: number) {
  return Hex.fromNumber(value, { size: 32 })
}
