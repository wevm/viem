// biome-ignore lint/performance/noBarrelFile: entrypoint module
export {
  type IpcTransport,
  type IpcTransportConfig,
  type IpcTransportErrorType,
  ipc,
} from '../clients/transports/ipc.js'
export {
  getIpcRpcClient,
  type IpcRpcClient,
} from '../utils/rpc/ipc.js'
export { mainnetTrustedSetupPath } from './trustedSetups.js'
