import { BigNumber, constants, Contract, providers, utils } from "ethers";
import { ContractData } from "~/types";
import { getProvider } from "./web3.server";

enum ProxyPattern {
  UUPSProxy,
  UpgradeabilityStorage,
  EternalStorage,
  TransparentUpgradeableProxy,
  AppProxyUpgradeable,
  UnknownProxy,
}

type ProxyPatternHandler = (
  proxy: ContractData,
  provider: providers.Provider
) => Promise<string>;

const {
  UUPSProxy,
  UpgradeabilityStorage,
  EternalStorage,
  TransparentUpgradeableProxy,
  AppProxyUpgradeable,
  UnknownProxy,
} = ProxyPattern;

/**
 * Standarized storage slot determined by bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1)
 * and defined on EIP-1967 (https://eips.ethereum.org/EIPS/eip-1967#logic-contract-address)
 */
const EIP1967_STORAGE_SLOT = utils.hexlify(
  BigNumber.from(utils.id("eip1967.proxy.implementation")).sub(1)
);

const getAddressFromStorageSlot = async (
  contractAddress: string,
  storageSlot: string | number,
  provider: providers.Provider
): Promise<string> => {
  const rawImplementationAddress = await provider.getStorageAt(
    contractAddress,
    storageSlot
  );
  return utils.hexStripZeros(rawImplementationAddress);
};

const PROXY_PATTERN_HANDLERS: Record<ProxyPattern, ProxyPatternHandler> = {
  [UUPSProxy]: async ({ address }, provider) => {
    let implementationAddress = await getAddressFromStorageSlot(
      address,
      EIP1967_STORAGE_SLOT,
      provider
    );

    /**
     * Try to fetch the address from the keccak256("PROXIABLE") slot as defined on
     * the EIP-1822 UUPS proposal (https://eips.ethereum.org/EIPS/eip-1822#proxiable-contract).
     */
    if (implementationAddress === constants.AddressZero) {
      implementationAddress = await getAddressFromStorageSlot(
        address,
        utils.id("PROXIABLE"),
        provider
      );
      return implementationAddress;
    }

    return implementationAddress;
  },
  [UpgradeabilityStorage]: async (proxy, provider) => {
    return "";
  },
  [EternalStorage]: async (proxy, provider) => {
    return "";
  },
  [TransparentUpgradeableProxy]: async ({ address }, provider) => {
    return getAddressFromStorageSlot(address, EIP1967_STORAGE_SLOT, provider);
  },
  [AppProxyUpgradeable]: ({ address, abi }, provider) => {
    const proxyContract = new Contract(address, abi, provider);

    return proxyContract.implementation();
  },
  [UnknownProxy]: async ({ address, abi }, provider) => {
    let implementationAddress: string;

    try {
      const proxyContract = new Contract(address, abi, provider);
      // Try fetching address from method
      implementationAddress = await proxyContract.implementation();
    } catch (err) {
      implementationAddress = await getAddressFromStorageSlot(
        address,
        EIP1967_STORAGE_SLOT,
        provider
      );
    }

    return implementationAddress;
  },
};

export const getProxyPattern = (
  contractName: string
): ProxyPattern | undefined => {
  const normalizedContractName = contractName.toLowerCase();
  const proxyPatternKeys = Object.keys(ProxyPattern).map((k) =>
    k.toLowerCase()
  );
  const proxyPatternIndex = proxyPatternKeys.indexOf(normalizedContractName);

  if (proxyPatternIndex === -1) {
    if (normalizedContractName.includes("proxy")) {
      return UnknownProxy;
    }
    return;
  }

  return Object.values(ProxyPattern)[
    proxyPatternIndex
  ] as unknown as ProxyPattern;
};

export const fetchImplementationAddress = (
  proxy: ContractData,
  proxyPattern: ProxyPattern
): Promise<string> =>
  PROXY_PATTERN_HANDLERS[proxyPattern](proxy, getProvider(proxy.network.id));
