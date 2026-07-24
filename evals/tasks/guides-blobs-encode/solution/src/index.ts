import { Blobs, Hex } from 'viem/utils'

export function encodeBlobs(options: encodeBlobs.Options): readonly Hex.Hex[] {
  return Blobs.from(Hex.fromString(options.value))
}

export declare namespace encodeBlobs {
  type Options = {
    value: string
  }
}

export function decodeBlobs(options: decodeBlobs.Options): string {
  return Hex.toString(Blobs.to(options.blobs))
}

export declare namespace decodeBlobs {
  type Options = {
    blobs: readonly Hex.Hex[]
  }
}
