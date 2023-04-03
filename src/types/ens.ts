export type AssetGateway = 'ipfs' | 'arweave'

export type AssetGatewayUrls = {
  [key in AssetGateway]?: string
}
