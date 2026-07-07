import * as AbiConstructor from 'ox/AbiConstructor'
import * as AbiFunction from 'ox/AbiFunction'
import * as Bytes from 'ox/Bytes'
import * as ContractAddress from 'ox/ContractAddress'
import * as Hex from 'ox/Hex'
import * as PersonalMessage from 'ox/PersonalMessage'
import * as Signature from 'ox/Signature'
import { SignatureErc6492 } from 'ox/erc6492'
import { SignatureErc8010 } from 'ox/erc8010'
import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions, Chain, Client, custom, publicActions } from 'viem'

const client = anvil.getClient(anvil.mainnet)
// Non-fork instance for locally-deployed fixtures (no upstream state forwarding).
const local = anvil.getClient(anvil.local)

const localAccount = Account.fromPrivateKey(constants.accounts[0].privateKey)

const helloHash = PersonalMessage.getSignPayload(Hex.fromString('hello world'))

// Deployed ERC-1271 smart account on the mainnet fork, with a known-valid
// signature over `hashMessage('This is a test message for viem!')`.
const smartAccountAddress = '0x3FCf42e10CC70Fe75A62EB3aDD6D305Aa840d145'
const smartAccountHash = PersonalMessage.getSignPayload(
  Hex.fromString('This is a test message for viem!'),
)
const smartAccountSignature =
  '0xefd5fb29a274ea6682673d8b3caa9263e936d48d486e5df68893003e0a76496439594d12245008c6fba1c8e3ef28241cffe1bef27ff6bca487b167f261f329251c'

// Deployed contract without ERC-1271 support.
const ensPublicResolverAddress = '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63'

describe('local account signature shapes', () => {
  test('hex', async () => {
    const signature = await localAccount.signMessage({
      message: 'hello world',
    })

    await expect(
      Actions.verifyHash(client, {
        address: localAccount.address,
        hash: helloHash,
        signature,
      }),
    ).resolves.toBe(true)
  })

  test('bytes', async () => {
    const signature = await localAccount.signMessage({
      message: 'hello world',
    })

    await expect(
      Actions.verifyHash(client, {
        address: localAccount.address,
        hash: helloHash,
        signature: Bytes.fromHex(signature),
      }),
    ).resolves.toBe(true)
  })

  test('object', async () => {
    const signature = await localAccount.signMessage({
      message: 'hello world',
    })

    await expect(
      Actions.verifyHash(client, {
        address: localAccount.address,
        hash: helloHash,
        signature: Signature.fromHex(signature),
      }),
    ).resolves.toBe(true)
  })
})

describe('args: mode', () => {
  test('eoa verifies locally without an RPC request', async () => {
    const offline = Client.create({
      transport: custom({
        async request() {
          throw new Error('unexpected rpc request')
        },
      }),
    })

    const signature = await localAccount.signMessage({
      message: 'hello world',
    })

    await expect(
      Actions.verifyHash(offline, {
        address: localAccount.address,
        hash: helloHash,
        mode: 'eoa',
        signature,
      }),
    ).resolves.toBe(true)
  })

  test('eoa falls back to onchain verification', async () => {
    await expect(
      Actions.verifyHash(client, {
        address: smartAccountAddress,
        hash: smartAccountHash,
        mode: 'eoa',
        signature: smartAccountSignature,
      }),
    ).resolves.toBe(true)
  })
})

describe.each([
  {
    _name: 'deployed, supports ERC1271, valid signature (hex)',
    address: smartAccountAddress,
    expectedResult: true,
    hash: smartAccountHash,
    signature: smartAccountSignature,
  },
  {
    _name: 'deployed, supports ERC1271, valid signature (object)',
    address: smartAccountAddress,
    expectedResult: true,
    hash: smartAccountHash,
    signature: Signature.fromHex(smartAccountSignature),
  },
  {
    _name: 'deployed, supports ERC1271, invalid signature',
    address: smartAccountAddress,
    expectedResult: false,
    hash: smartAccountHash,
    signature: '0xdead',
  },
  {
    _name: 'deployed, does not support ERC1271',
    address: ensPublicResolverAddress,
    expectedResult: false,
    hash: PersonalMessage.getSignPayload(Hex.fromString('0xdead')),
    signature: '0xdead',
  },
  {
    _name: 'undeployed, with correct signature',
    address: constants.accounts[0].address,
    expectedResult: true,
    hash: helloHash,
    signature:
      '0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b',
  },
  {
    _name: 'undeployed, with wrong signature',
    address: '0x000000000000000000000000000000000000dead',
    expectedResult: false,
    hash: PersonalMessage.getSignPayload(Hex.fromString('0xdead')),
    signature: '0xdead',
  },
] as const)('$_name', ({ address, expectedResult, hash, signature }) => {
  test('verifies', async () => {
    expect(
      await Actions.verifyHash(client, {
        address,
        hash,
        signature: signature,
      }),
    ).toBe(expectedResult)
  })
})

