import type { TypedDataDomain } from 'abitype'
import type { TypedDataParameter } from 'abitype'
import type { TypedData } from 'abitype'
import {
  type AbiParameter,
  type Address,
  type Hex,
  type PublicClient,
  type SignableMessage,
  type TypedDataDefinition,
  type UnionPartialBy,
  concat,
  concatHex,
  domainSeparator,
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  keccak256,
  parseAbi,
  parseAbiParameters,
  toBytes,
  toHex,
  validateTypedData,
} from 'viem'
import {
  type SmartAccount,
  type SmartAccountImplementation,
  type UserOperation,
  entryPoint07Address,
  getUserOperationHash,
  toSmartAccount,
} from 'viem/account-abstraction'
import type { LocalAccount } from '../../../accounts/types.js'
import {
  getCode,
  readContract,
  simulateContract,
} from '../../../actions/index.js'
import type { Client } from '../../../clients/createClient.js'
import type { Assign, Prettify } from '../../../types/utils.js'
import { entryPoint07Abi } from '../../constants/abis.js'
/**
 * Parameters for creating a Nexus Smart Account
 */
export type ToNexusSmartAccountParameters = {
  client: Client
  /** The blockchain network */
  //   chain: Chain
  /** The transport configuration */
  //   transport: ClientConfig["transport"]
  /** The signer account or address */
  signer: LocalAccount
  /** Optional index for the account */
  index?: bigint | undefined
  /** Optional active validation module */
  //   activeValidationModule?: ToValidationModuleReturnType
  /** Optional factory address */
  factoryAddress?: Address
  /** Optional K1 validator address */
  k1ValidatorAddress?: Address
}

/**
 * Nexus Smart Account type
 */
export type NexusAccount = Prettify<
  SmartAccount<NexusSmartAccountImplementation>
>

export type NexusSmartAccountImplementation = Assign<
  SmartAccountImplementation<typeof entryPoint07Abi, '0.7'>,
  {
    encodeCalls: NonNullable<SmartAccountImplementation['encodeCalls']>
    encodeExecute: (call: Call) => Promise<Hex>
    encodeExecuteBatch: (calls: readonly Call[]) => Promise<Hex>
    signUserOperation: NonNullable<
      SmartAccountImplementation['signUserOperation']
    >
    signTypedData: NonNullable<SmartAccountImplementation['signTypedData']>
    signMessage: NonNullable<SmartAccountImplementation['signMessage']>
    getStubSignature: NonNullable<
      SmartAccountImplementation['getStubSignature']
    >
    getNonce: NonNullable<SmartAccountImplementation['getNonce']>
  }
>

// define mode and exec type enums
export const CALLTYPE_SINGLE = '0x00' // 1 byte
export const CALLTYPE_BATCH = '0x01' // 1 byte
export const EXECTYPE_DEFAULT = '0x00' // 1 byte
export const EXECTYPE_TRY = '0x01' // 1 byte
export const EXECTYPE_DELEGATE = '0xFF' // 1 byte
export const MODE_DEFAULT = '0x00000000' // 4 bytes
export const UNUSED = '0x00000000' // 4 bytes
export const MODE_PAYLOAD = '0x00000000000000000000000000000000000000000000' // 22 bytes

export const EXECUTE_SINGLE = concat([
  CALLTYPE_SINGLE,
  EXECTYPE_DEFAULT,
  MODE_DEFAULT,
  UNUSED,
  MODE_PAYLOAD,
])

export const EXECUTE_BATCH = concat([
  CALLTYPE_BATCH,
  EXECTYPE_DEFAULT,
  MODE_DEFAULT,
  UNUSED,
  MODE_PAYLOAD,
])

export type Call = {
  to: Hex
  data?: Hex | undefined
  value?: bigint | undefined
}

export const MODE_VALIDATION = '0x00'
export const K1ValidatorAddress = '0x00000004171351c442B202678c48D8AB5B321E8f'
export const K1ValidatorFactoryAddress =
  '0x00000bb19a3579F4D779215dEf97AFbd0e30DB55'

/**
 * @description Create a Nexus Smart Account.
 *
 * @param parameters - {@link ToNexusSmartAccountParameters}
 * @returns Nexus Smart Account. {@link NexusAccount}
 *
 * @example
 * import { toNexusAccount } from '@biconomy/sdk'
 * import { createWalletClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const account = await toNexusAccount({
 *   chain: mainnet,
 *   transport: http(),
 *   signer: '0x...',
 * })
 */
