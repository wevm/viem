import { Hex } from 'ox'
import {
  readContract,
  sendTransactionSync,
  writeContractSync,
} from '../../../src/actions/index.js'
import {
  type Abi,
  type Address,
  type Chain,
  type Client,
  type EncodeDeployDataParameters,
  encodeDeployData,
  encodeFunctionData,
  parseEventLogs,
  type Transport,
  type Account as viem_Account,
} from '../../../src/index.js'
import * as Abis from '../../../src/tempo/Abis.js'
import * as Addresses from '../../../src/tempo/Addresses.js'
import type { Account } from '../../../src/tempo/index.js'
import { accounts, addresses } from './config.js'
import * as EarnContracts from './earnContracts.js'

/**
 * Deploys a full local Earn stack from the vendored artifacts, mirroring
 * `earn/localnet/foundry/script/DeployLocalEarn.s.sol`: `Simple4626Vault`
 * venue -> `ERC4626Engine` -> `VaultAdapter` implementation -> `EarnFactory`
 * -> `factory.deploy` -> `engine.initializeAdapter`. Deploys are sequential
 * since Tempo allows one contract creation per transaction.
 */
export async function deployEarnStack(
  client: Client<Transport, Chain, viem_Account>,
  options: deployEarnStack.Options = {},
): Promise<deployEarnStack.ReturnValue> {
  const {
    asset = addresses.alphaUsd,
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
    abi: EarnContracts.vaultAdapter.abi,
    bytecode: EarnContracts.vaultAdapter.bytecode,
  })
  const earnFeesImplementation = await deployContract(client, {
    abi: EarnContracts.earnFees.abi,
    bytecode: EarnContracts.earnFees.bytecode,
  })
  const factory = await deployContract(client, {
    abi: EarnContracts.earnFactory.abi,
    args: [Addresses.tip20Factory, implementation, earnFeesImplementation],
    bytecode: EarnContracts.earnFactory.bytecode,
  })

  const receipt = await writeContractSync(client, {
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
  const [deployed] = parseEventLogs({
    abi: Abis.earnFactory,
    eventName: 'EarnStackDeployed',
    logs: receipt.logs,
  })
  if (!deployed) throw new Error('`EarnStackDeployed` event not found.')
  const { earnFees, earnToken, vaultAdapter: adapter } = deployed.args

  await writeContractSync(client, {
    abi: Abis.erc4626Engine,
    address: engine,
    args: [adapter],
    functionName: 'initializeAdapter',
  })

  return {
    adapter,
    asset,
    // Demo-only yield injection: adds venue assets without minting shares.
    async donate(assets: bigint) {
      await writeContractSync(client, {
        abi: Abis.tip20,
        address: asset,
        args: [venue, assets],
        functionName: 'approve',
      })
      await writeContractSync(client, {
        abi: EarnContracts.simple4626Vault.abi,
        address: venue,
        args: [assets],
        functionName: 'donate',
      })
    },
    engine,
    earnFees,
    factory,
    seats: { ...seats, operator },
    earnToken,
    venue,
  }
}

export declare namespace deployEarnStack {
  export type Options = {
    /** Venue base asset (TIP-20). @default `addresses.alphaUsd` */
    asset?: Address | undefined
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

  export type ReturnValue = {
    /** Deployed `VaultAdapter` proxy. */
    adapter: Address
    /** Venue base asset. */
    asset: Address
    /** Injects venue yield via `Simple4626Vault.donate`. */
    donate: (assets: bigint) => Promise<void>
    /** Deployed `ERC4626Engine`. */
    engine: Address
    /** Ownerless one-to-one fee accounting and custody module. */
    earnFees: Address
    /** Deployed `EarnFactory`. */
    factory: Address
    /** Seat accounts wired into the deployment. */
    seats: Seats
    /** EarnToken (TIP-20) issued by the adapter. */
    earnToken: Address
    /** Deployed `Simple4626Vault` venue. */
    venue: Address
  }
}

/**
 * Deploys a `EarnRouter` against the given zone portal and Zone-enables the
 * stack's asset and EarnToken (localnet precedent: both legs must be
 * Zone-enabled).
 */
export async function deployEarnRouter(
  client: Client<Transport, Chain, viem_Account>,
  options: deployEarnRouter.Options,
): Promise<deployEarnRouter.ReturnValue> {
  const { adapter, portalClient } = options
  const portal = options.zonePortal

  const earnRouter = await deployContract(client, {
    abi: EarnContracts.earnRouter.abi,
    bytecode: EarnContracts.earnRouter.bytecode,
  })

  const [asset, earnToken] = await Promise.all([
    readContract(client, {
      abi: Abis.vaultAdapter,
      address: adapter,
      functionName: 'asset',
    }),
    readContract(client, {
      abi: Abis.vaultAdapter,
      address: adapter,
      functionName: 'earnToken',
    }),
  ])
  for (const token of [asset, earnToken]) {
    const enabled = await readContract(client, {
      abi: portalAbi,
      address: portal,
      args: [token],
      functionName: 'isTokenEnabled',
    })
    if (!enabled)
      await sendTransactionSync(portalClient, {
        data: encodeFunctionData({
          abi: portalAbi,
          args: [token],
          functionName: 'enableToken',
        }),
        // The Zone sequencer shares this signer, so portal writes use expiring nonces.
        nonceKey: 'expiring',
        to: portal,
      })
  }

  return { earnRouter }
}

export declare namespace deployEarnRouter {
  export type Options = {
    /** `VaultAdapter` whose tokens should be enabled in the test Zone. */
    adapter: Address
    /** Portal administrator client. */
    portalClient: Client<Transport, Chain, viem_Account>
    /** Zone portal on the parent chain. */
    zonePortal: Address
  }

  export type ReturnValue = {
    /** Deployed `EarnRouter`. */
    earnRouter: Address
  }
}

/** `IVaultFees.FeeInit` shape for `factory.deploy`. */
export type FeeInit = {
  administrator: Address
  excessFeeCap: bigint
  fixedFeeCap: bigint
  guardian: Address
  initialConfig: {
    excess: {
      account: Address
      annualTargetRate: bigint
      enabled: boolean
      excessFeeRate: bigint
    }
    fixedFeeCount: number
    fixedFees: readonly [FixedFee, FixedFee, FixedFee, FixedFee]
  }
}

type FixedFee = { account: Address; rate: bigint }

type Seats = {
  /** Cancel-to-stored-receiver liveness seat. */
  asyncJanitor: Account.RootAccount
  /** Pause-only emergency seat. */
  emergencyGuardian: Account.RootAccount
  /** Fee configuration administrator. */
  feeAdministrator: Account.RootAccount
  /** Fee emergency-disable seat. */
  feeGuardian: Account.RootAccount
  /** Adapter governance seat (the deployer). */
  operator: viem_Account
}

/** Seat accounts wired into every harness deployment. Indices are dedicated to earn; other suites use `accounts[19]` as the validator. */
export const seats = {
  asyncJanitor: accounts[16],
  emergencyGuardian: accounts[17],
  feeAdministrator: accounts[18],
  feeGuardian: accounts[20],
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

// Local portal token enablement (`ILocalZonePortal` in earn/localnet).
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
async function deployContract<const abi extends Abi | readonly unknown[]>(
  client: Client<Transport, Chain, viem_Account>,
  parameters: EncodeDeployDataParameters<abi>,
) {
  const { abi, args, bytecode } = parameters as EncodeDeployDataParameters
  const receipt = await sendTransactionSync(client, {
    data: encodeDeployData({ abi, args, bytecode }),
  })
  if (!receipt.contractAddress)
    throw new Error('contract creation returned no address.')
  return receipt.contractAddress
}
