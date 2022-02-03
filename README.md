# Harmony Contract Verification Tutorial - Transparent Proxy
Tutorial for harmony contract verification of transparent proxies using hardhat-etherscan  
This a part of a 3-part tutorial for contract verification of open zeppelin proxies:  
- [Transparent Proxies](https://github.com/victaphu/harmony-transparent-proxy-tutorial)
- [UUPS Proxies](https://github.com/victaphu/harmony-uups-proxy-tutorial)
- [Beacon Proxies](https://github.com/victaphu/harmony-beacon-proxy-tutorial)


Prerequisites  
- Hardhat installed globally (https://hardhat.org/getting-started/)
- Install npx and npm version 16

To begin  
- npm install
- configure hardhat.config.js (https://hardhat.org/config/) (we included a copy of the configuration in the repo)
- configure .env file with PRIVATE_KEY (this setting is your private key that holds funds to be used for deployment)
- npx hardhat compile
- npx hardhat run --network harmonyTest scripts/deployContract.js (deploy to harmony testnet)

> Record the output of the deployed smart contract address, this will be used for verification

Example:
```
Initially Deployed 0x2172C790E45fbEdAAbaD13DD650fb7761a450BF3
```

> When deploying proxy contracts, hardhat takes care of deploying the proxy and linking the implementation. This information is stored in the .openzeppelin/networkid.json file (in our case its unknown-1666700000.json).  
> 
> **The output of the script is the proxy contract address (not the implementation).**  



# Verifying using hardhat-etherscan
The hardhat-etherscan module has been modified to support Harmony One. Please make sure that you include the correct package (see package.json).

Verifying proxy contracts are a two-part process  
1. Verify the implementation contract  
2. Verify the proxy itself  


## Verifying the implementation
To verify the implementation contract we will need the address of the implementation (note: running the deployContract script will only output the proxy contract, we need to find the implementation conrtracts). All contract address information pertaining to proxy deployment can be found in file:
```
.openzeppelin/unknown-1666700000.json 
```
Once the deployContract script completes, this file will be updated with the latest version of the deployed contract addresses. In this file we will need the "impls" property, under which the address property will contain our deployed contract address.

Example:
```
"impls": {
    "b413dfcea0523a7ed02dd6e3e5eed15ac6464bab763deeacbcea23d7e72f6810": {
      "address": "0x8E2F4C2a6158A0E992827445ef3fe701a1D8c459",
      "txHash": "0x75a7ec828830e43e49873e37b26416b10a2749e5117a985d0caa26afb26143eb",
      "layout": {
```
With the contract address (in our case 0x8E2F4C2a6158A0E992827445ef3fe701a1D8c459), run the following command to verify the contract:
```
npx hardhat verify --network harmonyTest 0x8E2F4C2a6158A0E992827445ef3fe701a1D8c459
```
If everything works then you should see the following output (superflous output removed):
```
Compiling 1 file with 0.8.2
--> contracts/Box.sol


Successfully submitted source code for contract
contracts/Box.sol:Box at 0x8E2F4C2a6158A0E992827445ef3fe701a1D8c459
for verification on the block explorer. Waiting for verification result...

Successfully verified contract Box on Etherscan.
https://explorer.pops.one/address/0x8E2F4C2a6158A0E992827445ef3fe701a1D8c459#code
```

If you reach this point then your implementation contract has been deployed and now you can move on to verifying the proxy contract itself.

## Verifying the Proxy
Proxy verification involves supplying the arguments used to create the proxy and using the contract address output by the deployContract script as input to hardhat's verification process.

For TransparentProxy, we need the following arguments (refer to <https://forum.openzeppelin.com/t/verify-upgrades-plugins-proxy-on-etherscan/3920> for more details):  
- ProxyAdmin contract address
- Implementation contract address (found in previous steps, in our example it is 0x8E2F4C2a6158A0E992827445ef3fe701a1D8c459)
- Argument(s) supplied when we deployed our implementation as a proxy (in our example the argument supplied was 42, refer to scripts/deployContract.js for more information)
- Proxy Contract address (output from our script, in our example it is 0x2172C790E45fbEdAAbaD13DD650fb7761a450BF3)

The ProxyAdmin contract address can be found in .openzeppelin/unknown-1666700000.json under the "admin" property:
```
{
  "manifestVersion": "3.2",
  "admin": {
    "address": "0xeB5df44afb325540E63290a0C7FCC56952527C09",
    "txHash": "0xf2ed0b61214248a7784124aaafbb84b9300a103fc9a769ae7f070df36b032fb8",

```

If you lost the proxy contract address you can find the value in the .openzeppelin/unknown-1666700000.json file under the proxies property:
```
"proxies": [
    {
      "address": "0x2172C790E45fbEdAAbaD13DD650fb7761a450BF3",
      "txHash": "0xf28fde079ca4c33be19ba25dbf07c748ff87117621165f0ccb22176eb8fc32ca",
      "kind": "transparent"
    }
  ],
```

For the deployment, we have the following values for each argument:
- ProxyAdmin: 0xeB5df44afb325540E63290a0C7FCC56952527C09
- Implementation: 0x8E2F4C2a6158A0E992827445ef3fe701a1D8c459
- Argument(s): 42
- Proxy Contract Address: 0x2172C790E45fbEdAAbaD13DD650fb7761a450BF3

Hardhat takes a js file it uses to read the arguments; in our example you can find an argument.js file which contains the following (which you should fill in with your own value found using the previous set of steps):
```
module.exports = [
    "0xeB5df44afb325540E63290a0C7FCC56952527C09", // proxy admin
    "0x8E2F4C2a6158A0E992827445ef3fe701a1D8c459", // implementation
    42 // argument(s)
  ];
```
With this informationwe can now verify the proxy contract using the following command:
```
npx hardhat verify --network harmonyTest 0x2172C790E45fbEdAAbaD13DD650fb7761a450BF3 --constructor-args scripts/arguments.js
```

If everything works then you will receive the following message confirming that the contract has been successfully verified:
```
Successfully submitted source code for contract
@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy at 0x2172C790E45fbEdAAbaD13DD650fb7761a450BF3
for verification on the block explorer. Waiting for verification result...

Successfully verified contract TransparentUpgradeableProxy on Etherscan.
https://explorer.pops.one/address/0x2172C790E45fbEdAAbaD13DD650fb7761a450BF3#code
```

Refer to verification troubleshooting below if you encounter any issues during the verification process. Make sure to double-check all the values in arguments.js and that the proxy contract address is correct.

## Verifying upgraded contracts
Time to time you will be upgrading your contracts. In our example we will upgrade Box.sol to BoxV2.sol and introduce an additional variable (y). Refer to https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable for rules on writing upgradeable smart contracts.

To upgrade our proxy, open the upgradeContract.js file and edit the BOX_ADDRESS value to the contract address of the proxy you deployed (in our example it is 0x2172C790E45fbEdAAbaD13DD650fb7761a450BF3)

```
const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

const BOX_ADDRESS = "0x2172C790E45fbEdAAbaD13DD650fb7761a450BF3"
```

Run the upgrade script with the following command:
```
npx hardhat run --network harmonyTest scripts/upgradeContract.js
```

If everything goes well you will receive something similar to the following output:
```
Box upgraded 0x2172C790E45fbEdAAbaD13DD650fb7761a450BF3 BigNumber { value: "55" }
```

You can confirm the contract has been upgraded by navigating to the [explorer](https://explorer-2.netlify.app/address/0xdd37c785e7f4e5f2e31fe19e7b678753b7e3b7b2?activeTab=7) and viewing the contract proxy; which will list as a different address.  

You can also refer to the .openzeppelin/unknown-1666700000.json file which will show your second (BoxV2) contract with its address.

> Make sure you verify your newly deployed implementation contract using the same step above (with the new address). In our example, we would use address 0x302e8BbCbeBb65f209c86Fba2D5b2c79Dd854909)


## Verification Troubleshooting
If you receive the following error message then confirm if you have the correct version of open-zeppelin/contracts and open-zeppelin/contracts-upgradeable vs the hardhat-upgrades libraries. 

```
Error in plugin @nomiclabs/hardhat-etherscan: The address provided as argument contains a contract, but its bytecode doesn't match any of your local contracts.

Possible causes are:
  - Contract code changed after the deployment was executed. This includes code for seemingly unrelated contracts.
  - A solidity file was added, moved, deleted or renamed after the deployment was executed. This includes files for seemingly unrelated contracts.
  - Solidity compiler settings were modified after the deployment was executed (like the optimizer, target EVM, etc.).
  - The given address is wrong.
  - The selected network (harmonyTest) is wrong.
```

> You can verify by browsing the specific installed version. Refer to this repository's package.json, we are using 4.1.0 of openzeppelin. Since contract verification relies on bytecode matches, it is important the proxy used by hardhat-upgrades matches what you have in your environment.

# Deploying your own smart contract proxies
Hardhat hides a lot of the proxy deployment complexity. If you are planning to use this in a project and want to use Hardhat to verify the contract you will need to include the proxies as part of your compiled contracts (so Hardhat knows how to find the contract bytecode and match with what is deployed in the Harmony Explorer).  

A simple way to include the required contracts into your project is to create an empty contract importing the necessary open zeppelin proxy contracts:

```
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract Infer {
    
}
```
Add this into your contract directory and hardhat will be able to find the transparent proxy contracts and verify them automatically  