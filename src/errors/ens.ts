import { BaseError } from './base.js'

export class EnsAvatarInvalidMetadataError extends BaseError {
  override name = 'EnsAvatarInvalidMetadataError'
  constructor({ data }: { data: any }) {
    super(
      'Unable to extract image from metadata. The metadata may be malformed or invalid.',
      {
        metaMessages: [
          '- Metadata must be a JSON object with at least an `image`, `image_url` or `image_data` property.',
          '',
          `Provided data: ${JSON.stringify(data)}`,
        ],
      },
    )
  }
}

export class EnsAvatarInvalidNftUriError extends BaseError {
  override name = 'EnsAvatarInvalidNftUriError'
  constructor({ reason }: { reason: string }) {
    super(`ENS NFT avatar URI is invalid. ${reason}`)
  }
}

export class EnsAvatarUriResolutionError extends BaseError {
  override name = 'EnsAvatarUriResolutionError'
  constructor({ uri }: { uri: string }) {
    super(
      `Unable to resolve ENS avatar URI "${uri}". The URI may be malformed, invalid, or does not respond with a valid image.`,
    )
  }
}

export class EnsAvatarUnsupportedNamespaceError extends BaseError {
  override name = 'EnsAvatarUnsupportedNamespaceError'
  constructor({ namespace }: { namespace: string }) {
    super(
      `ENS NFT avatar namespace "${namespace}" is not supported. Must be "erc721" or "erc1155".`,
    )
  }
}
