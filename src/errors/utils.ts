import type { Address } from 'abitype'

import { version } from './version.js'

export type ErrorType<name extends string = 'Error'> = Error & { name: name }

export const getContractAddress = (address: Address) => address
export const getUrl = (url: string) => url
export const getVersion = () => `viem@${version}`
