import { deployments, ethers } from "hardhat";
import type { ETHPool } from "../typechain";

export const getDeployedContract = async () => {
  const { address } = await deployments.get("ETHPool");
  const ethPool = (await ethers.getContractAt("ETHPool", address)) as ETHPool;

  return ethPool;
};
