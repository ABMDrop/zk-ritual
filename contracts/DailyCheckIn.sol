// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DailyCheckIn {
    uint256 public constant INTERVAL = 1 days;
    uint256 public constant GRACE    = 2 days;

    struct UserData { uint256 lastCheckIn; uint256 streak; uint256 totalCheckIns; }
    mapping(address => UserData) public users;

    event CheckedIn(address indexed user, uint256 streak, uint256 totalCheckIns, uint256 timestamp);

    function checkIn() external {
        UserData storage u = users[msg.sender];
        require(block.timestamp >= u.lastCheckIn + INTERVAL, "Already checked in today");
        uint256 newStreak;
        if (u.lastCheckIn == 0) { newStreak = 1; }
        else if (block.timestamp <= u.lastCheckIn + GRACE) { newStreak = u.streak + 1; }
        else { newStreak = 1; }
        u.lastCheckIn   = block.timestamp;
        u.streak        = newStreak;
        u.totalCheckIns += 1;
        emit CheckedIn(msg.sender, newStreak, u.totalCheckIns, block.timestamp);
    }

    function canCheckIn(address user) external view returns (bool) {
        return block.timestamp >= users[user].lastCheckIn + INTERVAL;
    }

    function getUserData(address user) external view returns (uint256 lastCheckIn, uint256 streak, uint256 totalCheckIns, bool canCheckInNow) {
        UserData memory u = users[user];
        return (u.lastCheckIn, u.streak, u.totalCheckIns, block.timestamp >= u.lastCheckIn + INTERVAL);
    }
}
