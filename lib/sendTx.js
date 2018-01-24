const _ = require('underscore');
const Tx = require('ethereumjs-tx');

var getWallet = function (from, accounts) {
  var wallet = null;
  if (_.isNumber(from)) {
    wallet = accounts.wallet[from];
  } else if (_.isObject(from) && from.address && from.privateKey) {
    wallet = from;
  } else {
    wallet = accounts.wallet[from.toLowerCase()];
  }
  return wallet;
};

module.exports = async(web3, contract, method, params, callback) => {
  let wallet = getWallet(contract.options.from, web3.eth.accounts);
  if (wallet && wallet.privateKey) {
    const callData = contract.methods[method](...params).encodeABI();
    const rawTx = {
      gasPrice: ("0x" + contract.options.gasPrice.toString(16)),
      gasLimit: ("0x" + contract.options.gas.toString(16)),
      to: contract.options.address,
      data: callData,
    }
    let sign = await web3.eth.accounts.signTransaction(rawTx, wallet.privateKey);
    const receipt = await web3.eth.sendSignedTransaction(sign.rawTransaction, (err, hash) => {
      if (typeof callback === "function") {
        callback(err, hash);
      }
    });
    // console.log(receipt)
    return receipt;

  } else {
    throw new Error("wallet is required")
  }
}