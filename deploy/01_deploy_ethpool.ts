import { deployments, getNamedAccounts } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async () => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("ETHPool", {
    from: deployer,
    args: [],
    log: true,
  });
};

deploy.tags = ["ETHPool"];

export default deploy;
