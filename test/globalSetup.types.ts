import * as attest from '@ark/attest'

export default async function () {
  return attest.setup({
    updateSnapshots: true,
  })
}
