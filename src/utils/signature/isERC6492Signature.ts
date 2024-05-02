const ERC6492_DETECTION_SUFFIX =
  '6492649264926492649264926492649264926492649264926492649264926492'

export function isERC6492Signature(signature: string): boolean {
  return (
    signature.slice(signature.length - 64, signature.length) ==
    ERC6492_DETECTION_SUFFIX
  )
}