test('behavior: chain `verifyHash` hook takes precedence', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Test',
    nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
    rpcUrls: { default: { http: ['http://localhost'] } },
    verifyHash(_client, options) {
      return options.signature === '0xdeadbeef'
    },
  })
  const hooked = Client.create({
    chain,
    transport: custom({
      async request() {
        throw new Error('unexpected rpc request')
      },
    }),
  })

  await expect(
    Actions.verifyHash(hooked, {
      address: localAccount.address,
      hash: helloHash,
      signature: '0xdeadbeef',
    }),
  ).resolves.toBe(true)
  await expect(
    Actions.verifyHash(hooked, {
      address: localAccount.address,
      hash: helloHash,
      signature: '0xdeadbeee',
    }),
  ).resolves.toBe(false)
})

test('behavior: appended-byte signature is invalid', async () => {
  const signature = await localAccount.signMessage({
    message: 'hello world',
  })

  await expect(
    Actions.verifyHash(client, {
      address: localAccount.address,
      hash: helloHash,
      signature: Hex.concat(Hex.slice(signature, 0, 64), '0x001b'),
    }),
  ).resolves.toBe(false)
})

test('behavior: unexpected errors still get thrown', async () => {
  await expect(
    Actions.verifyHash(client, {
      address: '0x0',
      hash: PersonalMessage.getSignPayload(Hex.fromString('0xdead')),
      signature: '0xdead',
    }),
  ).rejects.toThrow()
})

test('decorator', async () => {
  const decorated = client.extend(publicActions())
  const signature = await localAccount.signMessage({
    message: 'hello world',
  })

  await expect(
    decorated.verifyHash({
      address: localAccount.address,
      hash: helloHash,
      signature,
    }),
  ).resolves.toBe(true)
})

