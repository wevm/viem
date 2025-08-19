import { BaseError } from './base.js'

export type EnsAvatarInvalidMetadataErrorType =
  EnsAvatarInvalidMetadataError & {
    name: 'EnsAvatarInvalidMetadataError'
  }
export class EnsAvatarInvalidMetadataError extends BaseError {
  constructor({ data }: { data: any }) {
    super(
      'Unable to extract image from metadata. The metadata may be malformed or invalid.',
      {
        metaMessages: [
          '- Metadata must be a JSON object with at least an `image`, `image_url` or `image_data` property.',
          '',
          `Provided data: ${JSON.stringify(data)}`,
        ],
        name: 'EnsAvatarInvalidMetadataError',
      },
    )
  }
}

export type EnsAvatarInvalidNftUriErrorType = EnsAvatarInvalidNftUriError & {
  name: 'EnsAvatarInvalidNftUriError'
}
export class EnsAvatarInvalidNftUriError extends BaseError {
  constructor({ reason }: { reason: string }) {
    super(`ENS NFT avatar URI is invalid. ${reason}`, {
      name: 'EnsAvatarInvalidNftUriError',
    })
  }
}

export type EnsAvatarUriResolutionErrorType = EnsAvatarUriResolutionError & {
  name: 'EnsAvatarUriResolutionError'
}
export class EnsAvatarUriResolutionError extends BaseError {
  constructor({ uri }: { uri: string }) {
    super(
      `Unable to resolve ENS avatar URI "${uri}". The URI may be malformed, invalid, or does not respond with a valid image.`,
      { name: 'EnsAvatarUriResolutionError' },
    )
  }
}

export type EnsAvatarUnsupportedNamespaceErrorType =
  EnsAvatarUnsupportedNamespaceError & {
    name: 'EnsAvatarUnsupportedNamespaceError'
  }
export class EnsAvatarUnsupportedNamespaceError extends BaseError {
  constructor({ namespace }: { namespace: string }) {
    super(
      `ENS NFT avatar namespace "${namespace}" is not supported. Must be "erc721" or "erc1155".`,
      { name: 'EnsAvatarUnsupportedNamespaceError' },
    )
  }
}

export type EnsInvalidChainIdErrorType = EnsInvalidChainIdError & {
  name: 'EnsInvalidChainIdError'
}
export class EnsInvalidChainIdError extends BaseError {
  constructor({ chainId }: { chainId: number }) {
    super(
      `Invalid ENSIP-11 chainId: ${chainId}. Must be between 0 and 0x7fffffff, or 1.`,
      {
        name: 'EnsInvalidChainIdError',
      },
    )
  }
}
