import { ethers } from 'ethers';
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const RPC_URL = 'https://eth-rpc-api.thetatoken.org/rpc';

export function useBlockListener(queryKeys: string[][]) {
  const queryClient = useQueryClient();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const RPC_URLS = [
      'https://eth-rpc-api.thetatoken.org/rpc',
      'https://theta-bridge-rpc.thetatoken.org/rpc'
    ];

    const fetchBlock = async () => {
      for (const url of RPC_URLS) {
        try {
          const provider = new ethers.providers.JsonRpcProvider(url);
          await provider.getBlockNumber();
          
          queryKeys.forEach(key => {
            queryClient.invalidateQueries({ queryKey: key });
          });
          return;
        } catch (err) {
          // Try next RPC
        }
      }
    };

    fetchBlock();
    interval = setInterval(fetchBlock, 15000);

    return () => clearInterval(interval);
  }, [queryClient, queryKeys]);
}