describe('erc6492', () => {
  async function deployAccount() {
    const initCode = AbiConstructor.encode(
      AbiConstructor.fromAbi(generated.Erc1271Account.abi),
      {
        args: [localAccount.address],
        bytecode: generated.Erc1271Account.bytecode.object,
      },
    )
    return await contract.deploy(local, { bytecode: initCode })
  }

  test('deployed smart account (deployless validator)', async () => {
    const { address } = await deployAccount()
    const signature = await localAccount.sign({ hash: helloHash })

    await expect(
      Actions.verifyHash(local, {
        address,
        hash: helloHash,
        signature,
      }),
    ).resolves.toBe(true)
  })

  test('deployed smart account, wrong signer', async () => {
    const { address } = await deployAccount()
    const signature = await Account.fromPrivateKey(
      constants.accounts[1].privateKey,
    ).sign({ hash: helloHash })

    await expect(
      Actions.verifyHash(local, {
        address,
        hash: helloHash,
        signature,
      }),
    ).resolves.toBe(false)
  })

  test('undeployed (counterfactual) smart account', async () => {
    const { address: factory } = await contract.deploy(local, {
      bytecode: generated.Erc1271AccountFactory.bytecode.object,
    })

    const salt = Hex.padLeft('0x01', 32)
    const address = ContractAddress.fromCreate2({
      bytecode: AbiConstructor.encode(
        AbiConstructor.fromAbi(generated.Erc1271Account.abi),
        {
          args: [localAccount.address],
          bytecode: generated.Erc1271Account.bytecode.object,
        },
      ),
      from: factory,
      salt,
    })
    const factoryData = AbiFunction.encodeData(
      AbiFunction.fromAbi(generated.Erc1271AccountFactory.abi, 'createAccount'),
      [localAccount.address, salt],
    )

    const signature = await localAccount.sign({ hash: helloHash })

    await expect(
      Actions.verifyHash(local, {
        address,
        factory,
        factoryData,
        hash: helloHash,
        signature,
      }),
    ).resolves.toBe(true)
    await expect(
      Actions.verifyHash(local, {
        address,
        factory,
        factoryData,
        hash: helloHash,
        signature: '0xdead',
      }),
    ).resolves.toBe(false)
  })

  test('undeployed (counterfactual) smart account, pre-wrapped signature', async () => {
    const { address: factory } = await contract.deploy(local, {
      bytecode: generated.Erc1271AccountFactory.bytecode.object,
    })

    const salt = Hex.padLeft('0x02', 32)
    const address = ContractAddress.fromCreate2({
      bytecode: AbiConstructor.encode(
        AbiConstructor.fromAbi(generated.Erc1271Account.abi),
        {
          args: [localAccount.address],
          bytecode: generated.Erc1271Account.bytecode.object,
        },
      ),
      from: factory,
      salt,
    })
    const factoryData = AbiFunction.encodeData(
      AbiFunction.fromAbi(generated.Erc1271AccountFactory.abi, 'createAccount'),
      [localAccount.address, salt],
    )

    const signature = SignatureErc6492.wrap({
      data: factoryData,
      signature: await localAccount.sign({ hash: helloHash }),
      to: factory,
    })

    await expect(
      Actions.verifyHash(local, {
        address,
        hash: helloHash,
        signature,
      }),
    ).resolves.toBe(true)
  })

  test('args: erc6492VerifierAddress (deployed verifier contract)', async () => {
    const { address: verifier } = await contract.deploy(local, {
      bytecode: generated.Erc6492SignatureVerifier.bytecode.object,
    })
    const { address } = await deployAccount()
    const signature = await localAccount.sign({ hash: helloHash })

    await expect(
      Actions.verifyHash(local, {
        address,
        erc6492VerifierAddress: verifier,
        hash: helloHash,
        signature,
      }),
    ).resolves.toBe(true)
    await expect(
      Actions.verifyHash(local, {
        address,
        erc6492VerifierAddress: verifier,
        hash: helloHash,
        signature: '0xdead',
      }),
    ).resolves.toBe(false)
  })

  test('undeployed with predeployed verifier (via arg)', async () => {
    const { address: verifier } = await contract.deploy(local, {
      bytecode: generated.Erc6492SignatureVerifier.bytecode.object,
    })
    const { address: factory } = await contract.deploy(local, {
      bytecode: generated.Erc1271AccountFactory.bytecode.object,
    })

    const salt = Hex.padLeft('0x03', 32)
    const address = ContractAddress.fromCreate2({
      bytecode: AbiConstructor.encode(
        AbiConstructor.fromAbi(generated.Erc1271Account.abi),
        {
          args: [localAccount.address],
          bytecode: generated.Erc1271Account.bytecode.object,
        },
      ),
      from: factory,
      salt,
    })
    const factoryData = AbiFunction.encodeData(
      AbiFunction.fromAbi(generated.Erc1271AccountFactory.abi, 'createAccount'),
      [localAccount.address, salt],
    )

    await expect(
      Actions.verifyHash(local, {
        address,
        erc6492VerifierAddress: verifier,
        factory,
        factoryData,
        hash: helloHash,
        signature: await localAccount.sign({ hash: helloHash }),
      }),
    ).resolves.toBe(true)
  })

  test('undeployed with predeployed verifier (via client chain)', async () => {
    const { address: verifier } = await contract.deploy(local, {
      bytecode: generated.Erc6492SignatureVerifier.bytecode.object,
    })
    const { address: factory } = await contract.deploy(local, {
      bytecode: generated.Erc1271AccountFactory.bytecode.object,
    })

    const chained = Client.create({
      chain: Chain.from({
        contracts: { erc6492Verifier: { address: verifier } },
        id: 1,
        name: 'Test',
        nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
        rpcUrls: { default: { http: ['http://localhost'] } },
      }),
      transport: custom({
        async request({ method, params }: { method: string; params: unknown }) {
          return local.request({ method, params })
        },
      }),
    })

    const salt = Hex.padLeft('0x04', 32)
    const address = ContractAddress.fromCreate2({
      bytecode: AbiConstructor.encode(
        AbiConstructor.fromAbi(generated.Erc1271Account.abi),
        {
          args: [localAccount.address],
          bytecode: generated.Erc1271Account.bytecode.object,
        },
      ),
      from: factory,
      salt,
    })
    const factoryData = AbiFunction.encodeData(
      AbiFunction.fromAbi(generated.Erc1271AccountFactory.abi, 'createAccount'),
      [localAccount.address, salt],
    )

    await expect(
      Actions.verifyHash(chained, {
        address,
        factory,
        factoryData,
        hash: helloHash,
        signature: await localAccount.sign({ hash: helloHash }),
      }),
    ).resolves.toBe(true)
  })

  test('deployed with factory + factoryData', async () => {
    const { address: factory } = await contract.deploy(local, {
      bytecode: generated.Erc1271AccountFactory.bytecode.object,
    })

    const salt = Hex.padLeft('0x05', 32)
    const factoryData = AbiFunction.encodeData(
      AbiFunction.fromAbi(generated.Erc1271AccountFactory.abi, 'createAccount'),
      [localAccount.address, salt],
    )
    const { result: address } = await Actions.contract.simulate(local, {
      abi: generated.Erc1271AccountFactory.abi,
      account: localAccount,
      address: factory,
      args: [localAccount.address, salt],
      functionName: 'createAccount',
    })
    await Actions.contract.write(local, {
      abi: generated.Erc1271AccountFactory.abi,
      account: localAccount,
      address: factory,
      args: [localAccount.address, salt],
      functionName: 'createAccount',
    })
    await Actions.test.block.mine(local, { blocks: 1 })

    await expect(
      Actions.verifyHash(local, {
        address,
        factory,
        factoryData,
        hash: helloHash,
        signature: await localAccount.sign({ hash: helloHash }),
      }),
    ).resolves.toBe(true)
  })
})

