import { getViemChain, supportedChains } from '@inco/js';
import { Lightning } from '@inco/js/lite';
import { createWalletClient, custom } from 'viem';

export const getConfig = () => {
  return Lightning.latest('testnet', supportedChains.baseSepolia);
};

export const setupWallet = async () => {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask');
  }

  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });

  if (accounts.length === 0) {
    throw new Error('No accounts found');
  }

  const walletClient = createWalletClient({
    chain: getViemChain(supportedChains.baseSepolia),
    account: accounts[0],
    transport: custom(window.ethereum)
  });

  return {
    account: accounts[0],
    chain: getViemChain(supportedChains.baseSepolia),
    transport: custom(window.ethereum),
    signMessage: async (message) => {
      return window.ethereum.request({
        method: 'personal_sign',
        params: [message, accounts[0]]
      });
    }
  };
};

/**
 * @example
 * const encryptedValue = await encryptValue({
 *   value: 100,
 *   address: "0x123...",
 *   contractAddress: "0x456..."
 * });
 */
export const encryptValue = async ({ value, address, contractAddress }) => {
  const zap = getConfig();
  
  const ciphertext = await zap.encrypt(value, {
    accountAddress: address,
    dappAddress: contractAddress
  });

  console.log("Encrypted data:", ciphertext);
  return ciphertext;
};

/**
 * @example
 * const decryptedValue = await reEncryptValue({
 *   walletClient: yourWalletClient,
 *   handle: encryptionHandle
 * });
 */
export const reEncryptValue = async ({ walletClient, handle }) => {
  if (!walletClient || !handle) {
    throw new Error("Missing required parameters for creating reencryptor");
  }

  try {
    const zap = getConfig();
    const reencryptor = await zap.getReencryptor(walletClient);
    const result = await reencryptor({ handle: handle.toString() });
    
    console.log("Decrypted result:", result);
    return result.value.toString();
  } catch (error) {
    console.error("Reencryption error:", error);
    throw new Error(`Failed to create reencryptor: ${error.message}`);
  }
};
