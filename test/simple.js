const AtnLib = require('../')
var test = require("tape")

var lib = new AtnLib(
  "c431bc51736dcacb1f89369fca31f2e252a08c3abe875aba6af607460f42986b",
  // "https://kovan.infura.io/AMiQRoDABln2S7gObydS"
  "ws://118.31.18.101:4046"
);

// test("getAiList", function (assert) {
//   lib.getAiList();
//   assert.end();
// })

// test("getAiInfo", 1, function (assert) {
//   lib.getAiInfo(1);
//   assert.end();
// })

// test("openChannel", function (assert) {
//   lib.openChannel('0x9765e2d8467334198b402e4d4551dd49e63327ec', 1);
//   assert.end();
// })

// test("topUpChannel", function (assert) {
//   lib.topUpChannel('0x9765e2d8467334198b402e4d4551dd49e63327ec', 5176704, 1);
//   assert.end();
// })

// test("closeChannel", function (assert) {
//   lib.closeChannel('http://127.0.0.1:3000', "0x9765e2d8467334198b402e4d4551dd49e63327ec", 5138755, 0);
//   assert.end();
// })

// test("getChannels", function (assert) {
//   lib.getChannels('http://127.0.0.1:3000', 5176704)
//   assert.end();
// })

// test("getPrice", function (assert) {
//   lib.getPrice('http://127.0.0.1:3000', 'xiaoi');
//   assert.end();
// })

// test("callAI", function (assert) {
//   lib.callAI(
//     'http://127.0.0.1:3000',
//     'xiaoi',
//     'hi',
//     '0x9765e2d8467334198b402e4d4551dd49e63327ec',
//     5176704,
//     2,
//     1
//   )
//   assert.end();
// })

// lib.getAiList();
// lib.getAiInfo(1);
// lib.openChannel('0x9765e2d8467334198b402e4d4551dd49e63327ec', 1);
// lib.topUpChannel('0x9765e2d8467334198b402e4d4551dd49e63327ec', 5176704, 1);
// lib.closeChannel('http://127.0.0.1:3000',"0x9765e2d8467334198b402e4d4551dd49e63327ec", 5138755, 0)
// lib.getChannels('http://127.0.0.1:3000', 5176704)
// lib.getPrice('http://127.0.0.1:3000', 'xiaoi')
// lib.callAI(
//   'http://127.0.0.1:3000',
//   'xiaoi',
//   'hi',
//   '0x9765e2d8467334198b402e4d4551dd49e63327ec',
//   5176704,
//   2,
//   1
// )
lib.directlyCallAI('XIAO_I', {
  question:"你好!"
})