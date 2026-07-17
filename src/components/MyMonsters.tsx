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

  // 1. Get Total Supply AND destructure its refetch function
  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: MEXIMONSTERS_ADDRESS,
    abi: MEXIMONSTERS_ABI,
    functionName: 'totalSupply',
    //query: {
      //refetchInterval: 5000, // Automatically check for new mints every 5 seconds
    //}
  });

  const total = totalSupply ? Number(totalSupply.toString()) : 0;

  // 2. Build multicall array to check `ownerOf` for every token ID up to `total`
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

  // 3. NEW: Force immediate refetch whenever the user completes a mint or updates an NFT!
  useEffect(() => {
    refetchTotalSupply();
    refetchOwners();
  }, [refreshTrigger, refetchTotalSupply, refetchOwners]);

  if (!isConnected) return null;
  if (isLoading && total === 0) return <p className="text-zinc-500 text-center py-8">Scanning blockchain for your monsters...</p>;

  // Filter out the token IDs that belong to the currently connected wallet
  const myTokenIds: number[] = [];
  owners?.forEach((res, index) => {
    if (res.status === 'success' && res.result?.toLowerCase() === address?.toLowerCase()) {
      myTokenIds.push(index + 1);
    }
  });

  return (
    <div className="mt-16 w-full max-w-6xl">
      <h2 className="text-3xl font-bold border-b border-zinc-800 pb-4 mb-8 text-white flex items-center gap-3">
        <span>🇲🇽</span> My Minted Monsters ({myTokenIds.length})
      </h2>

      {myTokenIds.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800/80">
          <p className="text-zinc-400 font-medium">You don't own any MexiMonsters yet.</p>
          <p className="text-zinc-600 text-sm mt-1">Use the panel above to mint your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTokenIds.map((id) => (
            <NFTCard key={`${id}-${refreshTrigger}`} tokenId={id} />
          ))}
        </div>
      )}
    </div>
  );
}