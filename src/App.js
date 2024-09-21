import React, { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { toast, ToastContainer } from "react-toastify";
import ScContract from "./components/ScContract";
import "./App.css";

function App() {
  const [showConnectedAlert, setShowConnectedAlert] = useState(false);
  const { address, isConnected } = useAccount({
    onConnect({ address, connector, isReconnected }) {
      toast.success(`Connected to ${address.slice(0, 6)}...${address.slice(-4)}`);
      setShowConnectedAlert(true);
    },
    onDisconnect() {
      toast.info("Wallet disconnected");
      setShowConnectedAlert(false);
    },
  });

  useEffect(() => {
    if (showConnectedAlert) {
      const timer = setTimeout(() => setShowConnectedAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConnectedAlert]);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="logo">AirDAO Multisig Wallet</h1>
        <div className="connection-button">
          <ConnectButton />
        </div>
      </header>

      <main className="app-main">
        {showConnectedAlert && (
          <div className="alert alert-success">
            <span>Wallet connected successfully!</span>
            <button className="alert-close" onClick={() => setShowConnectedAlert(false)}>×</button>
          </div>
        )}

        {isConnected ? (
          <ScContract userAddress={address} />
        ) : (
          <div className="welcome-message">
            <h2>Welcome to AirDAO Multisig Wallet</h2>
            <p>Please connect your wallet to get started.</p>
          </div>
        )}
      </main>

      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}

export default App;