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
import * as TempoActions from '../../../src/tempo/actions/index.js'
import type { Account } from '../../../src/tempo/index.js'
import { accounts, addresses, setupToken } from './config.js'
import * as EarnContracts from './earnContracts.js'

/**
 * Deploys a full local Earn stack from the vendored artifacts, mirroring
 * `earn/localnet/foundry/script/DeployLocalEarn.s.sol`: `Simple4626Vault`
 * venue -> `ERC4626Engine` -> `EarnVault` and `EarnFees` implementations ->
 * `EarnFactory` -> `factory.deploy` -> `engine.initializeEarnVault`. Deploys are sequential
 * so each fixture contract address can be recovered independently.
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
          maxManagedAssets: 0n,
          // `EngineMigrationMode`: 0 = UserOnly, 1 = OperatorEnabled.
          migrationMode: controls.migrationMode === 'userOnly' ? 0 : 1,
        },
        deploymentId,
        distributorConfig: {
          distributor: zeroAddress,
          updateDelay: 0,
        },
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
        }
      | undefined
    /** Share-token namespace id. @default random */
    deploymentId?: Hex.Hex | undefined
    /** `FeeInit` passed to `factory.deploy`. @default inert (caps set, no config) */
    fees?: FeeInit | undefined
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

/** Deploys the reviewed Earn factories and an ERC-4626 venue for deployment tests. */
export async function deployEarnFactories(
  client: Client<Transport, Chain, viem_Account>,
  options: deployEarnFactories.Options = {},
): Promise<deployEarnFactories.ReturnValue> {
  const asset = options.asset ?? addresses.alphaUsd
  const venue = await deployContract(client, {
    abi: EarnContracts.simple4626Vault.abi,
    args: [asset, 'Tempo Earn Test Vault', 'teTEST', 6],
    bytecode: EarnContracts.simple4626Vault.bytecode,
  })
  const earnVaultImplementation = await deployContract(client, {
    abi: EarnContracts.earnVault.abi,
    bytecode: EarnContracts.earnVault.bytecode,
  })
  const earnFeesImplementation = await deployContract(client, {
    abi: EarnContracts.earnFees.abi,
    bytecode: EarnContracts.earnFees.bytecode,
  })
  const earnFactory = await deployContract(client, {
    abi: EarnContracts.earnFactory.abi,
    args: [
      Addresses.tip20Factory,
      earnVaultImplementation,
      earnFeesImplementation,
    ],
    bytecode: EarnContracts.earnFactory.bytecode,
  })
  const erc4626EngineFactory = await deployContract(client, {
    abi: EarnContracts.erc4626EngineFactory.abi,
    bytecode: EarnContracts.erc4626EngineFactory.bytecode,
  })
  return {
    asset,
    factories: {
      earn: earnFactory,
      erc4626Engine: erc4626EngineFactory,
    },
    venue,
  }
}

export declare namespace deployEarnFactories {
  export type Options = {
    /** Venue base asset. @default `addresses.alphaUsd` */
    asset?: Address | undefined
  }

  export type ReturnValue = {
    asset: Address
    factories: {
      earn: Address
      erc4626Engine: Address
    }
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
  const tokenAuthority =
    options.tokenAuthority ??
    (await deployDemoTokenAuthority(client, {
      privateAsset: options.privateAsset,
      vaultAsset: asset,
    }))

  const gateway = await deployContract(client, {
    abi: EarnContracts.earnRouter.abi,
    args: [options.zoneId, adapter, options.privateAsset, tokenAuthority],
    bytecode: EarnContracts.earnRouter.bytecode,
  })
  if (!options.tokenAuthority) {
    const role = await readContract(client, {
      abi: EarnContracts.demoTokenAuthority.abi,
      address: tokenAuthority,
      functionName: 'UNWRAPPER_ROLE',
    })
    await writeContractSync(client, {
      abi: EarnContracts.demoTokenAuthority.abi,
      address: tokenAuthority,
      args: [role, gateway],
      functionName: 'grantRole',
    })
  }
  for (const token of [options.privateAsset, shareToken]) {
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
    /** Token authority for the private and vault asset pair. A demo authority is deployed by default. */
    tokenAuthority?: Address | undefined
    /** Only Zone accepted by the router. */
    zoneId: number
    /** Zone portal on the parent chain. */
    zonePortal: Address
  }

  export type ReturnValue = {
    /** Deployed Zone-only Earn gateway. */
    gateway: Address
  }
}

async function deployDemoTokenAuthority(
  client: Client<Transport, Chain, viem_Account>,
  parameters: { privateAsset: Address; vaultAsset: Address },
) {
  const { token: reserveToken } = await setupToken(client, {
    name: 'Earn Test Reserve',
    symbol: 'etRESERVE',
  })
  const authority = await deployContract(client, {
    abi: EarnContracts.demoTokenAuthority.abi,
    args: [reserveToken, client.account.address],
    bytecode: EarnContracts.demoTokenAuthority.bytecode,
  })
  for (const token of [
    reserveToken,
    parameters.privateAsset,
    parameters.vaultAsset,
  ])
    await TempoActions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: authority,
      token,
    })

  const bridgeRole = await readContract(client, {
    abi: EarnContracts.demoTokenAuthority.abi,
    address: authority,
    functionName: 'BRIDGE_ECOSYSTEM_CONTRACT_ROLE',
  })
  await writeContractSync(client, {
    abi: EarnContracts.demoTokenAuthority.abi,
    address: authority,
    args: [bridgeRole, client.account.address],
    functionName: 'grantRole',
  })
  for (const token of [parameters.privateAsset, parameters.vaultAsset]) {
    await writeContractSync(client, {
      abi: EarnContracts.demoTokenAuthority.abi,
      address: authority,
      args: [token, 1_000_000_000_000n],
      functionName: 'setTxnMintLimit',
    })
    await writeContractSync(client, {
      abi: EarnContracts.demoTokenAuthority.abi,
      address: authority,
      args: [token, client.account.address, 1_000_000_000_000n],
      functionName: 'mintBridgeEcosystem',
    })
  }
  return authority
}

/** `FeeConfig` shape for `factory.deploy`. */
export type FeeInit = {
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

// The empty config keeps fees inactive.
const inertFees: FeeInit = {
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
