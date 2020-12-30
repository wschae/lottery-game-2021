const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const MNEMONIC = process.env.MNEMONIC;
const INFURA_ENDPOINT = process.env.INFURA_ENDPOINT;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, INFURA_ENDPOINT)
      },
      network_id: 3      
    }
  },
  compilers: {
    solc: {
      version: "^0.7"
    }
  }
};