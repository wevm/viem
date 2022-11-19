import { describe, expect, test } from 'vitest'

import { initialBlockNumber, networkProvider } from '../../../test/utils'
import { BlockNotFoundError, fetchBlock } from './fetchBlock'

test('fetches latest block', async () => {
  const block = await fetchBlock(networkProvider)
  expect(block).toBeDefined()
  expect(Object.keys(block!)).toMatchInlineSnapshot(`
    [
      "baseFeePerGas",
      "difficulty",
      "extraData",
      "gasLimit",
      "gasUsed",
      "hash",
      "logsBloom",
      "miner",
      "mixHash",
      "nonce",
      "number",
      "parentHash",
      "receiptsRoot",
      "sealFields",
      "sha3Uncles",
      "size",
      "stateRoot",
      "timestamp",
      "totalDifficulty",
      "transactions",
      "transactionsRoot",
      "uncles",
    ]
  `)
})

describe('args: blockNumber', () => {
  test('fetches block by block number', async () => {
    const block = await fetchBlock(networkProvider, {
      blockNumber: initialBlockNumber - 1,
    })
    expect(block).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 10789405161n,
        "difficulty": 11569232145203128n,
        "extraData": "0x75732d656173742d38",
        "gasLimit": 30029295n,
        "gasUsed": 8419709n,
        "hash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
        "logsBloom": "0x08b522b221800a2000021a32a0004268801a05e9105c4304125198c83020e12500015440044016000661860736212182030500441d22319624592cc092222201604000196d4ec408fa4046a9e52ca0a8200990612d4448c104881811a02030410320aab20226489040583901c8a05ba4604645fd0cd9040402804db0810a1900424089042c228c4880c88048b32c26465c886ca105a2466824604741e650804c8a83a16d912265044400cc80d29c01901444220162a4020603f1140410c009426433d043290fb8e001a00838600e525345f694c20482441e140239430090200120d023a8400abf0b62819881110958890418f2485938005a429b011a92cb2a69",
        "miner": "0xea674fdde714fd979de3edf0f56aa9716b898ec8",
        "mixHash": "0x86cbaf193f6e30d5c7ff809550d91704998566f03ca34e3a23fa04e30d7c1178",
        "nonce": "0x235a8f78e6352489",
        "number": 15131999,
        "parentHash": "0xeab82dfe587a9156272df26587d878f9cf39ba6afade6ccf3d483924f99b109f",
        "receiptsRoot": "0xb15a1c2aec1c931096063acf5d006fcda83cdd41126afe80eb98d94648556978",
        "sealFields": [],
        "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "size": 41043n,
        "stateRoot": "0x68d4f779d43661a4892a6ecd83f254d024563a5c0a9cc4fff1ac58cecbafd3ff",
        "timestamp": 1657684515n,
        "totalDifficulty": 53882465340013743427054n,
        "transactions": [
          "0x31a326e4190db96a0c12ef2f2aee6d4566635deb78a3c3497af208b8b7039f22",
          "0xc2647e4afd188cc1ff6d816308e60995c06da8492b69753fb27ac689ebd9248e",
          "0x669dd27e8bd74e75155031651d0ad701adc8b8f9bedfeccc322a39d380825098",
          "0x0fae370120acce68cf00586a166a7a73aefcc286574b1a96d45c049d10cdeba7",
          "0x6bebae5e7c93fb7b601b520d4664616a612f8b7a71690efa3bb3d9decf548841",
          "0x082395f55b04a9ee09fc341ed0c10f0289786057fbb7153584cad85b6abf7737",
          "0x7a0942ecce50ef0ecda3029719fc529ee0b149c79ef1c84a43f8b53c7f2fa660",
          "0x609f95d46c319102a470c9a7b68a97c9de4d5bca0233af743c3b680bbf97fdeb",
          "0x50292893e5f91a9e6d09776c6f5ba868057fc9468019f555a948e18d6a622406",
          "0xe208012aeec79a6b9a958514d08e7e7a14c5d16b0fa11cea35e826810e97789f",
          "0xb6d72949c12ebe25307e85f5d5dd17bdc7eb62fd22a93c852a355462cea75f0a",
          "0x827f1124b75a404f8da15c7fe10d74f22e111ad16d057922b26135063b5e75fd",
          "0x5cac55cc783bcc23b640b3433a9f1dc8cefd4f95684f0b27bebdd9bb282fe9f6",
          "0x9614f8f648e83cf4228b0544916ff181b693d5e2a1376ebad84ee31d43f91860",
          "0xc636ede0cdbace95472ce42e2235ea3e94a0287335b04cfeb1c0cce7a9732ad3",
          "0x83e881809920a9b2418f5509cf25e8a3f7fe6e75f34db297da52e1acd83d576f",
          "0x61b131e478e9accb3181afaf1b2b1a40dbc0fc711173b10273ecc84184f2c0d8",
          "0x12987f1ff3f16ff08df4ae43a59561a827cfed6316f94b598ce78c80c3b14dcf",
          "0xb7422f17f466f9d5e13ab8aaa928b550b596c5d4c124c79610268c1802c132b8",
          "0x4afb681ec2e901b78bd4561eb1b3f2b0a2c0b8ffa4d1fce333bd58cea6483ed4",
          "0x7f618f7aa54046c5c12371abe19733461b2e44d75359e8c5935a395b1931e5a9",
          "0x2fbf4a039a90a69e65bcf4d5c2a67495b1d0633929b44d3c489806265900ff8c",
          "0xb4037dd740cffa6638a80ce85d9e1cfd62d2a31b08c5e5a62c10f968ab7705eb",
          "0x9bd4ec9fead64dcc8df9dd42e00e7fc2b122798a7f472b87d547548ecc9b6b1a",
          "0xf3087054ac96f8ea6cd40e80394e094182d3ca77149bd92a63cba7753a35dcba",
          "0x160fbca06ee6cec203d7c2251dcb4a5db47da6ad985b58c6cc63bf5f7c5806ce",
          "0x75b48e7b41b6c52adef1ae99727e7d9d6250461731c645b6c03c39f1284b3409",
          "0x9bbc1c22d9b827f51d4f18752adb4b482a31d37bc4c58a404b25e04c0b009182",
          "0xc65774b22f4057aa8287793974cc28c79e494b57d154389dac0905423d949dd8",
          "0x15681b1560548aa21e07904b4a648887c1c6e0d81ce4645b4a76ada3452990ee",
          "0x36297bb07eccbbab5a2d7bde168d0280b121ad48f6d547ccd0b29daa0de8f5a5",
          "0x37b51c9a79aae1f2740568121fdee4856b0c340e6e671caa37a5c9616e989223",
          "0x63cb2b59333d0b702e0b51bedfa76d8cbc9091aa09f94cb82861250264e99133",
          "0x1b9a7492c8c6d55a78ddae24f2abb780e48fe6a2c81c4e3cf35994be2692fa84",
          "0x2b94b02c1da32a268160a53b99ef059fda53f6f11871c8e02fda7d5ef3c56e43",
          "0x1b3731ff31119b84bbc7bb25fa59545dc8ba03dfd25f00a30f77c20b92d08d11",
          "0xb1dceac7d9a7dda5b706d75c25cf9f016b452810cefd162655879a7bc8221289",
          "0x0b036f0c7329866284253592a100779627c34f923af14fe178d7d65f23a96851",
          "0x7e7abadf119913899e89981f3739360c095cb7df3f13b7df0ba5cebc66a4aebe",
          "0xddd2187f02ac24eb8dc631cfec66d9143a739b8b6148731736fec640c4488e04",
          "0x0b909194cf698b2326956f266da21f380b78d9704bab924bde1314727c96ec5f",
          "0x427ed7839df5785fcf30e356d6f18178b10200dd33ecb2b2e9472a3728749898",
          "0x839d7159819f5bd1dbeffb3af409777622eb733c3663006f1ad3578bc4235cfa",
          "0x2daf61a6aa6a5165af976d4bc6f66faa096ab89b61c4d98739a5488e3ad8d000",
          "0x8c50fe2ac2a20a083925070ec464cc749c3da8e13b319064d2c8fb12701d4a9e",
          "0x28098f381800e52fdea58cbe239765741a54df9e4013c3cbad7791a7d3971706",
          "0xd325c0d2f149ee871187da6634bb677900b7646f0c22cf6df5c56faf12d3c816",
          "0x079c7866c121e8ddb51c6ea8599b324004c6dc976d098e3bd703be88cd1cf4ff",
          "0x26ce16105acfeb7c4bf4abbf30a500be7bf513f3949a489f66c86f5f77c4a3a4",
          "0xffd31d1feeab34af48f2884b4480ece74e92c3c556a17edfa3d19d272524e269",
          "0x01ce2618da52462de1cfd74a8347ac8d7c356803e23c6ae63e97d4e3eba0d5e6",
          "0x76508e9443d91c8d5ab889cfee2f0e1bc0aebd52fb428a022dc871331ef7cba9",
          "0x86a015a73e1479725117534e2294d99b68d4f7b01ea4059eb8202403540fb6e6",
          "0x46efad3ef5e2d3c584f18f05bfd04ea97388781cda84f6541d6e1fec999d5991",
          "0xacc435cb5fe46e1add9c99b23a7a591e97b1fff05444e445a06cfc328ebb861d",
          "0x057bdd233de017c20f334aba3d6491f3806d288eafd149604b1f3af6ad9cfd58",
          "0xb88cd845ab58373ccbeff334a5b5f2699dcf7b20cc5ba4514b2f2ec11782424f",
          "0x8d065d16037548bb41232277395aa1f8a892fbd4cf7c279bafe3a104fc36ab60",
          "0x45de352f4e32658e0bf8a11d6d745dc8c21c2451ed399277728e8d9f4e7e5096",
          "0x810e5c4be24e4379b5d13c8636d22ec6acf2f35d0926291c5c38adccf79077c7",
          "0x746742cd7e3000db1777e449a5a98f799a28e3a7f066e3dea0d49e8a50bb472a",
          "0x8f3cb6462bce7adf4fd1c326157f74d03a9f635df2e09db19b12a301734593bf",
          "0xf1bde46e351203c0a20adff4f9819a1979227cad0a79c55cc9f542de88b735d1",
          "0x5318fb7d24ed69198d093e887a51c3b66d3b8344d05ada84681a97a9b1b6d6dc",
          "0x8906b5bde33ff8c2a3ccca80fbe638c0ccbbedf2d65a269b5b1f9c12d73e9f2d",
          "0xd1eccce7f6b756a72326aa6aef321084cca87f669e69228752dee812e0f3fc1c",
          "0xee7feaa0270d492aba352b9cc8a864f2c1f9dc17cc31383a994e51da02c140e9",
          "0x5173f1acfb5f5d3b14e9fa1dd3db777f43eece5f2a4b70b1fcd70d461a81807b",
          "0x98d9f9564c0a5b17b2470f1eeb4001130b87f02202e3e1c71599b52ff805454d",
          "0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b",
          "0xaa120245e3f1cc1f2553ab13920ba730237ba99c1d3fc25b75906e859e4d41b2",
          "0x4a6038d06abdc799000da80b8d9271b53dc2202c9dfea57090acf57d7c8a44b4",
          "0x7ca6120a35a182cf9b3cdfd69c78a93f71ef3debb6864dd19a4c3a0c67cfdee8",
          "0x5210718d14f2d915e1908be1a7e2a8cd90bbda4d1bd98c83cc4f766ebd721db9",
          "0xd3dbb49f48693631e638c246536b65748c6e2e7eaece30e639abed8a0e313d40",
          "0x56ebd5673eb96134ad782216d3ef47c91d549a3c6a8b6778f8c8edac625f7997",
          "0x506de1a75c9ac07fb78f556272e15c6566f8ee75980b07a537051dd80e8109e6",
          "0x71947ac71eb0af950309ac629f8f7460de8f3eff8980b02796adf8b6cb77d32c",
          "0xc6518b7a39863331939d4baa9e6cabc471153795723bb651e06ee646b5bd740d",
          "0x247e6cbb9eb1b6c8bde60e91dd305920e6cbb4fc8059ee63f0247f5e1da46883",
          "0x2b81cc624b243aed036e1deb5473a2b63fe609593e6a9420255b0cb3daaf4f32",
          "0xa46904b658c7bde7420859eb06825f54f1d49899c6e76b07c81305ae4f1610c7",
          "0xa77bc0fc52937d6a84198333db685c1934b68c65573530ee57adb54f084f4b77",
          "0x6c166dcf23963cc41eb2a7db5f2bf992dd9b97969b6a407c5c1e68370f028fa2",
          "0x451d431173ff5c1a311cfad783bbdc0c543070958db28399e062e1020e58d253",
          "0x02dd65f8dca50547380f7f6966639d2dca2d3e57eab3071528ce9060663ac713",
          "0x946c984860e6c133e66ecadf8f3a8297ca55dbe3306de61ff259ffba195648aa",
          "0x2e5dc0dad5c299345174c039e972c2513e51e9133a5fba387252fb40fe6b5d5a",
          "0x4f28b0a58c95b8f2a5cdd9a16c1f7c6f8dbb8ec95c81e8960517b1d1252b963f",
          "0xcb15a816f8705609c5b17783ddacb537ee7395a711f3ef7b08487fe28ab55a3a",
          "0xfe523cd10892715f1822530cc1b004bff9c112889d3a821bd54dd4647ea221ce",
          "0xdf4bfe52c00552df697d810ceda365ef449cb67aaa77d84f8da55bb38f45546e",
          "0x49dde171f9369ec9ab0ca4f9ede1fef47e23d7ffc72091003bd582cb700bfae8",
          "0x005f4e886398db108d93543c2b8087cc2f2641e6c5c96241c6ddbab225f7c664",
          "0xe32980fbd59c13943ff61cd84486dbe93419d7d01ef7fc4e553c3d0d37e0ff21",
          "0xf3db15736a5c4ba9065b325b19f3e64056811d6d946cec4b58bde19fb9091501",
          "0xb3a84c4ea2b4c54308b091bd44b096d693c57fb41e0b4570d6d626d281c5f308",
          "0x8a3e68e7d829c83d72d5178787e10eca275f48b6436be1735b87ff1596420c88",
          "0x886df53066105ebe390f3efcb4a523d7178597da84dfaa1bbc524e2b20b5650c",
        ],
        "transactionsRoot": "0x18f39063215bc432da4e7e9bc89f1e7260ca20167b9dee5e0dce72b2eb6b1745",
        "uncles": [],
      }
    `)
  })
})

describe('args: blockTag', () => {
  test('fetches block by block time (latest)', async () => {
    const block = await fetchBlock(networkProvider, {
      blockTag: 'latest',
    })
    expect(block).toBeDefined()
    expect(Object.keys(block!)).toMatchInlineSnapshot(`
      [
        "baseFeePerGas",
        "difficulty",
        "extraData",
        "gasLimit",
        "gasUsed",
        "hash",
        "logsBloom",
        "miner",
        "mixHash",
        "nonce",
        "number",
        "parentHash",
        "receiptsRoot",
        "sealFields",
        "sha3Uncles",
        "size",
        "stateRoot",
        "timestamp",
        "totalDifficulty",
        "transactions",
        "transactionsRoot",
        "uncles",
      ]
    `)
  })

  test('fetches block by block time (pending)', async () => {
    const block = await fetchBlock(networkProvider, {
      blockTag: 'pending',
    })
    expect(block).toBeDefined()
    expect(Object.keys(block!)).toMatchInlineSnapshot(`
      [
        "baseFeePerGas",
        "difficulty",
        "extraData",
        "gasLimit",
        "gasUsed",
        "hash",
        "logsBloom",
        "miner",
        "mixHash",
        "nonce",
        "number",
        "parentHash",
        "receiptsRoot",
        "sealFields",
        "sha3Uncles",
        "size",
        "stateRoot",
        "timestamp",
        "totalDifficulty",
        "transactions",
        "transactionsRoot",
        "uncles",
      ]
    `)
  })

  test('fetches block by block time (earliest)', async () => {
    const block = await fetchBlock(networkProvider, {
      blockTag: 'earliest',
    })
    expect(block).toBeDefined()
    expect(Object.keys(block!)).toMatchInlineSnapshot(`
      [
        "baseFeePerGas",
        "difficulty",
        "extraData",
        "gasLimit",
        "gasUsed",
        "hash",
        "logsBloom",
        "miner",
        "mixHash",
        "nonce",
        "number",
        "parentHash",
        "receiptsRoot",
        "sealFields",
        "sha3Uncles",
        "size",
        "stateRoot",
        "timestamp",
        "totalDifficulty",
        "transactions",
        "transactionsRoot",
        "uncles",
      ]
    `)
  })
})

describe('args: hash', () => {
  test('fetches block by block hash', async () => {
    const initialBlock = await fetchBlock(networkProvider, {
      blockNumber: initialBlockNumber,
    })
    const block = await fetchBlock(networkProvider, {
      blockHash: initialBlock!.hash!,
    })
    expect(block).toMatchInlineSnapshot(`
      {
        "baseFeePerGas": 10197021454n,
        "difficulty": 11574915544074895n,
        "extraData": "0x455841506f6f6c",
        "gasLimit": 30000000n,
        "gasUsed": 9363081n,
        "hash": "0xf338169e315cc8de7e1d0e9edb09730cb508b392160d754774718b31cc4a70c0",
        "logsBloom": "0x78e4d12a55044c21c040b208e250557994080090a8d6052611513800740000614a028c2800042200020118e3c4044f20962524950c4336500e4126ec0132748228200162400b8308691e0c48421009e840d786030f025c40de005e8dc00270001b405808365e540a4a6430601920cd15440890a8081144d014ac9294816c3212c2a425005b82590116590053ad2ec001450071099921e209a4280a5349d050248a5a811925a264124992468e17782e71c145039030e2022a19a1cd1c2388411a4c013206024d0f08556a080c026b610d20623268012c161424100b0c0a9024e1a49a264944241112221112304b268a180809165e0588494c265d8c9062896a13",
        "miner": "0x886be08886fa12d3a0981a8e557b74f7937b42e7",
        "mixHash": "0xb7a247294fcf7a0c0f1f3627d09ba944c931a34fd5fdb925f1767d4c6ba876c9",
        "nonce": "0xffd255f3e945231d",
        "number": 15132000,
        "parentHash": "0x89644bbd5c8d682a2e9611170e6c1f02573d866d286f006cbf517eec7254ec2d",
        "receiptsRoot": "0xd909117bfae22ac5f9d173904f7dc00a27ee3ff3d828dd961b71e253157d8542",
        "sealFields": [],
        "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "size": 59399n,
        "stateRoot": "0x56f083bf74d3ead8b4f91f4982e734f2696a00586600569197c356a090122e22",
        "timestamp": 1657684520n,
        "totalDifficulty": 53882476914929287501949n,
        "transactions": [
          "0x9697a030cfaee4cefb5e6a1359ecdcd03a0217416fa0888f3962c74f2c2074cb",
          "0xff275511f5034e7b101f5dc47b5bd83b8a92dc8741654b333798a11ba0117c73",
          "0xb86cb80f0e2dfa0beb35c550dc64c5bce89608ea147c212e334f7f503272e28b",
          "0xafe764c0a883e0c5c3a7bf0ec5bc5e8e948871ed7d9ed355461e03ea0e7effb3",
          "0x6ce25f644d88be8053d62dc120e2db45c14b20656b08fe71994fc7d3b270a11e",
          "0xfdd9f7722fcbfe7a912d7fa6cfbbfa55a490817e6cc8d3f23cabf7e7cec9d715",
          "0x21e8df6de5c18678c856fa59949ee8da05f943d8efd6e31dc95056dd8f44900e",
          "0x4a8dd40ac7f96089199307814ec6d1f31f1379945b38952bbe3033a1b160c601",
          "0x66c4c458125bf988e9e77f90f30e73e4d88d5f515a6312f4c0b7956dea27df53",
          "0x5bb4964eae74ca69e1887bfa091bf28c23e9d95e8f96913894e4a0a9a24bdab7",
          "0x41e399428eb8d252ab919b54eef3e69a22feafcbe2e4b7e610f01a211e5504ee",
          "0xd865cdcf4943fa25558b2b684cdde8ccbf8abe8d9ab1a497187edf954b92f6df",
          "0x95f9e32ac74bddcea6671a6d94e6d55a2dead9e3494ee6c3f36d88dcd3c5fbfa",
          "0x05d67ba3fa0152ecf15aa3b130c5e7e3e5c280e462b03c80a953f8b342ed12f2",
          "0xb7828c6a22d2f140a20c7f8d8cba10f4f0c36694fbf0f738153dca76c3b89931",
          "0x3f36118be046c89187ac3fb03ab0fa54d573f75c4ee3ea9b6d16efff4baa439d",
          "0xbea73e2f6dc161bf2027d7e3dd3eded01f22b170e58be32117e52da3b15a239f",
          "0x617f92df3031dc4f2b8f2cb549679c9dc71e8e62a162c2778801db37c7174a9e",
          "0x5926bf5ff52dfdcbeec66caac83bf7230c752d249d25b58f85a038f3b06a8645",
          "0x0fb76d42008cb47b6ad910941be0faf86b8da65d46dae1266d3c30c557babf98",
          "0x98c4ad85b754b7b389dbc89dd2088583b673df802d4aae61609e2414a844c77c",
          "0xd47905cee98ad95c73d2bd8d3f57d8979560a2b084aad5e1eac7aa76471592fa",
          "0x8835eb6fe0fcb8718302fea7c4087bd447446aab0b32dc8e9525dd8791d6f657",
          "0x66e921a5eb3bbf08cafdaf590e268fc1f5ca45ec2f1b01f641bfdbf6a139ff9e",
          "0x021f839c3311262d7efa5dd7f433a47f9c8507c0336299ef980ef700373add27",
          "0x9cd25187821a76acae12dc5ca5076c082400b77c1190ebb1f3bd2f645637afe3",
          "0xb1a0fdc0cf49a29c9be9ac41238bce662c931562d19561301906477440b47367",
          "0x5a4f37c57db5b3150af98c89e144dec2e133319345f243b8adf4003132e35b2c",
          "0xbb0e59750b8465eeb0802f1ab48c31e59a0dec91637de750af61733535aed1a9",
          "0xb5ce9d4415d96533bed8661387474b6ab9365b7494d9126febb221c28405353e",
          "0x01a0ad3b3af297342c02ae00271f38bb99fecf81304015cfef42c9495388231a",
          "0x68634fd1a5135e6a2a958ab8eb07c85c02ba2ba7f4d0f551a075dd4eeaec3432",
          "0x661b6916ee3d76d952f0c67cca75e1467106f6ea0068f9ff53939057baa0b167",
          "0x6564248734948ee775e7ea937a4b3f2614b4d2a0d21d6d26f1a722d8ad24cabf",
          "0x712de0d53047bb24e89782e6074621b12e154db3aebf0e39572698f6dc2cd545",
          "0xf8e444ab91fdde40678f414cf00d412fed08b67f2025d0e7f2762bf591b48020",
          "0x7986e584ac58ab8cfa88a8d81b4fcb048e06b648d2c2b853a7d37615822024b4",
          "0xb3d8dc32702e030d2a59cfbb3ac2a9503776eb7ab45555e226ebad5c2cc03099",
          "0x8634185373b183c64099638e3920f510c8bd31eda80c515c050b9a8486d0099d",
          "0x61c68bf7ede30842cd9626247b980c7620001f9731bc71e49c5c1ec79766b9a1",
          "0x577f895c53c0d7d5fc8dbd2ac8e8c5f0eddd1fbdfec2a95bc37745e8c6ee2e70",
          "0x89804c10c1be33b4c9b9c589d08e861fcfb39b512d3679ec7fa4c9d36b8098bd",
          "0xd74c615c90a58bff14dcd14f5c2fab63524769ba4fc6e4fb44dba73af217cb2f",
          "0xb477531e2d955548f433dc407a971477881eaed4184d0c2ad9f4c8a32235271c",
          "0xdbf7888cd72808c54a0d0b751de5227d79578dcae010f30e20044cf2a99cc999",
          "0xec2ebe27c616fa4d81d549fd31038c5c0f8d293d04a4e01504f27b4a344d12ef",
          "0x2bbb9095eb2b210b16736a6f63e1f19b140f6d7311a8ac378ee1bda8f5c4eee4",
          "0xd7d00c3e3c66467af7634cd68cbaf35a52c400c2fd6c023e388e6b7d67b5ec8d",
          "0x7612428192224d78b62eb84552282c768725cfeee32c4c5bdb9048e350d025d1",
          "0x77e9693f3c0d72c9ae907d58895510c05c9e6277ab3e77f7bffb6e8ff6c09d29",
          "0x97a9d1f6ffb51d9340d2108c486f48d83c6b85c9f75cf55fe061835c55ea9034",
          "0x42c6cd27050f2e3dcde9044f13b6faff039081e9f94ef8aac7c28213af5dfc0d",
          "0xd0dc28b8131993a758a49409f02c61be5abf714de12f8831260023e6e41c3dcb",
          "0x6fd6a1403a3a6c59eeb060f3de0633d58cc5b7caf8589b091c89c95f59eb08b3",
          "0x044da02de1bd319956b71fe68ce5dc1a9e63589e67eac3fc676a1d1cb6f748df",
          "0x62a0b41722bc828d5619c7d06737ff850d48e02b82750062e21a5cc1e9cca5ba",
          "0x47c4635dae8495ed7a4a2c07b447d1a09947638d3deab88a3c34e175a3d3e74b",
          "0x5d7b9085e755badec8dcdd5eb2643a5f2b5a3727c5f166d18311e12d3b363371",
          "0x0f02396f6b6a3e04e0183369a1215cb37b41306249194bee8076c789f1a1fada",
          "0xc4448561d055638a4898fc393b8f03544acbfaaaf7ed3762fb008932835f763d",
          "0xf2fd3c05824209f4372017e18ea18baa99ffd4ab8c90b095c9de2b84b35bfaf4",
          "0x72b87b3cfcd577cadbb4cdedeb5278d816b2ed8fcd4f4d84404b881b9d688d4f",
          "0x88d52aafcb6669401ba40399b2b59e2d41576cb3019974f14d7521efd5813b67",
          "0xcd7461b92d33e86e7fc6748f70b4eca188a1ae6d6c5c73811016ffae6f95196b",
          "0x03034b3bfb6e0ddf8e7406d72510da60defe0f4027f0dbd0eeb628adab21069c",
          "0x4e2344abd198cf4da17a8c32eeacb07960989e79261bb3c1c2f4b86b8c27b327",
          "0x5e689320a182926c160cc8f2ef669986f0fb44665f49df71ea5aeb0dfb38ee08",
          "0xfd6261442f1e45d27833102b1bf17dc0c7e84f21db8e92b0043ae63052618256",
          "0x796534d0c86fd48fa29dd9445f7e9fd071d86d2fc323efc7fda6ab56fb7b05de",
          "0x2b27cd3b94038e3c718b4e44cad5f25d6ec711252696ba49af3e059425852a71",
          "0xd8fc4e0eb0c70ea369e6c848c1c6715e5636b1dd162a9ca6b99cd89e759b1859",
          "0x2ab008f5cf2c0a1806f1bdafee86014b6bd68cf13c0c10aed6a175c07566b582",
          "0x735cf4ab1c5a3d5e897d77e2f2020053442cff259b6818d196fc40b57523ffbb",
          "0x5e7663ef708fc2d427434ba05f8943a90fc8b5114e82237e45831be2d725fa89",
          "0xb345b1beb2a0da05d84aaa248231c20e9d482d3c868513229d0143d9cf685499",
          "0x532ea5c2c01d00ca18ad986fb81dad749ae893dafb92197f7caaca1319de2778",
          "0xff63a4df3ae46db989b1b61d864a2876b3966d08eb43b1c6ab31ea1c8c3665c2",
          "0x5003a373b59325a7b30333e9a8e416040851ba0d95f8cec6b6ba5f5ae16c3a47",
          "0x5f4c43f3ee95bfef96fba605b53735d6e5ba03220f8834f1329a52ccf71a4efa",
          "0xcc96b149d0ff3a1756f204faad1ade4daaf53364cd33912ffa43e407b871b014",
          "0x65f5e649bde96f67a8bfbda0735f1090dc98b7e6fac70f4870037e49447a5004",
          "0x62ece0427e6ae6f8a9810bb3eaafdbd12c6e4218da29771ffdcf36415923d4c9",
          "0xe22d456ad5598a73e72e26ca9320805f05253c04e4d72498ffb46060f388f5af",
          "0x6b3f90e90f04ecff93d03197a5eb91aac05682ccf051340b8d9eb42512be0dac",
          "0xd4a8cf1bf4d05f44480ae4a513d09cddb273880ed249168bf2c523ee9e5c7722",
          "0xd452769a91831a7d00bdab8136c892f23c2c6bfec2e6a5db1efe42d4d32e7725",
          "0x4188a8de8da99cceff63f269aed7d7c4db61e96fadd33e89263f44a9a39ecfdc",
          "0x0bd8595602e79f38c47497a206dd66b218e82fe8ef021c68f05e8556f737702d",
          "0x5b3833caddf9c4275b85487e38b3dfa57105101cfc82947d34239c3389d1e528",
          "0xf0b4b4c65ffd72d5c6325e3aeb5012c059a2ad82219e6779f21678b188bf0bb8",
          "0x1a60d9f66780af4b0902026d701bf517cbe7c303cad26dc651806a374742b08b",
          "0x6dd90a8ff629bdc82df59a97c88c59f3cd513dde03c3a562d868881b42094c74",
          "0xce0a14541c9b5ab3ca067bca319ded2efd9ea6a1501eda6b267adeb81006f469",
          "0x8e646c08c501f2554f539f2fd71436e12480b5ad77bab3635c42237ca7a50771",
          "0xfbbcbdec45421af2d984217d32ebe45f3638495d6a560203ae6195874f507630",
          "0x00939783084c4f60fa2392af575f92b47e97d9236f23aae4d2f2c45881d484a9",
          "0x12f54fae81f7f817d6323397e1f1cab2da354a4d0ece04bcbbc4a9e61d055c18",
          "0x293516b8f59fff29f5ae67fa213536b0e906489d8973e5d66aa12bc2dc87e5f0",
          "0x4fce695a51719e881bcff039241f44ddbc61a662b97badabf4c7c2e7c8bf5efd",
          "0xfab6493fb8ddebb820856c529e17f5c9c66dc8d5216d95aa1f6ba0ad9a00a937",
          "0x9704cf7f9e8b24eb75c890d6521ad5685bbb1fd8458ad72a777ae782d3f07568",
          "0xeef49e2632d5573cd99eb230aab15c6b3660e489d59bcb6d1f3957a88bf5e2b3",
          "0x0d598dcc456a290d9f3bc84481f4e72a57906f34ae40d0d9e7e1439da8adbb9b",
          "0x7b661cb11d771098e1934ad8d9e5db065345d94fcda5f42a35d0cef1f5d37435",
          "0x3bd608fdea0838a0a726e05468d8da8bace59ddde41050c3c13442aae5e82dcf",
          "0x0a327b7f8b235897be7b3618a92a479028f85cfe94fb3a1d2230e1c385c1750c",
          "0x6b8d2437c2f2de0e6d96e7cab12f4ef95f3dbbb8bca0f43186243e56cc04c828",
          "0x18b255741f6bb12eed73beec66f6235c4e8d5fba731d497594011e546eac6571",
          "0x57949ba6e1cb686d045d84acd63733993457437cfc29e3a304350e356507ef94",
          "0xeefe5c091521f21b15eed162faba54a732e20abc116c972a05e6ad9d0257ca52",
          "0x7fcdcd93e6b51929ff2c74c84c547050e80489acb80b119ee7c859f54545c946",
          "0x8e66644066c38a2329b58868f6c9368b06d721d06b6aab83641bd055c2e4ef71",
          "0x4b834d4f40f4e769bfb6f845c516e0896a3dbc776733fbe472a8071748a80de5",
          "0x893d352adbc08a22c960ed3e54ba296b2e7a400bebd01d3df8691b71e8d3c333",
          "0x41f2dc4b538a3120cb6ba6a1541df35f13126978eb60eb08700287395f3c0b68",
          "0x765d1d811760b513af039b32c164b123c30f029be48713e8350dc012b7a06576",
          "0x75378ebb62606c2d9dc8f5e9deb518deae4af068577b5f978396e22f78b841e2",
          "0x9eba9b3d81117e13e1862409d60c4db4fe1cd8910df2b9620afc62798ce68ba8",
          "0xa56df8fcba7a5101681b26c1b9b95066aed99af31998df43ae20d4dd9167b72c",
          "0x4d8f4ba79c732c58680dd85f811d1ba64d1b1029588c9baebdbc695120709cf6",
          "0x91d8a6b8a6903f3705e77a623d173a45802fcc1d7fce21fddf2e9cc01a817546",
          "0x128493b578b408b7759ac816c20f65f93ea54fc07df5047c1b0c43c030e805ae",
          "0xcdfc35f5ecbbf42dca9c5b09a00cf5d9de53df70dc50a839752df0774a0f32c2",
          "0x00cbc7acaec8d5881b40e1ae867cda25afb62f0c6aa6a3e8ad81f99181c8dd8a",
        ],
        "transactionsRoot": "0x3fadac895bb584a7da5316da7dcd8acaf97c6d8bd21e6ff1e099fc0118116535",
        "uncles": [],
      }
    `)
  })
})

describe('args: includeTransactions', () => {
  test('fetches block with transactions included', async () => {
    const block = await fetchBlock(networkProvider, {
      blockNumber: initialBlockNumber,
      includeTransactions: true,
    })
    expect(block?.transactions.length).toEqual(124)
    expect(block?.transactions[0]).toMatchInlineSnapshot(`
      {
        "blockHash": "0xf338169e315cc8de7e1d0e9edb09730cb508b392160d754774718b31cc4a70c0",
        "blockNumber": "0xe6e560",
        "from": "0x74922747c8468737c73cf4a484823f3d9912cc69",
        "gas": "0x183ac",
        "gasPrice": "0xa7a358200",
        "hash": "0x9697a030cfaee4cefb5e6a1359ecdcd03a0217416fa0888f3962c74f2c2074cb",
        "input": "0xa9059cbb000000000000000000000000a455c16a55d65bd19e88733b73794465a04d9561000000000000000000000000000000000000000000000000000000000587d1ff",
        "nonce": "0x0",
        "r": "0x6dbd07efacd8589d90b85c91ba08dd98bdfafebe90e72d4dc02d786b327894c5",
        "s": "0xe9455b807886f39301ea09987333659902aca4042f6e9e9e9cdfcb70b56e4fd",
        "to": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "transactionIndex": "0x0",
        "type": "0x0",
        "v": "0x25",
        "value": "0x0",
      }
    `)
  })
})

test('non-existent block: throws if block number does not exist', async () => {
  await expect(
    fetchBlock(networkProvider, {
      blockNumber: 69420694206942,
      includeTransactions: true,
    }),
  ).rejects.toMatchInlineSnapshot(`
      [BlockNotFoundError: Block at number "69420694206942" could not be found.

      Details: block not found at given hash or number
      Version: viem@1.0.2]
    `)
})

test('non-existent block: throws if block hash does not exist', async () => {
  await expect(
    fetchBlock(networkProvider, {
      blockHash:
        '0xd4a8cf1bf4d05f44480ae4a513d09cddb273880ed249168bf2c523ee9e5c7722',
      includeTransactions: true,
    }),
  ).rejects.toMatchInlineSnapshot(`
      [BlockNotFoundError: Block at hash "0xd4a8cf1bf4d05f44480ae4a513d09cddb273880ed249168bf2c523ee9e5c7722" could not be found.

      Details: block not found at given hash or number
      Version: viem@1.0.2]
    `)
})

test('BlockNotFoundError', () => {
  expect(new BlockNotFoundError({ blockNumber: 69420 })).toMatchInlineSnapshot(`
    [BlockNotFoundError: Block at number "69420" could not be found.

    Details: block not found at given hash or number
    Version: viem@1.0.2]
  `)
  expect(new BlockNotFoundError({ blockHash: '0x69420' }))
    .toMatchInlineSnapshot(`
      [BlockNotFoundError: Block at hash "0x69420" could not be found.

      Details: block not found at given hash or number
      Version: viem@1.0.2]
    `)
  expect(new BlockNotFoundError({})).toMatchInlineSnapshot(`
    [BlockNotFoundError: Block could not be found.

    Details: block not found at given hash or number
    Version: viem@1.0.2]
  `)
})
