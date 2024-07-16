'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

export default function SolanaPage() {
  const { publicKey, signTransaction } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  const checkBalance = async () => {
    if (!publicKey) return;

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const balance = await connection.getBalance(publicKey);
    setBalance(balance / 1000000000); // Convert lamports to SOL
  };

  const sendTransaction = async () => {
    if (!publicKey || !signTransaction) return;

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Example: Send 0.1 SOL to a random address
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey('INSERT_RECIPIENT_PUBLIC_KEY_HERE'),
        lamports: 100000000, // 0.1 SOL
      })
    );

    transaction.feePayer = publicKey;
    const blockhash = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash.blockhash;

    const signed = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);
  };

  return (
    <main>
      <h1>Solana Interaction</h1>
      <WalletMultiButton />
      {publicKey && (
        <>
          <button onClick={checkBalance}>Check Balance</button>
          {balance !== null && <p>Balance: {balance} SOL</p>}
          <button onClick={sendTransaction}>Send Transaction</button>
        </>
      )}
    </main>
  );
}