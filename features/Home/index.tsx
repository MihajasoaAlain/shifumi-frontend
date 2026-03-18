'use client'
import React from 'react'
import Button from '../../components/Button'
import { useRouter } from 'next/navigation';

const Home = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/game");
  };
  return (
    <main className=" h-screen bg-gray-900 text-white border flex flex-col items-center justify-around gap-2 py-12">
      <div className=" mx-auto border">
        <h1 className="text-4xl font-bold mb-4 text-center">Welcome to Shifumi Game!</h1>
        <p className="text-lg mb-8 text-center">Test your skills against the computer in this classic game of Rock, Paper, Scissors.</p>
      </div>
      <div className="  border border-gray-700 rounded-lg mb-8 flex items-center justify-center">
      ici logo
      </div>
     <Button buttomProps={{ text: "Play Game", action: handleClick }} />
    </main>
  )
}

export default Home