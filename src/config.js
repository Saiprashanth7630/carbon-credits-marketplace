import contractConfig from './services/contractConfig.json' with { type: 'json' };

const config = {
  contractAddress: contractConfig.contractAddress,
  network: contractConfig.network,
  initialPrice: contractConfig.initialPrice,
  priceDecimals: contractConfig.priceDecimals,
  ganacheUrl: contractConfig.network.rpcUrl,
  chainId: contractConfig.network.chainId,
  supportedNetworks: {
    1337: {
      name: 'Ganache',
      rpcUrl: 'http://localhost:7545',
      blockExplorer: '',
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
      }
    }
  }
};

export default config; 