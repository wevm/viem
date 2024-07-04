import { WebSocket } from 'isows'
import { describe, expect, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { getBlockNumber } from '../../actions/public/getBlockNumber.js'
import { mine } from '../../actions/test/mine.js'

import type { RpcResponse } from '../../types/rpc.js'
import { numberToHex } from '../encoding/toHex.js'
import { wait } from '../wait.js'
import { getWebSocketRpcClient } from './webSocket.js'

const client = anvilMainnet.getClient()

describe('getWebSocketRpcClient', () => {
  test('creates WebSocket instance', async () => {
    const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
    expect(socketClient).toBeDefined()
    expect(socketClient.socket.readyState).toEqual(WebSocket.OPEN)
  })

  test('multiple invocations on a url only opens one socket', async () => {
    const url = 'ws://127.0.0.1:8545/69420'
    const [client1, client2, client3, client4] = await Promise.all([
      getWebSocketRpcClient(url),
      getWebSocketRpcClient(url),
      getWebSocketRpcClient(url),
      getWebSocketRpcClient(url),
    ])
    expect(client1).toEqual(client2)
    expect(client1).toEqual(client3)
    expect(client1).toEqual(client4)
  })
})

describe('request', () => {
  test('valid request', async () => {
    const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
    const { id, ...version } = await new Promise<any>((resolve) =>
      socketClient.request({
        body: { method: 'web3_clientVersion' },
        onResponse: resolve,
      }),
    )
    expect(id).toBeDefined()
    expect(version).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": "anvil/v0.2.0",
      }
    `)
    expect(socketClient.requests.size).toBe(0)
  })

  test('valid request', async () => {
    const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
    const { id, ...block } = await new Promise<any>((resolve) =>
      socketClient.request({
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(anvilMainnet.forkBlockNumber), false],
        },
        onResponse: resolve,
      }),
    )
    expect(id).toBeDefined()
    expect(block).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": {
          "baseFeePerGas": "0x12f449559",
          "blobGasUsed": "0x20000",
          "difficulty": "0x0",
          "excessBlobGas": "0x60000",
          "extraData": "0x6265617665726275696c642e6f7267",
          "gasLimit": "0x1c9c380",
          "gasUsed": "0xe68b5f",
          "hash": "0x33a7971472539aa0ffab0ee330347acd56ca7d2682bfbc80872110ee15e7d8f7",
          "logsBloom": "0x80a715cbad9a534e26a01218c885fc2384c7418ebb08610ce30b692726685230a8d1d4be7c512b1963d50bc3fa9b310512532f52ba86229ee000e6a941fab0a45026e41f4f8a4baa2993f06d4ce308fe84b4026b0b4f8cd4d6445240806750615ed8433dae4e24e01d4183978821ac9f00123297008a2648f269c41f7c98d1059a63ba6aa345d42410d70250213a65761258b78143d4709c100282df6a523a79bec1036e5814f9583cdb81c519d7b70016976e8ae1c98346091840262b154741d999907beade05423823ff7a09cd783c06cd621795d85112bf7ffc0620a1a0da5854e4897c2014ea02f596915c43902c9ca0532193797747712152267d0057cc",
          "miner": "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
          "mixHash": "0x0403c5067873bff3108703e127c63a2882509ee91006d921e2955c2420470958",
          "nonce": "0x0000000000000000",
          "number": "0x12e3ffa",
          "parentBeaconBlockRoot": "0xed1c13ebb84bf75b852cb3e703f8a7d7c8465a039ce058e2390ece725a54ca47",
          "parentHash": "0x72e938fa6ab225be2ce940db9aea7d670b50b3320b8deaeea1084ab645a1db81",
          "receiptsRoot": "0x649c9570fc198f14fa93c9b3fb0d7bda1f75a2a05761ffd832768841fc274aca",
          "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
          "size": "0x132bb",
          "stateRoot": "0xb821f1259927e7c699f2b06cd550d45e8cb322c06256f17ba36caaec33ae865e",
          "timestamp": "0x6638490b",
          "totalDifficulty": "0xc70d815d562d3cfa955",
          "transactions": [
            "0x12860ead0532b3a4f4aa5f8187d7d0365f6ae93764c8771ac13c6d38560033d6",
            "0xed513dcfd2a4f635bfaa476c78919cdd116090513e73ae6b369fa2012ee5a9b0",
            "0xc72e7c15c972b5e4e2ccde950691426dd5a725cb63fa2e9784df0f98bc4c1751",
            "0x258c636c6d237e14c081c57e7e49043cbc1c81dc7d0b9628ff2c7c6b9a3ffca8",
            "0x0800e07eafdb3c33bacd4511503110953d231342a7c29c88c3706b70210d3079",
            "0x7fb43c8bba50ffaa4e5b679e0bb55213d55def53e86524b50cd929d69d25a11a",
            "0xce5ae725bcf217588fea1f50a5e90b73be01be20a0c280a74992365b84a0e1dc",
            "0x39014032f86eb1c043ecf794e04b2a03127a41a1a65b3ab232705a7bf7ccd3d8",
            "0x54c8ed510339118a344942a487b46d8627c8627f35cd24efd924e5d39a0bbbaf",
            "0x10fe93d2263dd06a9ebf720b2987f07032fe3c4371c8f0c47f92969e19d638b1",
            "0x9126f9bc92a2abcd95c35916d45258490d9743a536fa98b7da0f6bd878aa40c3",
            "0xaf7690eb86ab1e3e0622454477b7048081ad555d398ec7d3ee7ea80e7b7136a5",
            "0x2812d7e89b861cb2b6654ae85728bf046ea1b651d558f984e22df08357958d46",
            "0x0351d36488fb798fd81d65de7adbaed0b3de372ecb1dcfb7722281d4595b27dc",
            "0xc5fa349a9fe36be632e9ee0da47cd1f585cee05027ac7d241a12ca7e59ac01c5",
            "0x9a2e22ac7b57614bc59d69f0cf6d8cd664e625a39b4bd3518fe02174fb36b53e",
            "0x40b80ab435c5d21ac7a8607cd19dd90bae1abfdd45727726a0027c0a6d0f0f40",
            "0x3caf97e1c0d81062c8047bdbac7c427e0c2b4a0bc6f860cc3892ec884444b9b0",
            "0x350bcf3893818beae014118a42a6666559d7ff21ee9824b88a287f0efd734627",
            "0x7588537e4c3f06d40e4efc1a495dbfbe042b6064b81104de82f5ef0987b64cdf",
            "0xbc20d73ee056c066705c7cbe3fea6eb1b7caea7b56ca53fc3298396f1fb70d57",
            "0x2f08911326a2c5c60a7f86ef99084d5b73d2393dfe00622f627459bcdbd62e10",
            "0xfb6055df069e04ae38c2d553f891d3ee6ab9eadec01d5fd8bf0c8b477c7c89af",
            "0xdf7a8624a9d3b9fd3cf65363243b9db1226199e2035cfc9188208f89d7e38cbc",
            "0xb986e24702b5a08144261a64a2e189f872edaaed979082d33f31069cbaf82420",
            "0x472adb3a051dc3dd82db424786c900dc1d87f3803d0ce6502bc709687114f98a",
            "0xdbc480aaba9b60b3b464adf78a4220446775490cabbc5952f1ec57318608a81f",
            "0x7b2770dbe042ad96bf6a91855b635e78c5d027f3798424356d3c45c3002cf499",
            "0x12459c7ce4a983588e168351f2206843a4b11eddda203fd3a6a2d4580f7d23bd",
            "0x9d8b25edb003dc088028133efe714ce235b1f6ee1768cdbd7ff69ada032d4a21",
            "0x370c36c4292fe4d437618e4a045c6fb2c6bc22621411f40ebfb82fcfa2f7b9e0",
            "0x8145af3796c4964e5a6ff964de8ab23b615112ca280ea7beea97753b6c849280",
            "0xefc0bfa3a0c44ef04d36335054a41ede3cc507c759be41a1cfe83b18f5fd129c",
            "0xc79e7863bb792590dd0b3c4622a180bf70f767591eacaad48a0af10930332679",
            "0xf47931c3a313968e1cd137b5067ad1b90c54bccc2ce16ca01318bacada4b4a31",
            "0xd54f767e01c4267be2c0fbe8db9e4d845fda4cb113a3899ada4289480dd5f859",
            "0x2cd97e83ebbd33bc8d7d2d39aa9cdcec1ac261bab1702548ede4ebead14c47e8",
            "0x80c0d28d0ccf69dca51d263e0a4107c8a554c40dfcb207c1eb2c95a07618a5ac",
            "0xe5033b68abcf549b32ca59903c655e12007d96e8dbd53e37d2ee00501d2b7de1",
            "0x4ad9f131b26daf8424a72a58ffdb82014eefdcf4ac1473f504777dab84b87535",
            "0xaca6f6a0a1f94e265d31be0ec2d6b5f7da27e6df40595b067c71ac65eac50e94",
            "0x1d356bf7c11ab24a8b6c51b38b1f822e2deed2c9dc4bba515bfd46e27b20d5ba",
            "0xe58b2851229cfd243981f0e3a10a6b1dc7a9df7e2a5afae1f0e61505e960375c",
            "0x931c4dacb13e711a8578f02df6df51a381cfb05fa81da5f766638952910a3286",
            "0xb199838a7add300d484e03f452a09c7cdb0afb0e7c67e5884367b9c8a674d182",
            "0x2110462201aee32e8d9ddb5c9dd9513592ffde32382da1aabf007630ccf77ea1",
            "0xf5ac56284d6d4aa75fa67ccfc58a5658d2cae41d01f412cdab962e91276e06a0",
            "0x4ec6f73e1245c247ff6868795b7f0b6789f6a9342c8580b7f9a80d34c3959c6b",
            "0xcf77dbfe46f7c12dd9f8042e4b86e7c28a519f1a833cc30f4b581418a3440103",
            "0xd4ad311394d0d0a06be4bb32f85ee6f5f6b5f2a688b252e4fb89c3dc374b8bd6",
            "0x5f998e622a5ecdd34ac52e89cac0e8959e734a4afb850c18b7829a4c1c30fde6",
            "0xac150958348194a84cf894631ecca299cc1ba46b92d36222906f1695d45ff127",
            "0x029101258e3a0d66780f2ec8a6c74e93f1f574466af72a771bf4452ed4a36f58",
            "0x9d986ebbcfae4e31be2aa5fa5c7f2fcd7f0856ca6521a7e397b7a2bbc48d8ba4",
            "0xc39c67e7efb378137a47dec994ac018f3b9674a1fd0dcb2c8d39ed41c8655206",
            "0x9a416e3dd237f7f9b5c696197f18a53390f52fe2971658f284704167365c9e35",
            "0xe9305e739cf066fd8e1468dd25f460db18f33b8ea171c95a9c424c5aa7e3c235",
            "0x8832a517ca2deb2a66b5e0681fe0c85c5c1af12aeb94d50b531a264ae1eb9e33",
            "0xa9f74c7b27928f1e4b6344889e22939409d07a602619b62903c5776120e0a558",
            "0xa10590ec01af9f837be9d6b3ad688acbdbbb3fc8b03bc2cfd9248ba20c6c64ea",
            "0x4ed77d7ad8b1ac8fdf1bab5e03a8d8c73687b8a7788b8040a0c1bdce2931f0d4",
            "0x406705bbec19171a8d5699522732698255b122a495bb4141e2c11605972495f5",
            "0x0847427ddcdae27ed2029ecfc9a0fd27cdd919c5648ae715b8c25f336a3f92d4",
            "0x6256806522d5dfd39f9a7fd8a2aef44c73a555c24a3fac6ab1570771e641a05e",
            "0xfe1a5fa2b637212e86d593b3d7ae041babad31b866d054e901f2ff33c468e418",
            "0x6a9576201f7c85a2c327581f30702e94d2a350caef89c8400d9569aa91951bfe",
            "0x5f77b63367a427cc620ca5e3a660b1dde2beb5ca98e56adfd55a4861ae14e1b5",
            "0xe31b66b16d8a41d32dc6f422502bdee12bc747d9314b1856b4b4bc9cb3dd9403",
            "0x3531698211550e8674966e596c678f8953e58b304ed7811c4fe663b7b9c7cffd",
            "0xeb2c5a76791d6ff1c11bf730253658f51daeb00906e394b47aea835c9fdba77b",
            "0x86d1ddc92753c1c1f0302a690d2063c6e0dfd2d6862c592274fd7905efa49eec",
            "0xfc574ead986bf97b1f8a2f238d88727f3d4a72046c63f83290fb37dba3201b5c",
            "0x325936f0be7ea6043238e77bd1bdeabccd759967879908fd627f72727518931e",
            "0x20364ae1ea8b9801894ffe225d7d976f80e7362dab1f5a7130d25243b8889eec",
            "0x279735ea4729dc90a118266648a2feebce7ca64cb1afa9545e19ea13da0cf83b",
            "0x0fa0f631fd043dacfc8d46a5928abeecad3f78364b82e7186c60875837bdbbbd",
            "0x4bc7e1074376aa78335f8b4b8f62e9292cace9dae0aed6d26a203a03cddd4109",
            "0x775e28757ae6e072cd3b81d85e4de4bc924b69341585ffa644898fd954808aa0",
            "0xd08f902819d47dd5b7d2d34273aea34562d7d3e6e696087625a6654055ef655f",
            "0x4f11a66edea360f5f27f462a11f93d817cee7a870c9449814f96dbd155cc5bc8",
            "0xbc4798ebf06e8de6f41f3266e38eba95c4fb1a26476bb1e33029d8cdb7036a24",
            "0x4b1cf02ef289636671481e8364afc84bc79cc1f196c75d59bcd8e6442190e9e3",
            "0x08e9a2c505d6975f87dbb3fd680a748bc3a10894a6c05d045d7cead1311daa50",
            "0x9c18c613880668be568156190381fc36662369e49e8a436243eaaeeb5caf42b0",
            "0xe935bd3ef799f26b7efcb0796fcd6762aa2736b6241a5ddd4de90ff9acb5600a",
            "0xa2dac6abd420580dbe113c0c64190f731519f3ad51f37426c377022aeb9ddc44",
            "0x3b20edf7281bf115eea7287643f68ddf70b464baa26ab493e906a8b4cc0bd183",
            "0x6bba175b959f2af9fe4d89a92e55e259ee7ca98207739ff9e86ddf8f1a90fc75",
            "0xcc34030e9d69b6f7813ee9647cde4ab4bd23fb3c4cd76dd1d3b0a9b5b72b124d",
            "0xaf28bbd7c9eea390ecf90b0ba6cd7074bbfd202956b80a411a72a29bf1d0a065",
            "0x8126d643814b5d013674ead269132aa4b223074afcd406ad0d7ca07d598b3e52",
            "0x781de3d23e65f4f7369b07795ad1f1237b53d8f054a2d58aa24eadb7e42ee07d",
            "0xd01c2a8c4020ac9faced0d25476622ea82030ffeeb7c69ffeec6004827c70f07",
            "0x133d37de851fbbc8f6496519012e4ae17d60e3ac58c8987d4de3142161b8dc6b",
            "0xcd21c5e94e1362390688c541be600a53f318a299e7fba155fe032e61a85c87db",
            "0x1a03c128b6b6a4348f56ebf4076f5c051ecd22f0c3534216fb02b1bc33a0602c",
            "0xbb486632d0c2fb6fab0a17a0b39258695f9a178f5e27e9a72c36df76cc1263d8",
            "0xa59bb99d7c0becdc070c02ea453409dda451b5e6c66ca42a081d01607691c68e",
            "0x6b8701f8bf6a5bf853cfe765d5d86153cecbbd46c41e6afb81d26d1e79031cfe",
            "0x8399c2f547d7abfb99dbc586250134b57e46577f7a2e55e9c7c2618e56239292",
            "0xd37d12d8518dc02e8b3cbb5fa0b59f56fe6c0a70805c755ffff6b74edfcae2f4",
            "0x765ea9c689e67f4f773e4058a2fea01edf70da6db50064507e684877394aa502",
            "0x89675014845e26847ef059d21ea4af749975a7ec3f4a6976e6c6e8c53b0b145c",
            "0x2ffd985bbae3b9ff11f8451b8bb19515a449115abdfab09474515d1cdc5ce124",
            "0xc6c58abde0a22e572bf6e16180dc968f02dc3afa3d15d0aa8f4215e42f757a62",
            "0x37b84f52321c2d4c81efec686237f125b770a2a3c103a684d63ed590e90431b7",
            "0x3706bc60b4a99c01097c06f39512247448abdb0d15f5f609220811da018ae17e",
            "0x7d2eab2fec674e1c7e370eeb167ecb74029c0a232f1235e845963fc7d3dda954",
            "0xd4c6ab4c94c53e5aadfee12542526d55630690ee7e8402a5c992a000950be6fb",
            "0x3d0517ea747fc46a1af3e8bd66a5e9c1baec849a3e8d6ec8c0cfe065a42cccf3",
            "0xcfd5693a2101852aec988e057da93871f453f758cecdd38b9194652dbd9b9c25",
            "0xc097c97e4acc5360de98e4d72af55333c05d154eac3424059e7848d32013e025",
            "0x7527429baf457ba3644188a75a109960ae0d845449386ad4aa8e5581cd7b1a41",
            "0x061e3b2a4c0cd6490993ea94fd4e7563d362585af12bb3458952b752426886ce",
            "0xf9af3398ad3edde0ca7f4603e5851d302f39b617e4aa1eb3568392bf5144bcf4",
            "0x7f478c943917b27a3441d42ddce13838efe3926ed6ca87e812be441501b37016",
            "0x94f5ebf04e6d04d89dca2643daa02439833b153460d3f33de578047d0f04ff8e",
            "0x2e03c81dc609ccbf0e91b6b67b79f3088028b736679de46f51caafbc9dd6a488",
            "0xfc6472d85609fbbb6ac8dec4bf069f51d3a96f59f163738e38724aefcb5d9423",
            "0xf70cfd8d0721b13b8e75c8aa24e6fa984576b1916fa14edc932fc8f53132d9df",
            "0xbf6190304df41dafe26113b37dc45a9812ccfe9ee40a1dfb97bf85e71c5e9829",
            "0xa59cffc13207fe46b3c41ff728f3e1fe8172492854208ed6ee34485a4a452638",
            "0xa0447569ee667995ccdf4edbe77abbb9e499741b7d084928a2cd4fec010ae3af",
            "0x38de793ad609ad9774dc298e1b3050eb022858125e22640ac6f4ba4713004320",
            "0xd83b345b4a6cc0ce214d987ba4a39d2f981ee7e54bba697138cb9a2e3f354a31",
            "0xc58657f3919410d504d0b3e16cd8baa1a38a2405b490a288eb64635c86038848",
            "0xf49b53d2c68f855bbb828109d66cf75952fa16d6d21a6aa8fe04cba4ae54e91a",
            "0x98559bbb58decddbfddb8f074e4e681fda52ee5e41d9b230af4ad054c6b05448",
            "0x0cda4b71587108b814822df6e4ee65e466716c634c5a080c87bb9c92d0a01304",
            "0xb5dc2541610f061f46d81ad092e7222a85bc6d208044b8d57ba2381334901536",
            "0x6de7c83368dacd692c865fb42fcca63ade071e98717cb62424bdd256f1368d26",
            "0xc553a57130c5877337bbae3150b497fff994a1150494911659c1fca1cc8aabd6",
            "0x9fa1899b30b6da8079838aa0b597ed5a48a1182006b28053babafab8ac3b796d",
            "0x545d5046aa19ce6f402e93bd77d0c29f9ae58f07856ace50e91e9fdcb15b0bee",
            "0x6a8698facdbed4b6659ad745fd4eb434bc129cecaffad99c3f08f4d688b1df02",
            "0xeb1269ed5c9a4945c0725be8b986212057a19bf9127c8252949270a3e1996f1a",
            "0xf4792b8be1496300e500d7a702b4ae2824c14d5f438604fdfe94388867c7c9c5",
            "0x64c6a2e4cea7d4784d12677704549df5bb8b27ebeabe41891781b9a641430848",
            "0x45bda137a2426603437ad1e393bfc93855c84c9eb116299640f842ae15beb46a",
            "0x77374a47adc133e93d9661b8ce8e672a343cd5a2b2a079034de69211a0ab0893",
          ],
          "transactionsRoot": "0x17429d391ba2a1d033a60a9bdb2899a1c06e25747fcb4c9bc8476c3c72cc357a",
          "uncles": [],
          "withdrawals": [
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11b7ed9",
              "index": "0x2a5128b",
              "validatorIndex": "0x4e940",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11b37eb",
              "index": "0x2a5128c",
              "validatorIndex": "0x4e941",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x1c7ee99",
              "index": "0x2a5128d",
              "validatorIndex": "0x4e942",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11aab91",
              "index": "0x2a5128e",
              "validatorIndex": "0x4e943",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11a6e72",
              "index": "0x2a5128f",
              "validatorIndex": "0x4e944",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11b2baf",
              "index": "0x2a51290",
              "validatorIndex": "0x4e945",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11bd042",
              "index": "0x2a51291",
              "validatorIndex": "0x4e946",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11a9593",
              "index": "0x2a51292",
              "validatorIndex": "0x4e947",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11ad611",
              "index": "0x2a51293",
              "validatorIndex": "0x4e948",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11b8446",
              "index": "0x2a51294",
              "validatorIndex": "0x4e949",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x119349e",
              "index": "0x2a51295",
              "validatorIndex": "0x4e94a",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11ad839",
              "index": "0x2a51296",
              "validatorIndex": "0x4e94b",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11a9715",
              "index": "0x2a51297",
              "validatorIndex": "0x4e94c",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11b820b",
              "index": "0x2a51298",
              "validatorIndex": "0x4e94d",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11aad2b",
              "index": "0x2a51299",
              "validatorIndex": "0x4e94e",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11b090a",
              "index": "0x2a5129a",
              "validatorIndex": "0x4e94f",
            },
          ],
          "withdrawalsRoot": "0x158cc8e8a444e3f70658da20714882c73b2c8932eb09b691271da474471d137b",
        },
      }
    `)
    expect(socketClient.requests.size).toBe(0)
  })

  test('invalid request', async () => {
    const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
    await expect(
      new Promise<any>((resolve, reject) =>
        socketClient.request({
          body: {
            method: 'wagmi_lol',
          },
          onError: reject,
          onResponse: resolve,
        }),
      ),
    ).resolves.toMatchInlineSnapshot(
      `
      {
        "error": {
          "code": -32602,
          "message": "data did not match any variant of untagged enum EthRpcCall",
        },
        "id": 7,
        "jsonrpc": "2.0",
      }
    `,
    )
    expect(socketClient.requests.size).toBe(0)
  })

  test('invalid request (closing socket)', async () => {
    const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
    await wait(1000)
    socketClient.close()
    await expect(
      () =>
        new Promise<any>((resolve, reject) =>
          socketClient.request({
            body: {
              method: 'wagmi_lol',
            },
            onError: reject,
            onResponse: resolve,
          }),
        ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [WebSocketRequestError: WebSocket request failed.

      URL: http://localhost
      Request body: {"jsonrpc":"2.0","id":9,"method":"wagmi_lol"}

      Details: Socket is closed.
      Version: viem@x.y.z]
    `,
    )
    await wait(100)
  })

  test('invalid request (closed socket)', async () => {
    const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
    socketClient.close()
    await wait(1000)
    await expect(
      () =>
        new Promise<any>((resolve, reject) =>
          socketClient.request({
            body: {
              method: 'wagmi_lol',
            },
            onError: reject,
            onResponse: resolve,
          }),
        ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [WebSocketRequestError: WebSocket request failed.

      URL: http://localhost
      Request body: {"jsonrpc":"2.0","id":11,"method":"wagmi_lol"}

      Details: Socket is closed.
      Version: viem@x.y.z]
    `,
    )
  })
})