export const toNexusAccount = async (
  parameters: ToNexusSmartAccountParameters,
): Promise<NexusAccount> => {
  const {
    // chain,
    client,
    // transport,
    signer: _signer,
    index = 0n,
    // activeValidationModule,
    factoryAddress = K1ValidatorFactoryAddress,
    // key = "nexus account",
    // name = "Nexus Account"
  } = parameters

  const entryPoint = {
    abi: entryPoint07Abi,
    address: entryPoint07Address,
    version: '0.7',
  } as const

  //   const masterClient = createWalletClient({
  //     account: _signer as LocalAccount,
  //     chain,
  //     transport,
  //     key,
  //     name
  //   })
  //     .extend(walletActions)
  //     .extend(publicActions)

  //   const signerAddress = masterClient.account.address
  //   const entryPointContract = getContract({
  //     address: entryPoint07Address,
  //     abi: entryPoint07Abi,
  //     client
  //   })

  const factoryData = encodeFunctionData({
    abi: parseAbi([
      'function createAccount(address,uint256,address[],uint8) external returns (address)',
    ]),
    functionName: 'createAccount',
    args: [_signer.address, index, [], 0],
  })

  let _accountAddress: Address
  /**
   * @description Gets the address of the account
   * @returns The address of the account
   */
  const getAddress = async () => {
    if (_accountAddress) return _accountAddress

    try {
      _accountAddress = (await readContract(client, {
        address: factoryAddress,
        abi: parseAbi([
          'function computeAccountAddress(address,uint256,address[],uint8) external returns (address)',
        ]),
        functionName: 'computeAccountAddress',
        args: [_signer.address, index, [], 0n],
      })) as Address
    } catch (e: any) {
      if (
        e.shortMessage?.includes(
          'The contract function "computeAccountAddress" returned no data ("0x")',
        )
      ) {
        throw new Error('Account has not yet been deployed')
      }
    }

    return _accountAddress
  }

  //   let defaultedActiveModule =
  //     activeValidationModule ??
  //     (await toK1ValidatorModule({
  //       nexusAccountAddress: await getAddress(),
  //       initData: signerAddress,
  //       deInitData: "0x",
  //       client: masterClient
  //     }))

  /**
   * @description Gets the counterfactual address of the account
   * @returns The counterfactual address
   * @throws {Error} If unable to get the counterfactual address
   */
  const getCounterFactualAddress = async (): Promise<Address> => {
    if (_accountAddress) return _accountAddress
    try {
      await simulateContract(client, {
        address: entryPoint07Address,
        abi: entryPoint07Abi,
        functionName: 'getSenderAddress',
        args: [getInitCode()],
      })
    } catch (e: any) {
      if (e?.cause?.data?.errorName === 'SenderAddressResult') {
        _accountAddress = e?.cause.data.args[0] as Address
        return _accountAddress
      }
    }
    throw new Error('Failed to get counterfactual account address')
  }

  /**
   * @description Gets the init code for the account
   * @returns The init code as a hexadecimal string
   */
  const getInitCode = () => concatHex([factoryAddress, factoryData])

  /**
   * @description Checks if the account is deployed
   * @returns True if the account is deployed, false otherwise
   */
  const isDeployed = async (): Promise<boolean> => {
    const address = await getCounterFactualAddress()
    const contractCode = await getCode(client, { address })
    return (contractCode?.length ?? 0) > 2
  }

  /**
   * @description Calculates the hash of a user operation
   * @param userOp - The user operation
   * @returns The hash of the user operation
   */
  const getUserOpHash = async (
    userOp: UnionPartialBy<UserOperation, 'sender'> & {
      chainId?: number | undefined
    },
  ): Promise<Hex> => {
    return getUserOperationHash({
      chainId: client.chain!.id,
      entryPointAddress: entryPoint.address,
      entryPointVersion: entryPoint.version,
      userOperation: {
        ...(userOp as unknown as UserOperation),
        sender: await getAddress(),
      },
    })
  }

  /**
   * @description Encodes a batch of calls for execution
   * @param calls - An array of calls to encode
   * @param mode - The execution mode
   * @returns The encoded calls
   */
  const encodeExecuteBatch = async (
    calls: readonly Call[],
    mode = EXECUTE_BATCH,
  ): Promise<Hex> => {
    const executionAbiParams: AbiParameter = {
      type: 'tuple[]',
      components: [
        { name: 'target', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'callData', type: 'bytes' },
      ],
    }

    const executions = calls.map((tx) => ({
      target: tx.to,
      callData: tx.data ?? '0x',
      value: BigInt(tx.value ?? 0n),
    }))

    const executionCalldataPrep = encodeAbiParameters(
      [executionAbiParams],
      [executions],
    )
    return encodeFunctionData({
      abi: parseAbi([
        'function execute(bytes32 mode, bytes calldata executionCalldata) external',
      ]),
      functionName: 'execute',
      args: [mode, executionCalldataPrep],
    })
  }

  /**
   * @description Encodes a single call for execution
   * @param call - The call to encode
   * @param mode - The execution mode
   * @returns The encoded call
   */
  const encodeExecute = async (
    call: Call,
    mode = EXECUTE_SINGLE,
  ): Promise<Hex> => {
    const executionCalldata = encodePacked(
      ['address', 'uint256', 'bytes'],
      [call.to as Hex, BigInt(call.value ?? 0n), (call.data ?? '0x') as Hex],
    )

    return encodeFunctionData({
      abi: parseAbi([
        'function execute(bytes32 mode, bytes calldata executionCalldata) external',
      ]),
      functionName: 'execute',
      args: [mode, executionCalldata],
    })
  }

  /**
   * @description Gets the nonce for the account
   * @param args - Optional arguments for getting the nonce
   * @returns The nonce
   */
  const getNonce = async (): Promise<bigint> => {
    try {
      const key: string = concat([
        '0x000000',
        MODE_VALIDATION,
        K1ValidatorAddress,
      ])
      const accountAddress = await getAddress()
      return await readContract(client, {
        address: accountAddress,
        abi: entryPoint07Abi,
        functionName: 'getNonce',
        args: [accountAddress, BigInt(key)],
      })
    } catch (_e) {
      return BigInt(0)
    }
  }

  //   /**
  //    * @description Changes the active module for the account
  //    * @param newModule - The new module to set as active
  //    * @returns void
  //    */
  //   const setActiveValidationModule = (
  //     validationModule: ToValidationModuleReturnType
  //   ): void => {
  //     defaultedActiveModule = validationModule
  //   }

  /**
   * @description Signs a message
   * @param params - The parameters for signing
   * @param params.message - The message to sign
   * @returns The signature
   */
  const signMessage = async ({
    message,
  }: { message: SignableMessage }): Promise<Hex> => {
    const tempSignature = await _signer.signMessage({
      message,
    })

    const signature = encodePacked(
      ['address', 'bytes'],
      [K1ValidatorAddress, tempSignature],
    )
    const MAGIC_BYTES =
      '0x6492649264926492649264926492649264926492649264926492649264926492'

    const erc6492Signature = concat([
      encodeAbiParameters(
        [
          {
            type: 'address',
            name: 'create2Factory',
          },
          {
            type: 'bytes',
            name: 'factoryCalldata',
          },
          {
            type: 'bytes',
            name: 'originalERC1271Signature',
          },
        ],
        [factoryAddress, factoryData, signature],
      ),
      MAGIC_BYTES,
    ])

    const accountIsDeployed = await isDeployed()
    return accountIsDeployed ? signature : erc6492Signature
  }

  /**
   * @description Signs typed data
   * @param parameters - The typed data parameters
   * @returns The signature
   */
  async function signTypedData<
    const typedData extends TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
  >(parameters: TypedDataDefinition<typedData, primaryType>): Promise<Hex> {
    const { message, primaryType, types: _types, domain } = parameters

    if (!domain) throw new Error('Missing domain')
    if (!message) throw new Error('Missing message')

    const types = {
      EIP712Domain: getTypesForEIP712Domain({ domain }),
      ..._types,
    }

    // @ts-ignore: Comes from nexus parent typehash
    const messageStuff: Hex = message.stuff

    // @ts-ignore
    validateTypedData({
      domain,
      message,
      primaryType,
      types,
    })

    const appDomainSeparator = domainSeparator({ domain })
    const accountDomainStructFields = await getAccountDomainStructFields(
      client as PublicClient,
      await getAddress(),
    )

    const parentStructHash = keccak256(
      encodePacked(
        ['bytes', 'bytes'],
        [
          encodeAbiParameters(parseAbiParameters(['bytes32, bytes32']), [
            keccak256(toBytes(PARENT_TYPEHASH)),
            messageStuff,
          ]),
          accountDomainStructFields,
        ],
      ),
    )

    const wrappedTypedHash = eip712WrapHash(
      parentStructHash,
      appDomainSeparator,
    )

    let signature = await signMessage({
      message: { raw: wrappedTypedHash },
    })

    const contentsType = toBytes(typeToString(types as TypedDataWith712)[1])

    const signatureData = concatHex([
      signature,
      appDomainSeparator,
      messageStuff,
      toHex(contentsType),
      toHex(contentsType.length, { size: 2 }),
    ])

    signature = encodePacked(
      ['address', 'bytes'],
      [K1ValidatorAddress, signatureData],
    )

    return signature
  }

  return toSmartAccount({
    client: client as any, // Type assertion to bypass type checking
    entryPoint,
    getAddress,
    encodeCalls: (calls: readonly Call[]): Promise<Hex> => {
      return calls.length === 1
        ? encodeExecute(calls[0])
        : encodeExecuteBatch(calls)
    },
    getFactoryArgs: async () => ({ factory: factoryAddress, factoryData }),
    getStubSignature: async (): Promise<Hex> => {
      const dynamicPart = K1ValidatorAddress.substring(2).padEnd(40, '0')
      return `0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000${dynamicPart}000000000000000000000000000000000000000000000000000000000000004181d4b4981670cb18f99f0b4a66446df1bf5b204d24cfcb659bf38ba27a4359b5711649ec2423c5e1247245eba2964679b6a1dbb85c992ae40b9b00c6935b02ff1b00000000000000000000000000000000000000000000000000000000000000`
    },
    signMessage,
    signTypedData,
    signUserOperation: async (
      parameters: UnionPartialBy<UserOperation, 'sender'> & {
        chainId?: number | undefined
      },
    ): Promise<Hex> => {
      const { chainId = client.chain!.id, ...userOpWithoutSender } = parameters
      const address = await getCounterFactualAddress()

      const userOperation = {
        ...userOpWithoutSender,
        sender: address,
      }

      const hash = getUserOperationHash({
        chainId,
        entryPointAddress: entryPoint07Address,
        entryPointVersion: '0.7',
        userOperation,
      })
      const signature = await _signer.signMessage({
        message: { raw: hash as Hex },
      })
      return signature as Hex
    },
    getNonce,
    extend: {
      entryPointAddress: entryPoint07Address,
      getCounterFactualAddress,
      isDeployed,
      getInitCode,
      encodeExecute,
      encodeExecuteBatch,
      getUserOpHash,
      //   setActiveValidationModule,
      //   getActiveValidationModule: () => defaultedActiveModule,
      factoryData,
      factoryAddress,
    },
  })
}

