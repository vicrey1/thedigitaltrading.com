import React, { useState, useEffect } from 'react';
import { FiKey, FiSend, FiDownload, FiEye, FiEyeOff, FiCopy, FiBookOpen, FiTrash2, FiCreditCard, FiLoader } from 'react-icons/fi';
import { QRCodeCanvas } from 'qrcode.react';
import {
  getEthWallet, getEthBalance, sendEth, getErc20Balance, sendErc20,
  getTrxBalance, getTrc20Balance
} from '../../utils/blockchain';
import {
  getAddressBook, addAddress, removeAddress
} from '../../utils/addressBook';

const ERC20_TOKENS = {
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Mainnet USDT
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet USDC
};

const AdminColdWallet = () => {
  const [inputType, setInputType] = useState('mnemonic');
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [sendForm, setSendForm] = useState({ to: '', amount: '', asset: 'USDT' });
  const [txResult, setTxResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [network, setNetwork] = useState('ethereum');
  const [addressBook, setAddressBook] = useState([]);
  const [addressLabel, setAddressLabel] = useState('');
  const [showBook, setShowBook] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setAddressBook(getAddressBook());
  }, []);

  const handleImport = async () => {
    setLoading(true);
    try {
      let w = null;
      let balances = {};
      let address = '';
      if (network === 'ethereum') {
        w = await getEthWallet({ mnemonic, privateKey, rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY' });
        address = w.address;
        balances.ETH = await getEthBalance(w);
        balances.USDT = await getErc20Balance(w, ERC20_TOKENS.USDT);
        balances.USDC = await getErc20Balance(w, ERC20_TOKENS.USDC);
      } else if (network === 'bitcoin') {
        // Only support mnemonic/privateKey for address generation, not signing
        throw new Error('For security, browser wallets can only generate and display Bitcoin addresses and balances. Sending requires a hardware wallet or external app.');
      } else if (network === 'tron') {
        address = privateKey || mnemonic;
        try {
          balances.TRX = await getTrxBalance(address);
          balances.USDT = await getTrc20Balance(address);
        } catch {}
      }
      setWallet({ address, balances, network });
    } catch (e) {
      alert('Import failed: ' + e.message);
    }
    setLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let tx;
      if (network === 'ethereum') {
        if (sendForm.asset === 'ETH') {
          tx = await sendEth(wallet, sendForm.to, sendForm.amount);
        } else {
          const tokenAddr = ERC20_TOKENS[sendForm.asset];
          tx = await sendErc20(wallet, tokenAddr, sendForm.to, sendForm.amount);
        }
      } else if (network === 'bitcoin') {
        // Implement Bitcoin send logic
        tx = { txid: 'btc_txid', success: true };
      } else if (network === 'tron') {
        // Implement Tron send logic
        tx = { txid: 'tron_txid', success: true };
      }
      setTxResult({
        success: true,
        txid: tx.hash || tx.txid,
        to: sendForm.to,
        amount: sendForm.amount,
        asset: sendForm.asset,
      });
    } catch (e) {
      setTxResult({ success: false, error: e.message });
    }
    setLoading(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleAddToBook = () => {
    if (addressLabel && sendForm.to) {
      addAddress(addressLabel, sendForm.to);
      setAddressBook(getAddressBook());
      setAddressLabel('');
    }
  };

  const handleRemoveFromBook = (address) => {
    removeAddress(address);
    setAddressBook(getAddressBook());
  };

  return (
    <div className={`max-w-full ${isMobile ? 'p-4' : 'sm:max-w-4xl p-2 sm:p-6'} w-full mx-auto`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <FiKey className="w-6 h-6 text-gold" />
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gold`}>Cold Wallet Admin</h1>
        </div>

        {/* Network and Input Type Selection */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Network</label>
            <select 
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
              value={network} 
              onChange={e => setNetwork(e.target.value)}
            >
              <option value="ethereum">Ethereum (ETH, USDT ERC20, USDC ERC20)</option>
              <option value="bitcoin">Bitcoin (all address types)</option>
              <option value="tron">Tron (TRX, USDT TRC20)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Import Method</label>
            <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex space-x-2'}`}>
              <button
                className={`${isMobile ? 'w-full' : 'flex-1'} px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                  inputType === 'mnemonic' ? 'bg-gold text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setInputType('mnemonic')}
              >
                Mnemonic Phrase
              </button>
              <button
                className={`${isMobile ? 'w-full' : 'flex-1'} px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                  inputType === 'privateKey' ? 'bg-gold text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setInputType('privateKey')}
              >
                Private Key
              </button>
              <button
                className={`${isMobile ? 'w-full' : ''} px-4 py-3 rounded-lg font-semibold bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors flex items-center justify-center text-sm`}
                onClick={() => setShowBook(b => !b)}
              >
                <FiBookOpen className="mr-2 w-4 h-4" /> Address Book
              </button>
            </div>
          </div>
        </div>

        {/* Address Book */}
        {showBook && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h2 className="text-lg font-bold text-gold mb-4 flex items-center">
              <FiBookOpen className="mr-2 w-5 h-5" /> Address Book
            </h2>
            {addressBook.length === 0 ? (
              <div className="text-gray-400 text-center py-4">No saved addresses.</div>
            ) : (
              <div className="space-y-3">
                {addressBook.map(a => (
                  <div key={a.address} className="bg-gray-900 rounded-lg p-3 border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs text-gray-300 break-all">{a.address}</div>
                        <div className="text-sm text-gray-400 mt-1">{a.label}</div>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <button 
                          className="text-gold hover:text-yellow-400 transition-colors"
                          onClick={() => setSendForm(f => ({ ...f, to: a.address }))}
                        >
                          <FiSend className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-red-400 hover:text-red-300 transition-colors"
                          onClick={() => handleRemoveFromBook(a.address)}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Import Wallet */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-4">
          <h2 className="text-lg font-bold text-gold flex items-center">
            <FiCreditCard className="mr-2 w-5 h-5" />
            Import Wallet
          </h2>
          
          {inputType === 'mnemonic' ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Mnemonic Phrase</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  className="w-full p-3 pr-12 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
                  value={mnemonic}
                  onChange={e => setMnemonic(e.target.value)}
                  placeholder="Enter 12/24-word mnemonic phrase"
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowSecret(s => !s)}
                >
                  {showSecret ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Private Key</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  className="w-full p-3 pr-12 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
                  value={privateKey}
                  onChange={e => setPrivateKey(e.target.value)}
                  placeholder="Enter private key"
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowSecret(s => !s)}
                >
                  {showSecret ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
          
          <button
            className="w-full px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            onClick={handleImport}
            disabled={loading || (!mnemonic && !privateKey)}
          >
            {loading ? (
              <>
                <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              'Import Wallet'
            )}
          </button>
        </div>

        {/* Wallet Info */}
        {wallet && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-4">
            <h2 className="text-lg font-bold text-gold flex items-center">
              <FiCreditCard className="mr-2 w-5 h-5" />
              Wallet Information
            </h2>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Address</label>
                  <button 
                    className="text-gold hover:text-yellow-400 transition-colors flex items-center"
                    onClick={() => handleCopy(wallet.address)}
                  >
                    <FiCopy className="w-4 h-4 mr-1" />
                    {copied && <span className="text-green-400 text-xs ml-1">Copied!</span>}
                  </button>
                </div>
                <div className="font-mono text-sm text-gold bg-gray-900 p-3 rounded border border-gray-600 break-all">
                  {wallet.address}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Network</label>
                <div className="text-white bg-gray-900 p-3 rounded border border-gray-600 capitalize">
                  {wallet.network}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Balances</label>
                <div className={`${isMobile ? 'space-y-2' : 'grid grid-cols-3 gap-4'}`}>
                  {Object.entries(wallet.balances).map(([asset, amount]) => (
                    <div key={asset} className="bg-gray-900 p-3 rounded border border-gray-600 text-center">
                      <div className="text-gold font-bold text-lg">{amount}</div>
                      <div className="text-xs text-gray-300">{asset}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Funds */}
        {wallet && (
          <form onSubmit={handleSend} className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-4">
            <h2 className="text-lg font-bold text-gold flex items-center">
              <FiSend className="mr-2 w-5 h-5" />
              Send Funds
            </h2>
            
            <div className="space-y-4">
              <div className={`${isMobile ? 'space-y-4' : 'flex gap-4'}`}>
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-300">To Address</label>
                  <input
                    className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
                    value={sendForm.to}
                    onChange={e => setSendForm(f => ({ ...f, to: e.target.value }))}
                    placeholder="Recipient address"
                    required
                  />
                </div>
                <div className={`${isMobile ? 'space-y-2' : 'w-32'} space-y-2`}>
                  <label className="block text-sm font-medium text-gray-300">Label</label>
                  <input
                    className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
                    value={addressLabel}
                    onChange={e => setAddressLabel(e.target.value)}
                    placeholder="Label"
                  />
                  <button 
                    type="button" 
                    className="w-full bg-gold text-black px-3 py-2 rounded text-xs font-semibold hover:bg-yellow-400 transition-colors"
                    onClick={handleAddToBook}
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className={`${isMobile ? 'space-y-4' : 'flex gap-4'}`}>
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Amount</label>
                  <input
                    className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
                    value={sendForm.amount}
                    onChange={e => setSendForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="Amount"
                    type="number"
                    min="0"
                    step="any"
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Asset</label>
                  <select
                    className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-gold outline-none text-sm"
                    value={sendForm.asset}
                    onChange={e => setSendForm(f => ({ ...f, asset: e.target.value }))}
                  >
                    {Object.keys(wallet.balances).map(asset => (
                      <option key={asset} value={asset}>{asset}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                className="w-full px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Funds'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Transaction Result */}
        {txResult && (
          <div className={`rounded-lg p-4 border ${
            txResult.success 
              ? 'border-green-600 bg-green-900 bg-opacity-20' 
              : 'border-red-600 bg-red-900 bg-opacity-20'
          }`}>
            <div className="font-bold text-lg text-gold mb-2">
              Transaction {txResult.success ? 'Success' : 'Failed'}
            </div>
            {txResult.success ? (
              <>
                <div className="text-white mb-2">
                  Sent {txResult.amount} {txResult.asset} to {txResult.to}
                </div>
                <div className="text-xs text-gray-400 font-mono break-all">
                  TXID: {txResult.txid}
                </div>
              </>
            ) : (
              <div className="text-red-300">{txResult.error}</div>
            )}
          </div>
        )}

        {/* Receive Funds */}
        {wallet && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-4">
            <h2 className="text-lg font-bold text-gold flex items-center">
              <FiDownload className="mr-2 w-5 h-5" />
              Receive Funds
            </h2>
            
            <div className="text-center space-y-4">
              <div className="text-gray-300">Share this address to receive funds:</div>
              <div className="font-mono text-sm text-gold bg-gray-900 p-3 rounded border border-gray-600 break-all">
                {wallet.address}
              </div>
              <div className="flex justify-center">
                <QRCodeCanvas 
                  value={wallet.address} 
                  size={isMobile ? 150 : 200} 
                  bgColor="#18181b" 
                  fgColor="#FFD700" 
                  className="rounded-lg border border-gray-600" 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminColdWallet;
