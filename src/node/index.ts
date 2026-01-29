// biome-ignore lint/performance/noBarrelFile: entrypoint module
export {
  type IpcTransport,
  type IpcTransportConfig,
  type IpcTransportErrorType,
  ipc,
} from '../clients/transports/ipc.js'

export { mainnetTrustedSetupPath } from './trustedSetups.js'

export {
  type IpcRpcClient,
  getIpcRpcClient,
} from '../utils/rpc/ipc.js'
