// TODO(v2): Remove this entrypoint. Favor importing from root entrypoint (`viem`).

export {
  type ParseAbi,
  type ParseAbiItem,
  type ParseAbiParameter,
  type ParseAbiParameters,
  parseAbi,
  parseAbiItem,
  parseAbiParameter,
  parseAbiParameters,
} from 'abitype'
export {
  type DecodeAbiParametersReturnType,
  type DecodeAbiParametersErrorType,
  decodeAbiParameters,
} from '../utils/abi/decodeAbiParameters.js'
export {
  type EncodeAbiParametersReturnType,
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from '../utils/abi/encodeAbiParameters.js'
export {
  type GetAbiItemParameters,
  type GetAbiItemErrorType,
  getAbiItem,
} from '../utils/abi/getAbiItem.js'
export {
  type EncodePackedErrorType,
  encodePacked,
} from '../utils/abi/encodePacked.js'
