# Exactly Finance's ETHPool challenge

This is my submission for Exactly Finance's ETHPool challenge. The contract was deployed at `0xB06296feC71f80B62D0C85AD823DA9f6413913F9` on the Goerli network ([Etherscan](https://goerli.etherscan.io/address/0xB06296feC71f80B62D0C85AD823DA9f6413913F9))

## Considerations

- This is an ETH to ETH pool, meaning you stake ETH and receive ETH rewards, and not any kind of ERC20 token (for simplicity's sake)
- Like the system described in [Scalable Reward Distribution on the Ethereum
  Blockchain](http://batog.info/papers/scalable-reward-distribution.pdf), this system DOES NOT compound the reward. The user must manually do so
- Unlike the paper mentioned above, this system DOES ALLOW users to change the stake size once it's deposited
- The entire pending rewards amount is sent to the user when depositing or withdrawing any amount. This is a design choice, the alternative is to have a separate function for withdrawing rewards (and keeping track of the reward tally)

## Commands

Test:

`npx hardhat test`

Coverage:

`npx hardhat coverage`

Check contract balance:

`npx hardhat balance --network goerli`

Be sure to create an .env file with your keys in it in order to run the following scripts.

Feel free to edit the ETH values inside them to test the contract.

Deposit:

`npx hardhat run scripts/deposit.ts --network goerli`

Withdraw:

`npx hardhat run scripts/withdraw.ts --network goerli`

Distribute:

`npx hardhat run scripts/distribute.ts --network goerli`

## References

- http://batog.info/papers/scalable-reward-distribution.pdf
- https://solmaz.io/2019/02/24/scalable-reward-changing
