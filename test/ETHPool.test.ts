import { expect } from "chai";
import type { Contract } from "ethers";
import {
  deployments,
  ethers,
  getNamedAccounts,
  getUnnamedAccounts,
} from "hardhat";
import { div, mul } from "prb-math";
import { ETHPool } from "../typechain";

const amountAlice = ethers.utils.parseEther("100");
const amountBob = ethers.utils.parseEther("300");
const amountTotal = amountAlice.add(amountBob);
const amountRewards = ethers.utils.parseEther("200");

const shareAlice = div(amountAlice, amountTotal);
const shareBob = div(amountBob, amountTotal);

describe("ETHPool", function () {
  describe("deposit", () => {
    it("should let users stake their ETH", async () => {
      const { alice, bob, ETHPool } = await setup();

      await alice.ETHPool.deposit({ value: amountAlice });
      await bob.ETHPool.deposit({ value: amountBob });

      expect(await ETHPool.balanceOf(alice.address)).to.eq(amountAlice);
      expect(await ETHPool.balanceOf(bob.address)).to.eq(amountBob);

      expect(await ETHPool.totalStaked()).to.eq(amountTotal);
      expect(await ETHPool.balance()).to.eq(amountTotal);
    });
  });

  describe("distribute", () => {
    it("should revert if not called by a team member", async () => {
      const { alice } = await setup();

      await expect(
        alice.ETHPool.distribute({ value: amountRewards })
      ).to.be.revertedWith("Sender is not a team member");
    });

    it("should revert if zero rewards are sent", async () => {
      const { deployer } = await setup();

      await expect(
        deployer.ETHPool.distribute({ value: ethers.constants.Zero })
      ).to.be.revertedWith("Distribution amount must be greater than 0");
    });

    it("should revert if there are no active stakes", async () => {
      const { deployer } = await setup();

      await expect(
        deployer.ETHPool.distribute({ value: amountRewards })
      ).to.be.revertedWith("Total staked amount is 0");
    });
  });

  describe("withdraw", () => {
    it("should revert if there isn't enough balance", async () => {
      const { alice, deployer } = await setup();

      await alice.ETHPool.deposit({ value: amountAlice });

      await deployer.ETHPool.distribute({ value: amountRewards });

      await expect(
        alice.ETHPool.withdraw(
          amountAlice.add(amountRewards).add(ethers.constants.One)
        )
      ).to.be.revertedWith("Insufficient balance");
    });

    // README's first case
    it("should let users withdraw their deposit and rewards (according to their pool share)", async () => {
      const { deployer, alice, bob, ETHPool } = await setup();

      await alice.ETHPool.deposit({ value: amountAlice });
      await bob.ETHPool.deposit({ value: amountBob });

      await deployer.ETHPool.distribute({ value: amountRewards });

      expect(await ETHPool.balance()).to.eq(amountTotal.add(amountRewards));

      const pendingRewardsAlice = await ETHPool.pendingRewards(alice.address);
      const pendingRewardsBob = await ETHPool.pendingRewards(bob.address);

      expect(pendingRewardsAlice).to.eq(mul(shareAlice, amountRewards));
      expect(pendingRewardsBob).to.eq(mul(shareBob, amountRewards));

      await alice.ETHPool.withdraw(amountAlice);
      await bob.ETHPool.withdraw(amountBob);

      const balanceAlice = await ETHPool.balanceOf(alice.address);
      const balanceBob = await ETHPool.balanceOf(bob.address);

      expect(balanceAlice).to.eq(ethers.constants.Zero);
      expect(balanceBob).to.eq(ethers.constants.Zero);
      expect(await ETHPool.totalStaked()).to.eq(ethers.constants.Zero);
      expect(await ETHPool.balance()).to.eq(ethers.constants.Zero);
    });

    // README's second case
    it("should let alice withdraw her stake plus all rewards", async () => {
      const { deployer, alice, bob, ETHPool } = await setup();

      await alice.ETHPool.deposit({ value: amountAlice });

      await deployer.ETHPool.distribute({ value: amountRewards });

      await bob.ETHPool.deposit({ value: amountBob });

      const pendingRewardsAlice = await ETHPool.pendingRewards(alice.address);

      expect(pendingRewardsAlice).to.eq(amountRewards);

      await alice.ETHPool.withdraw(amountAlice);

      const pendingRewardsBob = await ETHPool.pendingRewards(bob.address);

      expect(pendingRewardsBob).to.eq(ethers.constants.Zero);

      await bob.ETHPool.withdraw(amountBob);

      expect(await ETHPool.totalStaked()).to.eq(ethers.constants.Zero);
      expect(await ETHPool.balance()).to.eq(ethers.constants.Zero);
    });
  });
});

async function setup() {
  await deployments.fixture(["ETHPool"]);

  const contracts = {
    ETHPool: (await ethers.getContract("ETHPool")) as ETHPool,
  };

  const { deployer, alice, bob } = await getNamedAccounts();

  const users = await setupUsers(await getUnnamedAccounts(), contracts);

  return {
    ...contracts,
    users,
    deployer: await setupUser(deployer, contracts),
    alice: await setupUser(alice, contracts),
    bob: await setupUser(bob, contracts),
  };
}

async function setupUsers<T extends { [contractName: string]: Contract }>(
  addresses: string[],
  contracts: T
): Promise<({ address: string } & T)[]> {
  const users: ({ address: string } & T)[] = [];

  for (const address of addresses) {
    users.push(await setupUser(address, contracts));
  }

  return users;
}

async function setupUser<T extends { [contractName: string]: Contract }>(
  address: string,
  contracts: T
): Promise<{ address: string } & T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = { address };

  for (const key of Object.keys(contracts)) {
    user[key] = contracts[key].connect(await ethers.getSigner(address));
  }

  return user as { address: string } & T;
}
