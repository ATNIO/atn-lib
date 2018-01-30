# atn-lib v0.2.0-beta
A light client lib for consumer to call ATN AI services.

## Installation
Using npm:
```
$ npm i --save atn-lib
$ npm i --save web3@1.0.0-beta.28
```

In Node.js:
```javascript
var AtnLib = require('atn-lib');
const lib = new AtnLib(
  "yourPrivateKey",        // private key 
  "rpcProvider"          // host and port Parity/Geth serves RPC requests on
);
```

**Note:**
Your account should be existed in Kovan. 

## Usage

### µraiden 
**Step 1:**
Getting all AI info 
`lib.getAiList()`

**Step 2:**
Choosing an AI to use 
`lib.getAiInfo(aiId)`

**Step 3:**
Opening a transfer channel
`lib.openChannel(aiInfo.dbot_receiver, deposit)`

**Step 4:**
Getting the price of the AI
`lib.getPrice(aiInfo.dbot_url, aiInfo.name)`

**Step 5:**
Calling the AI
```
lib.callAI(
      aiInfo.dbot_url,
      aiInfo.name,
      input,
      aiInfo.dbot_receiver,
      block,
      balance,
      fee
    );
```

### smart contract
**Step 1:**
Getting all AI info 
`lib.getAiList()`

**Step 2:**
Choosing an AI to use 
`lib.getAiInfo(aiId)`

**Step 3:**
Calling the AI
`lib.directlyCallAI(aiInfo.name, aiInfo.bill_kovan_addr, input)`

## Example
see in [simple.js](test/simple.js)
## API in Detail
### getAiList
`lib.getAiList()`
#### Parameters
  none
#### Returns
`Array`: The list of all AI:
* <a name="ai_object">`AI Object`</a>
    * <a name="ai_id">`id`</a>-`Number`: The id of AI
    * `type`-`String`: The type of AI
    * <a name="ai_name">`name`-`String`</a>: The name of AI
    * `bill_type`-`String`: The bill type of AI
      * `'0'`: free
      * `'1'`: times
      * `'2'`: interval
    * <a id="bill_kovan_addr">`bill_kovan_addr`</a>-`String`: The address of billing contract in Kovan
    *  <a id="dbot_url">`dbot_url`</a>-`String`: Host and port dbot serves requests on  
    * <a id="dbot_receiver">`dbot_receiver`</a>-`String`: The address of dbot provider
    * <a id="ai_params">`params`</a>-`String`: The AI's parameters 
      * `name`-`String`: The key of parameter
      * `type`-`String`: The type of parameter
      * `required`-`Number`: The parameter is required or not
        * `1`: required
        * `0`: options
  
### getAiInfo
`lib.getAiInfo(id)`
#### Parameters
[id](#ai_id)-`Number`: The id of AI 
#### Returns
[AI Object](#ai_object)

### openChannel
`lib.openChannel(receiver, deposit)`
#### Parameters
1. [receiver](#dbot_receiver)-`String`: The address of dbot provider

2. `deposit`-`Number`: Deposit value(number of ATN)
#### Returns
<a id="channel_info">`Result`</a>: The opened channel info
  * `0`: The key of channel
  * `1`: The balance of deposit value
  * `2`: Settle block number of closing requests
  * `3`: Closing balance of closing requests
  * <a id="opening_block_number">`4`</a>: Opening block number 
  * `5`: The address of receiver 
  * `6`: The address of sender

### topUpChannel
`lib.topUpChannel(receiver, block, deposit)`
#### Parameters
1. [receiver](#dbot_receiver)-`String`: The address of dbot provider
2. [block](#opening_block_number)-`Number`: Opening block number 
3. `deposit`-`Number`: Topup value(number of ATN)
#### Returns
[Result](#channel_info): The topup channel info

### getChannels
`lib.getChannels(dbot_url, block, status)`
#### Parameters
1. [dbot_url](#dbot_url)-`String`: Host and port dbot serves requests on 
2. [block](#opening_block_number)(options)-`Number`: Opening block number 
3. `status`(options)-`String`:
  * `all`: all status channels
  * `open/opened`(default): opened channels
  * `closed`: closed channels
#### Returns
`channel info`:
  * [receiver](#dbot_receiver): The address of dbot provider
  * `sender`: The address of sender
  * `deposit`: Deposit value(number of ATN) of the channel
  * [open_block_number](#opening_block_number): Opening block number
  *  <a id="balance">`balance`</a>: The number of ATN which the channel used

### closeChannel
`lib.closeChannel(dbot_url, receiver, block, balance)`
#### Parameters
1. [dbot_url](#dbot_url)-`String`: Host and port dbot serves requests on 
2. [receiver](#dbot_receiver)-`String`: The address of dbot provider
3. [block](#opening_block_number)-`Number`: Opening block number 
4. `balance`-`Number`: The number of ATN which the channel used
#### Returns
`receipt`: The receipt of close channel

### getPrice
`lib.getPrice(dbot_url, ai_name)`
#### Parameters
1. [dbot_url](#dbot_url)-`String`: Host and port dbot serves requests on 
2. [ai_name](#ai_name)-`String`: The name of AI
#### Returns
<a id="fee">`fee`</a>: The cost of calling AI

### callAI
`lib.callAI(dbot_url, ai_name, input, receiver, block, balance, price)`
#### Parameters
1. [dbot_url](#dbot_url)-`String`: Host and port dbot serves requests on 
2. [ai_name](#ai_name)-`String`: The name of AI
3. [input](#ai_params)-`Object`: An object build with ai parameters
4. [receiver](#dbot_receiver)-`String`: The address of dbot provider
5. [block](#opening_block_number)-`Number`: Opening block number
6. [balance](#balance)-`Number`: The number of ATN which the channel used
7. [price](#fee)-`Number`: The cost of calling AI
#### Returns
`Result`: The result of calling AI

### directlyGetPrice
`lib.directlyGetPrice(ai_name)`
#### Parameters
1. [ai_name](#ai_name)-`String`: The name of AI
#### Returns
`fee`: The cost of calling AI

### directlyCallAI
`lib.directlyCallAI(ai_name, bill_addr, input)`

**Note**: In this way, you should use ws interface to init the lib
#### Parameters
1. [ai_name](#ai_name "ai_name")-`String`: The name of AI
2. [bill_addr](#bill_kovan_addr)-`String`: The address of billing contract in Kovan
3. [input](#ai_params)-`Number`: An object build with ai parameters
#### Returns
`Result`: The result of calling AI