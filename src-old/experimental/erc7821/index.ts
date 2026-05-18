// biome-ignore lint/performance/noBarrelFile: entrypoint
export {
  type ExecuteErrorType,
  type ExecuteParameters,
  type ExecuteReturnType,
  execute,
} from './actions/execute.js'
export {
  type ExecuteBatchesErrorType,
  type ExecuteBatchesParameters,
  type ExecuteBatchesReturnType,
  executeBatches,
} from './actions/executeBatches.js'
export {
  type SupportsExecutionModeErrorType,
  type SupportsExecutionModeParameters,
  type SupportsExecutionModeReturnType,
  supportsExecutionMode,
} from './actions/supportsExecutionMode.js'
export { type Erc7821Actions, erc7821Actions } from './decorators/erc7821.js'
export {
  ExecuteUnsupportedError,
  type ExecuteUnsupportedErrorType,
  FunctionSelectorNotRecognizedError,
  type FunctionSelectorNotRecognizedErrorType,
} from './errors.js'

export {
  type EncodeCallsErrorType,
  encodeCalls,
} from './utils/encodeCalls.js'
export {
  type EncodeExecuteBatchesDataErrorType,
  type EncodeExecuteBatchesDataParameters,
  type EncodeExecuteBatchesDataReturnType,
  encodeExecuteBatchesData,
} from './utils/encodeExecuteBatchesData.js'
export {
  type EncodeExecuteDataErrorType,
  type EncodeExecuteDataParameters,
  type EncodeExecuteDataReturnType,
  encodeExecuteData,
} from './utils/encodeExecuteData.js'
export {
  type GetExecuteErrorParameters,
  type GetExecuteErrorReturnType,
  getExecuteError,
} from './utils/getExecuteError.js'
