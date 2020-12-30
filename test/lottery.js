const Lottery = artifacts.require("./Lottery.sol");

contract("Lottery", accounts => {
  it("should have address", async () => {
    const lottery = await Lottery.deployed();

    assert.ok(lottery.address);
  });

  it("should have a manager address which equals to my account", async() => {
      const lottery = await Lottery.deployed();
      const manager = await lottery.manager.call();

      assert.equal(accounts[0], manager);
  });

  it("should allow an account to enter", async() => {
    const lottery = await Lottery.deployed();
    await lottery.enter({from: accounts[1], value: web3.utils.toWei("0.1", "ether")});
    const player = await lottery.players.call(0);    

    assert.equal(accounts[1], player);
  });

  it("requires a minimum amount of ether to enter", async() => {
    const lottery = await Lottery.deployed();
    try {
        await lottery.enter({from: accounts[1], value: 0});
        assert.fail();
    }
    catch (err)
    {
        assert.include(err.message, "revert");
    }
  });

  it("should allow only the manager to pick a winner", async() => {
    const lottery = await Lottery.deployed();
    try {
        await lottery.pickWinner({from: accounts[1]});
        assert.fail();
    }
    catch (err)
    {
        assert.include(err.message, "revert");
    }
  });

  it("should send money to the winner", async() => {
    const lottery = await Lottery.deployed();
    const player = accounts[1];
    const initialBalance = await web3.eth.getBalance(player);

    await lottery.pickWinner({from: accounts[0]});
    const winnder = await lottery.winner.call();

    assert.equal(player, winnder);

    const finalBalance = await web3.eth.getBalance(player);

    assert.ok(finalBalance - initialBalance > web3.utils.toWei("0.09", "ether"));
    assert.ok(0 == await web3.eth.getBalance(lottery.address));
  });  

  it("should allow multiple accounts to enter", async() => {
    const lottery = await Lottery.deployed();
    await lottery.enter({from: accounts[1], value: web3.utils.toWei("0.1", "ether")});
    await lottery.enter({from: accounts[2], value: web3.utils.toWei("0.1", "ether")});
    await lottery.enter({from: accounts[3], value: web3.utils.toWei("0.1", "ether")});
    await lottery.enter({from: accounts[4], value: web3.utils.toWei("0.1", "ether")});
    await lottery.enter({from: accounts[5], value: web3.utils.toWei("0.1", "ether")});

    const player1 = await lottery.players.call(0);
    const player2 = await lottery.players.call(1);
    const player3 = await lottery.players.call(2);
    const player4 = await lottery.players.call(3);
    const player5 = await lottery.players.call(4);

    assert.equal(accounts[1], player1);
    assert.equal(accounts[2], player2);
    assert.equal(accounts[3], player3);
    assert.equal(accounts[4], player4);
    assert.equal(accounts[5], player5);
  });

});

