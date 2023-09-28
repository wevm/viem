// TODO(v2): Remove this entrypoint. Favor importing from root entrypoint (`viem`).

export {
  type CreateContractEventFilterErrorType,
  type CreateContractEventFilterParameters,
  type CreateContractEventFilterReturnType,
  createContractEventFilter,
} from '../actions/public/createContractEventFilter.js'
export {
  type EstimateContractGasErrorType,
  type EstimateContractGasParameters,
  type EstimateContractGasReturnType,
  estimateContractGas,
} from '../actions/public/estimateContractGas.js'
export {
  type GetBytecodeErrorType,
  type GetBytecodeParameters,
  type GetBytecodeReturnType,
  getBytecode,
} from '../actions/public/getBytecode.js'
export {
  type GetStorageAtErrorType,
  type GetStorageAtParameters,
  type GetStorageAtReturnType,
  getStorageAt,
} from '../actions/public/getStorageAt.js'
export {
  type MulticallErrorType,
  type MulticallParameters,
  type MulticallReturnType,
  multicall,
} from '../actions/public/multicall.js'
export type {
  WatchEventOnLogsFn,
  /** @deprecated - use `WatchEventOnLogsFn` instead. */
  WatchEventOnLogsFn as OnLogsFn,
  WatchEventOnLogsParameter,
  /** @deprecated - use `WatchEventOnLogsParameter` instead. */
  WatchEventOnLogsParameter as OnLogsParameter,
  WatchEventErrorType,
} from '../actions/public/watchEvent.js'
export {
  type ReadContractErrorType,
  type ReadContractParameters,
  type ReadContractReturnType,
  readContract,
} from '../actions/public/readContract.js'
export {
  type SimulateContractErrorType,
  type SimulateContractParameters,
  type SimulateContractReturnType,
  simulateContract,
} from '../actions/public/simulateContract.js'
export {
  type WatchContractEventErrorType,
  type WatchContractEventParameters,
  watchContractEvent,
} from '../actions/public/watchContractEvent.js'
export {
  type DeployContractErrorType,
  type DeployContractParameters,
  type DeployContractReturnType,
  deployContract,
} from '../actions/wallet/deployContract.js'
export {
  type WriteContractErrorType,
  type WriteContractParameters,
  type WriteContractReturnType,
  writeContract,
} from '../actions/wallet/writeContract.js'
export {
  type DecodeAbiParametersErrorType,
  type DecodeAbiParametersReturnType,
  decodeAbiParameters,
} from '../utils/abi/decodeAbiParameters.js'
export {
  type DecodeErrorResultErrorType,
  type DecodeErrorResultParameters,
  type DecodeErrorResultReturnType,
  decodeErrorResult,
} from '../utils/abi/decodeErrorResult.js'
export {
  type DecodeEventLogErrorType,
  type DecodeEventLogParameters,
  type DecodeEventLogReturnType,
  decodeEventLog,
} from '../utils/abi/decodeEventLog.js'
export {
  type DecodeFunctionDataErrorType,
  type DecodeFunctionDataParameters,
  decodeFunctionData,
} from '../utils/abi/decodeFunctionData.js'
export {
  type DecodeFunctionResultErrorType,
  type DecodeFunctionResultParameters,
  type DecodeFunctionResultReturnType,
  decodeFunctionResult,
} from '../utils/abi/decodeFunctionResult.js'
export {
  type EncodeAbiParametersErrorType,
  type EncodeAbiParametersReturnType,
  encodeAbiParameters,
} from '../utils/abi/encodeAbiParameters.js'
export {
  type EncodeDeployDataErrorType,
  type EncodeDeployDataParameters,
  encodeDeployData,
} from '../utils/abi/encodeDeployData.js'
export {
  type EncodeErrorResultErrorType,
  type EncodeErrorResultParameters,
  encodeErrorResult,
} from '../utils/abi/encodeErrorResult.js'
export {
  type EncodeArgErrorType,
  type EncodeEventTopicsParameters,
  encodeEventTopics,
} from '../utils/abi/encodeEventTopics.js'
export {
  type EncodeFunctionDataErrorType,
  type EncodeFunctionDataParameters,
  encodeFunctionData,
} from '../utils/abi/encodeFunctionData.js'
export {
  type EncodeFunctionResultErrorType,
  type EncodeFunctionResultParameters,
  encodeFunctionResult,
} from '../utils/abi/encodeFunctionResult.js'
export {
  type GetAbiItemErrorType,
  type GetAbiItemParameters,
  getAbiItem,
} from '../utils/abi/getAbiItem.js'
export {
  type FormatAbiItemWithArgsErrorType,
  formatAbiItemWithArgs,
} from '../utils/abi/formatAbiItemWithArgs.js'
export {
  type FormatAbiItemErrorType,
  formatAbiItem,
} from '../utils/abi/formatAbiItem.js'
