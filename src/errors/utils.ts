import type { Address } from 'abitype'

export type ErrorType<name extends string = 'Error'> = Error & { name: name }
export type AbortErrorType = ErrorType<'AbortError'>

export const getContractAddress = (address: Address) => address
export const getUrl = (url: string) => url
