import {
  generateSecp256k1Keypair,
  decodeSecp256k1PublicKey,
  getEciesEncryptor,
} from "@inco-fhevm/js/lite";
import { hexToBytes } from "viem";
import { getReencryptor } from "@inco-fhevm/js/reencryption";
import { incoLiteEnvQuerier, incoLiteReencrypt } from "@inco-fhevm/js/lite";
import { Schema, Bytes32 } from "@inco-fhevm/js";

export const SELECTED_NETWORK = "baseSepolia";

export const encryptValue = async ({
  value,
  address,
  config,
  contractAddress,
}) => {
  const valueBigInt = BigInt(value);

  const plaintextWithContext = {
    plaintext: {
      scheme: 1, // encryptionSchemes.ecies
      value: valueBigInt,
      type: 8, // handleTypes.uint256
    },
    context: {
      hostChainId: BigInt(config.chainId),
      aclAddress: config.deployedAtAddress,
      userAddress: address,
      contractAddress: contractAddress,
    },
  };

  const ephemeralKeypair = await generateSecp256k1Keypair();

  const eciesPubKey = decodeSecp256k1PublicKey(
    hexToBytes(config.eciesPublicKey)
  );

  const encryptor = getEciesEncryptor({
    scheme: 1, // encryptionSchemes.ecies
    pubKeyA: eciesPubKey,
    privKeyB: ephemeralKeypair,
  });

  const inputCt = await encryptor(plaintextWithContext);

  return { inputCt };
};

export const reEncryptValue = async ({
  chainId,
  contractAddress,
  walletClient,
  handle,
  publicClient,
  incoLiteAddress,
  kmsConnectEndpoint,
}) => {
  if (
    !chainId ||
    !contractAddress ||
    !walletClient ||
    !publicClient ||
    !incoLiteAddress ||
    !kmsConnectEndpoint
  ) {
    throw new Error("Missing required parameters for creating reencryptor");
  }

  try {
    const reencryptor = await getReencryptor({
      chainId,
      contractAddress,
      walletClient,
      reencryptEndpoint: incoLiteReencrypt({
        kmsConnectRpcEndpointOrClient: kmsConnectEndpoint,
      }),
      fheEnvQuerier: incoLiteEnvQuerier({
        incoLiteAddress,
        publicClient,
      }),
    });

    const decrypted = await reencryptor({
      handle: {
        value: Schema.parse(Bytes32, handle),
        type: 8, // Default to uint256 type
      },
    });

    return decrypted;
  } catch (error) {
    throw new Error(`Failed to create reencryptor: ${error.message}`);
  }
};
