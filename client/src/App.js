import React, { Component, Button } from "react";
import LotteryContract from "./contracts/Lottery.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { manager: 0, players: 0, prize: 0, winner: 0, storageValue: 0,
            transactionHash: null, pickTransactionHash: null,
            web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = LotteryContract.networks[networkId];
      const instance = new web3.eth.Contract(
        LotteryContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { contract, web3 } = this.state;
  
    // Get the values from the contract
    const manager = await contract.methods.manager().call();
    const players = await contract.methods.getPlayers().call();
    const winner = await contract.methods.winner().call();
    const prize = await web3.eth.getBalance(contract.options.address);
  
    // Update state with the result
    this.setState({ manager: manager, players: players, winner: winner, 
                    prize: web3.utils.fromWei(prize, "ether")});
  };

  render() {
    const { accounts } = this.state;
    const isManager = accounts == this.state.manager;

    return (
      <div className="App">
        <h2>May the odds be ever in your favor!</h2>
        <p className="Board">
          This contract is managed by {this.state.manager}.
          There are currently {this.state.players} people entered,
          competing to win {this.state.prize} ethers!
          <br />
          <br />
          {this.state.winner} has won the last lottery.
        </p>
        <h2>Want to try your odd?</h2>
        <p className="Enter">
          <button onClick={this.handleEnter}>Buy one ticket</button>
          <br />
          {this.state.transactionHash}
        </p>
        {isManager &&
          <div>
            <h2>Time to pick a winner (<i>Manager Only</i>)</h2>
            <p className="Enter">
              <button onClick={this.handlePick}>Pick a winner</button>
              <br />
              {this.state.pickTransactionHash}
            </p>
          </div>
        }
      </div>
    );
  }

  handlePick = async () => {
    const { contract, accounts } = this.state;
    const pick = await contract.methods.pickWinner().send({from: accounts[0]});
    console.log(pick);
    this.setState({ pickTransactionHash: pick.transactionHash });
  } 

  handleEnter = async () => {
    const { contract, accounts } = this.state;
    const enter = await contract.methods.enter()
                        .send({from: accounts[0], value:'100000000000000000'});
    this.setState({ transactionHash: enter.transactionHash });
  }  
}

export default App;
