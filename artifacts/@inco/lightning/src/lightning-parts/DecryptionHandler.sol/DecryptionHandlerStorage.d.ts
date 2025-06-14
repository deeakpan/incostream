// This file was autogenerated by hardhat-viem, do not edit it.
// prettier-ignore
// tslint:disable
// eslint-disable

import type { Address } from "viem";
import type { GetContractReturnType } from "@nomicfoundation/hardhat-viem/types";
import "@nomicfoundation/hardhat-viem/types";

export interface DecryptionHandlerStorage$Type {
  "_format": "hh-sol-artifact-1",
  "contractName": "DecryptionHandlerStorage",
  "sourceName": "@inco/lightning/src/lightning-parts/DecryptionHandler.sol",
  "abi": [],
  "bytecode": "0x6080604052348015600e575f5ffd5b50603e80601a5f395ff3fe60806040525f5ffdfea2646970667358221220ac752115b3cf6522d3dcb6d4f138772aff85f91df1c66f70c157340e77ff166a64736f6c634300081c0033",
  "deployedBytecode": "0x60806040525f5ffdfea2646970667358221220ac752115b3cf6522d3dcb6d4f138772aff85f91df1c66f70c157340e77ff166a64736f6c634300081c0033",
  "linkReferences": {},
  "deployedLinkReferences": {}
}

declare module "@nomicfoundation/hardhat-viem/types" {
  export function deployContract(
    contractName: "DecryptionHandlerStorage",
    constructorArgs?: [],
    config?: DeployContractConfig
  ): Promise<GetContractReturnType<DecryptionHandlerStorage$Type["abi"]>>;
  export function deployContract(
    contractName: "@inco/lightning/src/lightning-parts/DecryptionHandler.sol:DecryptionHandlerStorage",
    constructorArgs?: [],
    config?: DeployContractConfig
  ): Promise<GetContractReturnType<DecryptionHandlerStorage$Type["abi"]>>;

  export function sendDeploymentTransaction(
    contractName: "DecryptionHandlerStorage",
    constructorArgs?: [],
    config?: SendDeploymentTransactionConfig
  ): Promise<{
    contract: GetContractReturnType<DecryptionHandlerStorage$Type["abi"]>;
    deploymentTransaction: GetTransactionReturnType;
  }>;
  export function sendDeploymentTransaction(
    contractName: "@inco/lightning/src/lightning-parts/DecryptionHandler.sol:DecryptionHandlerStorage",
    constructorArgs?: [],
    config?: SendDeploymentTransactionConfig
  ): Promise<{
    contract: GetContractReturnType<DecryptionHandlerStorage$Type["abi"]>;
    deploymentTransaction: GetTransactionReturnType;
  }>;

  export function getContractAt(
    contractName: "DecryptionHandlerStorage",
    address: Address,
    config?: GetContractAtConfig
  ): Promise<GetContractReturnType<DecryptionHandlerStorage$Type["abi"]>>;
  export function getContractAt(
    contractName: "@inco/lightning/src/lightning-parts/DecryptionHandler.sol:DecryptionHandlerStorage",
    address: Address,
    config?: GetContractAtConfig
  ): Promise<GetContractReturnType<DecryptionHandlerStorage$Type["abi"]>>;
}
