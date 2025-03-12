import React from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWalletClient,
} from "wagmi";
import { getActiveIncoLiteDeployment } from "@inco-fhevm/js/lite";
import { TWO_THIRD_ABI, TWO_THIRD_CONTRACT_ADDRESS } from "@/utils/contract";
import { reEncryptValue, SELECTED_NETWORK } from "@/utils/inco-lite";

const ReEncryptButton = () => {
  const { data: walletClient } = useWalletClient();

  const publicClient = usePublicClient();
  const { address } = useAccount();

  const resultHandle = useReadContract({
    address: TWO_THIRD_CONTRACT_ADDRESS,
    abi: TWO_THIRD_ABI,
    functionName: "entries",
    args: [address],
    enabled: !!address,
  });

  const reEncrypt = async () => {
    if (!resultHandle.data) {
      console.error("No result handle data available yet");
      return;
    }

    try {
      const cfg = getActiveIncoLiteDeployment(SELECTED_NETWORK);

      const decrypted = await reEncryptValue({
        chainId: cfg.chainId,
        contractAddress: TWO_THIRD_CONTRACT_ADDRESS,
        incoLiteAddress: cfg.deployedAtAddress,
        walletClient,
        publicClient,
        handle: resultHandle.data,
        kmsConnectEndpoint:
          "https://grpc.basesepolia.covalidator.denver.inco.org", // Deafault for now
      });

      console.log("Decrypted value:", decrypted);
    } catch (error) {
      console.error("Error in reEncrypt function:", error);
    }
  };
  return (
    <button
      className="bg-white/10 hover:bg-white-40 text-white px-4 py-2 rounded-md transition-colors mt-4"
      onClick={reEncrypt}
    >
      Re-Encrypt
    </button>
  );
};

export default ReEncryptButton;
