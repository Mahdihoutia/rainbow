// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CrypturalPresale is Ownable {
    IERC20 public tokenContract;
    address public beneficiaryWallet;

    uint256 private numberOfTokenSold;
    uint256 private numberTotalOfToken = 1000000000;

    struct Stage {
        uint256 tokenPrice; // Price per token in ETH
        uint256 tokensAvailable; // Tokens available in this stage
    }

    Stage[] public stages;
    uint256 public currentStage = 0;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 totalCost);
    event StageAdvanced(uint256 newStage);
    event LogMessage(uint256 value);

    constructor() Ownable(msg.sender) payable {
        //require(_tokenAddress != address(0), "Invalid token address");
        //tokenContract = IERC20(_tokenAddress);

        // Define stages with corresponding prices and token limits
        stages.push(Stage(0.000005 ether, 150_000_000));
        stages.push(Stage(0.00001 ether, 150_000_000));
        stages.push(Stage(0.00002 ether, 50_000_000));
        stages.push(Stage(0.00003 ether, 50_000_000));
        stages.push(Stage(0.00004 ether, 50_000_000));
    }

    // Function to allow users to buy tokens with ETH
    function buyTokens(uint256 ETHquantity) external payable {
        require(beneficiaryWallet != address(0), "Beneficiary wallet not set");
        require(ETHquantity > 0, "ETH amount must be greater than 0");

        Stage memory currentStageData = stages[currentStage];
        require(currentStageData.tokensAvailable > 0, "No tokens available in this stage");

        // Calculate the number of tokens to purchase
        uint256 tokensToBuy = ETHquantity / currentStageData.tokenPrice;
        require(tokensToBuy > 0, "Insufficient ETH to buy tokens");

        // Ensure the requested tokens do not exceed the stage's available tokens
        if (tokensToBuy > currentStageData.tokensAvailable) {
            tokensToBuy = currentStageData.tokensAvailable;
        }

        // Update the number of tokens sold and available
        numberOfTokenSold += tokensToBuy;
        stages[currentStage].tokensAvailable -= tokensToBuy;

        // Transfer tokens to the buyer
        require(
            tokenContract.transfer(msg.sender, tokensToBuy),
            "Token transfer failed"
        );

        // Transfer ETH to the beneficiary wallet
        (bool success, ) = beneficiaryWallet.call{value: ETHquantity}("");
        require(success, "ETH transfer failed");

        // Emit an event for the purchase
        emit TokensPurchased(msg.sender, tokensToBuy, ETHquantity);

        // Advance to the next stage if the current stage is sold out
        if (stages[currentStage].tokensAvailable == 0) {
            advanceStage();

            
        }
    }

    // Internal function to advance to the next stage
    function advanceStage() internal {
        if (currentStage < stages.length - 1) {
            currentStage++;
            emit StageAdvanced(currentStage);
        }
    }

    // Function to set the beneficiary wallet address
    function setBeneficiaryWallet(address _beneficiaryWallet) public onlyOwner {
        require(_beneficiaryWallet != address(0), "Invalid address");
        beneficiaryWallet = _beneficiaryWallet;
    }

    // Function to get the token contract address
    function getTokenAddress() public view returns (address) {
        return address(tokenContract);
    }

    // Function to get the contract owner's address
    function getOwner() public view returns (address) {
        return owner();
    }

    // Function to get the current stage index
    function getCurrentStage() public view returns (uint256) {
        return currentStage;
    }

    // Function to manually update the current stage (only owner)
    function updateStage(uint256 newStage) public onlyOwner {
        require(newStage < stages.length, "Invalid stage index");
        currentStage = newStage;
    }

    // Function to get the token price for the current stage
    function getStageTokenPrice() public view returns (uint256) {
        return stages[currentStage].tokenPrice;
    }

    // Function to update the token price for the current stage (only owner)
    function setStageTokenPrice(uint256 newStageTokenPrice) public onlyOwner {
        stages[currentStage].tokenPrice = newStageTokenPrice;
    }

    // Function to get the total number of tokens sold
    function getNbTokenSold() public view returns (uint256) {
        return numberOfTokenSold;
    }

    // Function to update the total number of tokens (only owner)
    function setNumberTotalOfToken(uint256 _numberTotalOfToken) public onlyOwner {
        numberTotalOfToken = _numberTotalOfToken;
    }

    // Function to get the remaining tokens in the current stage
    function getRemainingTokensInStage() public view returns (uint256) {
        return stages[currentStage].tokensAvailable;
    }
}