// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.6.12;
struct AppStorage {
    /// @dev stores the daily price
    mapping(uint256 => uint256) dailyPrice;
    /// @dev stores the accumulated token price since the beginning of record history
    mapping(uint256 => uint256) accPrice;
    /// @dev last timestamp when the daily token price was recorded
    uint256 lastTimestamp;
}
