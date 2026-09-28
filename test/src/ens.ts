import {
  Abi,
  AbiConstructor,
  AbiError,
  AbiFunction,
  AbiParameters,
  Ens,
  Hash,
  Hex,
  Secp256k1,
  Signature,
} from 'ox'
import type { Address } from 'ox'
import * as generated from '../../contracts/generated.js'

import { Actions, type Client } from 'viem'

import { accounts } from './constants.js'
import * as contract from './contract.js'
import { createServer } from './http.js'

const registryAddress: Address.Address =
  '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'

const registryAbi = /*#__PURE__*/ Abi.from([
  'function owner(bytes32 node) view returns (address)',
  'function setResolver(bytes32 node, address resolver)',
])

const reverseRegistrarAbi = /*#__PURE__*/ Abi.from([
  'function setName(string name) returns (bytes32)',
])

const batchGatewayAbi = /*#__PURE__*/ Abi.from([
  'function query((address sender, string[] urls, bytes data)[]) returns (bool[] failures, bytes[] responses)',
  'error HttpError(uint16 status, string message)',
])

export const vitalik: Address.Address =
  '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'

/** Sets vitalik's primary ENS name via the reverse registrar (impersonated). */
export async function setPrimaryName(
  client: Client.Client,
  options: { name: string },
) {
  await Actions.address.impersonate(client, { address: vitalik })
  await Actions.contract.write(client, {
    abi: reverseRegistrarAbi,
    account: vitalik,
    address: '0x9062c0a6dbd6108336bcbe4593a3d1ce05512069',
    args: [options.name],
    functionName: 'setName',
  })
  await Actions.block.mine(client, { blocks: 1 })
  await Actions.address.stopImpersonating(client, { address: vitalik })
}

/**
 * Points `vitalik.eth` at a resolver without profile support (the registry
 * contract) and `vbuterin.eth` at a non-contract resolver (an EOA).
 */
export async function setVitalikResolver(client: Client.Client) {
  await Actions.address.impersonate(client, { address: vitalik })
  await Actions.contract.write(client, {
    abi: registryAbi,
    account: vitalik,
    address: registryAddress,
    args: [Ens.namehash('vitalik.eth'), registryAddress],
    functionName: 'setResolver',
  })
  await Actions.contract.write(client, {
    abi: registryAbi,
    account: vitalik,
    address: registryAddress,
    args: [Ens.namehash('vbuterin.eth'), vitalik],
    functionName: 'setResolver',
  })
  await Actions.block.mine(client, { blocks: 1 })
  await Actions.address.stopImpersonating(client, { address: vitalik })
}

const resolveParameters = /*#__PURE__*/ AbiParameters.from('bytes, bytes')

const addrItem = /*#__PURE__*/ AbiFunction.from(
  'function addr(bytes32 node) view returns (address)',
)
const addrCoinTypeItem = /*#__PURE__*/ AbiFunction.from(
  'function addr(bytes32 node, uint256 coinType) view returns (bytes)',
)
const textItem = /*#__PURE__*/ AbiFunction.from(
  'function text(bytes32 node, string key) view returns (string)',
)

/**
 * Gateway for `OffchainResolverExample`: answers profile queries from the
 * provided records, signing each result with account 0.
 */
export function createOffchainResolverServer(records: {
  address?: Address.Address | undefined
  text?: Record<string, string> | undefined
}) {
  return createServer((req, res) => {
    const [, data] = AbiParameters.decode(
      resolveParameters,
      req.url!.split('/')[2] as Hex.Hex,
    ) as [Hex.Hex, Hex.Hex]

    const result = (() => {
      const selector = Hex.slice(data, 0, 4)
      if (selector === AbiFunction.getSelector(addrItem))
        return AbiParameters.encode(AbiParameters.from('address'), [
          records.address ?? '0x0000000000000000000000000000000000000000',
        ])
      if (selector === AbiFunction.getSelector(addrCoinTypeItem)) {
        const [, coinType] = AbiFunction.decodeData(addrCoinTypeItem, data)
        // ETH queries reply with a raw `address`-encoded word (a shape real
        // gateways produce); other coin types have no record.
        if (coinType === 60n && records.address)
          return AbiParameters.encode(AbiParameters.from('address'), [
            records.address,
          ])
        return '0x'
      }
      if (selector === AbiFunction.getSelector(textItem)) {
        const [, key] = AbiFunction.decodeData(textItem, data)
        return AbiParameters.encode(AbiParameters.from('string'), [
          records.text?.[key] ?? '',
        ])
      }
      return '0x'
    })()

    const signature = Signature.toHex(
      Secp256k1.sign({
        payload: Hash.keccak256(result),
        privateKey: accounts[0].privateKey,
      }),
    )

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        data: AbiParameters.encode(resolveParameters, [result, signature]),
      }),
    )
  })
}

/**
 * Deploys `OffchainResolverExample` (signed by account 0, served by `url`)
 * and points `name`'s registry resolver at it (impersonating the owner).
 */
export async function setOffchainResolver(
  client: Client.Client,
  options: { name: string; url: string },
) {
  const { name, url } = options

  const { address } = await contract.deploy(client, {
    bytecode: AbiConstructor.encode(
      AbiConstructor.fromAbi(generated.OffchainResolverExample.abi),
      {
        args: [accounts[0].address, [`${url}/{sender}/{data}`]],
        bytecode: generated.OffchainResolverExample.bytecode.object,
      },
    ),
  })

  const node = Ens.namehash(name)
  const owner = (await Actions.contract.read(client, {
    abi: registryAbi,
    address: registryAddress,
    args: [node],
    functionName: 'owner',
  })) as Address.Address

  await Actions.address.setBalance(client, {
    address: owner,
    value: 10_000_000_000_000_000_000n,
  })
  await Actions.address.impersonate(client, { address: owner })
  await Actions.contract.write(client, {
    abi: registryAbi,
    account: owner,
    address: registryAddress,
    args: [node, address],
    functionName: 'setResolver',
  })
  await Actions.block.mine(client, { blocks: 1 })
  await Actions.address.stopImpersonating(client, { address: owner })

  return { address }
}

/** Batch gateway that fails every query with an encoded `HttpError(404)`. */
export async function createBatchGatewayErrorServer() {
  const data = AbiFunction.encodeResult(
    AbiFunction.fromAbi(batchGatewayAbi, 'query'),
    [
      [true],
      [
        AbiError.encode(AbiError.fromAbi(batchGatewayAbi, 'HttpError'), [
          404,
          'Not Found',
        ]),
      ],
    ],
  )
  return await createServer((_, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ data }))
  })
}
