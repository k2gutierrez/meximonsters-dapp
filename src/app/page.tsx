import { ConnectButton } from '@rainbow-me/rainbowkit';
import MintSection from '../components/MintSection';
import MyMonsters from '../components/MyMonsters';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center pb-20">
      {/* Top Navbar */}
      <nav className="w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center max-w-7xl">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐉</span>
          <h1 className="font-black text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-white to-red-500">
            MEXI<span className="text-red-600">MONSTERS</span>
          </h1>
        </div>
        <ConnectButton />
      </nav>

      {/* Hero / Minting Area */}
      <section className="w-full px-6 pt-12 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 max-w-3xl">
          Transform High Society Into <span className="text-red-600 underline decoration-amber-500">Untamed Beasts</span>
        </h1>
        <p className="text-zinc-400 max-w-xl mb-10 text-lg">
          Mint your dynamic 100% on-chain SVG NFT. Toggle manually between Day and Night forms, and stamp your legendary lore directly onto the blockchain!
        </p>
        
        <MintSection />
      </section>

      {/* User's NFT Gallery */}
      <section className="w-full px-6 flex justify-center">
        <MyMonsters />
      </section>
    </main>
  );
}