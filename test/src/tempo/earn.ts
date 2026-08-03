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
 * venue -> `ERC4626Engine` -> `EarnVault` and `EarnFees` implementations ->
 * `EarnFactory` -> `factory.deploy` -> `engine.initializeEarnVault`. Deploys are sequential
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

  const receipt = await writeContractSync(client, {
    abi: Abis.earnFactory,
    address: factory,
    args: [
      {
        controls: {
          asyncJanitor: seats.asyncJanitor.address,
          emergencyGuardian: seats.emergencyGuardian.address,
          maxManagedAssets: controls.maxManagedAssets ?? 0n,
          // `EngineMigrationMode`: 0 = UserOnly, 1 = OperatorEnabled.
          migrationMode: controls.migrationMode === 'userOnly' ? 0 : 1,
        },
        deploymentId,
        engine,
        fees,
        owner: operator.address,
        transferPolicyId: 0n,
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
  const {
    earnFees: feesAddress,
    earnShare: shareToken,
    earnVault: adapter,
  } = deployed.args

  await writeContractSync(client, {
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
    factory,
    fees: feesAddress,
    seats: { ...seats, operator },
    shareToken,
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
          /** Initial active managed-assets limit. @default unlimited */
          maxManagedAssets?: bigint | undefined
        }
      | undefined
    /** Share-token namespace id. @default random */
    deploymentId?: Hex.Hex | undefined
    /** `FeeConfig` passed to `factory.deploy`. @default no fees */
    fees?: FeeConfig | undefined
  }

  export type ReturnValue = {
    /** Deployed `EarnVault` proxy. */
    adapter: Address
    /** Venue base asset. */
    asset: Address
    /** Injects venue yield via `Simple4626Vault.donate`. */
    donate: (assets: bigint) => Promise<void>
    /** Deployed `ERC4626Engine`. */
    engine: Address
    /** Deployed `EarnFactory`. */
    factory: Address
    /** Deployed `EarnFees` clone. */
    fees: Address
    /** Seat accounts wired into the deployment. */
    seats: Seats
    /** TIP-20 share token issued by the vault. */
    shareToken: Address
    /** Deployed `Simple4626Vault` venue. */
    venue: Address
  }
}

/**
 * Deploys a Zone-only Earn gateway and enables the stack's tokens in the Zone.
 */
export async function deployEarnGateway(
  client: Client<Transport, Chain, viem_Account>,
  options: deployEarnGateway.Options,
): Promise<deployEarnGateway.ReturnValue> {
  const { adapter, portalClient } = options
  const portal = options.zonePortal

  const gateway = await deployContract(client, {
    abi: EarnContracts.earnRouter.abi,
    args: [
      options.zoneId,
      adapter,
      options.privateAsset,
      options.tokenAuthority,
    ],
    bytecode: EarnContracts.earnRouter.bytecode,
  })

  const [asset, shareToken] = await Promise.all([
    readContract(client, {
      abi: Abis.earnVault,
      address: adapter,
      functionName: 'asset',
    }),
    readContract(client, {
      abi: Abis.earnVault,
      address: adapter,
      functionName: 'earnShare',
    }),
  ])
  for (const token of [asset, shareToken]) {
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

  return { gateway }
}

export declare namespace deployEarnGateway {
  export type Options = {
    /** `EarnVault` whose tokens are enabled in the Zone. */
    adapter: Address
    /** Private stablecoin accepted by the router. */
    privateAsset: Address
    /** Portal administrator client. */
    portalClient: Client<Transport, Chain, viem_Account>
    /** Existing TokenAuthority for the private and vault asset pair. */
    tokenAuthority: Address
    /** Immutable source Zone ID. */
    zoneId: number
    /** Zone portal on the parent chain. */
    zonePortal: Address
  }

  export type ReturnValue = {
    /** Deployed Zone-only Earn gateway. */
    gateway: Address
  }
}

/** Earn fee configuration passed to `factory.deploy`. */
export type FeeConfig = {
  excess: {
    account: Address
    annualTargetRateBps: number
    enabled: boolean
    excessFeeRateBps: number
  }
  fixedFeeCount: number
  fixedFees: readonly [FixedFee, FixedFee, FixedFee, FixedFee]
}

type FixedFee = { account: Address; rateBps: number }

type Seats = {
  /** Cancel-to-stored-receiver liveness seat. */
  asyncJanitor: Account.RootAccount
  /** Pause-only emergency seat. */
  emergencyGuardian: Account.RootAccount
  /** Adapter governance seat (the deployer). */
  operator: viem_Account
}

/** Seat accounts wired into every harness deployment. Indices are dedicated to earn; other suites use `accounts[19]` as the validator. */
export const seats = {
  asyncJanitor: accounts[16],
  emergencyGuardian: accounts[17],
} as const

const zeroAddress = '0x0000000000000000000000000000000000000000' as const

const zeroFixedFee = { account: zeroAddress, rateBps: 0 } as const

const inertFees: FeeConfig = {
  excess: {
    account: zeroAddress,
    annualTargetRateBps: 0,
    enabled: false,
    excessFeeRateBps: 0,
  },
  fixedFeeCount: 0,
  fixedFees: [zeroFixedFee, zeroFixedFee, zeroFixedFee, zeroFixedFee],
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
