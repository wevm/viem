import { maxUint16 } from '../../constants/number.js'

export const gasPerPubdataDefault = 50000n
export const maxBytecodeSize = maxUint16 * 32n

export const REQUIRED_L2_GAS_PRICE_PER_PUBDATA = 800

export const REQUIRED_L1_TO_L2_GAS_PER_PUBDATA_LIMIT = 800n

export const L1_FEE_ESTIMATION_COEF_NUMERATOR = 12
export const L1_FEE_ESTIMATION_COEF_DENOMINATOR = 10

export const ADDRESS_MODULO = 2n ** 160n

export const DEFAULT_POLLING_INTERVAL_MS = 500
