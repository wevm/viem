import * as Authorization from 'ox/Authorization'
import * as Blobs from 'ox/Blobs'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import * as Signature from 'ox/Signature'
import * as TransactionRequest from 'ox/TransactionRequest'
import * as TxEnvelope from 'ox/TxEnvelope'
import * as Value from 'ox/Value'
import { z } from 'ox/zod'
import { describe, expect, test } from 'vitest'
import { Account, Actions, Chain, Client, http } from 'viem'
import { mainnet, optimism } from 'viem/chains'

import * as anvil from '~test/anvil.js'
import { kzg } from '~test/kzg.js'
import { accounts } from '~test/constants.js'

const client = Client.create({
  chain: mainnet,
  transport: http(anvil.mainnet.rpcUrl.http),
})

const local = Account.fromPrivateKey(accounts[0].privateKey)
const jsonRpc = Account.from(accounts[0].address)

const base = {
  from: '0x0000000000000000000000000000000000000000',
  gas: 21000n,
  nonce: 785,
} as const

describe.each([
  ['json-rpc', jsonRpc],
  ['local', local],
] as const)('account: %s', (_name, account) => {
  test('signs a fully-specified transaction', async () => {
    const signed = await Actions.transaction.sign(client, {
      account,
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: 1n,
      nonce: 0,
      gas: 21000n,
      maxFeePerGas: Value.fromGwei('10'),
      maxPriorityFeePerGas: Value.fromGwei('1'),
      type: 'eip1559',
    })
    expect(signed).toMatchInlineSnapshot(
      `"0x02f86b0180843b9aca008502540be4008252089470997970c51812dc3a010c7d01b50e0d17dc79c80180c001a03fbd114d3bfafb03a1a73ec9c5935e863e7ac075098a493bd45cc4b1dae92ac4a057770cc2c470d1b94955e40b4d8c826f04d771abc0c2af8fd73f082c84fab7f7"`,
    )
  })
})

describe('eip1559', () => {
  test('default (local)', async () => {
    expect(
      await Actions.transaction.sign(client, {
        account: local,
        ...base,
        type: 'eip1559',
      }),
    ).toMatchInlineSnapshot(
      `"0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33"`,
    )
  })

  test('minimal (local)', async () => {
    expect(
      await Actions.transaction.sign(client, {
        account: local,
        type: 'eip1559',
      }),
    ).toMatchInlineSnapshot(
      `"0x02f84c0180808080808080c001a0db5b8a12b90b68aeb786379ac14219ac85934e833082dee6cf03fd912809224da06902cc208e3b14a056dca2005c96f59eae33118b899f642551a58cff09044c9a"`,
    )
  })

  test('args: accessList', async () => {
    expect(
      await Actions.transaction.sign(client, {
        account: local,
        ...base,
        type: 'eip1559',
        accessList: [
          {
            address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            storageKeys: [
              '0x0000000000000000000000000000000000000000000000000000000000000001',
              '0x60fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe',
            ],
          },
        ],
      }),
    ).toMatchInlineSnapshot(
      `"0x02f8ac018203118080825208808080f85bf85994f39Fd6e51aad88F6F4ce6aB8827279cffFb92266f842a00000000000000000000000000000000000000000000000000000000000000001a060fdd29ff912ce880cd3edaf9f932dc61d3dae823ea77e0323f94adb9f6a72fe80a0df4810a25d0e147163b03e392bf083dc852702715b9ba848eb9821c70ce2c92ea00b6d11209ef326abaf83aa2443ba61851c7c8ca0813e347a04b501f584b03024"`,
    )
  })

  test('args: data', async () => {
    expect(
      await Actions.transaction.sign(client, {
        account: local,
        ...base,
        type: 'eip1559',
        data: '0x1234',
      }),
    ).toMatchInlineSnapshot(
      `"0x02f8520182031180808252088080821234c001a054d552c58a162c9003633c20871d8e381ef7a3c35d1c8a79c7c12d5cf09a0914a03c5d6241f8c4fcf8b35262de038d3ab1940feb1a70b934ae5d40ea6bce912e2d"`,
    )
  })

  test('args: maxFeePerGas/maxPriorityFeePerGas', async () => {
    expect(
      await Actions.transaction.sign(client, {
        account: local,
        ...base,
        type: 'eip1559',
        maxFeePerGas: Value.fromGwei('20'),
        maxPriorityFeePerGas: Value.fromGwei('2'),
      }),
    ).toMatchInlineSnapshot(
      `"0x02f8590182031184773594008504a817c800825208808080c001a06ea33b188b30a5f5d0d1cec62b2bac7203ff428a49048766596727737689043fa0255b74c8e704e3692497a29cd246ffc4344b4107457ce1c914fe2b4e09993859"`,
    )
  })
})

