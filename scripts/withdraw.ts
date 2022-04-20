import { ethers } from "hardhat";
import { getDeployedContract } from "./utils";

const withdraw = async () => {
  try {
    const ethPool = await getDeployedContract();

    await ethPool.withdraw(ethers.utils.parseEther("0.001"));

    console.log("Withdraw successful");
  } catch (e) {
    const error = e as Error;

    console.log(error);
  }
};

withdraw();
