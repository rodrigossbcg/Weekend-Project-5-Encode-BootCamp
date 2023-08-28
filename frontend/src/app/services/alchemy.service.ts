import { Injectable } from '@angular/core';
import { Alchemy, Network, TokenBalance } from 'alchemy-sdk';
import { utils } from 'ethers';

@Injectable({
  providedIn: 'root',
})
export class AlchemyService {
  alchemy: Alchemy;

  constructor() {
    const settings = {
      apiKey: 'YOUR_API_KEY',
      network: Network.ARB_GOERLI,
    };
    this.alchemy = new Alchemy(settings);
  }

  async getTokenBalances(address: string) {
    const response = await this.alchemy.core.getTokenBalances(address);
    return response.tokenBalances.map(({ tokenBalance, ...rest }) => {
      return {
        tokenBalance: tokenBalance ? utils.formatUnits(tokenBalance, 18) : null,
        ...rest,
      } as TokenBalance;
    });
  }
}
