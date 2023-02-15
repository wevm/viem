// @ts-ignore
import { Address } from 'abitype'
import pkg from '../../package.json'

export const getContractAddress = (address: Address) => address
export const getUrl = (url: string) => url
export const getVersion = () => `${pkg.name}@${pkg.version}`
