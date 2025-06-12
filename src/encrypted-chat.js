import { useState } from 'react';
import { getViemChain, supportedChains } from '@inco/js';
import { Lightning } from '@inco/js/lite';
import { createWalletClient, custom } from 'viem';
import { ENCRYPTED_ERC20_CONTRACT_ADDRESS } from './utils/contract';

// Fixed utility functions
const getConfig = () => {
  return Lightning.latest('testnet', supportedChains.baseSepolia);
};

const setupWallet = async () => {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask');
  }

  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });

  if (accounts.length === 0) {
    throw new Error('No accounts found');
  }

  // Return a proper viem wallet client
  const walletClient = createWalletClient({
    chain: getViemChain(supportedChains.baseSepolia),
    account: accounts[0],
    transport: custom(window.ethereum)
  });

  return walletClient;
};

export default function ConfidentialTransfer() {
    const [message, setMessage] = useState('');
    const [encryptedMessage, setEncryptedMessage] = useState(null);
    const [decryptedMessage, setDecryptedMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [account, setAccount] = useState(null);
    const [walletClient, setWalletClient] = useState(null);

    const connectWallet = async () => {
        try {
            setError(null);
            const client = await setupWallet();
            // Access the account address properly from the wallet client
            setAccount(client.account.address);
            setWalletClient(client);
        } catch (err) {
            setError(err.message);
        }
    };

    const encryptMessage = async () => {
        if (!message || !walletClient) {
            setError('Please enter a message and connect wallet');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const plaintext = parseInt(message) || 0;
            const zap = getConfig();
            
            console.log('Encrypting value:', plaintext);
            console.log('Account address:', walletClient.account.address);
            
            // Update dappAddress to use the ConfidentialERC20 contract address
            const dappAddress = ENCRYPTED_ERC20_CONTRACT_ADDRESS;
            
            const ciphertext = await zap.encrypt(plaintext, {
                accountAddress: walletClient.account.address,
                dappAddress: dappAddress
            });
            
            console.log('Encryption successful, ciphertext:', ciphertext);
            setEncryptedMessage(ciphertext);
            setDecryptedMessage(null);
        } catch (err) {
            setError(`Encryption error: ${err.message}`);
            console.error('Encryption error details:', err);
        } finally {
            setLoading(false);
        }
    };

    const decryptMessage = async () => {
        if (!encryptedMessage || !walletClient) {
            setError('No encrypted message or wallet not connected');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const zap = getConfig();
            
            // Create a fresh wallet client for reencryption
            const reencryptionClient = createWalletClient({
                chain: getViemChain(supportedChains.baseSepolia),
                account: walletClient.account,
                transport: custom(window.ethereum)
            });
            
            console.log('Creating reencryptor with client:', reencryptionClient);
            console.log('Handle to decrypt:', encryptedMessage);
            
            // Pass the wallet client directly to getReencryptor
            const reencryptor = await zap.getReencryptor(reencryptionClient);
            
            // Make sure handle is properly formatted as Hex
            const handleAsHex = encryptedMessage.startsWith('0x') ? encryptedMessage : `0x${encryptedMessage}`;
            
            console.log('Formatted handle:', handleAsHex);
            
            const result = await reencryptor({ 
                handle: handleAsHex
            });
            
            console.log('Reencryption result:', result);
            setDecryptedMessage(result.value.toString());
        } catch (err) {
            setError(`Decryption error: ${err.message}`);
            console.error('Decryption error details:', err);
            console.error('Full error object:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 border-2 border-gray-600 w-full max-w-md mx-auto mt-8">
            <h2 className="text-xl font-bold mb-4 text-white">Encrypt/Decrypt Message</h2>
            
            {!account ? (
                <button
                    onClick={connectWallet}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full mb-4 transition-colors"
                >
                    Connect Wallet
                </button>
            ) : (
                <div className="mb-4">
                    <p className="text-gray-300 mb-4 text-sm">
                        Connected: {account.slice(0, 6)}...{account.slice(-4)}
                    </p>
                    
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2 text-sm">Enter a number to encrypt</label>
                        <input
                            type="number"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter a number"
                            className="border border-gray-600 p-3 w-full bg-gray-700 text-white rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    
                    <button
                        onClick={encryptMessage}
                        disabled={loading || !message}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-4 py-2 rounded w-full mb-2 transition-colors"
                    >
                        {loading ? 'Encrypting...' : 'Encrypt Number'}
                    </button>

                    {encryptedMessage && (
                        <div className="mt-4 p-4 bg-gray-700 rounded border border-gray-600">
                            <p className="text-gray-300 mb-2 text-sm font-medium">Encrypted Value:</p>
                            <div className="text-gray-300 text-xs font-mono bg-gray-800 p-2 rounded" style={{ maxWidth: '550px', wordBreak: 'break-all' }}>
                                {encryptedMessage}
                            </div>
                            <button
                                onClick={decryptMessage}
                                disabled={loading}
                                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-4 py-2 rounded w-full mt-3 transition-colors"
                            >
                                {loading ? 'Decrypting...' : 'Decrypt Value'}
                            </button>
                        </div>
                    )}

                    {decryptedMessage && (
                        <div className="mt-4 p-4 bg-green-900 bg-opacity-30 rounded border border-green-600">
                            <p className="text-gray-300 mb-2 text-sm font-medium">Decrypted Value:</p>
                            <p className="text-green-400 text-lg font-bold">{decryptedMessage}</p>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="text-red-400 mb-4 p-3 bg-red-900 bg-opacity-30 rounded border border-red-600 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
}