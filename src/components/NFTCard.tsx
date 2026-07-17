'use client';

import { useState } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { MEXIMONSTERS_ABI, MEXIMONSTERS_ADDRESS } from '@/contract';

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

      // 2. Decode the Base64 SVG so we can render it inline and bypass browser img blocking!
      if (metadata?.image?.startsWith('data:image/svg+xml;base64,')) {
        const base64Svg = metadata.image.replace('data:image/svg+xml;base64,', '');
        let rawSvg = atob(base64Svg);
        
        // Inject viewBox if missing so it scales responsively inside your Tailwind card
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
    writeContract({
      address: MEXIMONSTERS_ADDRESS,
      abi: MEXIMONSTERS_ABI,
      functionName: 'toggleDayNight',
      args: [BigInt(tokenId)],
    }, {
      onSuccess: () => setTimeout(() => refetch(), 4000)
    });
  };

  const handleUpdateLore = () => {
    if (!loreText || loreText.length > 32) return alert("Enter up to 32 characters.");
    writeContract({
      address: MEXIMONSTERS_ADDRESS,
      abi: MEXIMONSTERS_ABI,
      functionName: 'updateMonsterLore',
      args: [BigInt(tokenId), loreText],
      value: parseEther('0'),
    }, {
      onSuccess: () => {
        setLoreText('');
        setTimeout(() => refetch(), 4000);
      }
    });
  };

  if (!metadata) return <div className="animate-pulse bg-zinc-900 h-96 rounded-2xl border border-zinc-800"></div>;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
      <div>
        {/* 3. Render the Decoded Inline SVG directly into the DOM */}
        <div className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center">
          {decodedSvg ? (
            <div 
              className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-cover"
              dangerouslySetInnerHTML={{ __html: decodedSvg }}
            />
          ) : (
            <img src={metadata.image} alt={metadata.name} className="w-full h-full object-cover" />
          )}
        </div>

        <div className="p-5">
          <h3 className="font-bold text-xl mb-2 text-amber-400">{metadata.name}</h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {metadata.attributes.map((attr: any, idx: number) => (
              <span key={idx} className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-full border border-zinc-700">
                {attr.trait_type}: <strong className="text-white">{attr.value}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="p-5 pt-0 border-t border-zinc-800/50 space-y-3 mt-auto">
        <button
          onClick={handleToggleDayNight}
          disabled={isWriting}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold py-2 rounded-lg text-sm border border-zinc-700 transition-all"
        >
          🔄 Toggle Day/Night Mode
        </button>

        <div className="flex gap-2">
          <input
            type="text"
            maxLength={32}
            placeholder="New Lore (max 32 chars)"
            value={loreText}
            onChange={(e) => setLoreText(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white w-full focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleUpdateLore}
            disabled={isWriting || !loreText}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs whitespace-nowrap disabled:opacity-50"
          >
            Stamp (0)
          </button>
        </div>
      </div>
    </div>
  );
}