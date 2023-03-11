import { expect, test } from 'vitest'

import { recoverAddress } from './recoverAddress'

test('recover address', () => {
  expect(
    recoverAddress(
      '0xb1ffabbf8c051d2e5ecee0b69621eec616823c3fd329974590ef274cb9d54220',
      '0x8fa097d37a750d083708f20fb59ee8f6c0531209346507c8daf14708421543721f9f38c556d2e06ed574bb8e89144c8c9973795c40b3f57abee8878c9b34d2b91c',
    ),
  ).toEqual('0xEB014f8c8B418Db6b45774c326A0E64C78914dC0')
  expect(
    recoverAddress(
      '0xb1ffabbf8c051d2e5ecee0b69621eec616823c3fd329974590ef274cb9d54220',
      '0xe58d39004996004b9519913a2aa01865dc5c5fdc38242dcffb35bdd9e609a8cd734042aded56b3a547bceee5459220a92c9444325d366cc12deefc25aca3886f1c',
    ),
  ).toEqual('0x81682879A8FB6C490CA9BF944F21662C67DB2B92')
})
