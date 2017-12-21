const AtnLib = require('../')

var lib = new AtnLib(
  "c431bc51736dcacb1f89369fca31f2e252a08c3abe875aba6af607460f42986b",
  // "https://kovan.infura.io/AMiQRoDABln2S7gObydS"
  "http://118.31.18.101:4045"
);

lib.getAiList();
// lib.getAiInfo(1);
// lib.openChannel('0x9765e2d8467334198b402e4d4551dd49e63327ec', 100);
// lib.topUpChannel('0x9765e2d8467334198b402e4d4551dd49e63327ec', 5122147, 1);
// lib.closeChannel('http://127.0.0.1:5000',"0x9765e2d8467334198b402e4d4551dd49e63327ec", 5122475, 0)
// lib.getChannels('http://127.0.0.1:5000', 5122145)
// lib.settleChannel('0x9765e2d8467334198b402e4d4551dd49e63327ec' ,5122145)
// lib.getPrice('xiaoi')
// lib.callAI(
//   '',
//   'xiaoi',
//   'hello',
//   '0x9765e2d8467334198b402e4d4551dd49e63327ec',
//   5131738,
//   6,
//   1
// )