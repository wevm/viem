import { AbiEvent, Hex } from 'ox'
import type { Abi, Address } from 'ox'
import { Actions } from 'viem'
import type { Account } from 'viem'
import { Account as TempoAccount, Abis, Addresses } from 'viem/tempo'

import * as tempo from '../tempo.js'
import * as EarnContracts from './earnContracts.js'

type EarnClient = ReturnType<typeof tempo.getClient>

/**
 * Deploys a full local Earn stack from the vendored artifacts, mirroring
 * `earn/localnet/foundry/script/DeployLocalEarn.s.sol`: `Simple4626Vault`
 * venue -> `ERC4626Engine` -> `EarnVault` and `EarnFees` implementations ->
 * `EarnFactory` -> `factory.deploy` -> `engine.initializeEarnVault`. Deploys are sequential
 * since Tempo allows one contract creation per transaction.
 */
export async function deployEarnStack(
  client: EarnClient,
  options: deployEarnStack.Options = {},
): Promise<deployEarnStack.ReturnType> {
  const {
    asset = tempo.alphaUsd,
    controls = {},
    deploymentId = Hex.random(32),
    fees = inertFees,
  } = options

  const operator = client.account

  const venue = await deployContract(client, {
    abi: EarnContracts.simple4626Vault.abi,
    args: [asset, 'Tempo Earn Test Vault', 'teTEST', 6],
    bytecode: EarnContracts.simple4626Vault.bytecode,
  })
  const engine = await deployContract(client, {
    abi: EarnContracts.erc4626Engine.abi,
    args: [venue, operator.address, '', ''],
    bytecode: EarnContracts.erc4626Engine.bytecode,
  })
  const implementation = await deployContract(client, {
    abi: EarnContracts.earnVault.abi,
    bytecode: EarnContracts.earnVault.bytecode,
  })
  const feeImplementation = await deployContract(client, {
    abi: EarnContracts.earnFees.abi,
    bytecode: EarnContracts.earnFees.bytecode,
  })
  const factory = await deployContract(client, {
    abi: EarnContracts.earnFactory.abi,
    args: [Addresses.tip20Factory, implementation, feeImplementation],
    bytecode: EarnContracts.earnFactory.bytecode,
  })

  const receipt = await Actions.contract.writeSync(client, {
    abi: Abis.earnFactory,
    address: factory,
    args: [
      {
        controls: {
          asyncJanitor: seats.asyncJanitor.address,
          emergencyGuardian: seats.emergencyGuardian.address,
          // `EngineMigrationMode`: 0 = UserOnly, 1 = OperatorEnabled.
          migrationMode: controls.migrationMode === 'userOnly' ? 0 : 1,
        },
        deploymentId,
        engine,
        fees,
        owner: operator.address,
      },
    ],
    functionName: 'deploy',
  })
  const [deployed] = AbiEvent.extractLogs(Abis.earnFactory, receipt.logs, {
    eventName: 'EarnStackDeployed',
    strict: true,
  })
  if (!deployed) throw new Error('`EarnStackDeployed` event not found.')
  const {
    earnFees: feesAddress,
    earnShare: shareToken,
    earnVault: adapter,
  } = deployed.args

  await Actions.contract.writeSync(client, {
    abi: Abis.erc4626Engine,
    address: engine,
    args: [adapter],
    functionName: 'initializeEarnVault',
  })

  return {
    adapter,
    asset,
    // Demo-only yield injection: adds venue assets without minting shares.
    async donate(assets: bigint) {
      await Actions.contract.writeSync(client, {
        abi: Abis.tip20,
        address: asset,
        args: [venue, assets],
        functionName: 'approve',
      })
      await Actions.contract.writeSync(client, {
        abi: EarnContracts.simple4626Vault.abi,
        address: venue,
        args: [assets],
        functionName: 'donate',
      })
    },
    engine,
    factory,
    fees: feesAddress,
    seats: { ...seats, operator },
    shareToken,
    venue,
  }
}

export declare namespace deployEarnStack {
  export type Options = {
    /** Venue base asset (TIP-20). @default `tempo.alphaUsd` */
    asset?: Address.Address | undefined
    /** Control seat configuration. */
    controls?:
      | {
          /** Engine migration policy. @default `'operatorEnabled'` */
          migrationMode?: 'operatorEnabled' | 'userOnly' | undefined
        }
      | undefined
    /** Share-token namespace id. @default random */
    deploymentId?: Hex.Hex | undefined
    /** `FeeInit` passed to `factory.deploy`. @default inert (caps set, no config) */
    fees?: FeeInit | undefined
  }

  export type ReturnType = {
    /** Deployed `EarnVault` proxy. */
    adapter: Address.Address
    /** Venue base asset. */
    asset: Address.Address
    /** Injects venue yield via `Simple4626Vault.donate`. */
    donate: (assets: bigint) => Promise<void>
    /** Deployed `ERC4626Engine`. */
    engine: Address.Address
    /** Deployed `EarnFactory`. */
    factory: Address.Address
    /** Deployed `EarnFees` clone. */
    fees: Address.Address
    /** Seat accounts wired into the deployment. */
    seats: Seats
    /** TIP-20 share token issued by the vault. */
    shareToken: Address.Address
    /** Deployed `Simple4626Vault` venue. */
    venue: Address.Address
  }
}

