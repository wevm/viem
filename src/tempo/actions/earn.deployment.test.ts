import { Hex } from 'ox'
import { encodeDeployData, getAddress, isAddressEqual, zeroAddress } from 'viem'
import {
  readContract,
  sendTransactionSync,
  writeContractSync,
} from 'viem/actions'
import { Abis, Actions } from 'viem/tempo'
import { describe, expect, test } from 'vitest'
import { accounts, getClient, setupFeeToken } from '~test/tempo/config.js'
import { deployEarnFactories } from '~test/tempo/earn.js'
import { earnFactory } from '~test/tempo/earnContracts.js'

const account = accounts[0]
const client = getClient({ account })
let fixturePromise: ReturnType<typeof deployEarnFactories> | undefined
function setup() {
  fixturePromise ??= deployEarnFactories(client)
  return fixturePromise
}

describe('bindEngine.call', () => {
  test('encodes optional final ownership transfer', () => {
    expect(
      Actions.earn.bindEngine.call({
        engine: account.address,
        vault: accounts[1].address,
      }).args,
    ).toEqual([accounts[1].address])
    expect(
      Actions.earn.bindEngine.call({
        engine: account.address,
        finalOwner: accounts[2].address,
        vault: accounts[1].address,
      }).args,
    ).toEqual([accounts[1].address, accounts[2].address])
  })
})

describe('createStack.call', () => {
  test('defaults to a fee-free stack with no privileged control seats', () => {
    const call = Actions.earn.createStack.call({
      deploymentId: Hex.fromNumber(1, { size: 32 }),
      engine: account.address,
      factory: accounts[1].address,
      owner: account.address,
    })

    expect(call.args[0]).toMatchObject({
      controls: {
        asyncJanitor: zeroAddress,
        emergencyGuardian: zeroAddress,
        maxManagedAssets: 0n,
        migrationMode: 0,
      },
      distributorConfig: {
        distributor: zeroAddress,
        updateDelay: 0,
      },
      fees: {
        excess: {
          account: zeroAddress,
          annualTargetRateBps: 0,
          enabled: false,
          excessFeeRateBps: 0,
        },
        fixedFeeCount: 0,
      },
      transferPolicyId: 0n,
    })
  })

  test('validates deterministic ids and fee configuration', () => {
    const parameters = {
      deploymentId: Hex.fromNumber(1, { size: 32 }),
      engine: account.address,
      factory: accounts[1].address,
      owner: account.address,
    } as const

    expect(() =>
      Actions.earn.createStack.call({
        ...parameters,
        deploymentId: '0x01',
      }),
    ).toThrow('nonzero 32-byte hex')
    expect(() =>
      Actions.earn.createStack.call({
        ...parameters,
        fees: {
          fixedFees: [{ account: accounts[2].address, rateBps: 10_001 }],
        },
      }),
    ).toThrow('between 1 and 10,000')
    expect(() =>
      Actions.earn.createStack.call({
        ...parameters,
        fees: {
          fixedFees: [
            { account: accounts[2].address, rateBps: 6_000 },
            { account: accounts[3].address, rateBps: 5_000 },
          ],
        },
      }),
    ).toThrow('total fixed fee rate')
    expect(() =>
      Actions.earn.createStack.call({
        ...parameters,
        fees: {
          fixedFees: [
            { account: accounts[2].address, rateBps: 100 },
            { account: accounts[2].address, rateBps: 200 },
          ],
        },
      }),
    ).toThrow('must be unique')
    expect(() =>
      Actions.earn.createStack.call({
        ...parameters,
        distributor: {
          distributor: accounts[3].address,
          updateDelay: 86_400,
        },
      }),
    ).toThrow('requires at least one fixed fee')
    expect(() =>
      Actions.earn.createStack.call({
        ...parameters,
        distributor: {
          distributor: zeroAddress,
          updateDelay: 86_400,
        },
        fees: {
          fixedFees: [{ account: accounts[2].address, rateBps: 100 }],
        },
      }),
    ).toThrow('cannot be the zero address')
    expect(() =>
      Actions.earn.createStack.call({
        ...parameters,
        transferPolicyId: 1n << 64n,
      }),
    ).toThrow('fit into uint64')
  })

  test('encodes explicit controls, fees, and a distributor', () => {
    const call = Actions.earn.createStack.call({
      controls: {
        asyncJanitor: accounts[2].address,
        emergencyGuardian: accounts[3].address,
        maxManagedAssets: 1_000_000n,
        migrationMode: 'operatorEnabled',
      },
      deploymentId: Hex.fromNumber(4, { size: 32 }),
      distributor: { distributor: accounts[4].address, updateDelay: 86_400 },
      engine: account.address,
      factory: accounts[1].address,
      fees: {
        excess: {
          account: accounts[5].address,
          annualTargetRateBps: 500,
          rateBps: 1_000,
        },
        fixedFees: [{ account: accounts[6].address, rateBps: 100 }],
      },
      owner: account.address,
      transferPolicyId: 7n,
    })

    expect(call.args[0]).toMatchObject({
      controls: {
        asyncJanitor: accounts[2].address,
        emergencyGuardian: accounts[3].address,
        maxManagedAssets: 1_000_000n,
        migrationMode: 1,
      },
      distributorConfig: {
        distributor: accounts[4].address,
        updateDelay: 86_400,
      },
      fees: {
        excess: {
          account: accounts[5].address,
          annualTargetRateBps: 500,
          enabled: true,
          excessFeeRateBps: 1_000,
        },
        fixedFeeCount: 1,
        fixedFees: [
          { account: accounts[6].address, rateBps: 100 },
          { account: zeroAddress, rateBps: 0 },
          { account: zeroAddress, rateBps: 0 },
          { account: zeroAddress, rateBps: 0 },
        ],
      },
      transferPolicyId: 7n,
    })
  })
})

