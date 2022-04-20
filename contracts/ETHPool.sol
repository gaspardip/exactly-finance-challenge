//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "prb-math/contracts/PRBMathUD60x18.sol";

contract ETHPool is AccessControl {
    using PRBMathUD60x18 for uint256;
    using Address for address payable;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    bytes32 public constant TEAM_MEMBER_ROLE = keccak256("TEAM_MEMBER");

    mapping(address => uint256) private stakes;
    mapping(address => uint256) private rewardDebts;

    uint256 public rewardPerShare;
    uint256 public totalStaked;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TEAM_MEMBER_ROLE, msg.sender);
    }

    // external functions

    function deposit() external payable {
        _transferPendingRewardsIfAny(msg.sender);

        stakes[msg.sender] += msg.value;
        totalStaked += msg.value;

        _updateUserDebt(msg.sender);

        emit Deposit(msg.sender, msg.value);
    }

    function distribute() external payable onlyTeamMember {
        require(msg.value > 0, "Distribution amount must be greater than 0");
        require(totalStaked > 0, "Total staked amount is 0");

        rewardPerShare += msg.value.div(totalStaked);
    }

    function withdraw(uint256 _amount) external {
        require(_amount <= balanceOf(msg.sender), "Insufficient balance");

        _transferPendingRewardsIfAny(msg.sender);

        stakes[msg.sender] -= _amount;
        totalStaked -= _amount;

        _updateUserDebt(msg.sender);

        payable(msg.sender).sendValue(_amount);

        emit Withdraw(msg.sender, _amount);
    }

    // private functions

    function _transferPendingRewardsIfAny(address _user) private {
        uint256 pending = pendingRewards(_user);

        if (pending > 0) {
            payable(_user).sendValue(pending);
        }
    }

    function _updateUserDebt(address _user) private {
        rewardDebts[_user] = stakes[_user].mul(rewardPerShare);
    }

    // views

    function pendingRewards(address _user) public view returns (uint256) {
        return stakes[_user].mul(rewardPerShare) - rewardDebts[_user];
    }

    function balanceOf(address _user) public view returns (uint256) {
        return stakes[_user];
    }

    function balance() public view returns (uint256) {
        return address(this).balance;
    }

    // modifiers

    modifier onlyTeamMember() {
        require(
            hasRole(TEAM_MEMBER_ROLE, msg.sender),
            "Sender is not a team member"
        );
        _;
    }
}
