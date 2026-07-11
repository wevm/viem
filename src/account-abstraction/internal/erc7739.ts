import { AbiParameters, Hex, PersonalMessage, TypedData } from 'ox'
import type { Address } from 'ox'

import type * as Account from '../../core/Account.js'
import type * as Client from '../../core/Client.js'
import { getEip712Domain } from '../../core/actions/contract/getEip712Domain.js'
import { signTypedData as signTypedData_ } from '../../core/actions/signTypedData.js'

type Options = {
  account: Account.Account
  factory?: Address.Address | undefined
  factoryData?: Hex.Hex | undefined
  verifier: Address.Address
}

/** Signs a personal message with ERC-7739 nested EIP-712. */
export async function signMessage(
  client: Client.Client,
  options: Options & { message: Account.SignableMessage },
) {
  const { account, factory, factoryData, message, verifier } = options
  const { domain: verifierDomain } = await getEip712Domain(client, {
    address: verifier,
    factory,
    factoryData,
  })
  const { salt: _, ...domain } = verifierDomain

  return signTypedData_(client, {
    account,
    domain,
    message: { prefixed: PersonalMessage.encode(toPayload(message)) },
    primaryType: 'PersonalSign',
    types: {
      PersonalSign: [{ name: 'prefixed', type: 'bytes' }],
    },
  })
}

/** Signs typed data with ERC-7739 nested EIP-712. */
export async function signTypedData<
  const typedData extends TypedData.TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
>(
  client: Client.Client,
  options: Options & {
    value: TypedData.encode.Value<typedData, primaryType>
  },
) {
  const { account, factory, factoryData, value, verifier } = options
  const { domain, message, primaryType, types } = value as Value
  const { domain: verifierDomain } = await getEip712Domain(client, {
    address: verifier,
    factory,
    factoryData,
  })

  const signature = await signTypedData_<
    Record<string, unknown>,
    'TypedDataSign'
  >(client, {
    account,
    domain,
    message: { contents: message, ...verifierDomain },
    primaryType: 'TypedDataSign',
    types: {
      ...types,
      TypedDataSign: [
        { name: 'contents', type: primaryType },
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ],
    },
  })

  return wrapTypedDataSignature(value as Value, signature)
}

function wrapTypedDataSignature(value: Value, signature: Hex.Hex) {
  const { domain, message, primaryType, types } = value
  const domainHash = TypedData.domainSeparator(domain ?? {})
  const contentsHash = TypedData.hashStruct({
    data: message,
    primaryType,
    types,
  })
  const description = Hex.fromString(
    TypedData.encodeType({ primaryType, types }),
  )

  return AbiParameters.encodePacked(
    ['bytes', 'bytes32', 'bytes32', 'bytes', 'uint16'],
    [signature, domainHash, contentsHash, description, Hex.size(description)],
  )
}

function toPayload(message: Account.SignableMessage) {
  if (typeof message === 'string') return Hex.fromString(message)
  return Hex.from(message.raw)
}

type Value = {
  domain?: TypedData.Domain | undefined
  message: Record<string, unknown>
  primaryType: string
  types: TypedData.TypedData
}
