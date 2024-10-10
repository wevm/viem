import { maxUint16 } from '../../constants/number.js'

export const gasPerPubdataDefault = 50000n
export const maxBytecodeSize = maxUint16 * 32n

export const requiredL2GasPricePerPubdata = 800

export const requiredL1ToL2GasPerPubdataLimit = 800n

export const l1FeeEstimationCoefNumerator = 12
export const l1FeeEstimationCoefDenominator = 10

export const addressModulo = 2n ** 160n

export const defaultPollingIntervalMs = 500