describe('erc8010', () => {
  // Dedicated delegating account (the delegated-designation test mutates its
  // code on the shared fork).
  const eoa = Account.fromPrivateKey(constants.accounts[7].privateKey)

  async function signAuthorization(address: `0x${string}`) {
    const nonce = await Actions.address.getTransactionCount(local, {
      address: eoa.address,
    })
    return await eoa.signAuthorization!({
      address,
      chainId: 1,
      nonce: BigInt(nonce),
    })
  }

  test('undeployed delegation (optional init)', async () => {
    const { address: impl } = await contract.deploy(local, {
      bytecode: generated.EoaOptional.bytecode.object,
    })
    const authorization = await signAuthorization(impl)
    const signature = SignatureErc8010.wrap({
      authorization,
      signature: await eoa.sign({ hash: helloHash }),
    })

    await expect(
      Actions.verifyHash(local, {
        address: eoa.address,
        hash: helloHash,
        signature,
      }),
    ).resolves.toBe(true)
  })

  test('undeployed delegation (required init data)', async () => {
    const { address: impl } = await contract.deploy(local, {
      bytecode: generated.Eoa.bytecode.object,
    })
    const { address: initializer } = await contract.deploy(local, {
      bytecode: generated.EoaInitializer.bytecode.object,
    })
    const authorization = await signAuthorization(impl)
    const rawSignature = await eoa.sign({ hash: helloHash })

    await expect(
      Actions.verifyHash(local, {
        address: eoa.address,
        hash: helloHash,
        signature: SignatureErc8010.wrap({
          authorization,
          data: AbiFunction.encodeData(
            AbiFunction.fromAbi(generated.EoaInitializer.abi, 'initialize'),
            [eoa.address],
          ),
          signature: rawSignature,
          to: initializer,
        }),
      }),
    ).resolves.toBe(true)
    // Without the init data the delegate stays uninitialized and rejects.
    await expect(
      Actions.verifyHash(local, {
        address: eoa.address,
        hash: helloHash,
        signature: SignatureErc8010.wrap({
          authorization,
          signature: rawSignature,
        }),
      }),
    ).resolves.toBe(false)
  })

  test('delegated account verifies via ERC-1271', async () => {
    const { address: impl } = await contract.deploy(local, {
      bytecode: generated.EoaOptional.bytecode.object,
    })
    const authorization = await signAuthorization(impl)

    // Carry the authorization on a plain transfer (the delegate has no
    // fallback function to receive a direct call).
    await Actions.transaction.send(local, {
      account: localAccount,
      authorizationList: [authorization],
      to: localAccount.address,
    })
    await Actions.test.block.mine(local, { blocks: 1 })

    const signature = SignatureErc8010.wrap({
      authorization,
      signature: await eoa.sign({ hash: helloHash }),
    })

    await expect(
      Actions.verifyHash(local, {
        address: eoa.address,
        hash: helloHash,
        signature,
      }),
    ).resolves.toBe(true)
  })
  test('delegated: wrapped signature carries init data', async () => {
    const account = Account.random()
    const { address: impl } = await contract.deploy(local, {
      bytecode: generated.EoaOptional.bytecode.object,
    })
    const { address: initializer } = await contract.deploy(local, {
      bytecode: generated.EoaInitializer.bytecode.object,
    })

    const authorization = await account.signAuthorization!({
      address: impl,
      chainId: 1,
      nonce: 0n,
    })
    await Actions.transaction.send(local, {
      account: localAccount,
      authorizationList: [authorization],
      to: localAccount.address,
    })
    await Actions.test.block.mine(local, { blocks: 1 })

    // Already delegated: the init data is ignored and plain ERC-1271 runs.
    await expect(
      Actions.verifyHash(local, {
        address: account.address,
        hash: helloHash,
        signature: SignatureErc8010.wrap({
          authorization,
          data: AbiFunction.encodeData(
            AbiFunction.fromAbi(generated.EoaInitializer.abi, 'initialize'),
            [account.address],
          ),
          signature: await account.sign({ hash: helloHash }),
          to: initializer,
        }),
      }),
    ).resolves.toBe(true)
  })

  test('predelegated: init data targets the delegate itself', async () => {
    const account = Account.random()
    const { address: impl } = await contract.deploy(local, {
      bytecode: generated.Eoa.bytecode.object,
    })

    const authorization = await account.signAuthorization!({
      address: impl,
      chainId: 1,
      nonce: 0n,
    })

    await expect(
      Actions.verifyHash(local, {
        address: account.address,
        hash: helloHash,
        signature: SignatureErc8010.wrap({
          authorization,
          data: AbiFunction.encodeData(
            AbiFunction.fromAbi(generated.Eoa.abi, 'initialize'),
          ),
          signature: await account.sign({ hash: helloHash }),
        }),
      }),
    ).resolves.toBe(true)
  })

  test('predelegated: invalidate nonce (failure)', async () => {
    const account = Account.random()
    const { address: impl } = await contract.deploy(local, {
      bytecode: generated.EoaOptional.bytecode.object,
    })

    const authorization = await account.signAuthorization!({
      address: impl,
      chainId: 1,
      nonce: 0n,
    })
    const signature = SignatureErc8010.wrap({
      authorization,
      signature: await account.sign({ hash: helloHash }),
    })

    await expect(
      Actions.verifyHash(local, {
        address: account.address,
        hash: helloHash,
        signature,
      }),
    ).resolves.toBe(true)

    await Actions.test.address.setNonce(local, {
      address: account.address,
      nonce: 69,
    })

    await expect(
      Actions.verifyHash(local, {
        address: account.address,
        hash: helloHash,
        signature,
      }),
    ).resolves.toBe(false)
  })

  test('predelegated: invalidate delegation (failure)', async () => {
    const account = Account.random()
    const { address: impl } = await contract.deploy(local, {
      bytecode: generated.EoaOptional.bytecode.object,
    })
    const { address: gatedImpl } = await contract.deploy(local, {
      bytecode: generated.Eoa.bytecode.object,
    })

    const authorization = await account.signAuthorization!({
      address: impl,
      chainId: 1,
      nonce: 0n,
    })
    const signature = SignatureErc8010.wrap({
      authorization,
      signature: await account.sign({ hash: helloHash }),
    })

    await expect(
      Actions.verifyHash(local, {
        address: account.address,
        hash: helloHash,
        signature,
      }),
    ).resolves.toBe(true)

    // Re-delegate to the init-gated implementation; the original wrapped
    // signature now carries a stale authorization.
    const reAuthorization = await account.signAuthorization!({
      address: gatedImpl,
      chainId: 1,
      nonce: 0n,
    })
    await Actions.transaction.send(local, {
      account: localAccount,
      authorizationList: [reAuthorization],
      to: localAccount.address,
    })
    await Actions.test.block.mine(local, { blocks: 1 })

    await expect(
      Actions.verifyHash(local, {
        address: account.address,
        hash: helloHash,
        signature,
      }),
    ).resolves.toBe(false)
  })
})