describe('ERC-4626 Earn deployment', { timeout: 60_000 }, () => {
  test('batches engine and stack creation while keeping binding separate', async () => {
    const { factories, venue } = await setup()
    const deploymentId = Hex.fromNumber(12, { size: 32 })
    const engineArgs = {
      deploymentId,
      factory: factories.erc4626Engine,
      owner: account.address,
      venue,
    } as const
    const engine = await Actions.earn.createErc4626Engine.predict(
      client,
      engineArgs,
    )
    const stackArgs = {
      deploymentId,
      engine,
      factory: factories.earn,
      owner: account.address,
    } as const

    const receipt = await sendTransactionSync(client, {
      calls: [
        Actions.earn.createErc4626Engine.call(engineArgs),
        Actions.earn.createStack.call(stackArgs),
      ],
    })
    const engineEvent = Actions.earn.createErc4626Engine.extractEvent(
      receipt.logs,
      { factory: factories.erc4626Engine },
    )
    const stackEvent = Actions.earn.createStack.extractEvent(receipt.logs, {
      factory: factories.earn,
    })
    expect(isAddressEqual(engineEvent.args.engine, engine)).toBe(true)
    expect(isAddressEqual(stackEvent.args.engine, engine)).toBe(true)

    const binding = await Actions.earn.bindEngineSync(client, {
      engine,
      finalOwner: accounts[1].address,
      vault: stackEvent.args.earnVault,
    })
    expect(binding.receipt.status).toBe('success')
    expect(
      isAddressEqual(
        await readContract(client, {
          abi: Abis.erc4626Engine,
          address: engine,
          functionName: 'owner',
        }),
        accounts[1].address,
      ),
    ).toBe(true)
  })

  test('deploys, resumes, binds, and reruns idempotently', async () => {
    const { factories, venue } = await setup()
    const inferredClient = getClient({
      account,
      chain: {
        ...client.chain,
        contracts: {
          earnFactory: { address: factories.earn },
          erc4626EngineFactory: { address: factories.erc4626Engine },
        },
      },
    })
    const deploymentId = Hex.fromNumber(2, { size: 32 })
    const predicted = await Actions.earn.createErc4626Engine.predict(client, {
      deploymentId,
      factory: factories.erc4626Engine,
      owner: account.address,
      venue,
    })
    const engine = await Actions.earn.createErc4626EngineSync(client, {
      deploymentId,
      factory: factories.erc4626Engine,
      venue,
    })
    expect(isAddressEqual(engine.engine, predicted)).toBe(true)

    const deployed = await Actions.earn.deployErc4626StackSync(inferredClient, {
      deploymentId,
      resume: { deploymentId, engine: predicted },
      venue,
    })
    expect(deployed.receipts.engine).toBeUndefined()
    expect(deployed.receipts.stack?.status).toBe('success')
    expect(deployed.receipts.binding?.status).toBe('success')
    if (deployed.receipts.stack?.status === 'pending')
      throw new Error('Expected submitted stack receipt.')

    const [boundVault, guardian, janitor, migrationMode] = await Promise.all([
      readContract(client, {
        abi: Abis.erc4626Engine,
        address: deployed.engine,
        functionName: 'earnVault',
      }),
      readContract(client, {
        abi: Abis.earnVault,
        address: deployed.vault,
        functionName: 'emergencyGuardian',
      }),
      readContract(client, {
        abi: Abis.earnVault,
        address: deployed.vault,
        functionName: 'asyncJanitor',
      }),
      readContract(client, {
        abi: Abis.earnVault,
        address: deployed.vault,
        functionName: 'engineMigrationMode',
      }),
    ])
    expect(isAddressEqual(boundVault, deployed.vault)).toBe(true)
    expect(guardian).toBe(zeroAddress)
    expect(janitor).toBe(zeroAddress)
    expect(migrationMode).toBe(0)
    const feeState = await Actions.earn.getFeeState(client, {
      vault: deployed.vault,
    })
    expect(feeState.feesActive).toBe(false)

    const rerun = await Actions.earn.deployErc4626StackSync(inferredClient, {
      deploymentId,
      fromBlock: deployed.receipts.stack
        ? deployed.receipts.stack.blockNumber + 1n
        : undefined,
      resume: deployed,
      venue,
    })
    expect(rerun.receipts).toEqual({})
    expect(rerun).toMatchObject({
      earnShare: deployed.earnShare,
      engine: deployed.engine,
      fees: deployed.fees,
      vault: deployed.vault,
    })
  })

  test('requires explicit factories when chain metadata is unavailable', async () => {
    const { venue } = await setup()
    const clientWithoutFactories = getClient({
      account,
      chain: { ...client.chain, contracts: {} },
    })

    await expect(
      Actions.earn.deployErc4626StackSync(clientWithoutFactories, {
        deploymentId: Hex.fromNumber(13, { size: 32 }),
        venue,
      }),
    ).rejects.toThrow('does not support contract "earnFactory"')
  })

  test('uses a separate final owner for binding', async () => {
    const { factories, venue } = await setup()
    const owner = accounts[1]
    const fees = {
      fixedFees: [{ account: accounts[2].address, rateBps: 100 }],
    } as const
    await setupFeeToken(client, { account: owner })
    const deployed = await Actions.earn.deployErc4626StackSync(client, {
      bindingAccount: owner,
      deploymentId: Hex.fromNumber(3, { size: 32 }),
      factories,
      fees,
      owner,
      venue,
    })
    if (deployed.receipts.stack?.status === 'pending')
      throw new Error('Expected submitted stack receipt.')

    const engineOwner = await readContract(client, {
      abi: Abis.erc4626Engine,
      address: deployed.engine,
      functionName: 'owner',
    })
    expect(isAddressEqual(engineOwner, owner.address)).toBe(true)
    const feeState = await Actions.earn.getFeeState(client, {
      vault: deployed.vault,
    })
    expect(feeState.feesActive).toBe(true)
    expect(feeState.config.fixedFees).toEqual([
      { account: accounts[2].address, rateBps: 100 },
    ])

    const rerun = await Actions.earn.deployErc4626StackSync(client, {
      deploymentId: deployed.deploymentId,
      factories,
      fees,
      fromBlock: deployed.receipts.stack?.blockNumber,
      owner: owner.address,
      resume: deployed,
      venue,
    })
    expect(rerun.receipts).toEqual({})
  })

  test('returns receipts and resumes after a partial failure', async () => {
    const { factories, venue } = await setup()
    const deploymentId = Hex.fromNumber(7, { size: 32 })
    let failure: Actions.earn.DeployErc4626StackError | undefined

    try {
      await Actions.earn.deployErc4626StackSync(client, {
        deploymentId,
        distributor: {
          distributor: accounts[3].address,
          updateDelay: 86_400,
        },
        factories,
        venue,
      })
    } catch (error) {
      if (!(error instanceof Actions.earn.DeployErc4626StackError)) throw error
      failure = error
    }

    expect(failure?.stage).toBe('stack')
    expect(failure?.receipts.engine?.status).toBe('success')
    expect(failure?.receipts.stack).toBeUndefined()
    expect(failure?.state).toMatchObject({ deploymentId })
    if (!failure) throw new Error('Expected deployment to fail.')

    const resumed = await Actions.earn.deployErc4626StackSync(client, {
      deploymentId,
      factories,
      resume: failure.state,
      venue,
    })
    expect(resumed.receipts.engine).toBeUndefined()
    expect(resumed.receipts.stack?.status).toBe('success')
    expect(resumed.receipts.binding?.status).toBe('success')
  })

  test('returns completed receipts when final-owner binding fails', async () => {
    const { factories, venue } = await setup()
    const deploymentId = Hex.fromNumber(11, { size: 32 })
    const owner = getAddress(Hex.random(20))
    let failure: Actions.earn.DeployErc4626StackError | undefined

    try {
      await Actions.earn.deployErc4626StackSync(client, {
        bindingAccount: owner,
        deploymentId,
        factories,
        owner,
        venue,
      })
    } catch (error) {
      if (!(error instanceof Actions.earn.DeployErc4626StackError)) throw error
      failure = error
    }

    expect(failure?.stage).toBe('binding')
    expect(failure?.receipts.engine?.status).toBe('success')
    expect(failure?.receipts.stack?.status).toBe('success')
    expect(failure?.receipts.binding).toBeUndefined()
    expect(failure?.state).toMatchObject({ deploymentId })
    if (!failure?.state.engine)
      throw new Error('Expected an engine after deployment failure.')
    const boundVault = await readContract(client, {
      abi: Abis.erc4626Engine,
      address: failure.state.engine,
      functionName: 'earnVault',
    })
    expect(boundVault).toBe(zeroAddress)
  })

  test('rejects mismatched resume state before deployment', async () => {
    const { factories, venue } = await setup()
    await expect(
      Actions.earn.deployErc4626StackSync(client, {
        deploymentId: Hex.fromNumber(5, { size: 32 }),
        factories,
        resume: {
          deploymentId: Hex.fromNumber(6, { size: 32 }),
          engine: account.address,
        },
        venue,
      }),
    ).rejects.toThrow('resumed deployment ID')
  })

  test('rejects factories without code or with an unexpected TIP-20 factory', async () => {
    const { factories, venue } = await setup()
    const deploymentId = Hex.fromNumber(8, { size: 32 })
    await expect(
      Actions.earn.deployErc4626StackSync(client, {
        deploymentId,
        factories: { ...factories, earn: accounts[10].address },
        venue,
      }),
    ).rejects.toThrow('EarnFactory has no code')

    const [earnVaultImplementation, earnFeesImplementation] = await Promise.all(
      [
        readContract(client, {
          abi: Abis.earnFactory,
          address: factories.earn,
          functionName: 'earnVaultImplementation',
        }),
        readContract(client, {
          abi: Abis.earnFactory,
          address: factories.earn,
          functionName: 'earnFeesImplementation',
        }),
      ],
    )
    const receipt = await sendTransactionSync(client, {
      data: encodeDeployData({
        abi: earnFactory.abi,
        args: [
          accounts[10].address,
          earnVaultImplementation,
          earnFeesImplementation,
        ],
        bytecode: earnFactory.bytecode,
      }),
    })
    if (!receipt.contractAddress)
      throw new Error('contract creation returned no address.')

    await expect(
      Actions.earn.deployErc4626StackSync(client, {
        deploymentId,
        factories: { ...factories, earn: receipt.contractAddress },
        venue,
      }),
    ).rejects.toThrow('unexpected TIP-20 factory')
  })

  test('rejects recovered addresses that do not match the deployment', async () => {
    const { factories, venue } = await setup()
    const deploymentId = Hex.fromNumber(9, { size: 32 })
    const deployed = await Actions.earn.deployErc4626StackSync(client, {
      deploymentId,
      factories,
      venue,
    })
    if (deployed.receipts.stack?.status === 'pending')
      throw new Error('Expected submitted stack receipt.')

    await expect(
      Actions.earn.deployErc4626StackSync(client, {
        deploymentId,
        factories,
        fromBlock: deployed.receipts.stack?.blockNumber,
        resume: { ...deployed, vault: venue },
        venue,
      }),
    ).rejects.toMatchObject({
      stage: 'stack',
      state: {
        deploymentId,
        earnShare: deployed.earnShare,
        engine: deployed.engine,
        fees: deployed.fees,
        vault: venue,
      },
    })
  })

  test('reports an engine bound to a different vault', async () => {
    const { factories, venue } = await setup()
    const deploymentId = Hex.fromNumber(10, { size: 32 })
    const engine = await Actions.earn.createErc4626EngineSync(client, {
      deploymentId,
      factory: factories.erc4626Engine,
      venue,
    })
    const stack = await Actions.earn.createStackSync(client, {
      deploymentId,
      engine: engine.engine,
      factory: factories.earn,
    })
    if (stack.receipt.status === 'pending')
      throw new Error('Expected submitted stack receipt.')
    await writeContractSync(client, {
      abi: Abis.erc4626Engine,
      address: engine.engine,
      args: [venue],
      functionName: 'initializeEarnVault',
    })

    await expect(
      Actions.earn.deployErc4626StackSync(client, {
        deploymentId,
        factories,
        fromBlock: stack.receipt.blockNumber,
        resume: {
          deploymentId,
          earnShare: stack.earnShare,
          engine: engine.engine,
          fees: stack.earnFees,
          vault: stack.earnVault,
        },
        venue,
      }),
    ).rejects.toMatchObject({
      stage: 'binding',
      state: {
        deploymentId,
        earnShare: stack.earnShare,
        engine: engine.engine,
        fees: stack.earnFees,
        vault: stack.earnVault,
      },
    })
  })
})
