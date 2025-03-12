import React, { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { TWO_THIRD_ABI, TWO_THIRD_CONTRACT_ADDRESS } from "@/utils/contract";
import { getActiveIncoLiteDeployment } from "@inco-fhevm/js/lite";
import { SELECTED_NETWORK, encryptValue } from "@/utils/inco-lite";

const NumberInputForm = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittedNumber, setSubmittedNumber] = useState(null);
  const [isInputSubmitted, setIsInputSubmitted] = useState(false);
  const { address } = useAccount();

  const { writeContractAsync } = useWriteContract();

  const handleSubmit = async () => {
    setError(null);

    const numberInput = parseInt(input, 10);
    if (isNaN(numberInput) || numberInput < 1 || numberInput > 100) {
      setError("Please enter a valid number between 1 and 100");
      return;
    }

    try {
      setIsLoading(true);
      setSubmittedNumber(numberInput);

      const config = getActiveIncoLiteDeployment(SELECTED_NETWORK);

      const contractConfig = {
        address: TWO_THIRD_CONTRACT_ADDRESS,
        abi: TWO_THIRD_ABI,
      };

      const { inputCt } = await encryptValue({
        value: numberInput,
        address: address,
        config: config,
        contractAddress: TWO_THIRD_CONTRACT_ADDRESS,
      });

      const txHash = await writeContractAsync({
        ...contractConfig,
        functionName: "enterGame",
        args: [inputCt.ciphertext.value],
      });

      console.log(`Transaction submitted: ${txHash}`);
      setIsInputSubmitted(true);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInputSubmitted) {
    return (
      <div>
        <p>Your guess: {submittedNumber}</p>
      </div>
    );
  }

  return (
    <div className="grid ">
      <input
        type="number"
        placeholder="Enter a number (1-100)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        min="1"
        max="100"
        className="border border-gray-300 rounded-md p-2 bg-white/10"
        disabled={isLoading}
      />

      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors mt-4"
      >
        {isLoading ? "Processing..." : "Submit"}
      </button>
    </div>
  );
};

export default NumberInputForm;
