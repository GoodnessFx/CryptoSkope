import { useWalletContext } from "@/lib/context/WalletContext";

/**
 * Custom hook to interact with the WalletContext.
 * Provides access to wallet state and connection methods.
 */
export const useWallet = () => {
  return useWalletContext();
};
