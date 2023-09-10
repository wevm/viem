// Tree-shaking doesn't work well when we import from an index entrypoint. We don't
// want to bundle libs like `@noble/curves`, etc within the `/accounts` entrypoint
// as that will dramatically increase bundle size. So we export the modules directly.
export { parseAccount } from '../accounts/utils/parseAccount.js'
export { publicKeyToAddress } from '../accounts/utils/publicKeyToAddress.js'
