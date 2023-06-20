import { assertType, describe, expect, test } from 'vitest'

import { forkBlockNumber } from '../../_test/constants.js'
import { publicClient } from '../../_test/utils.js'
import { celo } from '../../chains.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import type { Block } from '../../types/block.js'
import type { Hex } from '../../types/misc.js'

import { getBlock } from './getBlock.js'

test('gets latest block', async () => {
  const block = await getBlock(publicClient)
  assertType<Block>(block)
  expect(block).toBeDefined()
  expect(Object.keys(block!)).toMatchInlineSnapshot(`
    [
      "hash",
      "parentHash",
      "sha3Uncles",
      "miner",
      "stateRoot",
      "transactionsRoot",
      "receiptsRoot",
      "number",
      "gasUsed",
      "gasLimit",
      "extraData",
      "logsBloom",
      "timestamp",
      "difficulty",
      "totalDifficulty",
      "sealFields",
      "uncles",
      "transactions",
      "size",
      "mixHash",
      "nonce",
      "baseFeePerGas",
    ]
  `)
})

test('chain w/ custom block type', async () => {
  const client = createPublicClient({
    chain: celo,
    transport: http(),
  })
  const block = await getBlock(client, {
    blockNumber: 16645775n,
  })

  assertType<
    Omit<Block, 'difficulty' | 'gasLimit' | 'mixHash' | 'nonce' | 'uncles'> & {
      randomness: { committed: Hex; revealed: Hex }
    }
  >(block)
  const { extraData: _extraData, ...rest } = block
  expect(rest).toMatchInlineSnapshot(`
    {
      "baseFeePerGas": null,
      "difficulty": undefined,
      "epochSnarkData": null,
      "gasLimit": undefined,
      "gasUsed": 5045322n,
      "hash": "0xac8c9bc3b84e103dc321bbe83b670e425ff68bfc9a333a4f1b1b204ad11c583d",
      "logsBloom": "0x02004000004200000000000000800020000000000000400002040000002020000000802000000000000180000001000020800000000000000000000000000000000000000022000260000008000800000000000000000000000000000000000000000008000410002100000140000800000044c00200000000400010000800008800000080000000000010000040000000000000000000000000000000800020028000000100000000000000000000002002881000000000000800020000040020900402020000180000000000000040000800000011020090002000400000200010002000001000000000000080000000000000000000000000000004000000",
      "miner": "0xe267d978037b89db06c6a5fcf82fad8297e290ff",
      "mixHash": undefined,
      "nonce": undefined,
      "number": 16645775n,
      "parentHash": "0xf6e57c99be5a81167bcb7bdf8d55572235384182c71635857ace2c04d25294ed",
      "randomness": {
        "committed": "0x339714505ecf55eacc2d2568ea53a7424bd0aa40fd710fd6892464d0716da711",
        "revealed": "0xe10b5f01b0376fdc9151f66992f8c1b990083acabc14ec1b04f6a53ad804db88",
      },
      "receiptsRoot": "0xca8aabc507534e45c982aa43e38118fc6f9cf222800e3d703a6e299a2e661f2a",
      "size": 24562n,
      "stateRoot": "0x051c8e40ed3d8afabbad5321a4bb6b9d686a8a62d9b696b3e5a5c769c3623d48",
      "timestamp": 1670896907n,
      "totalDifficulty": 16645776n,
      "transactions": [
        "0x487efb864b308ee85afd7ed5954e968457cfe84e71726114b0a44f31fb876e85",
        "0x3aa054b868fb0ce99388d74165b6128a5aca0992a785eb73a84fb7532f02a6a3",
        "0x7273f2bf436b14621094de5694d5aced028666389c7a89f4a863ac33d653cf52",
        "0xe5240102364623faf753498c52102de4a5f9641ceb6f99d9c92b032716e2f8f9",
        "0x92c31e9e4397e08a5abcccd8cc466e73d554be16da1ca7cac6a01b643f806524",
        "0x0acc190dfc0bbc6c9823dc17ff815c94e1494b60f9be9b6e045cbad572fdbdb1",
        "0x27c8cff64388e80b279407758d6801fe0dfe3410bacc7051deddf6c49c16710c",
        "0x6d4e4a0a01b1ebbb8be5cddede5de036779bd230ffc22e465eaa6128bd552ecb",
        "0xa80107ba2f636428883a71b7ce8a23171faf5076bae51e3a68e046c143434ed9",
        "0xcdadac0ee4a8901992ee365b7d251ff567134b007d2ad2d6a2285f7091998d60",
        "0xdff49ec96503acbd0110a8200f0f18b9924978bc5db32ae5c47a0986bcb58b58",
        "0xb0591b97ed1f7779e5cd548a9acfdad535d9073a3879d5bd4e3ff053bce31c5f",
        "0xa58e9da5702648d3f3f81e44952d5072b07b10eb13477a877cf3d957443b5605",
        "0x00d3bf8dc0ed9b62a786ce2fe1bec7de9d0ba286421acd3c4942b055b0741c0c",
        "0xf02343c58c6ef8007e86840e8ac9f8c2a6c52c7877b7554e87711efaab49d50a",
        "0x063f62e3c507eb0102f9dbe887520db4a1d3d34c4279f646bc3fc2c76e074369",
        "0xbeb28f46cc143db996e14fa35591cb5de4dcc92a569422f68f87f3f6a72a0e64",
        "0x9a38f385833a2c1ea159031f12c3e1af4033860c389afb69d77d1b897f37c452",
        "0xae6dbf3554a531e0ad6c51ec1e2201b41859f466dbb0ca3364fa7237fb0c60f3",
        "0x789aca8285c9e0ce2deb306f2c2f0f53df9b3601e295bdc0838a8622bd697be6",
        "0x230ebdcd6c3282992c8793f23eb847f955220f2a6c14bb82b38bc48ccf0cf1c4",
        "0xad7f4b13ac995055b681cb64f90bfe2863582e49d1179b837ebde353117ab2b4",
        "0xe40fc6bbacf5cfc1f6c41f06737d7df6274aef89a9c46bbe4fb8cb8484ffa54b",
        "0xa78f1aa9b1a0a2130477c0ed9df303c033c5c852240689a9ec34347333defa42",
        "0x3b10b4297066dbac52031920159034ef43544b77fc82c5fcc561df7208064b2f",
        "0x5d73e6bb86089544825ca8c8ca2091744b7fd25bdd36a8b4d9941968be76a845",
        "0x2f5d0deb26329807564b18ecbf24d9cb9d802d92369ea48c78fb973e1ea78994",
        "0x086a6ff358bce56bcbc022978b1b84448143ae66de7f9e0c3f7a68bce7664135",
        "0x8f36d90a6da392b377162caa1f81a5f0e3882c48794bea979bf79f119bb9284d",
        "0xe0a475e8a6f9495b00a55d8472b108171bf11a51cb8db131c98c25a17d0ac78c",
        "0x8ba00695bd7b524ff55fbbda3f17c6e93056e6895089de2ee29d58541e11b88f",
        "0xf971ed0462249050dbeaa4a812c2b881957d4225587dcd10c88581ca6b096a36",
        "0x229ab6e46f4be57cb81f8c7b2070f19827e55d4162c72b4abf26e618521eaaee",
        "0x99601bf74f39ef88dabd853b40e86bc9653899a93af85518fe73ecf372578588",
        "0x5deaa0abfd7689d3c33543a3d3b1bebc3dba46acd72246775fabb0bb5561e410",
        "0x413bada477356cdf02680950e2d0368ce3614eccc4a6c245fabd54ee07253f60",
      ],
      "transactionsRoot": "0xb293e2c4ce20a9eac253241e750a5592c9d3c1b27bf090d0fc2fa4756a038866",
      "uncles": undefined,
    }
  `)
})

