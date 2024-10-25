// types
import type { AbiParameter, Address, TypedDataParameter } from 'abitype'
import type { TypedData } from 'abitype'
import type { LocalAccount } from '../../../accounts/types.js'
import {
  type ClientConfig,
  createClient,
} from '../../../clients/createClient.js'
import type { PublicClient } from '../../../clients/createPublicClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { Account } from '../../../types/account.js'
import type { Chain } from '../../../types/chain.js'
import type { RpcSchema } from '../../../types/eip1193.js'
import type { Hex, SignableMessage } from '../../../types/misc.js'
import type { TypedDataDefinition } from '../../../types/typedData.js'
import type { Prettify, UnionPartialBy } from '../../../types/utils.js'
import type { UserOperation } from '../../types/userOperation.js'
import type { SmartAccount, SmartAccountImplementation } from '../types.js'

// actions
import { getContract } from '../../../actions/getContract.js'
import { getCode } from '../../../actions/public/getCode.js'
import { getUserOperationHash } from '../../utils/userOperation/getUserOperationHash.js'

// accounts
import { toSmartAccount } from '../toSmartAccount.js'

// constants
import { entryPoint07Address } from '../../constants/address.js'

import { readContract } from '../../../actions/index.js'
// utils
import {
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
} from '../../../index.js'
import { getTypesForEIP712Domain } from '../../../utils/typedData.js'
import { entryPoint07Abi } from '../../constants/abis.js'

// define mode and exec type enums
export const CALLTYPE_SINGLE = '0x00' // 1 byte
export const CALLTYPE_BATCH = '0x01' // 1 byte
export const EXECTYPE_DEFAULT = '0x00' // 1 byte
export const EXECTYPE_TRY = '0x01' // 1 byte
export const EXECTYPE_DELEGATE = '0xFF' // 1 byte
export const MODE_DEFAULT = '0x00000000' // 4 bytes
export const UNUSED = '0x00000000' // 4 bytes
export const MODE_PAYLOAD = '0x00000000000000000000000000000000000000000000' // 22 bytes
export const MAGIC_BYTES =
  '0x6492649264926492649264926492649264926492649264926492649264926492'
export const PARENT_TYPEHASH =
  'TypedDataSign(Contents contents,bytes1 fields,string name,string version,uint256 chainId,address verifyingContract,bytes32 salt,uint256[] extensions)Contents(bytes32 stuff)'

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

/**
 * Parameters for creating a Nexus Smart Account
 */
export type ToNexusSmartAccountParameters = {
  /** The blockchain network */
  chain: Chain
  /** The transport configuration */
  transport: ClientConfig['transport']
  /** The signer account or address */
  signer: Signer
  /** Optional index for the account */
  index?: bigint | undefined
  /** Optional factory address */
  factoryAddress?: Address
  /** Optional K1 validator address */
  k1ValidatorAddress?: Address
  /** Optional account address override */
  accountAddress?: Address
} & Prettify<
  Pick<
    ClientConfig<Transport, Chain, Account, RpcSchema>,
    | 'account'
    | 'cacheTime'
    | 'chain'
    | 'key'
    | 'name'
    | 'pollingInterval'
    | 'rpcSchema'
  >
>

/**
 * Nexus Smart Account type
 */
export type ToNexusSmartAccountReturnType = Prettify<
  SmartAccount<NexusSmartAccountImplementation>
>

export type Call = {
  to: Hex
  data?: Hex | undefined
  value?: bigint | undefined
}

/**
 * Nexus Smart Account Implementation
 */
export type NexusSmartAccountImplementation = SmartAccountImplementation<
  typeof entryPoint07Abi,
  '0.7',
  {
    getCounterFactualAddress: () => Promise<Address>
    isDeployed: () => Promise<boolean>
    getInitCode: () => Hex
    encodeExecute: (call: Call) => Promise<Hex>
    encodeExecuteBatch: (calls: readonly Call[]) => Promise<Hex>
    factoryData: Hex
    factoryAddress: Address
    signer: Signer
  }
>

const K1_VALIDATOR_ADDRESS = '0x00000004171351c442B202678c48D8AB5B321E8f'
const K1_VALIDATOR_FACTORY_ADDRESS =
  '0x00000bb19a3579F4D779215dEf97AFbd0e30DB55'

/**
 * Checks if a value is null or undefined
 * @param value - The value to check
 * @returns True if the value is null or undefined, false otherwise
 * @example
 * isNullOrUndefined(null) // returns true
 * isNullOrUndefined(undefined) // returns true
 * isNullOrUndefined(0) // returns false
 * isNullOrUndefined('') // returns false
 */
const isNullOrUndefined = (value: any): value is undefined => {
  return value === null || value === undefined
}

export type Signer = LocalAccount

/**
 * @description Create a Nexus Smart Account.
 *
 * @param parameters - {@link ToNexusSmartAccountParameters}
 * @returns Nexus Smart Account. {@link ToNexusSmartAccountReturnType}
 *
 * @example
 * import { http } from "viem";
 * import { toNexusAccount } from "viem/account-abstraction";
 * import { mainnet } from "viem/chains";
 *
 * const account = await toNexusAccount({
 *   chain: mainnet,
 *   transport: http(),
 *   signer: account,
 * })
 */
