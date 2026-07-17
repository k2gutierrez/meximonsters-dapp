'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { MEXIMONSTERS_ABI, MEXIMONSTERS_ADDRESS } from '@/contract';
import { useSetAtom } from 'jotai';
import { refreshTriggerAtom } from '../store/atoms';

export default function MintSection() {
  const [archetype, setArchetype] = useState<number>(0); 
  const [gender, setGender] = useState<number>(0);       
  const [quantity, setQuantity] = useState<number>(1);
  
  const setRefresh = useSetAtom(refreshTriggerAtom);

  const { data: mintPriceWei } = useReadContract({
    address: MEXIMONSTERS_ADDRESS,
    abi: MEXIMONSTERS_ABI,
    functionName: 'getMintPrice',
  });

  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      setRefresh((prev) => prev + 1);
    }
  }, [isSuccess, setRefresh]);

  const handleMint = () => {
    const pricePerToken = mintPriceWei ? BigInt(mintPriceWei.toString()) : parseEther('0');
    const totalCost = pricePerToken * BigInt(quantity);

    writeContract({
      address: MEXIMONSTERS_ADDRESS,
      abi: MEXIMONSTERS_ABI,
      functionName: 'mint',
      args: [BigInt(quantity), archetype, gender],
      value: totalCost,
    });
  };

  const calculatedEth = mintPriceWei ? (Number(mintPriceWei) / 1e18) * quantity : 0;

  return (
    <div className="relative group max-w-lg w-full">
      {/* Outer Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>

      <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col text-left">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <h2 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            MINT TERMINAL
          </h2>
          <span className="font-mono text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
            ERC-721A
          </span>
        </div>

        {/* Archetype Selector */}
        <div className="mb-5">
          <label className="block text-xs font-mono tracking-wider text-zinc-400 uppercase mb-2">
            1. Select Archetype
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {['Godínez', 'Mirrey', 'Buchón'].map((label, idx) => (
              <button
                key={label}
                onClick={() => setArchetype(idx)}
                className={`py-2.5 px-3 rounded-xl font-medium text-sm transition-all duration-200 border ${
                  archetype === idx
                    ? 'bg-gradient-to-b from-red-500/20 to-red-600/30 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)] scale-[1.02]'
                    : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Gender Selector */}
        <div className="mb-5">
          <label className="block text-xs font-mono tracking-wider text-zinc-400 uppercase mb-2">
            2. Select Form
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {['Male', 'Female'].map((label, idx) => (
              <button
                key={label}
                onClick={() => setGender(idx)}
                className={`py-2.5 px-3 rounded-xl font-medium text-sm transition-all duration-200 border ${
                  gender === idx
                    ? 'bg-gradient-to-b from-amber-500/20 to-amber-600/30 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-[1.02]'
                    : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-mono tracking-wider text-zinc-400 uppercase mb-2">
            <span>3. Quantity</span>
            <span className="text-amber-400 font-bold">{quantity} MAX 5</span>
          </div>
          <div className="bg-zinc-950/50 p-3 rounded-xl border border-white/5">
            <input
              type="range"
              min="1"
              max="5"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* Mint Button */}
        <button
          onClick={handleMint}
          disabled={isPending || isConfirming}
          className="w-full relative group/btn overflow-hidden rounded-xl font-bold text-base py-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-red-600 via-amber-600 to-emerald-600 text-white shadow-lg shadow-red-900/30 hover:shadow-red-600/50 active:scale-[0.98]"
        >
          <span className="relative z-10 flex items-center justify-center gap-2 font-mono uppercase tracking-wider">
            {isPending && <span className="animate-spin">⚙️</span>}
            {isConfirming && <span className="animate-spin">⛓️</span>}
            {isPending ? 'Confirming in Wallet...' : isConfirming ? 'Minting On-Chain...' : `MINT TOKEN (${calculatedEth} ETH)`}
          </span>
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-950/50 border border-red-500/30 rounded-xl text-red-300 text-xs font-mono break-all">
            ⚠ {error.message.slice(0, 100)}...
          </div>
        )}
        
        {isSuccess && (
          <div className="mt-4 p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-mono text-center flex items-center justify-center gap-2">
            <span>⚡</span> Transaction confirmed! Welcome to the pack.
          </div>
        )}
      </div>
    </div>
  );
}