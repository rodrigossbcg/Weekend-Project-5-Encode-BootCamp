
import { Component, effect } from '@angular/core';
import { MetamaskService } from './services/metamask.service';
import { AlchemyService } from './services/alchemy.service';
import { TokenBalance } from 'alchemy-sdk';
import { FormControl, Validators } from '@angular/forms';
import { BigNumber, ethers } from 'ethers';
import { Lottery__factory } from 'src/assets/contracts';
import { LotteryToken__factory } from 'src/assets/contracts/factories/LotteryToken__factory';

declare global {
  interface Window {
    ethereum: any;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  provider = new ethers.providers.Web3Provider(window.ethereum, "any");  /// ver na nova versão
  signer = this.provider.getSigner();
  title = 'Weekend Project 5 - Encode';
  currentChainId = this.metamaskService.currentChainId;
  currentAccount = this.metamaskService.currentAccount;
  balance = this.metamaskService.balance;
  hasMetamask;
  tokenBalances: TokenBalance[] = [];
  message = new FormControl('', Validators.required);
  signatures: string[] = [];
  contract = Lottery__factory.connect("0x214c7E4356d3970E5F4DaA0C5C42a162836e9b6d", this.signer);
  token = LotteryToken__factory.connect("0x34f5a36E6d2d33546A327D81e7a0Ba12F2b491b1", this.signer);
  tokenBalance = BigNumber.from(0);

  contractName = ""
  owner = ""
  betPrice = BigNumber.from(0)
  betFee = BigNumber.from(0)
  prizePool = BigNumber.from(0)
  betsOpen = false;
  countdown = 'Bets are closed'
  targetTimestamp = BigNumber.from(0)

  spendAllowedLeft = BigNumber.from(0);

  constructor(
    private metamaskService: MetamaskService,
    private alchemyService: AlchemyService
  ) {
    this.hasMetamask = metamaskService.checkMetamaskAvailability();
    if (this.hasMetamask) {
      metamaskService.retrieveConnection();
    }
    effect(async () => {
      if (this.currentAccount()) {
        this.tokenBalances = await this.alchemyService.getTokenBalances(
          this.currentAccount()
        );
      }
    });

    effect(async () => {
      this.owner = await this.contract.owner()
    });

    effect(async () => {
      this.targetTimestamp = await this.contract.betsClosingTime();
    });

    effect(async () => {
      this.tokenBalance = await this.token.balanceOf(String(this.currentAccount()));
    });

    effect(async () => {
      this.betsOpen = await this.contract.betsOpen();
    });
    effect(async () => {
      this.spendAllowedLeft = await this.token.allowance(this.currentAccount(), this.token.address);
    });
  }

  ngOnInit() {
    this.updateCountdown();
    setInterval(() => this.updateCountdown(), 1000);
    this.updateBetPrice(); 
    this.updateBetFee(); 
  }

  connectWallet() {
    this.metamaskService.connectWallet();
  }

  signMessage() {
    const message = this.message.value!;
    this.metamaskService.signer?.signMessage(message).then((signature) => {
      this.signatures.push(signature);
    });
  }

  // get betPrice or error
  async updateBetPrice() {
    try {
      this.betPrice = await this.contract.betPrice();
    } catch (error) {
      console.error('Error fetching bet price:', error);
      this.betPrice = ethers.BigNumber.from(0);
    }
  }

  // get betFee or error
  async updateBetFee() {
    try {
      this.betFee = await this.contract.betFee();
    } catch (error) {
      console.error('Error fetching bet price:', error);
      this.betFee = ethers.BigNumber.from(0);
    }
  }

  // get prizePool or error
  async getPrizePool() {
    try {
      this.prizePool = await this.contract.prizePool();
    } catch (error) {
      console.error('Error fetching bet price:', error);
      this.prizePool = ethers.BigNumber.from(0);
    }
  }

  // Countdown to bets closed
  updateCountdown() {
    const currentTime = Date.now();
    const timeDifference = Math.floor(Number(this.targetTimestamp) - Number(currentTime) / 1000);
    
    if (timeDifference <= 0) {
      this.countdown = 'Bets are closed';
    } else {
      const hours = Math.floor(timeDifference / 3600);
      const minutes = Math.floor((timeDifference % 3600) / 60);
      const seconds = Math.floor(timeDifference % 60);
      this.countdown = `${hours}h ${minutes}m ${seconds}s`;
    }
  }

  // open bets -> pass the closing timestamp
  async openBets(betsClosingTime: string) {
    try {
      const tx = await this.contract.openBets(Number(betsClosingTime));
      await tx.wait();
      return tx.hash; 
    }
    catch{
      alert("Error occured during the transaction! Confirm input")
      return "Error"
    }
  }

  // close bets
  async closeBets() {
    try {
      const tx = await this.contract.closeLottery();
      await tx.wait();
      return tx.hash; 
    }
    catch{
      alert("Error occured during the transaction! Confirm input")
      return "Error"
    }
  }
  async aproove(spendAmount: number) {
    try {
      const tx = await this.token.approve(this.token.address, spendAmount);
      await tx.wait();

      // update spendAllowedLeft
      this.spendAllowedLeft = await this.token.allowance(this.currentAccount(), this.token.address);
      return tx.hash;
    }
    catch (error) {
      alert("Error occured during the transaction!")
      return "Error"
    }
  }

  // bet many
  async bet(nBets: string) {
    try {
      const nBets1 = parseInt(nBets);
      const spendAmount = nBets1 * (Number(this.betPrice) + Number(this.betFee));
      console.log(spendAmount);
      let allowed = ''; 
      if (spendAmount > Number(this.spendAllowedLeft)) {
        allowed = await this.aproove(spendAmount);
      }
      if (allowed != "Error") {
        // needs gaslimit due to loop 
        const cost = 50000 * nBets1; 
        const tx = await this.contract.betMany(nBets1, { gasLimit: cost });
        return tx.hash;
      }
      return 'Error';
    }

    catch (error) {
      alert(error);
      console.log(error);
      alert("Error occured during the transaction!")
      return "Error"
    }
  }

  // withdraw
  async withdraw(amount: string) {
    try {
      const amount1 = parseFloat(amount)
      const tx = await this.contract.prizeWithdraw(amount1);
      await tx.wait();
      return tx.hash;
    }

    catch{
      alert("Error occured during the transaction!")
      return "Error"
    }
  }

  // Buy tokens
  async purchaseTokens(ethValue: string) {
    try {
      const tx = await this.contract.purchaseTokens({value: ethers.utils.parseEther(ethValue)});
      return tx.hash;
    }
    catch{
      alert("Error occured during the transaction!")
      return "Error. Make sure you have enough tokens"
    }
  }

}