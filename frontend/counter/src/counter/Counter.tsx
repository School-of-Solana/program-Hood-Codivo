import type { FC } from "react";
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
// @ts-ignore: Allow importing JSON idl without explicit type declarations
import idlJson from "../idl.json";

const PROGRAM_ID = new PublicKey(
  "HNVpWAQDDdAGq36gpHysc674pWhSv55nng9k9s55Pdqw"
);

// Create proper IDL object with programId
const idl = {
  ...idlJson,
  programId: PROGRAM_ID.toString(),
} as Idl;

// this is where you define the structure of your counter account (data stored on-chain dabase)
interface CounterAccount {
  owner: PublicKey;
  count: BN;
  totalIncrements: BN;
  createdAt: BN;
}

export const CounterApp: FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [counter, setCounter] = useState<CounterAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [counterPDA, setCounterPDA] = useState<PublicKey | null>(null);

  const getProvider = () => {
    if (
      !wallet.publicKey ||
      !wallet.signTransaction ||
      !wallet.signAllTransactions
    ) {
      return null;
    }
    return new AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    });
  };

  const getProgram = () => {
    const provider = getProvider();
    if (!provider) return null;
    return new Program(idl, provider, PROGRAM_ID) as Program<Idl>;
  };

  useEffect(() => {
    if (wallet.publicKey) {
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("counter"), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      );
      setCounterPDA(pda);
      fetchCounter(pda);
    } else {
      setCounter(null);
      setCounterPDA(null);
    }
  }, [wallet.publicKey, connection]);

  const fetchCounter = async (pda: PublicKey) => {
    try {
      const program = getProgram();
      if (!program) return;

      const account = await (program.account as any).counter.fetch(pda);
      setCounter(account as CounterAccount);
    } catch (error) {
      console.log("Counter not initialized yet");
      setCounter(null);
    }
  };

  const initialize = async () => {
    if (!wallet.publicKey || !counterPDA) return;

    setLoading(true);
    try {
      const program = getProgram();
      if (!program) {
        alert("Please connect your wallet first!");
        return;
      }

      const tx = await program.methods
        .initialize()
        .accounts({
          counter: counterPDA,
          user: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Initialize tx:", tx);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for confirmation
      await fetchCounter(counterPDA);
      alert("Counter initialized successfully!");
    } catch (error: any) {
      console.error("Error initializing counter:", error);
      alert(`Failed to initialize counter: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const increment = async () => {
    if (!wallet.publicKey || !counterPDA) return;

    setLoading(true);
    try {
      const program = getProgram();
      if (!program) {
        alert("Please connect your wallet first!");
        return;
      }

      const tx = await program.methods
        .increment()
        .accounts({
          counter: counterPDA,
          user: wallet.publicKey,
          owner: wallet.publicKey,
        })
        .rpc();

      console.log("Increment tx:", tx);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for confirmation
      await fetchCounter(counterPDA);
    } catch (error: any) {
      console.error("Error incrementing counter:", error);
      alert(`Failed to increment counter: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    if (!wallet.publicKey || !counterPDA) return;

    setLoading(true);
    try {
      const program = getProgram();
      if (!program) {
        alert("Please connect your wallet first!");
        return;
      }

      const tx = await program.methods
        .reset()
        .accounts({
          counter: counterPDA,
          user: wallet.publicKey,
          owner: wallet.publicKey,
        })
        .rpc();

      console.log("Reset tx:", tx);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for confirmation
      await fetchCounter(counterPDA);
    } catch (error: any) {
      console.error("Error resetting counter:", error);
      alert(`Failed to reset counter: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          ⚡ Counter dApp
        </h1>

        <div className="mb-6">
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg w-full" />
        </div>

        {wallet.connected && (
          <div className="space-y-6">
            {counter ? (
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="text-center">
                  <div className="text-6xl font-bold text-purple-600 mb-2">
                    {counter.count.toString()}
                  </div>
                  <p className="text-gray-600 text-sm">Current Count</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <div className="font-bold text-gray-800">
                      {counter.totalIncrements.toString()}
                    </div>
                    <div className="text-gray-600">Total Increments</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="font-bold text-gray-800">
                      {new Date(
                        counter.createdAt.toNumber() * 1000
                      ).toLocaleDateString()}
                    </div>
                    <div className="text-gray-600">Created</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={increment}
                    disabled={loading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "..." : "+ Increment"}
                  </button>
                  <button
                    onClick={reset}
                    disabled={loading}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "..." : "↺ Reset"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  You haven't created a counter yet!
                </p>
                <button
                  onClick={initialize}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "🚀 Create Counter"}
                </button>
              </div>
            )}
          </div>
        )}

        {!wallet.connected && (
          <p className="text-center text-gray-600 mt-4">
            Connect your wallet to get started!
          </p>
        )}
      </div>
    </div>
  );
};
