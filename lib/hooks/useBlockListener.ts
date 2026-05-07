import { ethers } from 'ethers';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const RPC_URL = 'https://eth-rpc-api.thetatoken.org/rpc';

export function useBlockListener(queryKeys: string[][]) {
  const queryClient = useQueryClient();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);

  useEffect(() => {
    let provider: ethers.providers.JsonRpcProvider | null = null;

    const setupListener = async () => {
      try {
        provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        
        // Test connection
        await provider.getNetwork();
        
        retryCountRef.current = 0; // Reset on success

        provider.on('block', (blockNumber) => {
          queryKeys.forEach(key => {
            queryClient.invalidateQueries({ queryKey: key });
          });
        });

        // Error handling for provider
        provider.on('error', (error) => {
          console.error('Provider error, attempting reconnect:', error);
          reconnect();
        });

      } catch (error) {
        console.error('Failed to connect to Theta RPC:', error);
        reconnect();
      }
    };

    const reconnect = () => {
      if (provider) {
        provider.removeAllListeners();
      }
      
      const delay = Math.min(Math.pow(2, retryCountRef.current) * 5000, 30000);
      retryCountRef.current++;
      
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = setTimeout(setupListener, delay);
    };

    setupListener();

    return () => {
      if (provider) {
        provider.removeAllListeners();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [queryClient, queryKeys]);
}
