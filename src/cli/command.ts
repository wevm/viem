import * as fs from 'fs'
import type { PublicClient } from '../clients/createPublicClient.js'
import { createPublicClient } from '../clients/createPublicClient.js'
import { ChainMaps } from './constants.js'
import { http } from '../clients/transports/http.js'

export interface Command {
  name: string
  describe: string

  execute: (arg: any) => Promise<void>
  setOptions: (arg: any) => void
}

export interface GetClientProps {
  chain: string
}

export interface WriteOutputProps {
  format: 'console' | 'json' | 'file'
  filePath: string
  data: any
}

export default class CliHelper {
  public static getClient(props: GetClientProps): PublicClient | null {
    if (ChainMaps[props.chain]) {
      return createPublicClient({
        chain: ChainMaps[props.chain],
        transport: http(),
      })
    }

    return null
  }

  public static writeOutput(props: WriteOutputProps) {
    if (props.format === 'console') {
      console.log(props.data)
    } else if (props.format === 'json') {
      console.log(JSON.stringify(props.data))
    } else if (props.format === 'file') {
      fs.writeFileSync(props.filePath, JSON.stringify(props.data))
    }
  }
}