describe('request (subscription)', () => {
  test('basic', async () => {
    const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
    const data_: RpcResponse[] = []
    socketClient.request({
      body: {
        method: 'eth_subscribe',
        params: ['newHeads'],
      },
      onResponse: (data) => data_.push(data),
    })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    expect(socketClient.subscriptions.size).toBe(1)
    expect(data_.length).toBe(3)
    await socketClient.requestAsync({
      body: {
        method: 'eth_unsubscribe',
        params: [(data_[0] as any).result],
      },
    })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    expect(socketClient.subscriptions.size).toBe(0)
    expect(data_.length).toBe(3)
  })

  test('multiple', async () => {
    const socketClient = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
    const s1: RpcResponse[] = []
    socketClient.request({
      body: {
        method: 'eth_subscribe',
        params: ['newHeads'],
      },
      onResponse: (data) => s1.push(data),
    })
    const s2: RpcResponse[] = []
    socketClient.request({
      body: {
        method: 'eth_subscribe',
        params: ['newHeads'],
      },
      onResponse: (data) => s2.push(data),
    })
    const s3: RpcResponse[] = []
    socketClient.request({
      body: {
        method: 'eth_subscribe',
        params: ['newPendingTransactions'],
      },
      onResponse: (data) => s3.push(data),
    })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    expect(socketClient.requests.size).toBe(0)
    expect(socketClient.subscriptions.size).toBe(3)
    expect(s1.length).toBe(3)
    expect(s2.length).toBe(3)
    expect(s3.length).toBe(1)
    await socketClient.requestAsync({
      body: {
        method: 'eth_unsubscribe',
        params: [(s1[0] as any).result],
      },
    })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    await mine(client, { blocks: 1 })
    await wait(100)
    expect(socketClient.requests.size).toBe(0)
    expect(socketClient.subscriptions.size).toBe(2)
    expect(s1.length).toBe(3)
    expect(s2.length).toBe(5)
    expect(s3.length).toBe(1)
    await socketClient.requestAsync({
      body: {
        method: 'eth_unsubscribe',
        params: [(s2[0] as any).result],
      },
    })
    await socketClient.requestAsync({
      body: {
        method: 'eth_unsubscribe',
        params: [(s3[0] as any).result],
      },
    })
    await wait(2000)
    expect(socketClient.requests.size).toBe(0)
    expect(socketClient.subscriptions.size).toBe(0)
    expect(s1.length).toBe(3)
    expect(s2.length).toBe(5)
    expect(s3.length).toBe(1)
  })

  test('invalid subscription', async () => {
    const client = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
    let err_: RpcResponse | undefined
    client.request({
      body: {
        method: 'eth_subscribe',
        params: ['fakeHeadz'],
      },
      onResponse: (err) => (err_ = err),
    })
    await wait(500)
    expect(client.requests.size).toBe(0)
    expect(client.subscriptions.size).toBe(0)
    expect(err_).toMatchInlineSnapshot(`
      {
        "error": {
          "code": -32602,
          "message": "data did not match any variant of untagged enum EthRpcCall",
        },
        "id": 31,
        "jsonrpc": "2.0",
      }
    `)
  })
})

