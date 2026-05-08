import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useBlockListener(queryKeys: string[][]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const RPC_URLS = [
      'https://eth-rpc-api.thetatoken.org/rpc',
      'https://theta-bridge-rpc.thetatoken.org/rpc'
    ];

    const fetchBlock = async () => {
      try {
        const { ethers } = await import('ethers');
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
      } catch (err) {
        console.error('Error loading ethers in block listener:', err);
      }
    };

    fetchBlock();
    interval = setInterval(fetchBlock, 15000);

    return () => clearInterval(interval);
  }, [queryClient, queryKeys]);
}
