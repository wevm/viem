import * as Abi from 'ox/Abi'
import * as AbiConstructor from 'ox/AbiConstructor'
import * as AbiFunction from 'ox/AbiFunction'
import * as Address from 'ox/Address'
import type * as Block from 'ox/Block'
import * as Bytes from 'ox/Bytes'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'
import * as Authorization from 'ox/Authorization'
import * as Secp256k1 from 'ox/Secp256k1'
import * as Signature from 'ox/Signature'
import { SignatureErc6492 } from 'ox/erc6492'
import { SignatureErc8010 } from 'ox/erc8010'

import type * as Client from '../Client.js'
import * as ContractError from '../ContractError.js'
import * as RpcError from '../RpcError.js'
import { isAbortError } from '../internal/errors.js'
import type { OneOf } from '../internal/types.js'
import { getCode } from './address/getCode.js'
import { call } from './call.js'
import { read } from './contract/read.js'
import { multicall3Bytecode } from './internal/constants.js'
import { toDeploylessCallViaBytecodeData } from './internal/deployless.js'
import { aggregate3Abi } from './internal/multicall.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

const erc1271Abi = /*#__PURE__*/ Abi.from([
  'function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4)',
])

const erc1271MagicValue = '0x1626ba7e'

/**
 * Verifies a signature over a hash onchain, supporting Smart Contract
 * Accounts (ERC-1271), counterfactual accounts (ERC-6492), delegated
 * accounts (ERC-8010), and Externally Owned Accounts.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const valid = await Actions.verifyHash(client, {
 *   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   hash: '0x…',
 *   signature: '0x…',
 * })
 * ```
 */
export async function verifyHash(
  client: Client.Client,
  options: verifyHash.Options,
): Promise<verifyHash.ReturnType> {
  if (client.chain?.verifyHash)
    return await client.chain.verifyHash(client, {
      ...options,
      signature: normalizeSignature(options.signature),
    })

  return await verifyDefault(client, options)
}

/**
 * The default (hook-less) verification path. Chain `verifyHash` hooks call
 * this to fall back to standard verification without re-dispatching.
 *
 * @internal
 */
export async function verifyDefault(
  client: Client.Client,
  options: verifyHash.Options,
): Promise<verifyHash.ReturnType> {
  const {
    address,
    erc6492VerifierAddress = client.chain?.contracts?.erc6492Verifier?.address,
    hash,
    mode = 'auto',
    multicallAddress = client.chain?.contracts?.multicall3?.address,
  } = options

  const signature = normalizeSignature(options.signature)

  try {
    if (mode === 'eoa') {
      try {
        if (verifyEoa({ address, hash, signature })) return true
      } catch {}
    }

    if (SignatureErc8010.validate(signature))
      return await verifyErc8010(client, {
        ...options,
        multicallAddress,
        signature,
      })
    return await verifyErc6492(client, {
      ...options,
      signature,
      verifierAddress: erc6492VerifierAddress,
    })
  } catch (error) {
    if (isAbortError(error)) throw error

    if (mode !== 'eoa') {
      try {
        if (verifyEoa({ address, hash, signature })) return true
      } catch {}
    }

    // A failed execution means the validator could not verify the signature
    // (e.g. unrecoverable signer or malformed signature).
    if (error instanceof VerificationError) return false

    throw error
  }
}

export declare namespace verifyHash {
  type Options = {
    /** The address that signed the hash. */
    address: Address.Address
    /** ERC-6492 signature verifier contract. @default client.chain.contracts.erc6492Verifier */
    erc6492VerifierAddress?: Address.Address | undefined
    /** The hash that was signed. */
    hash: Hex.Hex
    /** Verification path to try first before falling back (chains with a `verifyHash` hook may define custom modes). @default 'auto' */
    mode?: 'auto' | 'eoa' | (string & {}) | undefined
    /** Multicall3 address for ERC-8010 verification. @default client.chain.contracts.multicall3 */
    multicallAddress?: Address.Address | undefined
    /** Per-request transport options. */
    requestOptions?: RequestOptions
    /** The signature to verify. */
    signature: Hex.Hex | Bytes.Bytes | Signature.Signature
  } & OneOf<
    | {
        /** Deployment factory of the (counterfactual) smart account. */
        factory: Address.Address
        /** Deployment calldata for the smart account. */
        factoryData: Hex.Hex
      }
    | {}
  > &
    (
      | {
          /** The block number to verify against. */
          blockNumber?: bigint | undefined
          blockTag?: undefined
        }
      | {
          blockNumber?: undefined
          /** The block tag to verify against. @default 'latest' */
          blockTag?: Block.Tag | undefined
        }
    )

  type ReturnType = boolean

  type ErrorType =
    | RpcError.ExecutionError
    | ContractError.ContractFunctionExecutionError
    | Errors.GlobalErrorType
}

function normalizeSignature(
  signature: Hex.Hex | Bytes.Bytes | Signature.Signature,
): Hex.Hex {
  if (typeof signature === 'string') return signature
  if ('r' in signature && 's' in signature) return Signature.toHex(signature)
  return Hex.fromBytes(signature)
}

function verifyEoa(options: {
  address: Address.Address
  hash: Hex.Hex
  signature: Hex.Hex
}): boolean {
  const { address, hash, signature } = options
  return Address.isEqual(
    address,
    Secp256k1.recoverAddress({
      payload: hash,
      signature: Signature.fromHex(signature),
    }),
  )
}