export const toNexusAccount = async (
  parameters: ToNexusSmartAccountParameters,
): Promise<ToNexusSmartAccountReturnType> => {
  const {
    chain,
    transport,
    signer,
    index = 0n,
    factoryAddress = K1_VALIDATOR_FACTORY_ADDRESS,
    k1ValidatorAddress = K1_VALIDATOR_ADDRESS,
    key = 'nexus account',
    name = 'Nexus Account',
  } = parameters

  const client = createClient({
    chain: chain,
    transport,
    key,
    name,
  })

  const signerAddress = signer.address
  const entryPointContract = getContract({
    address: entryPoint07Address,
    abi: entryPoint07Abi,
    client: {
      public: client,
    },
  })

  const factoryData = encodeFunctionData({
    abi: parseAbi([
      'function createAccount(address eoaOwner, uint256 index, address[] attesters, uint8 threshold) external returns (address)',
    ]),
    functionName: 'createAccount',
    args: [signerAddress, index, [], 0],
  })

  let _accountAddress: Address | undefined = parameters.accountAddress
  /**
   * @description Gets the address of the account
   * @returns The address of the account
   * @example
   * const address = await getAddress()
   * console.log(address) // '0x...'
   */
  const getAddress = async (): Promise<Address> => {
    if (!isNullOrUndefined(_accountAddress)) return _accountAddress

    try {
      _accountAddress = (await readContract(client, {
        address: factoryAddress,
        abi: parseAbi([
          'function computeAccountAddress(address eoaOwner, uint256 index, address[] attesters, uint8 threshold) external view returns (address)',
        ]),
        functionName: 'computeAccountAddress',
        args: [signerAddress, index, [], 0],
      })) as Address
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (e: any) {
      if (
        e.shortMessage?.includes(
          `The contract function "computeAccountAddress" returned no data ("0x")`,
        )
      ) {
        throw new Error(
          'Failed to compute account address. Possible reasons:\n' +
            "- The factory contract does not have the function 'computeAccountAddress'\n" +
            '- The parameters passed to the factory contract function may be invalid\n' +
            '- The provided factory address is not a contract',
        )
      }
      throw e
    }

    return _accountAddress
  }

  /**
   * @description Gets the counterfactual address of the account
   * @returns The counterfactual address
   * @throws {Error} If unable to get the counterfactual address
   * @example
   * const counterFactualAddress = await getCounterFactualAddress()
   * console.log(counterFactualAddress) // '0x...'
   */
  const getCounterFactualAddress = async (): Promise<Address> => {
    if (_accountAddress) return _accountAddress
    try {
      await entryPointContract.simulate.getSenderAddress([getInitCode()])
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
   * @example
   * const initCode = getInitCode()
   * console.log(initCode) // '0x...'
   */
  const getInitCode = () => concatHex([factoryAddress, factoryData])

  /**
   * @description Gets the nonce for the account
   * @param args - Optional arguments for getting the nonce
   * @returns The nonce
   * @example
   * const nonce = await getNonce()
   * console.log(nonce) // 1n
   */
  const getNonce = async (
    parameters?: { key?: bigint | undefined } | undefined,
  ): Promise<bigint> => {
    try {
      const TIMESTAMP_ADJUSTMENT = 16777215n
      const defaultedKey = BigInt(parameters?.key ?? 0n) % TIMESTAMP_ADJUSTMENT
      const defaultedValidationMode = '0x00'
      const key: string = concat([
        toHex(defaultedKey, { size: 3 }),
        defaultedValidationMode,
        k1ValidatorAddress,
      ])

      const accountAddress = await getAddress()
      return await entryPointContract.read.getNonce([
        accountAddress,
        BigInt(key),
      ])
    } catch (_e) {
      return 0n
    }
  }

  /**
   * @description Checks if the account is deployed
   * @returns True if the account is deployed, false otherwise
   * @example
   * const deployed = await isDeployed()
   * console.log(deployed) // true or false
   */
  const isDeployed = async (): Promise<boolean> => {
    const address = await getCounterFactualAddress()
    const contractCode = await getCode(client, { address })
    return (contractCode?.length ?? 0) > 2
  }

  /**
   * @description Encodes a batch of calls for execution
   * @param calls - An array of calls to encode
   * @param mode - The execution mode
   * @returns The encoded calls
   * @example
   * const encodedCalls = await encodeExecuteBatch([
   *   { to: '0x...', data: '0x...', value: 1000n },
   *   { to: '0x...', data: '0x...', value: 2000n }
   * ])
   * console.log(encodedCalls) // '0x...'
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
   * @example
   * const encodedCall = await encodeExecute({ to: '0x...', data: '0x...', value: 1000n })
   * console.log(encodedCall) // '0x...'
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
   * @description Signs a message
   * @param params - The parameters for signing
   * @param params.message - The message to sign
   * @returns The signature
   * @example
   * const signature = await signMessage({ message: 'Hello, World!' })
   * console.log(signature) // '0x...'
   */
  const signMessage = async (parameters: {
    message: SignableMessage
  }): Promise<Hex> => {
    const tempSignature = await signer.signMessage(parameters)

    const signature = encodePacked(
      ['address', 'bytes'],
      [k1ValidatorAddress, tempSignature],
    )

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
    const TTypedData extends TypedData | Record<string, unknown>,
    TPrimaryType extends keyof TTypedData | 'EIP712Domain' = keyof TTypedData,
  >(parameters: TypedDataDefinition<TTypedData, TPrimaryType>): Promise<Hex> {
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
      client as unknown as PublicClient,
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

    let signature = await signer.signMessage({
      message: { raw: toBytes(wrappedTypedHash) },
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
      [k1ValidatorAddress, signatureData],
    )

    return signature
  }

  return toSmartAccount({
    client,
    entryPoint: {
      abi: entryPoint07Abi,
      address: entryPoint07Address,
      version: '0.7',
    },
    getAddress,
    encodeCalls: (calls: readonly Call[]): Promise<Hex> => {
      return calls.length === 1
        ? encodeExecute(calls[0])
        : encodeExecuteBatch(calls)
    },
    getFactoryArgs: async () => ({ factory: factoryAddress, factoryData }),
    getStubSignature: async (): Promise<Hex> => {
      const dynamicPart = k1ValidatorAddress.substring(2).padEnd(40, '0')
      return `0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000${dynamicPart}000000000000000000000000000000000000000000000000000000000000004181d4b4981670cb18f99f0b4a66446df1bf5b204d24cfcb659bf38ba27a4359b5711649ec2423c5e1247245eba2964679b6a1dbb85c992ae40b9b00c6935b02ff1b00000000000000000000000000000000000000000000000000000000000000` as Hex
    },
    signMessage,
    signTypedData,
    getNonce,
    signUserOperation: async (
      parameters: UnionPartialBy<UserOperation, 'sender'> & {
        chainId?: number | undefined
      },
    ): Promise<Hex> => {
      const { chainId = chain.id, ...userOpWithoutSender } = parameters
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
      return await signer.signMessage({
        message: { raw: hash as Hex },
      })
    },
    extend: {
      entryPointAddress: entryPoint07Address,
      getCounterFactualAddress,
      isDeployed,
      getInitCode,
      encodeExecute,
      encodeExecuteBatch,
      factoryData,
      factoryAddress,
      signer,
    },
  })
}

export type EIP712DomainReturn = [
  Hex,
  string,
  string,
  bigint,
  Address,
  Hex,
  bigint[],
]

/**
 * @description Wraps a typed hash with EIP-712 domain separator
 * @param typedHash - The typed hash to wrap
 * @param appDomainSeparator - The domain separator
 * @returns The wrapped hash
 * @example
 * const wrappedHash = eip712WrapHash('0x...', '0x...')
 * console.log(wrappedHash) // '0x...'
 */
export const eip712WrapHash = (typedHash: Hex, appDomainSeparator: Hex): Hex =>
  keccak256(concat(['0x1901', appDomainSeparator, typedHash]))

/**
 * @description Converts a type definition to a string representation
 * @param typeDef - The type definition to convert
 * @returns An array of string representations of the types
 * @example
 * const typeStrings = typeToString({
 *   Person: [{ name: 'name', type: 'string' }, { name: 'wallet', type: 'address' }]
 * })
 * console.log(typeStrings) // ['Person(string name,address wallet)']
 */
export function typeToString(typeDef: TypedDataWith712): string[] {
  return Object.entries(typeDef).map(([key, fields]) => {
    const fieldStrings = (fields ?? [])
      .map((field) => `${field.type} ${field.name}`)
      .join(',')
    return `${key}(${fieldStrings})`
  })
}

export type TypedDataWith712 = {
  EIP712Domain: TypedDataParameter[]
} & TypedData

/**
 * @description Gets the account domain struct fields
 * @param publicClient - The public client
 * @param accountAddress - The account address
 * @returns The encoded account domain struct fields
 * @example
 * const fields = await getAccountDomainStructFields(publicClient, '0x...')
 * console.log(fields) // '0x...'
 */
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

/**
 * @description Sanitizes a signature by adjusting the 'v' value if necessary
 * @param signature - The signature to sanitize
 * @returns The sanitized signature
 * @example
 * const sanitizedSignature = sanitizeSignature('0x...')
 * console.log(sanitizedSignature) // '0x...'
 */
export function sanitizeSignature(signature: Hex): Hex {
  let signature_ = signature
  const potentiallyIncorrectV = Number.parseInt(signature_.slice(-2), 16)
  if (![27, 28].includes(potentiallyIncorrectV)) {
    const correctV = potentiallyIncorrectV + 27
    signature_ = signature_.slice(0, -2) + correctV.toString(16)
  }
  if (signature.slice(0, 2) !== '0x') {
    signature_ = `0x${signature_}`
  }
  return signature_ as Hex
}
