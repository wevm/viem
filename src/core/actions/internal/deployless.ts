import { AbiConstructor } from 'ox'
import type { Address, Hex } from 'ox'

import {
  deploylessCallViaBytecodeBytecode,
  deploylessCallViaFactoryBytecode,
} from './constants.js'

const bytecodeConstructor = /*#__PURE__*/ AbiConstructor.from(
  'constructor(bytes, bytes)',
)
const factoryConstructor = /*#__PURE__*/ AbiConstructor.from(
  'constructor(address, bytes, address, bytes)',
)

/** Builds the calldata for a deployless `eth_call` via contract bytecode. */
export function toDeploylessCallViaBytecodeData(options: {
  code: Hex.Hex
  data: Hex.Hex
}): Hex.Hex {
  const { code, data } = options
  return AbiConstructor.encode(bytecodeConstructor, {
    bytecode: deploylessCallViaBytecodeBytecode,
    args: [code, data],
  })
}

/** Builds the calldata for a deployless `eth_call` via a deployment factory. */
export function toDeploylessCallViaFactoryData(options: {
  data: Hex.Hex
  factory: Address.Address
  factoryData: Hex.Hex
  to: Address.Address
}): Hex.Hex {
  const { data, factory, factoryData, to } = options
  return AbiConstructor.encode(factoryConstructor, {
    bytecode: deploylessCallViaFactoryBytecode,
    args: [to, data, factory, factoryData],
  })
}