describe('eip2930', () => {
  test('default (local)', async () => {
    expect(
      await Actions.transaction.sign(client, {
        account: local,
        ...base,
        type: 'eip2930',
      }),
    ).toMatchInlineSnapshot(
      `"0x01f84f0182031180825208808080c080a089cebce5c7f728febd1060b55837c894ec2a79dd7854350abce252fc2de96b5da039f2782c70b92f4b1916aa8db91453c7229f33458bd091b3e10a40f9a7e443d2"`,
    )
  })

  test('minimal (local)', async () => {
    expect(
      await Actions.transaction.sign(client, {
        account: local,
        type: 'eip2930',
      }),
    ).toMatchInlineSnapshot(
      `"0x01f84b01808080808080c080a0cfac15d0507fbcdff8c8b489a85704f856f0b0803cacbbe9aa2a0fd34fd9c260a0571039b719e1c24b410bd6407b22539817c385d99dd9e07858fc973704564d5c"`,
    )
  })

  test('args: gasPrice', async () => {
    expect(
      await Actions.transaction.sign(client, {
        account: local,
        ...base,
        type: 'eip2930',
        gasPrice: Value.fromGwei('20'),
      }),
    ).toMatchInlineSnapshot(
      `"0x01f854018203118504a817c800825208808080c080a058e29913bc928a79e0536fc588e8fe372464d1ff4feff691c344c0163280c97ea037780b5c99301a67aaacfbe98c83139fd026e30925fc103b7898b53af9cb0658"`,
    )
  })
})

describe('legacy', () => {
  const baseLegacy = {
    ...base,
    gasPrice: Value.fromGwei('2'),
    type: 'legacy',
  } as const

  test('default (local)', async () => {
    expect(
      await Actions.transaction.sign(client, {
        account: local,
        ...baseLegacy,
      }),
    ).toMatchInlineSnapshot(
      `"0xf851820311847735940082520880808025a0c1dc31893c8b13bc2dca5e650f68373ea0b8f3c182b516453faf217c53123527a0353f95bc1dab45198fde8cd20c597cb83ea7cf5a6d49586f0c2eaf150356aa49"`,
    )
  })

  test('minimal (local)', async () => {
    expect(
      await Actions.transaction.sign(client, {
        account: local,
        type: 'legacy',
      }),
    ).toMatchInlineSnapshot(
      `"0xf84980808080808026a0ea35a1957cb3b2df609b111365df2bc937dfb054f18e4eaa0d0d74c0aa17de21a04aeb73911649e88c65b3b47581731ba1a0e2f810175823f9565da0d54ee45f16"`,
    )
  })

  test('args: data', async () => {
    expect(
      await Actions.transaction.sign(client, {
        account: local,
        ...baseLegacy,
        data: '0x1234',
      }),
    ).toMatchInlineSnapshot(
      `"0xf8538203118477359400825208808082123425a0d2c01222db75967c3c0e6e24898bf2123e567b693a2e8c469aba19be0e72403ea0119701066fc18f95dc1c54d0fff88d2eb5883e861341b7b5115db0ae1439969f"`,
    )
  })
})

describe('eip7702', () => {
  test('default (local)', async () => {
    const authority = Account.fromPrivateKey(accounts[1].privateKey)
    const authorization = await authority.signAuthorization!(
      Authorization.from({
        address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
        chainId: 1,
        nonce: 420n,
      }),
    )

    const signed = await Actions.transaction.sign(client, {
      account: local,
      ...base,
      authorizationList: [authorization],
      to: '0x0000000000000000000000000000000000000000',
      type: 'eip7702',
    })
    expect(Hex.slice(signed, 0, 1)).toMatchInlineSnapshot(`"0x04"`)
  })
})

