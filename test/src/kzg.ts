import * as cKzg from 'c-kzg'
import { mainnetTrustedSetupPath } from '~viem/node/trustedSetups.js'
import { setupKzg } from '~viem/utils/kzg/setupKzg.js'

export const kzg = setupKzg(cKzg, mainnetTrustedSetupPath)
