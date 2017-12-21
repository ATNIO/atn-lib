const Web3 = require('web3');
const atn_artifacts = require('./data/contracts/ATN.json');
const uraiden_artifacts = require('./data/contracts/RaidenMicroTransferChannels.json');
const config = require('./data/config');
const rp = require('request-promise')

class AtnLib {
  constructor(private_key, rpc_provider = 'http://localhost:8545') {
    this.private_key = private_key;
    this.web3 = new Web3(new Web3.providers.HttpProvider(rpc_provider));
    this.senderAccount = this.web3.eth.accounts.privateKeyToAccount("0x" + this.private_key);
    this.sender = this.senderAccount.address.toLowerCase();
    this.web3.eth.accounts.wallet.add(this.senderAccount);
    this.uraiden = new this.web3.eth.Contract(uraiden_artifacts.abi, config.uraiden);
    this.atn = new this.web3.eth.Contract(atn_artifacts.abi, config.atn);
    this.uraiden.options.from = this.sender;
    this.uraiden.options.gas = config.gas;
    this.uraiden.options.gasPrice = config.gasPrice;
    this.atn.options.from = this.sender;
    this.atn.options.gas = config.gas;
    this.atn.options.gasPrice = config.gasPrice;
    this.decimals = 18;
    this.version = '1';
    this.apis = {
      'transfer': `/api/${this.version}/channels/transfer`,
      'channels': `/api/${this.version}/channels`
    }    
  }

  num2bal(value) {
    return Math.floor(value * Math.pow(10, this.decimals));
  }

  bal2num(bal) {
    return bal && bal.div ?
      bal.div(Math.pow(10, this.decimals)) :
      bal / Math.pow(10, this.decimals);
  }

