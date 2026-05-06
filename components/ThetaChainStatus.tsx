import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const RPC_URL = 'https://eth-rpc-api.thetatoken.org/rpc';
const DEX_CONTRACT = '0x2D65cf52EC55702eAee7ABF38e789e8E0048D7dD';
const TOKEN_ADDRESS = '0x4Dc08B15Ea0E10B96c41Aec22Fab934Ba15c983e';

export const ThetaChainStatus: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading');
  const [blockHeight, setBlockHeight] = useState<number>(0);
  const [gasPrice, setGasPrice] = useState<string>('0');

  useEffect(() => {
    const checkConnection = async () => {
      setStatus('loading');
      try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const block = await provider.getBlockNumber();
        const gas = await provider.getGasPrice();
        setBlockHeight(block);
        setGasPrice(ethers.utils.formatUnits(gas, 'gwei'));
        setStatus('connected');

        // Update block height in real-time
        provider.on('block', (newBlock: number) => {
          setBlockHeight(newBlock);
        });

        return () => {
          provider.removeAllListeners('block');
        };
      } catch (err) {
        setStatus('disconnected');
      }
    };
    checkConnection();
  }, []);

  return (
    <div className="flex items-center gap-3 p-4 bg-black/60 backdrop-blur-md rounded-lg border border-blue-900/50 flex-wrap shadow-xl">
      <div className="flex items-center gap-2 mr-4">
        {status === 'loading' ? (
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></span>
        ) : status === 'connected' ? (
          <span className="inline-block w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
        ) : (
          <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
        )}
        <span className={`font-semibold ${status === 'connected' ? 'text-green-400' : status === 'loading' ? 'text-yellow-200' : 'text-red-400'}`}>
          {status === 'loading' ? 'Syncing...' : status === 'connected' ? 'ThetaChain Live' : 'Offline'}
        </span>
      </div>
      
      <div className="flex items-center gap-6 text-xs text-blue-200/80">
        <div className="flex flex-col">
          <span className="text-blue-400/60 uppercase tracking-wider font-bold text-[10px]">Network</span>
          <span className="font-mono">Mainnet</span>
        </div>
        <div className="flex flex-col">
          <span className="text-blue-400/60 uppercase tracking-wider font-bold text-[10px]">Block Height</span>
          <span className="font-mono">{blockHeight || '---'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-blue-400/60 uppercase tracking-wider font-bold text-[10px]">Gas Price</span>
          <span className="font-mono">{parseFloat(gasPrice).toFixed(2)} Gwei</span>
        </div>
        <div className="hidden md:flex flex-col">
          <span className="text-blue-400/60 uppercase tracking-wider font-bold text-[10px]">DEX Active</span>
          <span className="font-mono text-green-400">0x2D65...D7dD</span>
        </div>
      </div>
    </div>
  );
}; 