import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Wallet } from "./services/near-wallet";
import { EthereumView } from "./components/Ethereum";
import { BitcoinView } from "./components/Bitcoin";

import ethSvg from "/eth-logo.svg"
import btcSvg from "/btc-logo.svg"
import arrowsSvg from "/transfer.png"
import miladyPng from "/milady.png"
import puppetPng from "/puppet.png"

document.getElementById('hero-img').style.background = `url("${ethSvg}")`


// CONSTANTS
const MPC_CONTRACT = 'multichain-testnet-2.testnet';

const OUR_CONTRACT_ID = 'nearbtcethswap.testnet';

// NEAR WALLET
const wallet = new Wallet({ network: 'testnet', createAccessKeyFor: MPC_CONTRACT });

  // type Order = {

function App() {
  const [selectedOrder, setSelectedOrder] = useState(); // [order: Order]
  const [swapType, setSwapType] = useState(true); // [true == "eth-2-btc", false == "btc-2-eth"]
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [status, setStatus] = useState("Please login to request a signature");
  const [chain, setChain] = useState('eth');
  const [ordersList, setOrdersList] = useState([]);
  const [requestSignatureTxHash, setRequestSignatureTxHash] = useState();

  useEffect(() => {
    const initFunction = async () => {
      const isSignedIn = await wallet.startUp();
      setIsSignedIn(isSignedIn);
      await getContractOrders();
      const queryParams = new URLSearchParams(window.location.search);
      const txHash = queryParams.get("transactionHashes");
      if (txHash) {
        setRequestSignatureTxHash(txHash);
      }
    }

    initFunction();
  }, []);

  const onAcceptOrder = (order) => {
    console.log("Accepting order...");
    setSelectedOrder(order);
  } 

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOrder || !selectedOrder.ownerAssetId || !selectedOrder.ownerAssetCollectionName || !selectedOrder.accepterAssetId || !selectedOrder.accepterAssetCollectionName) {
      console.error("createOrder: missing fields");
      return;
    }

    console.log("Creating order...");
    const createOrder = await wallet.callMethod({ contractId: OUR_CONTRACT_ID, method: "create_order", args: {
      ownerAssetType: swapType ? "NFT" : "Ordinal",
      ownerAssetId: selectedOrder.ownerAssetId,
      ownerAssetCollectionName: selectedOrder.ownerAssetCollectionName,
      accepterAssetType: swapType ? "Ordinal" : "NFT",
      accepterAssetId: selectedOrder.accepterAssetId,
      accepterAssetCollectionName: selectedOrder.accepterAssetCollectionName,
    }});
    console.log("result call", createOrder);

    await getContractOrders();
    
  }

  const onChangeOrder = (field, value) => {
    setSelectedOrder(selectedOrder => ({
      ...selectedOrder,
      [field]: value
    }));
  }

  const getContractOrders = async () => {
    console.log("Getting orders...");
    const newOrdersList = await wallet.viewMethod({ contractId: OUR_CONTRACT_ID, method: "get_orders", args: {}});
    console.log("orders: ", newOrdersList);
    setOrdersList(newOrdersList);
  }

  return (
    <>
        <Navbar wallet={wallet} isSignedIn={isSignedIn}></Navbar>
      <div className="d-flex align-items-center justify-content-center vh-100" style={{ backgroundColor: "#f5f5f5" }}>
        <div className="card p-4" style={{ maxWidth: "500px", width: "100%", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
          <h4 className="h4 text-center" style={{ fontFamily: "Space Grotesk Variable", fontSize: "2rem" }}>Swap Assets</h4>
          <form onSubmit={onSubmit}>
            <div className="d-flex justify-content-between align-items-center my-3">
              <img src={swapType ? ethSvg : btcSvg} alt="Swap Icon" style={{ width: "30px" }} />
              <input type="checkbox" className="form-check-input" onChange={() => setSwapType((s) => !s)} />
              <img src={!swapType ? ethSvg : btcSvg} alt="Swap Icon" style={{ width: "30px" }} />
            </div>
            <p className="text-center"><b>{swapType ? "Exchange NFT (ETH) for Ordinal (BTC)" : "Exchange Ordinal (BTC) for NFT (ETH)"}</b></p>

            <div className="input-group my-2">
              <span className="input-group-text">{swapType ? "NFT ID" : "Ordinal ID"}</span>
              <input type="text" className="form-control" defaultValue={selectedOrder?.ownerAssetId || ""} onChange={(e) => onChangeOrder("ownerAssetId", e.target.value)} />
            </div>
            <div className="input-group my-2">
              <span className="input-group-text">{swapType ? "NFT Name" : "Ordinal Name"}</span>
              <input type="text" className="form-control" defaultValue={selectedOrder?.ownerAssetCollectionName || ""} onChange={(e) => onChangeOrder("ownerAssetCollectionName", e.target.value)} />
            </div>

            <img src={arrowsSvg} alt="Swap Arrows" className="d-block mx-auto my-3" style={{ width: "40px" }} />

            <div className="input-group my-2">
              <span className="input-group-text">{swapType ? "Ordinal ID" : "NFT ID"}</span>
              <input type="text" className="form-control" defaultValue={selectedOrder?.accepterAssetId || ""} onChange={(e) => onChangeOrder("accepterAssetId", e.target.value)} />
            </div>
            <div className="input-group my-2">
              <span className="input-group-text">{swapType ? "Ordinal Name" : "NFT Name"}</span>
              <input type="text" className="form-control" defaultValue={selectedOrder?.accepterAssetCollectionName || ""} onChange={(e) => onChangeOrder("accepterAssetCollectionName", e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary w-100 mt-4" style={{ fontWeight: "bold", fontSize: "1rem" }}>Create Order</button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default App
