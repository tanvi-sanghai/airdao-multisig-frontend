import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  rainbowWallet,
  walletConnectWallet,
  ledgerWallet,
  coinbaseWallet,
  metaMaskWallet,
  okxWallet,
  trustWallet,
  tokenPocketWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

// Define AirDAO networks
const airdaoMainnet = {
  id: 16718,
  name: 'AirDAO Mainnet',
  network: 'airdao',
  nativeCurrency: {
    decimals: 18,
    name: 'AMB',
    symbol: 'AMB',
  },
  rpcUrls: {
    public: { http: ['https://network.ambrosus.io/'] },
    default: { http: ['https://network.ambrosus.io/'] },
  },
  blockExplorers: {
    default: { name: 'AirDAO Explorer', url: 'https://explorer.ambrosus.io/' },
  },
};

const airdaoTestnet = {
  id: 22040,
  name: 'AirDAO Testnet',
  network: 'airdao-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'AMB',
    symbol: 'AMB',
  },
  rpcUrls: {
    public: { http: ['https://network.ambrosus-test.io'] },
    default: { http: ['https://network.ambrosus-test.io'] },
  },
  blockExplorers: {
    default: { name: 'AirDAO Testnet Explorer', url: 'https://testnet.airdao.io/' },
  },
};

const { chains, publicClient } = configureChains(
  [airdaoMainnet, airdaoTestnet],
  [publicProvider()]
);

const projectId = process.env.REACT_APP_PROJECTID;

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
      rainbowWallet({ projectId, chains }),
      walletConnectWallet({ projectId, chains }),
      coinbaseWallet({ appName: "My RainbowKit App", chains }),
      okxWallet({ projectId, chains }),
      tokenPocketWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} initialChain={airdaoTestnet}>
        <ToastContainer />
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);