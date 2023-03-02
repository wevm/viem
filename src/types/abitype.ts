import type { Hex } from './misc'

declare module 'abitype' {
  export interface Config {
    BytesType: {
      inputs: Hex
      outputs: Hex
    }
  }
}

export type {
  Abi,
  AbiError,
  AbiEvent,
  AbiFunction,
  AbiInternalType,
  AbiParameter,
  AbiParameterKind,
  AbiStateMutability,
  AbiType,
  Address,
  IsAbi,
  IsTypedData,
  SolidityAddress,
  SolidityArray,
  SolidityArrayWithTuple,
  SolidityArrayWithoutTuple,
  SolidityBool,
  SolidityBytes,
  SolidityFixedArrayRange,
  SolidityFixedArraySizeLookup,
  SolidityFunction,
  SolidityInt,
  SolidityString,
  SolidityTuple,
  TypedData,
  TypedDataDomain,
  TypedDataParameter,
  TypedDataType,
} from 'abitype'
