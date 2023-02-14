// @ts-ignore
import { Address } from 'abitype'
import { name, version } from '../../package.json'

export const getContractAddress = (address: Address) => address
export const getUrl = (url: string) => url
export const getVersion = () => `${name}@${version}`
