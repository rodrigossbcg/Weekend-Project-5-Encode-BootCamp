<h1 align="center">W3FS Frontend</h1>

## About

W3FS Frontend is a project that utilizes Alchemy and Metamask services to provide seamless integration with the Metamask wallet. It allows you to check Metamask availability, connect your wallet, recover connection, handle wallet and account changes, list balances and
view Network ID. Additionally, it enables you to sign messages using the Metamask wallet.

This project was generated with Angular CLI version **16.0.2**.

## :computer: System requirements

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](<(https://www.typescriptlang.org/docs/)>)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](<(https://html.com/document/)>)
[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](<(https://angular.io/docs)>)

## Features

1. **Metamask Integration**: W3FS Frontend leverages the Alchemy SDK and Metamask services to seamlessly integrate with the Metamask wallet, ensuring a smooth user experience.

2. **Metamask Availability**: You can easily check the availability of the Metamask wallet to ensure a proper connection before performing any blockchain-related actions.

3. **Connect Wallet**: W3FS Frontend allows you to effortlessly connect your Metamask wallet, establishing a secure and reliable connection to the Ethereum network.

4. **Recover Connection**: In case your wallet connection is lost, W3FS Frontend automatically initiates a recovery process, ensuring uninterrupted access to your Ethereum accounts and data.

5. **Wallet and Account Changes**: The project efficiently handles wallet and account changes, seamlessly updating the relevant information and keeping your application in sync with the current state of the connected wallet.

6. **Get Provider**: The project enables you to obtain information about the current provider, empowering you to make informed decisions based on the network environment you are interacting with.

7. **Sign Messages**: W3FS Frontend offers a convenient functionality to sign messages using the Metamask wallet, leveraging its secure key management to provide cryptographic signatures for data verification.

## :rocket: How to install

To use the W3FS Frontend project, follow these steps:

1. Clone this repository:

   ```bash
   git clone https://github.com/Venture-Miner/w3fs.git
   ```

2. Install the dependencies:

   ```bash
   yarn install
   ```

3. Start the development server:

   ```bash
   yarn start
   ```

4. Open your web browser and navigate to `http://localhost:4200` to access the application.

## Usage

To use the features provided by the W3FS Frontend project, ensure that you have the Metamask extension installed in your browser.

Once the application is running and you have Metamask installed, you can perform the following actions:

- Click on the "Connect Wallet" button to connect your Metamask wallet.
- If the wallet connection is lost, the application will attempt to recover the connection automatically.
- The application will handle wallet and account changes automatically and update the relevant information accordingly.
- After connecting the wallet, you can use and test the "Sign message" functionality to sign messages using the Metamask wallet.

## Technologies Used

W3FS Frontend leverages the following technologies:

- **Alchemy SDK**: The Alchemy SDK is utilized to interact with the Ethereum blockchain, providing simplified and efficient access to blockchain data and smart contract functionalities.

- **Metamask**: Metamask is a popular browser extension that serves as a bridge between web applications and the Ethereum network, allowing users to securely manage their Ethereum accounts and sign transactions.

- **Web3**: The project utilizes Web3, a JavaScript library, to interact with the Ethereum blockchain and Metamask. Web3 acts as a communication layer between the frontend application and the Ethereum network, enabling seamless integration and interaction with smart contracts and blockchain data.

## Packages

| Definition      | Description                                                                                                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **alchemy-sdk** | The Alchemy SDK provides a set of libraries and APIs that simplify blockchain development by abstracting away the complexities of interacting directly with the blockchain.        |
| **ethers**      | It simplifies the process of working with blockchain data, smart contracts, and transactions, abstracting away the complexities of interacting directly with the Ethereum network. |

## Running unit tests

Run `yarn test` to execute the unit tests via [Karma](https://karma-runner.github.io).