describe('args: blockNumber', () => {
  test('gets block by block number', async () => {
    const block = await getBlock(publicClient, {
      blockNumber: forkBlockNumber - 1n,
    })
    expect(block).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 13091396207n,
        "difficulty": 0n,
        "extraData": "0x",
        "gasLimit": 30000000n,
        "gasUsed": 12140682n,
        "hash": "0xb932f77cf770d1d1c8f861153eec1e990f5d56b6ffdb4ac06aef3cca51ef37d4",
        "logsBloom": "0x8c20a398c53899999b895442b5849d2b02b845857fd9411879c305cd66817446f58c1f0ac0da1008e0ca1b43445da1013a28a6b1ca4e69c69243818819386b0e05af0479f224eba8ed9b33cd57106076edf4412d845354935804bc07cd281759964840970e02002711e6e99388b12b735420782045710f20125316d10c3802b423304338d35291b9836b44802bd32f661149088b85120c4c7661e2494211c5298f4c6b1b3140ec884a3079f51c01a402cdc91a083b0b409286b67c53f42f452d03080123468406228846b00102c24b44bd2812c294288a1e608c19a20246bd4ae23c6c0c0de1004e130491a411312bf81ed2449970886e649009ca30048170d0",
        "miner": "0x7a65a5ca6e241f7df9cd66113245c9cf41d9b60f",
        "mixHash": "0x99afca89e6d69ba8a2f1fc58a3ac3c10d631a4ccd03de87911634c7de662d660",
        "nonce": "0x0000000000000000",
        "number": 16280769n,
        "parentHash": "0x7742c011303e04b4f6725c146265ce92633bc35bb6cd337d3c976cf66841ad49",
        "receiptsRoot": "0xfd8f62df08df59aecfbb10f4b0cfd47047a44ccb2adbc9960d56971b8cedd80c",
        "sealFields": [],
        "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "size": 67633n,
        "stateRoot": "0x71dfed077f4d222e1bb296b6f7c55e8e2df05a6cb132e2685639bdb57cbe84a8",
        "timestamp": 1672200575n,
        "totalDifficulty": 58750003716598352816469n,
        "transactions": [
          "0xbf7d27700d053765c9638d3b9d39eb3c56bfc48377583e8be483d61f9f18a871",
          "0xa3d1de42b79c719b438e9c692d3d514c4bb25352ce7b94138367099902a25dca",
          "0xf088b3386b461e9555f06518d87ef7106001ae517c02b88f0d399771605a140d",
          "0x70f7a35636996d22de450ef31ea39b50cd8e877b9e5b4ce3c141a8c07f9ba2ec",
          "0x7f61b7f81330fe8442c06ac33720713d20b7d57563646f879f68c3ce12b58351",
          "0xbbbfc2788c3a6dbf13f4ed525a4460066455f7f2ec10f3c75ef153d9cffdfe9d",
          "0xc293e879410770c3cc94ebd54f84631ddb35a4aff9685ccbb57bf52809a53ecf",
          "0xa1db9bed25874c86bd8dacc94fb8c353db34127df8214065a07ee745ede4ec07",
          "0xf83f9ba28e659b8a5c8b0da5cd770e108f28733ec737175db0fb8ab6ed6aea23",
          "0x9a249a4393b346a399c03a132674be758f8730f619c8ce04d320f4f7ecdf718a",
          "0xefbd53ec95343e20cb87a69f0b75e7652407fabaa58514d306c3083eeaa0f7b6",
          "0x350580608e1f6a720de45bdc4cd4c92ff17b4314c4f482126762c48b79f6bba7",
          "0xcfd7aa6061b4a041b610d53effc0828f60f1309582fd820f710bb12db5ee8a5b",
          "0xe803518d2e8d6e339cb99400573ff27b4ffc8b00fe1eb6f11ef60284d9e3935c",
          "0x030f3940491070b784e5db1701531e5fbf03fb626b460baec455323a3ebfce11",
          "0xb420d7e8ef85d941d1a0c4c177ad5f1561f529b3cc04b7ca831f53596530eab5",
          "0x550f4237207d6fff47ff0019b9775b258abb00f543c2a2ddb958360b1e343e67",
          "0x1e79bc5effc9224082b6ffffaaafb135a47221f339fcd14bb940bba833453f51",
          "0xd7e078244d7d5fcebc7ed97b67483d29ee7ef19fa4b8a18d884a06ab82e9ffc9",
          "0xb0c9ef8b91c0bc1b43e676a702485680b2b19b235d08fc27ea548dc24a2e3c1f",
          "0x54ebcd791156cc0dc2b7ea60012e38275188e86ca49214f602e2b1a6d2306f1f",
          "0x70f89c125e2eeae29d996cf1b572189fbf9e8b123e3eb1c513346ada28a4726d",
          "0x53ce6e2fc39956a95611d9126525c05d45b2ae2eaac7549606d976b378abbaa8",
          "0xa231ae47c500ab34a61cc9db56c47b62c5b4bb92677a1e52dbcb8582935ff8ef",
          "0xe17177465b1c43831c3c55fa3f75e9f61ad9aa956afd82f27bccca67128c9069",
          "0x6e7a90c626c618c85e20b6f7d4d4555f272389506ecd37fc0ef068246b998891",
          "0x955968e8df948729494a366a81f873929cbb0296c58a6e283007c9b9c230820c",
          "0x20f3faea5de352cbca6787348a7347d963927637f2ea9a1e0d3878a5756a2c74",
          "0xa0ffbc5ba1cc20845829c6ec9026cc8ece4000f39a0370870d23d286fb786236",
          "0x0fcbe8513dcb6b1b363ce209e0554d4401888ca592a6ec4d323ab170391c4913",
          "0x041386f81bc057826ceb7ee4c84f2ce6b231acbf3c8dcd9e5f1f24b1a5fade82",
          "0xbcae4eb86975d67da14b95f95e77b9d578493b3b73b53068bd1e46baac41bdaf",
          "0x002b4f265cf081b55beebf44a73de8f930b63966e6928b515e7f31ca95151b5f",
          "0xb191486b10c2a891925826083476934b7312aa56b597ae994a65e943c32e9343",
          "0x2a1e8162aea8bd4952435b52be71a17b2bb63336ba07b40e559c9051ce09fbe0",
          "0xc50efd1e106b409bf02b5104f5c7b55bdc9e54612a92f821a0f74471c56640ad",
          "0xd2bacc28737b202ece2a4de22a4b007a42d32b8167cf4c3f5533688fc774eabf",
          "0x2291172bd8c099c2c4e480251fc387ed5e4d6e6d31c77d18e16e7ab11f00444d",
          "0x40517c0d144e27ce8075a845c6832cc734fc84156709b6d5c002743826d24d05",
          "0x1ae41d2c964ec5d102a7fd5928c104e128ae5fde050c062dd59aebe7152a00d8",
          "0xf4cc04263bf6a86adbb2b97bf9468de7b8aae224a382ba6d1b9c6b74a1b80043",
          "0x76d3c2f7d1c178f1589c4620de474bb4710dd73790e78bca8af63378737720a4",
          "0xdcc73d40d7bb2f7c47833c63225633c0b087e9ca90d04aa5341b1de7b2720649",
          "0xdbd9b3db3fed8a597462565bb3130265f06cbc47882dcf5186b234b9147f23c8",
          "0xb11935b528cd137ae6512aeeed320d647421e8db8af13d59e2cdd47fa787c8c2",
          "0x79ffd0f86b534b2fdd183ce2d781abea55fb44fafc0487b84597aedddf314216",
          "0x92d679d0f167c7d96a75cfabccff6740230f73d39c3abe4f58439d01b16c2a31",
          "0x4b00c47b3872058861b2c02e92a3fb0cdd5fdd72bf658bb9e6f3cd835864ceed",
          "0x0a0c2f7a9ed2aa752f25c070714fb9ba2a0bed6de4c8f35f25aeed5d8eb7e66d",
          "0x4ad8115f19fc41bf4d7f0b0632772b0f891700831ee4159d6d3355101b7af000",
          "0xd2050aa7a585eae8cb2719e86944cb92713addf1c63162728433a394b41ee4af",
          "0xc825bff0655f867c9aa6dd7b0408d14dd943561ff2e0a979de3533a221bc1a58",
          "0xea9ef56b8c6a89ebaf7cedfa5dc6f138f20465e9d0b21a32f099ef8b9d96fe40",
          "0xb803938364b1a9e6295eb2ee19492ad233f3b6745cbb61b60ca3a99ef4dec73b",
          "0x0c6658f997d8bc8cb502806993a4f9b03ba26d3b8106c6298929f35a9f9b7737",
          "0xdd781c26924e8134e39dfa6e5857a5c6f90b333d04e7e27784c8fe82e5dbcf81",
          "0x64aee48d8713cb7b97040672e55521307a11a7a92e371a4f35da280daef39b11",
          "0xbfebf91937a9069bebe6dd72e7e86a77209316ab8a669100a169fd979ac7a3a2",
          "0x5c67079586d5a1c855eddba62cbef56004ea2dbc00eda4c4d9f03b50f0b17a01",
          "0x400adf296470e7043ec1907a67eab4e896ffd2b5ccce8c7c8ac5ad4b702741bd",
          "0xec6aa508a37e0d416546f78baf9889620826f9c9779ee36495e11f92d772af65",
          "0x553f0c976d1c90355151f516e25cff72aa5fe7488b6d63c0d6f535c4a77b4335",
          "0x945e554ee33a8f5cdd863d3175d163381dfe4afa3ee62182375bef8b157ea587",
          "0xa1d9f6eb417bc3e80d51d837e826f94d4c4572cd888e908bf2b90bef1d79fd0c",
          "0x683fa0a08458cbd086d5f6ed018bc133b5695c49ad4abe43b08aeae09cf58192",
          "0x034c1017a7268b9de3842c274c6517c3d767bd45311f9da45f133dc0937f2de9",
          "0x81877f5fdac131ec90573d44fcd9d2626691ec204785408636a3fa7f93bd8362",
          "0xe448663f1e16ac20f8beb3c6c323d20d670cd0c31598d7e890a06d5ebd5df18a",
          "0x7d099851bcacfc7cacb2ca14291a23cadf5038e4ade377bc8dd833a6a8c66a83",
          "0x7ee612393d5c08cff9a540d82e403f733b87808ba01057cdd4aa725cf63b9340",
          "0x7dc71e8c1a8a15729f485dd98ba1c816e2b5c0622d0fc7ff57dd7749d668dd44",
          "0x51827febe9312b49b0de90f94d388fd56208e613f21c2e0c1c27ef1be3f68619",
          "0xb823e06056e1eceab6b9e2463fa7ee0d60601a75ecd03804a071760fa7b01667",
          "0x45be4ac93800d68c95da69eb54ef1effc29c54abe604b07a58e66951bde7112e",
          "0xfde2f680397c2a53e468186dc08ad16eefb0cbf8113431676487bb1c9b764dc5",
          "0x1530b8a7014efd96579a2755c2c656985ebeaf108679f0023cb26e417a19d33e",
          "0x0fd0263804364be311398bd52a46f5a8a1a5ddb37a7fd3198cddc45199dd14b3",
          "0x237949b3d2be7dbf60454cd991730a9d394834b95a1f5405d25a2161b3740cd7",
          "0x9dd940dd2ebed25d3759b05071aba9fd70ea5cb6f7698528e31d5ead13ee747c",
          "0xae400e17d8f975cc364b58399d984eec4082d1094433889f309f4af590ab59f8",
          "0xa93cd5dee4635f203848a10eb41647bc42410aa495780d677d4f4ffacd36675a",
          "0x13c0f70ddffffd537afce7b2b8f9558c920fe4379f4d5c2f5c0e1ecb952f0f2f",
          "0x9fdc726f41d3e1862f2b3fe729855d653cc16eb9bcb9c798daf0f7cb41a5ef46",
          "0xf2e4c499bb562679b6772b424024632450fc82809655cb0173e0c1e8b05c088d",
          "0x4ce34135b498d4e070b25e07e74a535b3cb17c36271d76121a2e66d40eaa0388",
          "0x772917ef4c9df981ef200ae117d0ffe8c49f832574b8faddd6a6642001c03258",
          "0xeb8d12bc8837bc999a79ddf7bbcad5530cbd1b40c15489ccc559a79d6f7938a1",
          "0xac9831278971cca3207af78b0d05f81ba059f836b1b7ba361c22cb4ad5f44c2c",
          "0xf11573e69311f8525492b8a046ea529970b418c3ce507fb4758d68386323f605",
          "0xf3bc631d1adcef6a697b11096064775d577526d48810aff8eb394745ebf48a64",
          "0x57e26ffdee68f549430b0ce3a0c8d3d437ac9a9bcb7e6cfb548dc9e36314f4c4",
          "0x07756f3c4fd6f08c9a4fbd1cf486c99b28f4abcef848a780770d2d2f88614851",
          "0xab79d2f540f0870135b1a8415b2607fd3107f32843e2e4a4dbda4fc46aac295b",
          "0x1992d1daf2704e42efaff5795b5c9df23ba33b73597c90f1d1339027cb433d24",
          "0x1c3b230d0f746320aa52e764980fb5c9f79104c8757e54f336e519e40a2d1c89",
          "0x662edb667c05c3426136cf6fdf0f9a85c033e298089afa7265c487ed63b20179",
          "0x3ce405bac421160fe3149c89d0c85f623038fb9d69bbcd307b923529874aac54",
          "0x70cdb11a7dfef2f6129ebae1845d25ea63d8fa42a6cae0ea68b88e44647a9477",
          "0x8fed9e0499a03ba686e6944661f21263b977c49dcd4d673a823bcad444b3da51",
          "0x6fc8a6d5e1f321ede6874de68012da1fbbe8d88a05fbc9d050cab501bb9df8b2",
          "0xe343273b2e8fdede3bc90b8872a886afae73d718cc55de88e3d2b44604cbd3d4",
          "0xb7eac3b50138884b7d51b3c0a1154f72300bf6aee7e1514f01da84e57183000f",
          "0x4ae03229ec32c26ba79e90f309b867d7b86b3ce7ac6a41243f98dfe02de10a96",
          "0xbc8238ee96536b61c876a20a98e3a68febd4afbae758b978c5d7636ace2f4c4b",
          "0xf4c3dba2295c370331f66a98a1fb5c84131270fc26b9f6f41e3067a8c893c98b",
          "0xf5e210ac5dd743b095ae6b633ef0e3c71649ddf18bc1a4e35cc662f50294976f",
          "0x107c7764547d6a3f240efd6494c9ddbdef9331be0f0171bc17e44da8a1c51aea",
          "0x2e1ee1174be6a08a83041b7edf44692419eb14b4315a417f956551f610f4838c",
          "0xf6bcdc2ac19a24bf611e423c58d33681075fceb757b325f798f9421f13e7da77",
          "0x6fc0861a39fcb90f581e8a552c85dd7d85d2fd0bb72542922346924afa2bc1ea",
          "0xaf1147b53bf6d3d4c737d097cb6d1007af1c8d254d42c8f253b414331776933b",
          "0x98ffb398eaf3e804e8ac89cb1dee0ad281bfacac4c92f6c693fa296f7578ef05",
          "0x77274093305b49c235635eb243c77436eac613bf0e8158e8df9c0bbd4defc0b2",
          "0x87cc5d323a56ff5cc98367e1a9250a995c78e6f5a4ed3f0d61e5cb98bddd4777",
          "0x854cd71b2d12386154dc69813ff7e06953c3387a9dc2d441c5c6f8f5eec56c76",
          "0x73d95a966fa6db05267f42a14839b4323bebf6809fdf2564f121115273ecf432",
          "0x0b2055a234327a03b2721c3794b31275970cb0efc8fa3149c2524a53a39a40dc",
          "0xcde887ab22771ac56336a8f9a464a76e5e8d00d31685dad3fd07f8748f2a348b",
          "0x51eef864cc3e71dfa1b0b13f3948ad244b8e815025c3df4e5e7c370fcc8da62f",
          "0x9a1964703f002d01009a983c4d9ba4550b75f30feee39e578ac3ed5e13660ce5",
        ],
        "transactionsRoot": "0xde58806b3011b9e7a2d59b78d77a08b7501c3dba0f52b8ee3fc7e200112df4b8",
        "uncles": [],
      }
    `)
  })
})

describe('args: blockTag', () => {
  test('gets block by block time (latest)', async () => {
    const block = await getBlock(publicClient, {
      blockTag: 'latest',
    })
    expect(block).toBeDefined()
    expect(Object.keys(block!)).toMatchInlineSnapshot(`
      [
        "hash",
        "parentHash",
        "sha3Uncles",
        "miner",
        "stateRoot",
        "transactionsRoot",
        "receiptsRoot",
        "number",
        "gasUsed",
        "gasLimit",
        "extraData",
        "logsBloom",
        "timestamp",
        "difficulty",
        "totalDifficulty",
        "sealFields",
        "uncles",
        "transactions",
        "size",
        "mixHash",
        "nonce",
        "baseFeePerGas",
      ]
    `)
  })

  test('gets block by block time (pending)', async () => {
    const block = await getBlock(publicClient, {
      blockTag: 'pending',
    })
    expect(block).toBeDefined()
    expect(Object.keys(block!)).toMatchInlineSnapshot(`
      [
        "hash",
        "parentHash",
        "sha3Uncles",
        "miner",
        "stateRoot",
        "transactionsRoot",
        "receiptsRoot",
        "number",
        "gasUsed",
        "gasLimit",
        "extraData",
        "logsBloom",
        "timestamp",
        "difficulty",
        "totalDifficulty",
        "sealFields",
        "uncles",
        "transactions",
        "size",
        "mixHash",
        "nonce",
        "baseFeePerGas",
      ]
    `)
  })

  test('gets block by block time (earliest)', async () => {
    const block = await getBlock(publicClient, {
      blockTag: 'earliest',
    })
    expect(block).toBeDefined()
    expect(Object.keys(block!)).toMatchInlineSnapshot(`
      [
        "hash",
        "parentHash",
        "sha3Uncles",
        "miner",
        "stateRoot",
        "transactionsRoot",
        "receiptsRoot",
        "number",
        "gasUsed",
        "gasLimit",
        "extraData",
        "logsBloom",
        "timestamp",
        "difficulty",
        "totalDifficulty",
        "sealFields",
        "uncles",
        "transactions",
        "size",
        "mixHash",
        "nonce",
        "baseFeePerGas",
      ]
    `)
  })
})

describe('args: hash', () => {
  test('gets block by block hash', async () => {
    const initialBlock = await getBlock(publicClient, {
      blockNumber: forkBlockNumber,
    })
    const block = await getBlock(publicClient, {
      blockHash: initialBlock!.hash!,
    })
    expect(block).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 12779459001n,
        "difficulty": 0n,
        "extraData": "0x6265617665726275696c642e6f7267",
        "gasLimit": 30000000n,
        "gasUsed": 18922448n,
        "hash": "0x3f900200152e9e7731b6adfb4a9a5cf43c71f3ff600962efe544f3b1d9466fac",
        "logsBloom": "0xeeec4ae861e4d9e400eb97e3c26253a37852273ababa634d97d300674e269f1a567884ba980b255ac72c1d787a129b8786e9b4201f21316cb6e8274545adbe4fb9264bf2f936df28efcdf72ff393486d4adae488455c34ed5c7d3e158d070938db650d71021a42da46105b004f05ad1fd614768209bc8ef44e0ada968a384a791639509379623bcbc1fc8cb876e3282969c5b9abc354b159678dd87153b6aecbbec06d7f3eb37a9a98596ce72c638ac7c2788ea00a36f0cfb96f0ec314bc8b4a473b955fc5c4dbdba1aaddb5a9c412165169cae009ae09561a79ab8f822cfd533d73bd988dd42dc4185618f62b310b40173f62b628fe2fe5958e3b14acc60860",
        "miner": "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
        "mixHash": "0xd7de5432d0e9545465317f2f0f82f6f60dfc35055103378c2b4c19a9218e7c75",
        "nonce": "0x0000000000000000",
        "number": 16280770n,
        "parentHash": "0xb932f77cf770d1d1c8f861153eec1e990f5d56b6ffdb4ac06aef3cca51ef37d4",
        "receiptsRoot": "0x7c577c7a2c1649735565691411b9236e1946dc74f3f474d15c014bece0104de8",
        "sealFields": [],
        "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "size": 98321n,
        "stateRoot": "0x651162a87a2905c6f37ab5f0a2676f9cd8fc5ff618cb5c1a89bf25ddea7f391c",
        "timestamp": 1672200587n,
        "totalDifficulty": 58750003716598352816469n,
        "transactions": [
          "0x1351de11f81a077cd300914e278c870c3df5b26d3f3b2a4a3f8db76bc138e7d3",
          "0x7d5c80f38b2e706aa3bd19b234e6026c8a4c0543bf299dfe609193693ac27dfb",
          "0xc986d00394b3aea84f19906037be219456f13894c0fcfecbd242b36d52a0fa01",
          "0x73271cf06de97fdbbf0be2bb13b9376a98b1715b6d463c81f5ce73a9988b6f5c",
          "0x48c27153e0fd95de6bb7858dc42ff2d16aa0123ff6f4839dda23da82c170df13",
          "0xb901cc43954131517926708106398c5c0c3c77c2550b18fb7bd6eb45a6b39284",
          "0xc6d0d2bf4e46725ed595acdc8bc841994d1e63500c0c06671bc19379c5f111dd",
          "0xb05036fbb0125a493090289331e0b9d44c8ebb3f7852c0a1657ff9e0fce0f51f",
          "0x14bbc701396fffe3b212eb96af063cb97e05ee36c98b133da22a5968a4b38707",
          "0x6b96c5431807ef6792333f1e448dc52d72d24b1460879da6b88a94858bc27a12",
          "0xda1f70f856e3ffc9ed5d5c3c91d8e13b0256931ca759be650407de7053842f4c",
          "0xe52666b85980c7f2cdf1c36ef32a69164c65250109bc9f639ebbc990390c8176",
          "0x5010f98f3ed2110fd40c8b463ad9fa56fe9f026d3bbbfa27a86238ea69084056",
          "0xa554462712447f7edee4cef01317d1d2438200c70f0eafd696d21ae6483472ae",
          "0x4d85ba6c319c5f05768bd42bc3a8509ffb20873c763bacf72b13d6febde479a7",
          "0xaf32af489ae7d94b22cd47c6b1ad44872a5b5781ed329e2e5dc622c1ad9b0be2",
          "0x5be511e63eabbaaeb0436e972e34747edd255e30155d6e943e0c4cc81980efea",
          "0xdad9805520d2eb35019f9f7692750959943a9c1dc9ecf31d234273eb0af93be5",
          "0x33e0a938bdb373ab8a57a03d20faa1fad0b793c86b61cc8cfbd9187f7a7a8f6c",
          "0x552e8b37157fa2fc8576b56e73b314d6001531e00c8c406c25b46c2275d99cb4",
          "0x8a47abc6188d6500b71744d03c68e20b017a33c4291b30eb6c8a1d332b03a654",
          "0xf6a51940f09b38b619958b2955841d6a5c80230a4bfda8266a2c59ebb2722528",
          "0x6d0adc2c20661faa7fab9ab72d09c7688fc61ab1d5d6d2f453b969c820377a2b",
          "0x91963d8420403980eeee8434d1d158dc0e7fb035d0b6bbc0cfa795965a9189c6",
          "0x4bb35a76df1f1b12cdb722f86548061bdcad763a96a0ee1a0bf8f8a3acc4894b",
          "0xbb1be5996b36846b4455ee515e701a8619741e035b89e7abf0b8dccba3d882fc",
          "0x995df00e7dd97dd7d591ebab4a8af2a5689ce67d98378857311715fc0c04e3c4",
          "0x6d0ef7c18c8a79e8c5357ede322c0f3c9bb79b423dcd38d68ece250d6dd90e82",
          "0x5e23f022fe06150e4269e76a0607732d960cec687398d7bb9551e2f396629a54",
          "0xc284f18afa7be933a7c2dd81666553ecb454280d68c5ab368e980e75d18cf341",
          "0x89710dd344aee964826271ee471c290cc07c75f5fa1567d3fb7a5bd7d9c98fd1",
          "0x0c98cd5eeeb28e14eeef72fc71432467b87f5b726adc97372d8a0533023d306b",
          "0xf9a3c04b2f40ca3b42a61988ada325db3ab11bda42ab9cb9c01c685e4d66bc04",
          "0x55531cea77c328a669b76543c20352346172f40d206afe38f25a8e79b1cd89eb",
          "0xb7d3f39769d5e1da93f979809d59fc0950136cfe4e58a59ae322993ad444d787",
          "0x4b3cb165f91b96ba7a90fe7cc1cb5dcf0d8ea379446970c650273f8e11cb5957",
          "0x4778b34dae4eb5de168b9c8aadec570cd8e73ff31f8633d84ebad667b736c5ef",
          "0xa298bfbb6cfd9f9663205aa81032df3f09c4ebdf5ff3411cd4db787429b6d014",
          "0x2b76948313eb52ab9e06b171d9ab6e746d19ef031e5d94bbb7f9d8ec532a9fe8",
          "0xa5835cf94ea79ec5518e4d0400f206e57bcab07696fcea7cf6308cd4c3647cfb",
          "0xfb00b96840d28381ea9d09d185d6bc0882acfba09a5b64997dab030178fee0a1",
          "0x30b4a72ee9e077c57c78cf86d8d2d6efef9f28f84f85eddeca5e35476fe011f8",
          "0x48d8e59134e8e89987b6059bda69d988b19a78e072c6c40dcf25b748d7916aac",
          "0x35af74b2deb8ea65742be1e8b75ad1c49bbbf01d1bfd26037fcaf3cd89926e39",
          "0x6763cf676ad90dfb40a6bd22d54d36a65571874c66b6e1bea3690cad8d051321",
          "0x760054fc96b0f8612dad81cea54de6d55622259a4a022398537d2814ed8ccb17",
          "0x2d58f61719af0756262b390ab0587babadb77da1403695dbb9b58dd5f4148d30",
          "0x6d1277534c5314ac1a7b9c05f92040c53144c45b55676c604304a4e3c4e9e0ac",
          "0xfa5bfaaed054884e849ce6988ab948ad7e98158741013c8da40f280879103125",
          "0xec2c8a649815c8a76a1c9d5ae0a4d2ca5530207dd59c84beb79e643c2b4699de",
          "0x5fc207821af511e130bac12d541562db4f9f956e2d2150cbdcce2ff2b2271dfe",
          "0xb3ca73f157d9837633dd44b86bb7b91fcdfabfeba6339f3cd5e5d2ca0a99054c",
          "0xdcb443a670462f3dc014e721b9b57a68d9288bebc74a29172192099746392cdb",
          "0x815de12d2b3d66a7cb0a29f0a21a597d1d6c5eadd077a2e42543c8266c1c552f",
          "0x5b8ed4cb34ed17d8e82f9037d828b73f3ec09caec6691a4919df7759d02cb989",
          "0xa4d7bcba3b2a421fe3af2ba43f8a30ea662015d8292916dd231bc6b125be8378",
          "0x69def64bae7292bc0a5c72d4b9f14426cc8d7aa12f89ba2fa685f63c466e398e",
          "0xad6f4e025468372f4b6e925584beb95675da74217d6344637443b0f1267af09b",
          "0x7c207ef61607ba16622cf9796156a22a29dab59ed77666ef5b81808fb8feca81",
          "0xc5ac8b92f5216cdd316cc4c28f3cdd6ee6978cb848379c51b8ce6ea5a8c0a231",
          "0x856d42db3f08e9c493d4e0239a5e6e610c58951a87d55eb4c6c7103d1e9818af",
          "0x557775076b85cead00fc6c33417b56743baf7cb301f965dd8e35263d18b860c2",
          "0x930031f6567e75ddbc7061ef851b0c1cb95eecf57c4db559b63e9f78b132011b",
          "0x3d016940fac9cbcb035310141727206a5a7cd936b8ac7ef8ad492f2c35f10b06",
          "0x5cc81c393a2c1523b9a8342eb2a291321ee8c5cd99a0f647570e3cc4fade8a7f",
          "0x75b03ab8d646c483878914bd0c91c1d1a2018f0fa039e72ad35cc9fb657f324e",
          "0xfd38eecb7f9689315484627791d3393d2f7286b40be85c0f44b879cb46710645",
          "0xf2f08c1b2723ac801ec471099071a6d8d60ab0b3847dd14400a88ca6fe2b0804",
          "0xafc9d2533c985139de1e3cda1c3ebdb022456d644dc0b32e05c8ce602cb0308f",
          "0x0f06d0716036c226992ae14def944de3bf651459f7d1a631b88d63bb35db2287",
          "0xc332aa7d2c9459a8149bdd04a0da2552f7fd3871d6dc00c932bb8ca115e3b124",
          "0xcdac2adc326d645b9ecdaf1954da28026957c87873f7e97d6236756395385901",
          "0x890e71419171b6c94acfa3859d9cad0acfae4095a4d4989b2f613e429e4e8f60",
          "0x681ede0467b184ae2fbc17b4d3a78d1eaa4674555494aaf872abe72c1ac10c57",
          "0xdcc80cfc23ad4582fca9b31590dc7badd5104b90e564e6e73718f437118c7f73",
          "0x53421fb3b6ce41428288863ab2983601400662ecee01f25f8005e13edae57be9",
          "0xabc0c5603cce5690d0c66a50e938a13e3ec5a5252345e70348b11276f2d3f3dd",
          "0x9b3f6a66edaf57e527d167569bc28ed14fd74a3b57dda552a98249372c559693",
          "0x1944f7eef251c45eb7a41c3dcbb2e38d05a68c935678d9de83352b2c553583c6",
          "0x37bc6090d2417fba1b1b06c5d1416be4012ca79df2e88d65c0b70fdbea28e85f",
          "0x9e35edc9fd33b00138cb4740aa9fcc67fb4a55639e30e3f55100f6fde63219fa",
          "0x93f72376c013a41bbac041280e426808162ae3c7fff4c86336283a338f98c629",
          "0x74277cfdf9d119e4acc2ac5b91883ade1888dce2d6f27a854ee12301379f7b72",
          "0x98889715672a70ca2e2d7b5c30269523a11ec510cf906d26f842692644265983",
          "0x11265cfc4888c5c00ec3848cbbf6b97c923127a8d71a576d9f40f29aaac3fab1",
          "0x227eafafdbbf1b38cb9b44720780c8730f5fcc963417d214c1b5b3ae15aea8ac",
          "0x789a22790ccc6db1aad0d4fdacef1e99f985083dac5c71684a05984173eb722e",
          "0x7ed24aed7c45de70482f19ce398574cd753d47fa26a5a72f7a85fbaebe1f3247",
          "0x95880d0c34bb3ed909f73dde91f24262724d231256739c79cfb76e5456d2da5e",
          "0x31299e470fc68ea56bd9f04b0cf1a63f56b48ff8475474e784f783db1fecad0c",
          "0x846a23db36d000b6c3dc4c4404daab5e749488273b022819f97250224ce86602",
          "0x011a92b6ae845fca18c3877e71602755983960c424233e3995868afadbb08915",
          "0xba48629772708a411d27be75f1f1b4ce94b5c61f1d5c3f742bf46dd911169ab4",
          "0xfca880cf632eb59cf79326690962288aa469a3f8ea5ed5431a6b3da2bd9524ea",
          "0xb82ecba811355e826346a633ba3f7a924f84ca0f7bab43b39423280539ac3e2e",
          "0x0f05979f9d7725b0dcc01c928d16e83842cc7fb7471827482ea7a912c0d49d13",
          "0x421cfd9ee8c958c87a24dbe2b315d101ed04579287199ca49fec93af3f5c6b44",
          "0x009797083528b2b097b5ed4e86b7a8ce09d4d230bc47ad5fc55056eba992af9c",
          "0xda306790bea2079c8332d113b9c0b2b94d947c11534a8d43844e1742ef3f0b87",
          "0xa7ca2796de5c4cd6ddc53debcde5ce1f97ff04a42679a7dc69cdd3ccef801818",
          "0xf930a383591fb426df5dc75d394368c5708d3fc45f280ed4d4f9893d1b5e0f64",
          "0xb3acc2d780a5fcd79afc84974fb0051ebba73b454053e9a0c3844625aebb7438",
          "0x50b247b9da00fa48d62b10e78e5f139da0169313b7051f328f56d987b7f72635",
          "0xac5c12ce32adffa8c6a39adaa54e4f9921086b1549858ddb8352611a9bc6dfaf",
          "0x211cc2097a9503e2d20a83d2e04bf04e2eae54fcf212de1d7c5c44f1dc2d4f26",
          "0xe81b13eaf7b676a84b028f0d9b015c517ca2d5c1040889fbf76e9213c81f5a13",
          "0x759fdf6ed79a4880c19dc2aeae6f402d3c2548c69a4ff2c414185d50d681a9b3",
          "0x4228cbaa3829b28afc56074a75761bc700547bce00bf62624e33d2561c0b55db",
          "0xcb0f89c3dc21d62b81ff4d1954b7b746d5667c6eb05182c08b9538a1d9e315c8",
          "0x5d0d1c7f0fb49a562150cd818dc7407d944f9d7724c688815dbb745cbd413f0e",
          "0x315b36e3411c3bb8a1c092c80eab9c19fd37db319dfc41befbbce9e78704988f",
          "0x8359dfc29f6fa9e06ba34cfa07b799a9203f17e42d3b5b3d7c48616ae1bd9aeb",
          "0xdc28479bc50ff36814c3272723405be178a67d0ec380719bc5d791031ec0e565",
          "0x3439e8ceba82c5b4a07f7c22be78c9650c88c384fdfb78572a5baa0289f723c7",
          "0xce6487ec2ea20a752cb27b5252faf15c7e75c07c95164a6be6a680e5411417bd",
          "0xda73b97749449576b0b3b406be397babab8ac683d2c63efaadfab98c0b01f6df",
          "0x8335757eabcb45e9de63bd17466223e59885ac9455331acff3035ee841545ffc",
          "0x1d19308d55db9fefe56833ddaa46ebdaefc8374acb944a0cdf0e54612ee823c6",
          "0xbf39356cc9332569595ba559e7a93455d6821f06607b5f81fa9ef497cef8ded4",
          "0x21c53c6633f95c9d09873f882357b9d3c9d578e36ac9ff4522c4f162d8f063c6",
          "0x080e51f918966a1a991fb35bf43f03f3d4b1d059b930f9425d03243909e6627e",
          "0x850bbd853553d4e63e7deae2b46c717f4898eb4cd2ab70b92074ba75e0669b28",
          "0x560bd9e5208ffab137318cb78dd22d022418ef05851559df6373184b6008d921",
          "0x68b994d4812451cd5dd0a6f79ec4af6c55bd81af96e80f398378827bfd2bfc79",
          "0xc8d2c46cfc54c6ee29c4ca9f11ff6775051d59b1c774fd2fa732f92236f535ba",
          "0xb706132112362fe076cca1c33cf4fef2e910f70fe2a453e45b710034059f1757",
          "0xb19912b950a53e2a6b16bfe2e8847f43ba7a3d15993701ebebe0e9c0971ca3dc",
          "0xcc8c01edc1360397cca04b87c4d94819da70fab718dc1c75cad7c43f82502d9e",
          "0x1a10b69ecdfb19ec88477595d14627de4335de63ee04d3273822cb571327f8a8",
          "0xcfab191eed98547c47065c6d3e5759306423f9c2610629adb5df336c7224bddb",
          "0xcf8fdcb00038d10d5fa3c847e4611ffee02ac20ee75ad45841451c9f1410e045",
          "0xe6d72fe86fbfa94a7e03e72d292f8d4bab188b18a4d732b500fc867d84bd86d6",
        ],
        "transactionsRoot": "0xe1aed9562570b4a0f31aebcc7558960f7aeafa3bd2a062977e2c927ff795af27",
        "uncles": [],
      }
    `)
  })

  test('args: includeTransactions', async () => {
    const block = await getBlock(publicClient, {
      blockNumber: forkBlockNumber,
      includeTransactions: true,
    })
    expect(typeof block.transactions[0] === 'object').toBe(true)
  })
})

test('non-existent block: throws if block number does not exist', async () => {
  await expect(
    getBlock(publicClient, {
      blockNumber: 69420694206942n,
    }),
  ).rejects.toMatchInlineSnapshot(`
    [BlockNotFoundError: Block at number "69420694206942" could not be found.

    Version: viem@1.0.2]
  `)
})

test('non-existent block: throws if block hash does not exist', async () => {
  await expect(
    getBlock(publicClient, {
      blockHash:
        '0xd4a8cf1bf4d05f44480ae4a513d09cddb273880ed249168bf2c523ee9e5c7722',
    }),
  ).rejects.toMatchInlineSnapshot(`
    [BlockNotFoundError: Block at hash "0xd4a8cf1bf4d05f44480ae4a513d09cddb273880ed249168bf2c523ee9e5c7722" could not be found.

    Version: viem@1.0.2]
  `)
})
