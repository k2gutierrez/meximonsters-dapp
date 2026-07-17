import { ConnectButton } from '@rainbow-me/rainbowkit';
import MintSection from '../components/MintSection';
import MyMonsters from '../components/MyMonsters';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center pb-24 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-red-600/20 to-amber-500/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-600/10 blur-[100px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <nav className="w-full border-b border-white/10 bg-zinc-950/60 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
              🐉
            </div>
            <div className="flex flex-col">
              <h1 className="font-black text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-white to-red-500">
                MEXI<span className="text-red-500">MONSTERS</span>
              </h1>
              <span className="text-[10px] tracking-widest text-zinc-400 font-mono -mt-1">ERC-721A // ON-CHAIN</span>
            </div>
          </div>
          <ConnectButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full px-6 pt-16 pb-8 flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-amber-400 font-mono mb-6 backdrop-blur-md animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          LIVE ON TESTNET // 100% DYNAMIC SVG
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
          Transform High Society Into <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 drop-shadow-[0_0_35px_rgba(239,68,68,0.3)]">
            Untamed Beasts
          </span>
        </h1>
        
        <p className="text-zinc-400 max-w-xl mb-12 text-lg font-light leading-relaxed">
          Mint your dynamic character. Toggle manually between day and night forms, and stamp your legendary 32-character lore directly into the smart contract storage.
        </p>
        
        <MintSection />
      </section>

      {/* User's NFT Gallery */}
      <section className="w-full px-6 flex justify-center max-w-7xl mx-auto">
        <MyMonsters />
      </section>
    </main>
  );
}