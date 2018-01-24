const AtnLib = require('../')
const assert = require("assert")
const lib = new AtnLib(
  "c431bc51736dcacb1f89369fca31f2e252a08c3abe875aba6af607460f42986b",
  // "https://kovan.infura.io/"
  "ws://118.31.18.101:4046"
);

// describe('atnLib', function() {
//   describe('#callAI()', function() {
//     it('test all api', async function() {
//       const lib = new AtnLib(
//         "c431bc51736dcacb1f89369fca31f2e252a08c3abe875aba6af607460f42986b",
//         // "https://kovan.infura.io/"
//         "http://118.31.18.101:4045"
//       );
//       const aiId = 1;
//       const allAi = await lib.getAiList();
//       const aiInfo = await lib.getAiInfo(aiId);
//       const filterAi = Array.from(allAi).filter(ai => 
//         ai.id == aiId
//       );
//       assert.equal(filterAi[0].id, aiInfo.id);

//       const channel = await lib.openChannel('0x9765e2d8467334198b402e4d4551dd49e63327ec', 1);
//       console.log(channel);
//     });
//   });
// });

async function run() {
  // await lib.openChannel('0x9765e2d8467334198b402e4d4551dd49e63327ec', 1);
  await lib.getChannels('http://118.31.18.101:4010', 5537263);
  // await lib.topUpChannel('0x9765e2d8467334198b402e4d4551dd49e63327ec', 5537263, 1)
  // await lib.closeChannel('http://118.31.18.101:4010', "0x9765e2d8467334198b402e4d4551dd49e63327ec", 5537407, 0)
  // await lib.getPrice('http://118.31.18.101:4010', 'xiaoi')
  // await lib.callAI(
  //   'http://118.31.18.101:4010',
  //   'xiaoi',
  //   'hi',
  //   '0x9765e2d8467334198b402e4d4551dd49e63327ec',
  //   5537465,
  //   0,
  //   1
  // )
  // await lib.directlyCallAI('xiaoi','0x77f0c5deccf15868da16d89dc67c4ab0c6aa0d19', {
  //   question: "你好!"
  // })
  // await lib.directlyCallAI('baiduOcr', '0xa99782d73844729822603bf1a7574389dd1427fc', {
  //   method: 'idcard',
  //   url: 'http://imgsrc.baidu.com/imgad/pic/item/bd3eb13533fa828bbd0022d9f61f4134970a5aec.jpg'
  // })
}


run();