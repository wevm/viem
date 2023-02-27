import { Hex } from './misc'

declare module 'abitype' {
  export interface Config {
    BytesType: {
      inputs: Hex
      outputs: Hex
    }
  }
}