  encodeHex(str, zPadLength) {
    /* Encode a string or number as hexadecimal, without '0x' prefix
     */
    if (typeof str === "number") {
      str = str.toString(16);
    } else {
      str = [...str].map((char) =>
          char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('');
    }
    return str.padStart(zPadLength, '0');
  }

  async balanceOfEth() {
    return this.bal2num(await this.web3.eth.getBalance(this.sender));
  }

  async balanceOfAtn() {
    return this.bal2num(await this.atn.methods.balanceOf(this.sender).call());
  }

  async getAiList(tags = []) {
    const opts = {
      uri: config.aimarket + config.apis.getAiList,
      qs: {
        tags,
      },
      json: true,
    }
    let res = await rp.get(opts);
    console.log(res)
  }

  async getAiInfo(id) {
    const opts = {
      uri: config.aimarket + config.apis.getAiInfo,
      qs: {
        id,
      },
      json: true,
    }
    let res = await rp.get(opts);
    console.log(res)
  }

  async openChannel(receiver, deposit) {
    deposit = this.num2bal(deposit);    
    let balance = await this.atn.methods.balanceOf(this.sender).call();
    if (balance < deposit) throw `Not enough tokens. Token balance = ${this.bal2num(balance)}, required = ${this.bal2num(deposit)}`;
    let receipt;
    if (typeof this.atn.methods['transfer(address,uint256,bytes)'] === 'function') {
      receipt = await this.atn.methods['transfer(address,uint256,bytes)'](
        this.uraiden.options.address,
        deposit,
        receiver
      ).send((err, hash) => {
        if(err) console.error(err);
        console.log(`hash:${hash}`);
      });
    } else {
      await this.atn.methods.approve(
        this.uraiden.options.address,
        deposit
      ).send();
      receipt = await this.uraiden.methods.createChannelERC20(
        receiver,
        deposit
      ).send((err, hash) => {
        if(err) console.error(err);
        console.log(`hash:${hash}`);
      });
    }
    console.log(receipt);
    let info = await this.uraiden.methods.getChannelInfo(
      this.sender,
      receiver,
      receipt.blockNumber
    ).call();
    console.log(info)
    return info;
  }

  async topUpChannel(receiver, block_number, deposit) {
    deposit = this.num2bal(deposit);    
    let balance = await this.atn.methods.balanceOf(this.sender).call();
    if (balance < deposit) throw `Not enough tokens. Token balance = ${this.bal2num(balance)}, required = ${this.bal2num(deposit)}`;
    let receipt;
    if (typeof this.atn.methods['transfer(address,uint256,bytes)'] === "function") {
      console.log(1)
      receipt = await this.atn.methods['transfer(address,uint256,bytes)'](
        this.uraiden.options.address,
        deposit,
        receiver + this.encodeHex(block_number, 8) // receiver goes as 3rd param, 20 bytes, plus blocknumber, 4bytes        
      ).send((err, hash) => {
        if(err) console.error(err);
        console.log(`hash:${hash}`);
      });
    } else {
      await this.atg.approve(
        this.uraiden.options.address,
        deposit
      ).send();
      receipt = await this.contract.topUpERC20(
        receiver,
        block_number,
        deposit
      ).send((err, hash) => {
        if(err) console.error(err);
        console.log(`hash:${hash}`);
      });    
    }
    console.log(receipt)
    let info = await this.uraiden.methods.getChannelInfo(
      this.sender,
      receiver,
      block_number
    ).call();
    console.log(info);
    return info;
  }

  async closeRequest(dbot_url, sender, block_number, balance) {
    const opts = {
      uri: `${dbot_url}${this.apis.channels}/${sender}/${block_number}`,
      body: {
        balance
      },
      json: true,
    }
    let res = await rp.delete(opts);
    console.log(res);    
    return res;
  }

  async signMessage(msg) {
    let sign = this.senderAccount.sign(msg);
    console.log(sign);
    return sign.signature;
  }

  async signBalance(receiver, block_number, newBalance) {
    let msg = await this.uraiden.methods.getBalanceMessage(
      receiver,
      block_number,
      this.num2bal(newBalance)
    ).call();
    return await this.signMessage(msg);
  }

  async closeChannel(dbot_url, receiver, block_number, balance) {
    let res = await this.closeRequest(dbot_url, this.sender, block_number, balance);
    let closeSign = res.close_signature;
    let sign = await this.signBalance(receiver, block_number, balance);
    let params = [
      receiver,
      block_number,
      this.num2bal(balance),
      sign
    ];
    let paramsTypes = "address,uint32,uint192,bytes";
    if (closeSign) {
      params.push(closeSign);
      paramsTypes += ",bytes";
    }
    let receipt = await this.uraiden.methods.close(
      ...params
    ).send();
    console.log(receipt);
    return receipt;
  }

  async settleChannel(receiver, block_number) { 
    let receipt = await this.uraiden.methods.settle(
      receiver,
      block_number
    ).send((err, hash) => {
      if(err) console.error(err);
      console.log(`hash:${hash}`);
    });    
    console.log(receipt)
    return receipt;
  }

  async getChannels(dbot_url, block_number, status = 'open') {
    let uri = `${dbot_url}${this.apis.channels}/${this.sender}`;
    if (Number.isInteger(block_number)) {
      uri += `/${block_number}`;
    }
    const opts = {
      uri,
      qs: {
        status
      },
      json: true,
    }
    let res = await rp.get(opts);
    console.log(res);
    return res;
  }

  async callAI(dbot_url, ai_id, input, receiver_addr, block_number, balance, price) {
    let uri = config.aimarket + config.apis.callAI;
    const opts = {
      uri,
      body: {
        ai_id,
        input,
        sender_addr: this.sender,
        receiver_addr,
        block_number,
        balance,
        price
      },
      json: true,
    }
    let res = await rp.post(opts);
    console.log(res);
    return res;
  }

  async getPrice(ai_id) {
    let uri = config.aimarket + config.apis.getPrice;
    const opts = {
      uri,
      qs: {
        ai_id,
        sender_addr: this.sender
      },
      json: true,
    }
    let res = await rp.get(opts);
    console.log(res);
  }

}

var lib = new AtnLib(
  "c431bc51736dcacb1f89369fca31f2e252a08c3abe875aba6af607460f42986b",
  // "https://kovan.infura.io/AMiQRoDABln2S7gObydS"
  "http://118.31.18.101:4045"
);

// lib.getAiList();
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