// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-4844.md#parameters

/** The number of bytes in a KZG commitment. */
export const bytesPerCommitment = 48

/** The number of bytes in a KZG proof. */
export const bytesPerProof = 48

/** The number of bytes in a BLS scalar field element. */
export const bytesPerFieldElement = 32

/** The number of field elements in a blob. */
export const fieldElementsPerBlob = 4096

/** The number of bytes in a blob. */
export const bytesPerBlob = bytesPerFieldElement * fieldElementsPerBlob

export const versionedHashVersionKzg = 1