describe('requestAsync', () => {
  test('valid request', async () => {
    const client = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
    const { id, ...version } = await client.requestAsync({
      body: { method: 'web3_clientVersion' },
    })
    expect(id).toBeDefined()
    expect(version).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": "anvil/v0.2.0",
      }
    `)
    expect(client.requests.size).toBe(0)
  })

  test('valid request', async () => {
    const client = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
    const { id, ...block } = await client.requestAsync({
      body: {
        method: 'eth_getBlockByNumber',
        params: [numberToHex(anvilMainnet.forkBlockNumber), false],
      },
    })
    expect(id).toBeDefined()
    expect(block).toMatchInlineSnapshot(`
      {
        "jsonrpc": "2.0",
        "result": {
          "baseFeePerGas": "0x12f449559",
          "blobGasUsed": "0x20000",
          "difficulty": "0x0",
          "excessBlobGas": "0x60000",
          "extraData": "0x6265617665726275696c642e6f7267",
          "gasLimit": "0x1c9c380",
          "gasUsed": "0xe68b5f",
          "hash": "0x33a7971472539aa0ffab0ee330347acd56ca7d2682bfbc80872110ee15e7d8f7",
          "logsBloom": "0x80a715cbad9a534e26a01218c885fc2384c7418ebb08610ce30b692726685230a8d1d4be7c512b1963d50bc3fa9b310512532f52ba86229ee000e6a941fab0a45026e41f4f8a4baa2993f06d4ce308fe84b4026b0b4f8cd4d6445240806750615ed8433dae4e24e01d4183978821ac9f00123297008a2648f269c41f7c98d1059a63ba6aa345d42410d70250213a65761258b78143d4709c100282df6a523a79bec1036e5814f9583cdb81c519d7b70016976e8ae1c98346091840262b154741d999907beade05423823ff7a09cd783c06cd621795d85112bf7ffc0620a1a0da5854e4897c2014ea02f596915c43902c9ca0532193797747712152267d0057cc",
          "miner": "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
          "mixHash": "0x0403c5067873bff3108703e127c63a2882509ee91006d921e2955c2420470958",
          "nonce": "0x0000000000000000",
          "number": "0x12e3ffa",
          "parentBeaconBlockRoot": "0xed1c13ebb84bf75b852cb3e703f8a7d7c8465a039ce058e2390ece725a54ca47",
          "parentHash": "0x72e938fa6ab225be2ce940db9aea7d670b50b3320b8deaeea1084ab645a1db81",
          "receiptsRoot": "0x649c9570fc198f14fa93c9b3fb0d7bda1f75a2a05761ffd832768841fc274aca",
          "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
          "size": "0x132bb",
          "stateRoot": "0xb821f1259927e7c699f2b06cd550d45e8cb322c06256f17ba36caaec33ae865e",
          "timestamp": "0x6638490b",
          "totalDifficulty": "0xc70d815d562d3cfa955",
          "transactions": [
            "0x12860ead0532b3a4f4aa5f8187d7d0365f6ae93764c8771ac13c6d38560033d6",
            "0xed513dcfd2a4f635bfaa476c78919cdd116090513e73ae6b369fa2012ee5a9b0",
            "0xc72e7c15c972b5e4e2ccde950691426dd5a725cb63fa2e9784df0f98bc4c1751",
            "0x258c636c6d237e14c081c57e7e49043cbc1c81dc7d0b9628ff2c7c6b9a3ffca8",
            "0x0800e07eafdb3c33bacd4511503110953d231342a7c29c88c3706b70210d3079",
            "0x7fb43c8bba50ffaa4e5b679e0bb55213d55def53e86524b50cd929d69d25a11a",
            "0xce5ae725bcf217588fea1f50a5e90b73be01be20a0c280a74992365b84a0e1dc",
            "0x39014032f86eb1c043ecf794e04b2a03127a41a1a65b3ab232705a7bf7ccd3d8",
            "0x54c8ed510339118a344942a487b46d8627c8627f35cd24efd924e5d39a0bbbaf",
            "0x10fe93d2263dd06a9ebf720b2987f07032fe3c4371c8f0c47f92969e19d638b1",
            "0x9126f9bc92a2abcd95c35916d45258490d9743a536fa98b7da0f6bd878aa40c3",
            "0xaf7690eb86ab1e3e0622454477b7048081ad555d398ec7d3ee7ea80e7b7136a5",
            "0x2812d7e89b861cb2b6654ae85728bf046ea1b651d558f984e22df08357958d46",
            "0x0351d36488fb798fd81d65de7adbaed0b3de372ecb1dcfb7722281d4595b27dc",
            "0xc5fa349a9fe36be632e9ee0da47cd1f585cee05027ac7d241a12ca7e59ac01c5",
            "0x9a2e22ac7b57614bc59d69f0cf6d8cd664e625a39b4bd3518fe02174fb36b53e",
            "0x40b80ab435c5d21ac7a8607cd19dd90bae1abfdd45727726a0027c0a6d0f0f40",
            "0x3caf97e1c0d81062c8047bdbac7c427e0c2b4a0bc6f860cc3892ec884444b9b0",
            "0x350bcf3893818beae014118a42a6666559d7ff21ee9824b88a287f0efd734627",
            "0x7588537e4c3f06d40e4efc1a495dbfbe042b6064b81104de82f5ef0987b64cdf",
            "0xbc20d73ee056c066705c7cbe3fea6eb1b7caea7b56ca53fc3298396f1fb70d57",
            "0x2f08911326a2c5c60a7f86ef99084d5b73d2393dfe00622f627459bcdbd62e10",
            "0xfb6055df069e04ae38c2d553f891d3ee6ab9eadec01d5fd8bf0c8b477c7c89af",
            "0xdf7a8624a9d3b9fd3cf65363243b9db1226199e2035cfc9188208f89d7e38cbc",
            "0xb986e24702b5a08144261a64a2e189f872edaaed979082d33f31069cbaf82420",
            "0x472adb3a051dc3dd82db424786c900dc1d87f3803d0ce6502bc709687114f98a",
            "0xdbc480aaba9b60b3b464adf78a4220446775490cabbc5952f1ec57318608a81f",
            "0x7b2770dbe042ad96bf6a91855b635e78c5d027f3798424356d3c45c3002cf499",
            "0x12459c7ce4a983588e168351f2206843a4b11eddda203fd3a6a2d4580f7d23bd",
            "0x9d8b25edb003dc088028133efe714ce235b1f6ee1768cdbd7ff69ada032d4a21",
            "0x370c36c4292fe4d437618e4a045c6fb2c6bc22621411f40ebfb82fcfa2f7b9e0",
            "0x8145af3796c4964e5a6ff964de8ab23b615112ca280ea7beea97753b6c849280",
            "0xefc0bfa3a0c44ef04d36335054a41ede3cc507c759be41a1cfe83b18f5fd129c",
            "0xc79e7863bb792590dd0b3c4622a180bf70f767591eacaad48a0af10930332679",
            "0xf47931c3a313968e1cd137b5067ad1b90c54bccc2ce16ca01318bacada4b4a31",
            "0xd54f767e01c4267be2c0fbe8db9e4d845fda4cb113a3899ada4289480dd5f859",
            "0x2cd97e83ebbd33bc8d7d2d39aa9cdcec1ac261bab1702548ede4ebead14c47e8",
            "0x80c0d28d0ccf69dca51d263e0a4107c8a554c40dfcb207c1eb2c95a07618a5ac",
            "0xe5033b68abcf549b32ca59903c655e12007d96e8dbd53e37d2ee00501d2b7de1",
            "0x4ad9f131b26daf8424a72a58ffdb82014eefdcf4ac1473f504777dab84b87535",
            "0xaca6f6a0a1f94e265d31be0ec2d6b5f7da27e6df40595b067c71ac65eac50e94",
            "0x1d356bf7c11ab24a8b6c51b38b1f822e2deed2c9dc4bba515bfd46e27b20d5ba",
            "0xe58b2851229cfd243981f0e3a10a6b1dc7a9df7e2a5afae1f0e61505e960375c",
            "0x931c4dacb13e711a8578f02df6df51a381cfb05fa81da5f766638952910a3286",
            "0xb199838a7add300d484e03f452a09c7cdb0afb0e7c67e5884367b9c8a674d182",
            "0x2110462201aee32e8d9ddb5c9dd9513592ffde32382da1aabf007630ccf77ea1",
            "0xf5ac56284d6d4aa75fa67ccfc58a5658d2cae41d01f412cdab962e91276e06a0",
            "0x4ec6f73e1245c247ff6868795b7f0b6789f6a9342c8580b7f9a80d34c3959c6b",
            "0xcf77dbfe46f7c12dd9f8042e4b86e7c28a519f1a833cc30f4b581418a3440103",
            "0xd4ad311394d0d0a06be4bb32f85ee6f5f6b5f2a688b252e4fb89c3dc374b8bd6",
            "0x5f998e622a5ecdd34ac52e89cac0e8959e734a4afb850c18b7829a4c1c30fde6",
            "0xac150958348194a84cf894631ecca299cc1ba46b92d36222906f1695d45ff127",
            "0x029101258e3a0d66780f2ec8a6c74e93f1f574466af72a771bf4452ed4a36f58",
            "0x9d986ebbcfae4e31be2aa5fa5c7f2fcd7f0856ca6521a7e397b7a2bbc48d8ba4",
            "0xc39c67e7efb378137a47dec994ac018f3b9674a1fd0dcb2c8d39ed41c8655206",
            "0x9a416e3dd237f7f9b5c696197f18a53390f52fe2971658f284704167365c9e35",
            "0xe9305e739cf066fd8e1468dd25f460db18f33b8ea171c95a9c424c5aa7e3c235",
            "0x8832a517ca2deb2a66b5e0681fe0c85c5c1af12aeb94d50b531a264ae1eb9e33",
            "0xa9f74c7b27928f1e4b6344889e22939409d07a602619b62903c5776120e0a558",
            "0xa10590ec01af9f837be9d6b3ad688acbdbbb3fc8b03bc2cfd9248ba20c6c64ea",
            "0x4ed77d7ad8b1ac8fdf1bab5e03a8d8c73687b8a7788b8040a0c1bdce2931f0d4",
            "0x406705bbec19171a8d5699522732698255b122a495bb4141e2c11605972495f5",
            "0x0847427ddcdae27ed2029ecfc9a0fd27cdd919c5648ae715b8c25f336a3f92d4",
            "0x6256806522d5dfd39f9a7fd8a2aef44c73a555c24a3fac6ab1570771e641a05e",
            "0xfe1a5fa2b637212e86d593b3d7ae041babad31b866d054e901f2ff33c468e418",
            "0x6a9576201f7c85a2c327581f30702e94d2a350caef89c8400d9569aa91951bfe",
            "0x5f77b63367a427cc620ca5e3a660b1dde2beb5ca98e56adfd55a4861ae14e1b5",
            "0xe31b66b16d8a41d32dc6f422502bdee12bc747d9314b1856b4b4bc9cb3dd9403",
            "0x3531698211550e8674966e596c678f8953e58b304ed7811c4fe663b7b9c7cffd",
            "0xeb2c5a76791d6ff1c11bf730253658f51daeb00906e394b47aea835c9fdba77b",
            "0x86d1ddc92753c1c1f0302a690d2063c6e0dfd2d6862c592274fd7905efa49eec",
            "0xfc574ead986bf97b1f8a2f238d88727f3d4a72046c63f83290fb37dba3201b5c",
            "0x325936f0be7ea6043238e77bd1bdeabccd759967879908fd627f72727518931e",
            "0x20364ae1ea8b9801894ffe225d7d976f80e7362dab1f5a7130d25243b8889eec",
            "0x279735ea4729dc90a118266648a2feebce7ca64cb1afa9545e19ea13da0cf83b",
            "0x0fa0f631fd043dacfc8d46a5928abeecad3f78364b82e7186c60875837bdbbbd",
            "0x4bc7e1074376aa78335f8b4b8f62e9292cace9dae0aed6d26a203a03cddd4109",
            "0x775e28757ae6e072cd3b81d85e4de4bc924b69341585ffa644898fd954808aa0",
            "0xd08f902819d47dd5b7d2d34273aea34562d7d3e6e696087625a6654055ef655f",
            "0x4f11a66edea360f5f27f462a11f93d817cee7a870c9449814f96dbd155cc5bc8",
            "0xbc4798ebf06e8de6f41f3266e38eba95c4fb1a26476bb1e33029d8cdb7036a24",
            "0x4b1cf02ef289636671481e8364afc84bc79cc1f196c75d59bcd8e6442190e9e3",
            "0x08e9a2c505d6975f87dbb3fd680a748bc3a10894a6c05d045d7cead1311daa50",
            "0x9c18c613880668be568156190381fc36662369e49e8a436243eaaeeb5caf42b0",
            "0xe935bd3ef799f26b7efcb0796fcd6762aa2736b6241a5ddd4de90ff9acb5600a",
            "0xa2dac6abd420580dbe113c0c64190f731519f3ad51f37426c377022aeb9ddc44",
            "0x3b20edf7281bf115eea7287643f68ddf70b464baa26ab493e906a8b4cc0bd183",
            "0x6bba175b959f2af9fe4d89a92e55e259ee7ca98207739ff9e86ddf8f1a90fc75",
            "0xcc34030e9d69b6f7813ee9647cde4ab4bd23fb3c4cd76dd1d3b0a9b5b72b124d",
            "0xaf28bbd7c9eea390ecf90b0ba6cd7074bbfd202956b80a411a72a29bf1d0a065",
            "0x8126d643814b5d013674ead269132aa4b223074afcd406ad0d7ca07d598b3e52",
            "0x781de3d23e65f4f7369b07795ad1f1237b53d8f054a2d58aa24eadb7e42ee07d",
            "0xd01c2a8c4020ac9faced0d25476622ea82030ffeeb7c69ffeec6004827c70f07",
            "0x133d37de851fbbc8f6496519012e4ae17d60e3ac58c8987d4de3142161b8dc6b",
            "0xcd21c5e94e1362390688c541be600a53f318a299e7fba155fe032e61a85c87db",
            "0x1a03c128b6b6a4348f56ebf4076f5c051ecd22f0c3534216fb02b1bc33a0602c",
            "0xbb486632d0c2fb6fab0a17a0b39258695f9a178f5e27e9a72c36df76cc1263d8",
            "0xa59bb99d7c0becdc070c02ea453409dda451b5e6c66ca42a081d01607691c68e",
            "0x6b8701f8bf6a5bf853cfe765d5d86153cecbbd46c41e6afb81d26d1e79031cfe",
            "0x8399c2f547d7abfb99dbc586250134b57e46577f7a2e55e9c7c2618e56239292",
            "0xd37d12d8518dc02e8b3cbb5fa0b59f56fe6c0a70805c755ffff6b74edfcae2f4",
            "0x765ea9c689e67f4f773e4058a2fea01edf70da6db50064507e684877394aa502",
            "0x89675014845e26847ef059d21ea4af749975a7ec3f4a6976e6c6e8c53b0b145c",
            "0x2ffd985bbae3b9ff11f8451b8bb19515a449115abdfab09474515d1cdc5ce124",
            "0xc6c58abde0a22e572bf6e16180dc968f02dc3afa3d15d0aa8f4215e42f757a62",
            "0x37b84f52321c2d4c81efec686237f125b770a2a3c103a684d63ed590e90431b7",
            "0x3706bc60b4a99c01097c06f39512247448abdb0d15f5f609220811da018ae17e",
            "0x7d2eab2fec674e1c7e370eeb167ecb74029c0a232f1235e845963fc7d3dda954",
            "0xd4c6ab4c94c53e5aadfee12542526d55630690ee7e8402a5c992a000950be6fb",
            "0x3d0517ea747fc46a1af3e8bd66a5e9c1baec849a3e8d6ec8c0cfe065a42cccf3",
            "0xcfd5693a2101852aec988e057da93871f453f758cecdd38b9194652dbd9b9c25",
            "0xc097c97e4acc5360de98e4d72af55333c05d154eac3424059e7848d32013e025",
            "0x7527429baf457ba3644188a75a109960ae0d845449386ad4aa8e5581cd7b1a41",
            "0x061e3b2a4c0cd6490993ea94fd4e7563d362585af12bb3458952b752426886ce",
            "0xf9af3398ad3edde0ca7f4603e5851d302f39b617e4aa1eb3568392bf5144bcf4",
            "0x7f478c943917b27a3441d42ddce13838efe3926ed6ca87e812be441501b37016",
            "0x94f5ebf04e6d04d89dca2643daa02439833b153460d3f33de578047d0f04ff8e",
            "0x2e03c81dc609ccbf0e91b6b67b79f3088028b736679de46f51caafbc9dd6a488",
            "0xfc6472d85609fbbb6ac8dec4bf069f51d3a96f59f163738e38724aefcb5d9423",
            "0xf70cfd8d0721b13b8e75c8aa24e6fa984576b1916fa14edc932fc8f53132d9df",
            "0xbf6190304df41dafe26113b37dc45a9812ccfe9ee40a1dfb97bf85e71c5e9829",
            "0xa59cffc13207fe46b3c41ff728f3e1fe8172492854208ed6ee34485a4a452638",
            "0xa0447569ee667995ccdf4edbe77abbb9e499741b7d084928a2cd4fec010ae3af",
            "0x38de793ad609ad9774dc298e1b3050eb022858125e22640ac6f4ba4713004320",
            "0xd83b345b4a6cc0ce214d987ba4a39d2f981ee7e54bba697138cb9a2e3f354a31",
            "0xc58657f3919410d504d0b3e16cd8baa1a38a2405b490a288eb64635c86038848",
            "0xf49b53d2c68f855bbb828109d66cf75952fa16d6d21a6aa8fe04cba4ae54e91a",
            "0x98559bbb58decddbfddb8f074e4e681fda52ee5e41d9b230af4ad054c6b05448",
            "0x0cda4b71587108b814822df6e4ee65e466716c634c5a080c87bb9c92d0a01304",
            "0xb5dc2541610f061f46d81ad092e7222a85bc6d208044b8d57ba2381334901536",
            "0x6de7c83368dacd692c865fb42fcca63ade071e98717cb62424bdd256f1368d26",
            "0xc553a57130c5877337bbae3150b497fff994a1150494911659c1fca1cc8aabd6",
            "0x9fa1899b30b6da8079838aa0b597ed5a48a1182006b28053babafab8ac3b796d",
            "0x545d5046aa19ce6f402e93bd77d0c29f9ae58f07856ace50e91e9fdcb15b0bee",
            "0x6a8698facdbed4b6659ad745fd4eb434bc129cecaffad99c3f08f4d688b1df02",
            "0xeb1269ed5c9a4945c0725be8b986212057a19bf9127c8252949270a3e1996f1a",
            "0xf4792b8be1496300e500d7a702b4ae2824c14d5f438604fdfe94388867c7c9c5",
            "0x64c6a2e4cea7d4784d12677704549df5bb8b27ebeabe41891781b9a641430848",
            "0x45bda137a2426603437ad1e393bfc93855c84c9eb116299640f842ae15beb46a",
            "0x77374a47adc133e93d9661b8ce8e672a343cd5a2b2a079034de69211a0ab0893",
          ],
          "transactionsRoot": "0x17429d391ba2a1d033a60a9bdb2899a1c06e25747fcb4c9bc8476c3c72cc357a",
          "uncles": [],
          "withdrawals": [
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11b7ed9",
              "index": "0x2a5128b",
              "validatorIndex": "0x4e940",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11b37eb",
              "index": "0x2a5128c",
              "validatorIndex": "0x4e941",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x1c7ee99",
              "index": "0x2a5128d",
              "validatorIndex": "0x4e942",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11aab91",
              "index": "0x2a5128e",
              "validatorIndex": "0x4e943",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11a6e72",
              "index": "0x2a5128f",
              "validatorIndex": "0x4e944",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11b2baf",
              "index": "0x2a51290",
              "validatorIndex": "0x4e945",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11bd042",
              "index": "0x2a51291",
              "validatorIndex": "0x4e946",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11a9593",
              "index": "0x2a51292",
              "validatorIndex": "0x4e947",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11ad611",
              "index": "0x2a51293",
              "validatorIndex": "0x4e948",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11b8446",
              "index": "0x2a51294",
              "validatorIndex": "0x4e949",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x119349e",
              "index": "0x2a51295",
              "validatorIndex": "0x4e94a",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11ad839",
              "index": "0x2a51296",
              "validatorIndex": "0x4e94b",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11a9715",
              "index": "0x2a51297",
              "validatorIndex": "0x4e94c",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11b820b",
              "index": "0x2a51298",
              "validatorIndex": "0x4e94d",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11aad2b",
              "index": "0x2a51299",
              "validatorIndex": "0x4e94e",
            },
            {
              "address": "0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f",
              "amount": "0x11b090a",
              "index": "0x2a5129a",
              "validatorIndex": "0x4e94f",
            },
          ],
          "withdrawalsRoot": "0x158cc8e8a444e3f70658da20714882c73b2c8932eb09b691271da474471d137b",
        },
      }
    `)
    expect(client.requests.size).toBe(0)
  })

  test('serial requests', async () => {
    const client = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
    const response: any = []
    for (const i in Array.from({ length: 10 })) {
      response.push(
        await client.requestAsync({
          body: {
            method: 'eth_getBlockByNumber',
            params: [
              numberToHex(anvilMainnet.forkBlockNumber - BigInt(i)),
              false,
            ],
          },
        }),
      )
    }
    expect(response.map((r: any) => r.result.number)).toEqual(
      Array.from({ length: 10 }).map((_, i) =>
        numberToHex(anvilMainnet.forkBlockNumber - BigInt(i)),
      ),
    )
    expect(client.requests.size).toBe(0)
  })

  test('parallel requests', async () => {
    await wait(500)

    await mine(client, { blocks: 100 })
    const blockNumber = await getBlockNumber(client)

    const client_2 = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
    const response = await Promise.all(
      Array.from({ length: 100 }).map(async (_, i) => {
        return await client_2.requestAsync({
          body: {
            method: 'eth_getBlockByNumber',
            params: [numberToHex(blockNumber - BigInt(i)), false],
          },
        })
      }),
    )
    expect(response.map((r) => r.result.number)).toEqual(
      Array.from({ length: 100 }).map((_, i) =>
        numberToHex(blockNumber - BigInt(i)),
      ),
    )
    expect(client_2.requests.size).toBe(0)
    await wait(500)
  }, 30_000)

  test('invalid request', async () => {
    const client = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)
    await expect(
      client.requestAsync({
        body: {
          method: 'wagmi_lol',
        },
      }),
    ).resolves.toThrowErrorMatchingInlineSnapshot(
      `
      {
        "error": {
          "code": -32602,
          "message": "data did not match any variant of untagged enum EthRpcCall",
        },
        "id": 151,
        "jsonrpc": "2.0",
      }
    `,
    )
  })

  test.skip('timeout', async () => {
    const client = await getWebSocketRpcClient(anvilMainnet.rpcUrl.ws)

    await expect(() =>
      client.requestAsync({
        body: {
          method: 'eth_getBlockByNumber',
          params: [numberToHex(5115n), false],
        },
        timeout: 10,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `
      [TimeoutError: The request took too long to respond.

      URL: http://localhost
      Request body: {"method":"eth_getBlockByNumber","params":["0x13fb",false]}

      Details: The request timed out.
      Version: viem@x.y.z]
    `,
    )
  })
})