describe('eip4844', () => {
  test('default (local)', async () => {
    const blobs = Blobs.from(Hex.fromString('hello world'))
    const signed = await Actions.transaction.sign(client, {
      account: local,
      ...base,
      blobs,
      kzg,
      maxFeePerBlobGas: Value.fromGwei('20'),
      to: '0x0000000000000000000000000000000000000000',
      type: 'eip4844',
    })
    // Serialized 4844 transactions embed the blob sidecars, so assert the
    // envelope type/prefix rather than snapshotting the whole payload.
    expect(Hex.slice(signed, 0, 1)).toMatchInlineSnapshot(`"0x03"`)
  })
})

describe('errors', () => {
  test('no account', async () => {
    await expect(() =>
      Actions.transaction.sign(client, {
        type: 'eip1559',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Account.NotFoundError: Could not find an Account to execute with this Action.

      Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

      Version: viem@2.52.1]
    `)
  })

  test('chain mismatch (json-rpc)', async () => {
    // Only json-rpc accounts assert the connected chain.
    await expect(() =>
      Actions.transaction.sign(client, {
        account: jsonRpc,
        chain: optimism,
        type: 'eip1559',
      }),
    ).rejects.toThrowError(Chain.MismatchError)
  })

  test('local account ignores chain mismatch', async () => {
    // A local account signs offline, so a mismatched `chain` is not asserted.
    const signed = await Actions.transaction.sign(client, {
      account: local,
      chain: optimism,
      type: 'eip1559',
    })
    expect(Hex.slice(signed, 0, 1)).toMatchInlineSnapshot(`"0x02"`)
  })
})

describe('behavior: account', () => {
  test('resolves a raw address (json-rpc)', async () => {
    const signed = await Actions.transaction.sign(client, {
      account: accounts[0].address,
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: 1n,
      nonce: 0,
      gas: 21000n,
      maxFeePerGas: Value.fromGwei('10'),
      maxPriorityFeePerGas: Value.fromGwei('1'),
      type: 'eip1559',
    })
    expect(signed).toMatchInlineSnapshot(
      `"0x02f86b0180843b9aca008502540be4008252089470997970c51812dc3a010c7d01b50e0d17dc79c80180c001a03fbd114d3bfafb03a1a73ec9c5935e863e7ac075098a493bd45cc4b1dae92ac4a057770cc2c470d1b94955e40b4d8c826f04d771abc0c2af8fd73f082c84fab7f7"`,
    )
  })
})

describe('behavior: chain schema', () => {
  test('encodes the json-rpc request via the chain request codec', async () => {
    const chain = mainnet.extend({
      schema: {
        transactionRequest: {
          toRpc: z.pipe(
            z.any(),
            z.transform((request) => TransactionRequest.toRpc(request)),
          ),
        },
      },
    })
    const client = Client.create({
      chain,
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const signed = await Actions.transaction.sign(client, {
      account: jsonRpc,
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: 1n,
      nonce: 0,
      gas: 21000n,
      maxFeePerGas: Value.fromGwei('10'),
      maxPriorityFeePerGas: Value.fromGwei('1'),
      type: 'eip1559',
    })
    expect(signed).toMatchInlineSnapshot(
      `"0x02f86b0180843b9aca008502540be4008252089470997970c51812dc3a010c7d01b50e0d17dc79c80180c001a03fbd114d3bfafb03a1a73ec9c5935e863e7ac075098a493bd45cc4b1dae92ac4a057770cc2c470d1b94955e40b4d8c826f04d771abc0c2af8fd73f082c84fab7f7"`,
    )
  })
})

describe('behavior: chain', () => {
  test('chain: null skips the current-chain assertion', async () => {
    const client = Client.create({
      chain: optimism,
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    // `optimism` (id 10) mismatches the connected chain (id 1); `chain: null`
    // skips the assertion and signs with the connected `chainId` (1 → `01`).
    const signed = await Actions.transaction.sign(client, {
      account: local,
      chain: null,
      type: 'eip1559',
    })
    expect(signed).toMatchInlineSnapshot(
      `"0x02f84c0180808080808080c001a0db5b8a12b90b68aeb786379ac14219ac85934e833082dee6cf03fd912809224da06902cc208e3b14a056dca2005c96f59eae33118b899f642551a58cff09044c9a"`,
    )
  })

  test('transaction.toEnvelope hook builds the envelope', async () => {
    // The chain's `toEnvelope` hook overrides `value`, so the signed
    // transaction must carry the hook's value (69n), not the caller's (1n).
    const chain = mainnet.extend({
      transaction: {
        async toEnvelope(request, options) {
          return {
            ...TransactionRequest.toEnvelope(request, options),
            value: 69n,
          }
        },
      },
    })
    const client = Client.create({
      chain,
      transport: http(anvil.mainnet.rpcUrl.http),
    })
    const signed = await Actions.transaction.sign(client, {
      account: local,
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: 1n,
      type: 'eip1559',
    })
    expect(TxEnvelope.deserialize(signed).value).toBe(69n)
  })

  test('behavior: custom envelope chain signs cast-free', async () => {
    type ZedEnvelope = {
      nonce: bigint | number
      to?: `0x${string}` | undefined
      type: 'zed'
      value?: bigint | undefined
    }

    const zed = Chain.from({
      id: 1,
      name: 'Zed',
      nativeCurrency: { name: 'Zed', symbol: 'ZED', decimals: 18 },
      rpcUrls: { default: { http: [anvil.mainnet.rpcUrl.http] } },
      transaction: {
        getSignPayload: (envelope: ZedEnvelope) =>
          Hash.keccak256(
            Hex.fromString(
              `${envelope.type}:${envelope.to}:${envelope.value}:${envelope.nonce}`,
            ),
          ),
        serialize: (
          envelope: ZedEnvelope,
          options?: { signature?: Signature.Signature | undefined },
        ) =>
          Hex.concat(
            '0x7a',
            Hex.fromString(`${envelope.type}:${envelope.value}`),
            options?.signature ? Signature.toHex(options.signature) : '0x',
          ),
        toEnvelope: (request): ZedEnvelope => ({
          nonce: request.nonce ?? 0n,
          to: request.to ?? undefined,
          type: 'zed',
          value: request.value,
        }),
      },
    })

    const zedClient = Client.create({
      chain: zed,
      transport: http(anvil.mainnet.rpcUrl.http),
    })

    const signed = await Actions.transaction.sign(zedClient, {
      account: local,
      gas: 21_000n,
      maxFeePerGas: 1_000_000_000n,
      maxPriorityFeePerGas: 1n,
      nonce: 785,
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: 1n,
    })

    expect(signed).toMatchInlineSnapshot(
      `"0x7a7a65643a31ce2e43cb6b7c96a07eca82dee1c1e4e2c3e9d0916ac2973e988875b37948bf3333426e56ae523da5924e82654107e56981d312fe6a7467c017ce0cce0572ef5e1c"`,
    )
  })
})

describe('behavior: prepare', () => {
  test('local account populates the required fields', async () => {
    // A minimal request (no nonce/fees/gas/type) is run through the prepare
    // ceremony before signing, so the signed envelope carries those fields.
    const signed = await Actions.transaction.sign(client, {
      account: local,
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: 1n,
      prepare: true,
    })
    const envelope = TxEnvelope.deserialize(signed) as {
      type: string
      gas?: bigint | undefined
      maxFeePerGas?: bigint | undefined
      maxPriorityFeePerGas?: bigint | undefined
      nonce?: bigint | undefined
    }
    expect(envelope.type).toBe('eip1559')
    expect(typeof envelope.nonce).toBe('bigint')
    expect(typeof envelope.gas).toBe('bigint')
    expect(typeof envelope.maxFeePerGas).toBe('bigint')
    expect(typeof envelope.maxPriorityFeePerGas).toBe('bigint')
  })

  test('without prepare, fields stay unset', async () => {
    // The same minimal request without `prepare` leaves `gas` unset, proving
    // the prepare ceremony is what populates it above.
    const signed = await Actions.transaction.sign(client, {
      account: local,
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: 1n,
      type: 'eip1559',
    })
    expect(TxEnvelope.deserialize(signed).gas).toBeUndefined()
  })

  test('json-rpc account signs a prepared request', async () => {
    const signed = await Actions.transaction.sign(client, {
      account: jsonRpc,
      to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
      value: 1n,
      prepare: true,
    })
    expect(Hex.slice(signed, 0, 1)).toMatchInlineSnapshot(`"0x02"`)
  })
})

test('alias: `Actions.signTransaction`', () => {
  expect(Actions.signTransaction).toBe(Actions.transaction.sign)
})