async function verifyErc6492(
  client: Client.Client,
  options: verifyHash.Options & {
    signature: Hex.Hex
    verifierAddress?: Address.Address | undefined
  },
): Promise<boolean> {
  const {
    address,
    blockNumber,
    blockTag,
    factory,
    factoryData,
    hash,
    requestOptions,
    signature,
    verifierAddress,
  } = options

  const wrappedSignature = (() => {
    // Without a `factory`, the address is assumed to be an EOA or an
    // already-deployed smart account.
    if (!factory && !factoryData) return signature

    if (SignatureErc6492.validate(signature)) return signature

    // Wrap for counterfactual (undeployed smart account) validation.
    return SignatureErc6492.wrap({
      data: factoryData!,
      signature,
      to: factory!,
    })
  })()

  const request = verifierAddress
    ? {
        data: AbiFunction.encodeData(
          AbiFunction.fromAbi(
            SignatureErc6492.universalSignatureValidatorAbi,
            'isValidSig',
          ),
          [address, hash, wrappedSignature],
        ),
        to: verifierAddress,
      }
    : {
        data: AbiConstructor.encode(
          AbiConstructor.fromAbi(
            SignatureErc6492.universalSignatureValidatorAbi,
          ),
          {
            args: [address, hash, wrappedSignature],
            bytecode: SignatureErc6492.universalSignatureValidatorBytecode,
          },
        ),
      }

  const { data } = await call(client, {
    ...request,
    blockNumber,
    blockTag,
    requestOptions,
  } as call.Options).catch((error) => {
    if (error instanceof RpcError.ExecutionError) throw new VerificationError()
    throw error
  })

  if (Hex.toBoolean(data ?? '0x0')) return true
  throw new VerificationError()
}

async function verifyErc8010(
  client: Client.Client,
  options: verifyHash.Options & {
    multicallAddress?: Address.Address | undefined
    signature: Hex.Hex
  },
): Promise<boolean> {
  const {
    address,
    blockNumber,
    blockTag,
    hash,
    multicallAddress,
    requestOptions,
  } = options

  const {
    authorization,
    data: initData,
    signature,
    to,
  } = SignatureErc8010.unwrap(options.signature)

  const code = await getCode(client, {
    address,
    blockNumber,
    blockTag,
  } as getCode.Options)

  // Already delegated: plain ERC-1271 verification.
  if (code === Hex.concat('0xef0100', authorization.address))
    return await verifyErc1271(client, {
      address,
      blockNumber,
      blockTag,
      hash,
      requestOptions,
      signature,
    })

  const valid = Secp256k1.verify({
    address,
    payload: Authorization.getSignPayload(authorization),
    signature: Signature.extract(authorization)!,
  })
  if (!valid) throw new VerificationError()

  // Deployless verification: apply the delegation, run the init data, then
  // check `isValidSignature` on the delegated account.
  const calldata = AbiFunction.encodeData(aggregate3Abi, [
    [
      ...(initData
        ? [
            {
              allowFailure: true,
              callData: initData,
              target: to ?? address,
            },
          ]
        : []),
      {
        allowFailure: true,
        callData: AbiFunction.encodeData(
          AbiFunction.fromAbi(erc1271Abi, 'isValidSignature'),
          [hash, signature],
        ),
        target: address,
      },
    ],
  ] as never)

  const { data: response } = await call(client, {
    ...(multicallAddress
      ? { data: calldata, to: multicallAddress }
      : {
          data: toDeploylessCallViaBytecodeData({
            code: multicall3Bytecode,
            data: calldata,
          }),
        }),
    authorizationList: [authorization],
    ...(blockNumber ? { blockNumber } : { blockTag: 'pending' }),
    requestOptions,
  } as call.Options).catch((error) => {
    if (error instanceof RpcError.ExecutionError) throw new VerificationError()
    throw error
  })
  if (!response) throw new VerificationError()

  const data = (() => {
    try {
      const results = AbiFunction.decodeResult(aggregate3Abi, response, {
        as: 'Object',
      }) as readonly { returnData: Hex.Hex; success: boolean }[]
      return results.at(-1)?.returnData
    } catch {
      throw new VerificationError()
    }
  })()

  if (data?.startsWith(erc1271MagicValue)) return true
  throw new VerificationError()
}

async function verifyErc1271(
  client: Client.Client,
  options: {
    address: Address.Address
    blockNumber?: bigint | undefined
    blockTag?: Block.Tag | undefined
    hash: Hex.Hex
    requestOptions?: RequestOptions
    signature: Hex.Hex
  },
): Promise<boolean> {
  const { address, blockNumber, blockTag, hash, requestOptions, signature } =
    options

  const result = await read(client, {
    abi: erc1271Abi,
    address,
    args: [hash, signature],
    blockNumber,
    blockTag,
    functionName: 'isValidSignature',
    requestOptions,
  } as never).catch((error) => {
    if (error instanceof ContractError.ContractFunctionExecutionError)
      throw new VerificationError()
    throw error
  })

  if ((result as Hex.Hex).startsWith(erc1271MagicValue)) return true
  throw new VerificationError()
}

/** Internal sentinel: the validator determined the signature is invalid. */
class VerificationError extends Error {}
