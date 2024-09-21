import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { formatEther, parseEther } from "viem";
import { toast } from "react-toastify";
import useDebounce from "../hooks/useDebounce";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractReads,
  useContractEvent,
} from "wagmi";
import MultiSigWallet from "../artifacts/contracts/MultiSigWallet.sol/MultiSigWallet.json";
import "../assets/style/UserFeatures.css";
export function Deposit({ scAddress, userAddress }) {
  const [depositAmt, setDepositAmt] = useState(0);
  const debouncedDeposit = useDebounce(depositAmt, 1500);

  const {
    config: depositConfig,
    error: prepareDepositError,
    isError: prepareDepositIsError,
  } = usePrepareContractWrite({
    address: scAddress,
    abi: MultiSigWallet.abi,
    functionName: "deposit",
    value: debouncedDeposit,
    enabled: Boolean(debouncedDeposit),
  });

  const {
    data: writeData,
    write: depositWrite,
    error: depositError,
    isError: depositIsError,
  } = useContractWrite(depositConfig);

  const { isLoading: depositIsLoading, isSuccess: depositIsSuccess } =
    useWaitForTransaction({
      hash: writeData?.hash,
    });

  const onChangeDeposit = (event) => {
    const amt = event.target.value;
    const depositEther = parseEther(amt);
    setDepositAmt(depositEther);
  };

  useContractEvent({
    address: scAddress,
    abi: MultiSigWallet.abi,
    eventName: "Deposit",
    listener(logs) {
      const userEvent = logs[0].args;
      const depositedAmt = formatEther(userEvent?.amount?.toString());
      toast.success(`Deposited ${depositedAmt} AMB!`);
    },
  });

  return (
    <div className="deposit-section">
      <h2 className="mb-4">Deposit AMB to Multisig</h2>
      <Form>
        <Form.Group className="mb-3 d-flex user-label" controlId="formUserAddress">
          <Form.Label className="user-address">Current address:</Form.Label>
          <Form.Control
            type="text"
            placeholder={userAddress}
            plaintext
            readOnly
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formDepositEther">
          <Form.Label>Deposit AMB</Form.Label>
          <Form.Control
            className="deposit-input-field"
            type="number"
            step="0.000001"
            placeholder="Enter amount in AMB"
            onChange={onChangeDeposit}
          />
        </Form.Group>
        <Button
          className="deposit-button"
          disabled={!depositWrite || depositIsLoading}
          variant="primary"
          onClick={() => depositWrite?.()}
        >
          {depositIsLoading ? "Depositing..." : "Deposit"}
        </Button>
      </Form>
      {depositIsSuccess && (
        <div className="mt-4">
          Successfully deposited {formatEther(depositAmt)} AMB!
          <div>
            <a
              href={`https://testnet.airdao.io/explorer/tx/${writeData?.hash}`}
              target="_blank"
              rel="noreferrer"
            >
              View on Explorer
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function UnapprovedTransactions({ scAddress, quorem }) {
  const { data: readData, isLoading: readIsLoading } = useContractReads({
    contracts: [{ 
      address: scAddress,
      abi: MultiSigWallet.abi, 
      functionName: "getWithdrawTxes" 
    }],
    watch: true,
  });

  const txnsWithId = !readIsLoading
    ? readData[0]?.result?.map((txn, index) => ({
        ...txn,
        id: index,
      }))
    : [];

  const unapprovedTxns = txnsWithId?.filter(
    (txn) => parseInt(txn?.approvals?.toString()) < quorem
  );

  useContractEvent({
    address: scAddress,
    abi: MultiSigWallet.abi,
    eventName: "CreateWithdrawTx",
    listener(logs) {
      const userEvent = logs[0].args;
      const withdrawalAmt = formatEther(userEvent?.amount?.toString());
      toast.success(
        `Withdrawal txnId: ${parseInt(
          userEvent?.transactionindex
        )} with withdrawal amount: ${withdrawalAmt} AMB created!`
      );
    },
  });

  useContractEvent({
    address: scAddress,
    abi: MultiSigWallet.abi,
    eventName: "ApproveWithdrawTx",
    listener(logs) {
      const userEvent = logs[0].args;
      toast.success(
        `txnId: ${parseInt(
          userEvent?.transactionIndex
        )} is approved and sent to recipient!`
      );
    },
  });

  return (
    <div className="transaction-section">
      <h3 className="mb-4">Pending Transactions</h3>
      {readIsLoading ? (
        <p>Loading transaction list...</p>
      ) : unapprovedTxns.length === 0 ? (
        <p>No pending transactions.</p>
      ) : (
        <div className="table-responsive">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Approvals</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {unapprovedTxns.map((txn) => (
                <tr key={txn.id}>
                  <td>{txn.id}</td>
                  <td>{`${txn?.to.slice(0, 6)}...${txn?.to.slice(-4)}`}</td>
                  <td>{`${parseFloat(formatEther(txn?.amount)).toFixed(4)} AMB`}</td>
                  <td>{`${txn?.approvals} / ${quorem}`}</td>
                  <td>{txn?.sent ? "Sent" : "Pending"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}