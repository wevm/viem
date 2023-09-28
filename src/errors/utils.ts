import type { Address } from 'abitype'

import { version } from './version.js'

export type ErrorType = Error & { name: 'Error' }

export const getContractAddress = (address: Address) => address
export const getUrl = (url: string) => url
export const getVersion = () => `viem@${version}`
