'use client';

import { useEffect } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { MEXIMONSTERS_ABI, MEXIMONSTERS_ADDRESS } from '@/contract';
import NFTCard from './NFTCard';
import { useAtomValue } from 'jotai';
import { refreshTriggerAtom } from '../store/atoms';

export default function MyMonsters() {
  const { address, isConnected } = useAccount();
  const refreshTrigger = useAtomValue(refreshTriggerAtom);

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: MEXIMONSTERS_ADDRESS,
    abi: MEXIMONSTERS_ABI,
    functionName: 'totalSupply',
  });

  const total = totalSupply ? Number(totalSupply.toString()) : 0;

  const contracts = Array.from({ length: total }, (_, i) => ({
    address: MEXIMONSTERS_ADDRESS,
    abi: MEXIMONSTERS_ABI,
    functionName: 'ownerOf' as const,
    args: [BigInt(i + 1)],
  }));

  const { data: owners, isLoading, refetch: refetchOwners } = useReadContracts({
    contracts,
    query: {
      enabled: isConnected && total > 0,
      refetchInterval: 5000, 
    }
  });

  useEffect(() => {
    refetchTotalSupply();
    refetchOwners();
  }, [refreshTrigger, refetchTotalSupply, refetchOwners]);

  if (!isConnected) return null;

  if (isLoading && total === 0) {
    return (
      <div className="w-full py-16 text-center border border-white/5 rounded-3xl bg-zinc-900/30 backdrop-blur-md">
        <div className="inline-block animate-spin text-2xl mb-3">⟳</div>
        <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">Scanning Blockchain State...</p>
      </div>
    );
  }

  const myTokenIds: number[] = [];
  owners?.forEach((res, index) => {
    if (res.status === 'success' && res.result?.toLowerCase() === address?.toLowerCase()) {
      myTokenIds.push(index + 1);
    }
  });

  return (
    <div className="mt-16 w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-8">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase">
            My Minted Monsters
          </h2>
        </div>
        
        <div className="bg-zinc-900 border border-white/10 px-3.5 py-1 rounded-full font-mono text-xs text-zinc-300 flex items-center gap-2">
          <span>COLLECTION:</span>
          <strong className="text-amber-400 font-bold">{myTokenIds.length}</strong>
        </div>
      </div>

      {/* Empty State */}
      {myTokenIds.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-b from-zinc-900/40 to-zinc-950/40 rounded-3xl border border-white/5 backdrop-blur-md max-w-xl mx-auto">
          <div className="text-4xl mb-4">🌵</div>
          <p className="text-white font-bold text-lg mb-1">No Monsters In Your Wallet</p>
          <p className="text-zinc-400 text-sm max-w-xs mx-auto">
            Use the minting terminal above to generate your first on-chain character.
          </p>
        </div>
      ) : (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTokenIds.map((id) => (
            <NFTCard key={`${id}-${refreshTrigger}`} tokenId={id} />
          ))}
        </div>
      )}
    </div>
  );
}