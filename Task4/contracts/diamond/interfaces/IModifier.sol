// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {LibDiamond} from "../libraries/LibDiamond.sol";

interface IModifier {
    modifier nonreentrant() {
        LibDiamond.nonreentrantbefore();
        _;
        LibDiamond.nonreentrantafter();
    }
}
