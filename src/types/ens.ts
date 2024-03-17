export type AssetGateway = 'ipfs' | 'arweave'

export type AssetGatewayUrls = {
  [_key in AssetGateway]?: string | undefined
}
