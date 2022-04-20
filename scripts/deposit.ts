import { ethers } from "hardhat";
import { getDeployedContract } from "./utils";

const deposit = async () => {
  try {
    const ethPool = await getDeployedContract();

    await ethPool.deposit({ value: ethers.utils.parseEther("0.001") });

    console.log("Deposit successful");
  } catch (e) {
    const error = e as Error;

    console.log(error);
  }
};

deposit();
