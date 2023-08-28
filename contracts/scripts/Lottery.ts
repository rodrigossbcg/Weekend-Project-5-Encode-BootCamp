import { ethers } from "hardhat";
import * as readline from "readline";
import { Lottery, LotteryToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

let contract: Lottery;
let token: LotteryToken;
let accounts: HardhatEthersSigner[];

const BET_PRICE = 1;
const BET_FEE = 0.2;
const TOKEN_RATIO = 1n;

async function main() {
  await initContracts();
  await initAccounts();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  mainMenu(rl);
}

async function initContracts() {
  const contractFactory = await ethers.getContractFactory("Lottery");
  contract = await contractFactory.deploy(
    "LotteryToken",
    "LT0",
    TOKEN_RATIO,
    ethers.parseUnits(BET_PRICE.toFixed(18)),
    ethers.parseUnits(BET_FEE.toFixed(18))
  );
  await contract.waitForDeployment();
  const tokenAddress = await contract.paymentToken();
  const tokenFactory = await ethers.getContractFactory("LotteryToken");
  token = tokenFactory.attach(tokenAddress) as LotteryToken;
}

async function initAccounts() {
  accounts = await ethers.getSigners();
}

async function mainMenu(rl: readline.Interface) {
  menuOptions(rl);
}

function menuOptions(rl: readline.Interface) {
  rl.question(
    "Select operation: \n Options: \n [0]: Exit \n [1]: Check state \n [2]: Open bets \n [3]: Top up account tokens \n [4]: Bet with account \n [5]: Close bets \n [6]: Check player prize \n [7]: Withdraw \n [8]: Burn tokens \n",
    async (answer: string) => {
      console.log(`Selected: ${answer}\n`);
      const option = Number(answer);
      switch (option) {
        case 0:
          rl.close();
          return;
        case 1:
          await checkState();
          mainMenu(rl);
          break;
        case 2:
          rl.question("Input duration (in seconds)\n", async (duration) => {
            try {
              await openBets(duration);
            } catch (error) {
              console.log("error\n");
              console.log({ error });
            }
            mainMenu(rl);
          });
          break;
        case 3:
          rl.question("What account (index) to use?\n", async (index) => {
            await displayBalance(index);
            rl.question("Buy how many tokens?\n", async (amount) => {
              try {
                await buyTokens(index, amount);
                await displayBalance(index);
                await displayTokenBalance(index);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;
        case 4:
          rl.question("What account (index) to use?\n", async (index) => {
            await displayTokenBalance(index);
            rl.question("Bet how many times?\n", async (amount) => {
              try {
                await bet(index, amount);
                await displayTokenBalance(index);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;
        case 5:
          try {
            await closeLottery();
          } catch (error) {
            console.log("error\n");
            console.log({ error });
          }
          mainMenu(rl);
          break;
        case 6:
          rl.question("What account (index) to use?\n", async (index) => {
            const prize = await displayPrize(index);
            if (Number(prize) > 0) {
              rl.question(
                "Do you want to claim your prize? [Y/N]\n",
                async (answer) => {
                  if (answer.toLowerCase() === "y") {
                    try {
                      await claimPrize(index, prize);
                    } catch (error) {
                      console.log("error\n");
                      console.log({ error });
                    }
                  }
                  mainMenu(rl);
                }
              );
            } else {
              mainMenu(rl);
            }
          });
          break;
        case 7:
          await displayTokenBalance("0");
          await displayOwnerPool();
          rl.question("Withdraw how many tokens?\n", async (amount) => {
            try {
              await withdrawTokens(amount);
            } catch (error) {
              console.log("error\n");
              console.log({ error });
            }
            mainMenu(rl);
          });
          break;
        case 8:
          rl.question("What account (index) to use?\n", async (index) => {
            await displayTokenBalance(index);
            rl.question("Burn how many tokens?\n", async (amount) => {
              try {
                await burnTokens(index, amount);
                await displayBalance(index);
                await displayTokenBalance(index);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;
        default:
          throw new Error("Invalid option");
      }
    }
  );
}

async function checkState() {
  const state = await contract.betsOpen();
  console.log(`The lottery is ${state ? "open" : "closed"}\n`);
  if (!state) return;
  const currentBlock = await ethers.provider.getBlock("latest");
  const timestamp = currentBlock?.timestamp ?? 0;
  const currentBlockDate = new Date(timestamp * 1000);
  const closingTime = await contract.betsClosingTime();
  const closingTimeDate = new Date(Number(closingTime) * 1000);
  console.log(
    `The last block was mined at ${currentBlockDate.toLocaleDateString()} : ${currentBlockDate.toLocaleTimeString()}\n`
  );
  console.log(
    `lottery should close at ${closingTimeDate.toLocaleDateString()} : ${closingTimeDate.toLocaleTimeString()}\n`
  );
}

async function openBets(duration: string) {
  const currentBlock = await ethers.provider.getBlock("latest");
  const timestamp = currentBlock?.timestamp ?? 0;
  const tx = await contract.openBets(timestamp + Number(duration));
  const receipt = await tx.wait();
  console.log(`Bets opened (${receipt?.hash})`);
}

async function displayBalance(index: string) {
  const balanceBN = await ethers.provider.getBalance(
    accounts[Number(index)].address
  );
  const balance = ethers.formatUnits(balanceBN);
  console.log(
    `The account of address ${
      accounts[Number(index)].address
    } has ${balance} ETH\n`
  );
}

async function buyTokens(index: string, amount: string) {
  const tx = await contract.connect(accounts[Number(index)]).purchaseTokens({
    value: ethers.parseUnits(amount) / TOKEN_RATIO,
  });
  const receipt = await tx.wait();
  console.log(`Tokens bought (${receipt?.hash})\n`);
}

async function displayTokenBalance(index: string) {
  const balanceBN = await token.balanceOf(accounts[Number(index)].address);
  const balance = ethers.formatUnits(balanceBN);
  console.log(
    `The account of address ${
      accounts[Number(index)].address
    } has ${balance} LT0\n`
  );
}

async function bet(index: string, amount: string) {
  const contractAddress = await contract.getAddress();
  const allowTx = await token
    .connect(accounts[Number(index)])
    .approve(contractAddress, ethers.MaxUint256);
  await allowTx.wait();
  const tx = await contract.connect(accounts[Number(index)]).betMany(amount);
  const receipt = await tx.wait();
  console.log(`Bets placed (${receipt?.hash})\n`);
}

async function closeLottery() {
  const tx = await contract.closeLottery();
  const receipt = await tx.wait();
  console.log(`Bets closed (${receipt?.hash})\n`);
}

async function displayPrize(index: string): Promise<string> {
  const prizeBN = await contract.prize(accounts[Number(index)].address);
  const prize = ethers.formatUnits(prizeBN);
  console.log(
    `The account of address ${
      accounts[Number(index)].address
    } has earned a prize of ${prize} Tokens\n`
  );
  return prize;
}

async function claimPrize(index: string, amount: string) {
  const tx = await contract
    .connect(accounts[Number(index)])
    .prizeWithdraw(ethers.parseUnits(amount));
  const receipt = await tx.wait();
  console.log(`Prize claimed (${receipt?.hash})\n`);
}

async function displayOwnerPool() {
  const balanceBN = await contract.ownerPool();
  const balance = ethers.formatUnits(balanceBN);
  console.log(`The owner pool has (${balance}) Tokens \n`);
}

async function withdrawTokens(amount: string) {
  const tx = await contract.ownerWithdraw(ethers.parseUnits(amount));
  const receipt = await tx.wait();
  console.log(`Withdraw confirmed (${receipt?.hash})\n`);
}

async function burnTokens(index: string, amount: string) {
  const contractAddress = await contract.getAddress();
  const allowTx = await token
    .connect(accounts[Number(index)])
    .approve(contractAddress, ethers.MaxUint256);
  const receiptAllow = await allowTx.wait();
  console.log(`Allowance confirmed (${receiptAllow?.hash})\n`);
  const tx = await contract
    .connect(accounts[Number(index)])
    .returnTokens(ethers.parseUnits(amount));
  const receipt = await tx.wait();
  console.log(`Burn confirmed (${receipt?.hash})\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
