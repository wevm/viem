import type { Address } from 'abitype'
import { version } from './version'

export const getContractAddress = (address: Address) => address
export const getUrl = (url: string) => url
export const getVersion = () => `viem@${version}`
