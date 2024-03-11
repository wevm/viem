// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-4844.md#parameters

/** Blob limit per transaction. */
export const blobsPerTransaction = 2

/** The number of bytes in a BLS scalar field element. */
export const bytesPerFieldElement = 32

/** The number of field elements in a blob. */
export const fieldElementsPerBlob = 4096

/** The number of bytes in a blob. */
export const bytesPerBlob = bytesPerFieldElement * fieldElementsPerBlob

/** Blob bytes limit per transaction. */
export const maxBytesPerTransaction =
  bytesPerBlob * blobsPerTransaction -
  // terminator byte (0x80).
  1 -
  // zero byte (0x00) appended to each field element.
  1 * fieldElementsPerBlob * blobsPerTransaction
