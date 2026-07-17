'use client';

// 1. Added useEffect to the React imports
import { useState, useEffect } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { MEXIMONSTERS_ABI, MEXIMONSTERS_ADDRESS } from '@/contract';
import { useSetAtom } from 'jotai';
import { refreshTriggerAtom } from '../store/atoms';

export default function MintSection() {
  const [archetype, setArchetype] = useState<number>(0); // 0: Godinez, 1: Mirrey, 2: Buchon
  const [gender, setGender] = useState<number>(0);       // 0: Male, 1: Female
  const [quantity, setQuantity] = useState<number>(1);
  
  const setRefresh = useSetAtom(refreshTriggerAtom);

  const { data: mintPriceWei } = useReadContract({
    address: MEXIMONSTERS_ADDRESS,
    abi: MEXIMONSTERS_ABI,
    functionName: 'getMintPrice',
  });

  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // 2. Wrapped the state update safely inside a useEffect hook!
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

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-lg w-full shadow-xl">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-600 mb-6">
        Mint Your MexiMonster
      </h2>

      {/* Archetype Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-400 mb-2">Select Archetype</label>
        <div className="grid grid-cols-3 gap-3">
          {['Godínez', 'Mirrey', 'Buchón'].map((label, idx) => (
            <button
              key={label}
              onClick={() => setArchetype(idx)}
              className={`py-2 rounded-lg font-medium border ${
                archetype === idx
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Gender Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-400 mb-2">Select Gender</label>
        <div className="grid grid-cols-2 gap-3">
          {['Male', 'Female'].map((label, idx) => (
            <button
              key={label}
              onClick={() => setGender(idx)}
              className={`py-2 rounded-lg font-medium border ${
                gender === idx
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-400 mb-2">Quantity ({quantity})</label>
        <input
          type="range"
          min="1"
          max="5"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full accent-red-600 cursor-pointer"
        />
      </div>

      {/* Mint Button */}
      <button
        onClick={handleMint}
        disabled={isPending || isConfirming}
        className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 py-3 rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
      >
        {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Minting On-Chain...' : `Mint (${quantity * (Number(mintPriceWei) / 18)} ETH)`}
      </button>

      {error && <p className="text-red-400 text-xs mt-3 truncate">{error.message}</p>}
      {isSuccess && <p className="text-emerald-400 text-sm mt-3 text-center font-medium">🎉 Successfully Minted!</p>}
    </div>
  );
}