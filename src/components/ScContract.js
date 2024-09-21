import React, { useState } from "react";
import { useContractRead, useContractReads } from "wagmi";
import { isAddress } from "viem";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ScStats from "./ScStats";
import { Deposit, UnapprovedTransactions } from "./UserFeatures";
import OwnersActions from "./OwnersActions";
import FactoryActions from "./FactoryActions";
import contractABI from "../artifacts/contracts/MultiSigWallet.sol/MultiSigWallet.json";
import factoryABI from "../artifacts/contracts/Factory.sol/Factory.json";
import "../assets/style/ScContract.css";

const factoryContract = {
  address: process.env.REACT_APP_FACTORY_ADDRESS,
  abi: factoryABI.abi,
};

function ScContract({ userAddress }) {
  const [activeTab, setActiveTab] = useState("select");
  const [scAddress, setScAddress] = useState("");

  const {
    data: factoryReadData,
    isLoading: factoryIsLoading,
    refetch: walletRefetch,
  } = useContractRead({
    ...factoryContract,
    functionName: "getWalletList",
  });

  const { data: readData, isSuccess } = useContractReads({
    contracts: [
      {
        address: scAddress,
        abi: contractABI.abi,
        functionName: "quoremRequired",
      },
      {
        address: scAddress,
        abi: contractABI.abi,
        functionName: "getOwners",
      },
    ],
    enabled: isAddress(scAddress),
  });

  const quorem = isSuccess ? parseInt(readData[0]?.result) : null;
  const owners = isSuccess ? readData[1]?.result : [];
  const isOwner = owners?.includes(userAddress);

  const renderContent = () => {
    switch (activeTab) {
      case "select":
        return (
          <div className="select-multisig">
            <h2>Choose your Multisig</h2>
            <Form.Select
              disabled={factoryIsLoading}
              onChange={(e) => setScAddress(e.target.value)}
              className="mt-3 mb-2"
            >
              <option>Select Contract Address</option>
              {factoryReadData?.map((address, index) => (
                <option key={address} value={address}>
                  {`walletID #${index + 1} ${address}`}
                </option>
              ))}
            </Form.Select>
            <Button
              className="mt-3"
              disabled={!isAddress(scAddress) || factoryIsLoading}
              onClick={() => setActiveTab("stats")}
            >
              Display Multisig
            </Button>
          </div>
        );
      case "create":
        return (
          <FactoryActions
            userAddress={userAddress}
            walletRefetch={walletRefetch}
          />
        );
      case "stats":
        return (
          <ScStats
            scAddress={scAddress}
            userAddress={userAddress}
            quorem={quorem}
            owners={owners}
          />
        );
      case "deposit":
        return <Deposit scAddress={scAddress} userAddress={userAddress} />;
      case "transactions":
        return <UnapprovedTransactions scAddress={scAddress} quorem={quorem} />;
      case "manage":
        return <OwnersActions scAddress={scAddress} isOwner={isOwner} />;
      default:
        return null;
    }
  };

  return (
    <div className="sc-contract">
      <nav className="mini-navbar">
        <button onClick={() => setActiveTab("select")}>Select Multisig</button>
        <button onClick={() => setActiveTab("create")}>Create Multisig</button>
        <button
          onClick={() => setActiveTab("stats")}
          disabled={!isAddress(scAddress)}
        >
          Multisig Stats
        </button>
        <button
          onClick={() => setActiveTab("deposit")}
          disabled={!isAddress(scAddress)}
        >
          Deposit & Transactions
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          disabled={!isAddress(scAddress)}
        >
          Withdraw
        </button>
      </nav>
      <div className="content">{renderContent()}</div>
    </div>
  );
}

export default ScContract;
