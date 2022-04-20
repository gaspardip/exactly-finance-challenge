import { ethers } from "hardhat";
import { getDeployedContract } from "./utils";

const distribute = async () => {
  try {
    const ethPool = await getDeployedContract();

    await ethPool.distribute({ value: ethers.utils.parseEther("0.001") });

    console.log("Reward distribution successful");
  } catch (e) {
    const error = e as Error;

    console.log(error);
  }
};

distribute();
