'use client';

import { useState } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { MEXIMONSTERS_ABI, MEXIMONSTERS_ADDRESS } from '@/contract';
import { toast } from 'sonner';

export default function NFTCard({ tokenId }: { tokenId: number }) {
  const [loreText, setLoreText] = useState('');
  
  const { data: tokenURI, refetch } = useReadContract({
    address: MEXIMONSTERS_ADDRESS,
    abi: MEXIMONSTERS_ABI,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
  });

  const { writeContract, isPending: isWriting } = useWriteContract();

  // 1. Decode the JSON Metadata
  let metadata = null;
  let decodedSvg = null;

  if (tokenURI) {
    try {
      const base64Json = tokenURI.replace('data:application/json;base64,', '');
      metadata = JSON.parse(atob(base64Json));

      // 2. Decode the Base64 SVG so we can render it inline
      if (metadata?.image?.startsWith('data:image/svg+xml;base64,')) {
        const base64Svg = metadata.image.replace('data:image/svg+xml;base64,', '');
        let rawSvg = atob(base64Svg);
        
        if (!rawSvg.includes('viewBox')) {
          rawSvg = rawSvg.replace('<svg ', '<svg viewBox="0 0 1000 1000" ');
        }
        decodedSvg = rawSvg;
      }
    } catch (e) {
      console.error("Failed to parse on-chain metadata", e);
    }
  }

  const handleToggleDayNight = () => {
    const toastId = toast.loading("Initiating Form Shift...", {
      description: "Please confirm the transaction in your connected wallet."
    });

    writeContract({
      address: MEXIMONSTERS_ADDRESS,
      abi: MEXIMONSTERS_ABI,
      functionName: 'toggleDayNight',
      args: [BigInt(tokenId)],
    }, {
      onSuccess: () => {
        toast.loading("Shifting Form...", {
          id: toastId,
          description: "Waiting for the block confirmation...",
        });

        setTimeout(() => {
          refetch();
          toast.success("Form Mutated Successfully!", {
            id: toastId,
            description: `Monster #${tokenId} has shifted realities.`,
            duration: 5000
          });
        }, 4000);
      },
      onError: (err) => {
        toast.error("Transformation Failed", {
          id: toastId,
          description: err.message.includes("User rejected") ? "Transaction canceled by user." : "Execution reverted.",
        });
      }
    });
  };

  const handleUpdateLore = () => {
    if (!loreText || loreText.length > 32) return alert("Enter up to 32 characters.");

    const toastId = toast.loading("Preparing Lore Stamp...", {
      description: "Sign the transaction to write this legend into contract storage."
    });

    writeContract({
      address: MEXIMONSTERS_ADDRESS,
      abi: MEXIMONSTERS_ABI,
      functionName: 'updateMonsterLore',
      args: [BigInt(tokenId), loreText],
      value: parseEther('0'),
    }, {
      onSuccess: () => {
        toast.loading("Stamping Blockchain Storage...", {
          id: toastId,
          description: "Awaiting blocks to settle data slots...",
        });

        setTimeout(() => {
          setLoreText('');
          refetch();
          toast.success("Lore Permanently Stamped!", {
            id: toastId,
            description: `"${loreText}" is now part of Monster #${tokenId}'s history.`,
            duration: 6000
          });
        }, 4000);
      },
      onError: (err) => {
        toast.error("Data Write Failed", {
          id: toastId,
          description: err.message.includes("User rejected") ? "Signature request denied." : "Insufficient funds or gas error.",
        });
      }
    });
  };

  if (!metadata) {
    return (
      <div className="animate-pulse bg-zinc-900/60 border border-white/5 h-[480px] rounded-3xl p-4 flex flex-col justify-between">
        <div className="w-full aspect-square bg-zinc-800/50 rounded-2xl"></div>
        <div className="h-6 bg-zinc-800/50 rounded-md w-1/2 my-4"></div>
        <div className="h-10 bg-zinc-800/50 rounded-xl w-full"></div>
      </div>
    );
  }

  return (
    <div className="group bg-zinc-900/60 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-red-950/20 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        {/* NFT Image Container */}
        <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden border-b border-white/5 flex items-center justify-center">
          {decodedSvg ? (
            <div 
              className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover group-hover:scale-105 transition-transform duration-500"
              dangerouslySetInnerHTML={{ __html: decodedSvg }}
            />
          ) : (
            <img src={metadata.image} alt={metadata.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )}
          <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full font-mono text-[10px] tracking-widest text-zinc-300">
            #{tokenId}
          </span>
        </div>

        {/* Card Details & Attributes */}
        <div className="p-5">
          <h3 className="font-extrabold text-xl mb-3 text-white tracking-wide">{metadata.name}</h3>
          
          <div className="flex flex-wrap gap-1.5 mb-2">
            {metadata.attributes.map((attr: any, idx: number) => (
              <div key={idx} className="bg-zinc-950/80 border border-white/5 px-2.5 py-1 rounded-lg flex flex-col">
                <span className="text-[9px] font-mono uppercase text-zinc-500 tracking-wider">{attr.trait_type}</span>
                <span className="text-xs font-semibold text-zinc-200">{attr.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive On-Chain Controls */}
      <div className="p-5 pt-3 border-t border-white/5 bg-zinc-950/30 space-y-2.5 mt-auto">
        <button
          onClick={handleToggleDayNight}
          disabled={isWriting}
          className="w-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 font-mono font-medium py-2.5 rounded-xl text-xs border border-white/5 hover:border-white/15 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
        >
          <span>🔄</span> TOGGLE FORM (DAY / NIGHT)
        </button>

        <div className="flex gap-1.5">
          <input
            type="text"
            maxLength={32}
            placeholder="Stamp Lore (max 32 chars)"
            value={loreText}
            onChange={(e) => setLoreText(e.target.value)}
            className="bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white w-full focus:outline-none focus:border-amber-500 font-mono transition-colors placeholder:text-zinc-600"
          />
          <button
            onClick={handleUpdateLore}
            disabled={isWriting || !loreText}
            className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-zinc-950 font-black font-mono px-3 py-2 rounded-xl text-xs whitespace-nowrap disabled:opacity-40 transition-all active:scale-95 shadow-md shadow-amber-950/20"
          >
            STAMP
          </button>
        </div>
      </div>
    </div>
  );
}