/**
 * Deploys a Zone-only Earn gateway and enables the stack's tokens in the Zone.
 */
export async function deployEarnGateway(
  client: EarnClient,
  options: deployEarnGateway.Options,
): Promise<deployEarnGateway.ReturnType> {
  const { adapter, portalClient } = options
  const portal = options.zonePortal

  const gateway = await deployContract(client, {
    abi: EarnContracts.earnRouter.abi,
    bytecode: EarnContracts.earnRouter.bytecode,
  })

  const [asset, shareToken] = await Promise.all([
    Actions.contract.read(client, {
      abi: Abis.earnVault,
      address: adapter,
      functionName: 'asset',
    }),
    Actions.contract.read(client, {
      abi: Abis.earnVault,
      address: adapter,
      functionName: 'earnShare',
    }),
  ])
  for (const token of [asset, shareToken]) {
    const enabled = await Actions.contract.read(client, {
      abi: portalAbi,
      address: portal,
      args: [token],
      functionName: 'isTokenEnabled',
    })
    if (!enabled)
      await Actions.contract.writeSync(portalClient, {
        abi: portalAbi,
        address: portal,
        args: [token],
        functionName: 'enableToken',
        // The Zone sequencer shares this signer, so portal writes use expiring nonces.
        nonceKey: 'expiring',
      })
  }

  return { gateway }
}

export declare namespace deployEarnGateway {
  export type Options = {
    /** `EarnVault` whose tokens are enabled in the Zone. */
    adapter: Address.Address
    /** Portal administrator client. */
    portalClient: EarnClient
    /** Zone portal on the parent chain. */
    zonePortal: Address.Address
  }

  export type ReturnType = {
    /** Deployed Zone-only Earn gateway. */
    gateway: Address.Address
  }
}

/** `EarnFeesInit` shape for `factory.deploy`. */
export type FeeInit = {
  administrator: Address.Address
  excessFeeCap: bigint
  fixedFeeCap: bigint
  guardian: Address.Address
  initialConfig: {
    excess: {
      account: Address.Address
      annualTargetRate: bigint
      enabled: boolean
      excessFeeRate: bigint
    }
    fixedFeeCount: number
    fixedFees: readonly [FixedFee, FixedFee, FixedFee, FixedFee]
  }
}

type FixedFee = { account: Address.Address; rate: bigint }

type Seats = {
  /** Cancel-to-stored-receiver liveness seat. */
  asyncJanitor: TempoAccount.RootAccount
  /** Pause-only emergency seat. */
  emergencyGuardian: TempoAccount.RootAccount
  /** Fee configuration administrator. */
  feeAdministrator: TempoAccount.RootAccount
  /** Fee emergency-disable seat. */
  feeGuardian: TempoAccount.RootAccount
  /** Adapter governance seat (the deployer). */
  operator: Account.Account
}

/** Seat accounts wired into every harness deployment. Indices are dedicated to earn; other suites use `accounts[19]` as the validator. */
export const seats = {
  asyncJanitor: TempoAccount.fromSecp256k1(tempo.accounts[16].privateKey),
  emergencyGuardian: TempoAccount.fromSecp256k1(tempo.accounts[17].privateKey),
  feeAdministrator: TempoAccount.fromSecp256k1(tempo.accounts[18].privateKey),
  feeGuardian: TempoAccount.fromSecp256k1(tempo.accounts[20].privateKey),
} as const

const zeroAddress = '0x0000000000000000000000000000000000000000' as const

const zeroFixedFee = { account: zeroAddress, rate: 0n } as const

// Caps allow later `setFeeConfig` tests; the empty config keeps fees inactive.
const inertFees: FeeInit = {
  administrator: seats.feeAdministrator.address,
  excessFeeCap: 1_000_000_000_000_000_000n,
  fixedFeeCap: 100_000_000_000_000_000n,
  guardian: seats.feeGuardian.address,
  initialConfig: {
    excess: {
      account: zeroAddress,
      annualTargetRate: 0n,
      enabled: false,
      excessFeeRate: 0n,
    },
    fixedFeeCount: 0,
    fixedFees: [zeroFixedFee, zeroFixedFee, zeroFixedFee, zeroFixedFee],
  },
}

// Local portal token enablement.
const portalAbi = [
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'enableToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'isTokenEnabled',
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// One top-level CREATE per Tempo transaction; the receipt carries the address.
async function deployContract<const abi extends Abi.Abi | readonly unknown[]>(
  client: EarnClient,
  options: Actions.contract.deploySync.Options<abi, EarnClient['chain']>,
) {
  const { contractAddress } = await Actions.contract.deploySync<
    EarnClient['chain'],
    abi
  >(client, options)
  if (!contractAddress)
    throw new Error('contract creation returned no address.')
  return contractAddress
}