export function getTypesForEIP712Domain({
  domain,
}: { domain?: TypedDataDomain | undefined }): TypedDataParameter[] {
  return [
    typeof domain?.name === 'string' && { name: 'name', type: 'string' },
    domain?.version && { name: 'version', type: 'string' },
    typeof domain?.chainId === 'number' && {
      name: 'chainId',
      type: 'uint256',
    },
    domain?.verifyingContract && {
      name: 'verifyingContract',
      type: 'address',
    },
    domain?.salt && { name: 'salt', type: 'bytes32' },
  ].filter(Boolean) as TypedDataParameter[]
}

export type TypedDataWith712 = {
  EIP712Domain: TypedDataParameter[]
} & TypedData

export function typeToString(typeDef: TypedDataWith712): string[] {
  return Object.entries(typeDef).map(([key, fields]) => {
    const fieldStrings = (fields ?? [])
      .map((field) => `${field.type} ${field.name}`)
      .join(',')
    return `${key}(${fieldStrings})`
  })
}

export const PARENT_TYPEHASH =
  'TypedDataSign(Contents contents,bytes1 fields,string name,string version,uint256 chainId,address verifyingContract,bytes32 salt,uint256[] extensions)Contents(bytes32 stuff)'
export const eip712WrapHash = (typedHash: Hex, appDomainSeparator: Hex): Hex =>
  keccak256(concat(['0x1901', appDomainSeparator, typedHash]))
export type EIP712DomainReturn = [
  Hex,
  string,
  string,
  bigint,
  Address,
  Hex,
  bigint[],
]

export const getAccountDomainStructFields = async (
  publicClient: PublicClient,
  accountAddress: Address,
) => {
  const accountDomainStructFields = (await publicClient.readContract({
    address: accountAddress,
    abi: parseAbi([
      'function eip712Domain() public view returns (bytes1 fields, string memory name, string memory version, uint256 chainId, address verifyingContract, bytes32 salt, uint256[] memory extensions)',
    ]),
    functionName: 'eip712Domain',
  })) as EIP712DomainReturn

  const [fields, name, version, chainId, verifyingContract, salt, extensions] =
    accountDomainStructFields

  const params = parseAbiParameters([
    'bytes1, bytes32, bytes32, uint256, address, bytes32, bytes32',
  ])

  return encodeAbiParameters(params, [
    fields,
    keccak256(toBytes(name)),
    keccak256(toBytes(version)),
    chainId,
    verifyingContract,
    salt,
    keccak256(encodePacked(['uint256[]'], [extensions])),
  ])
}
