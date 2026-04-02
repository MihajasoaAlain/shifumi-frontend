'use client'
import React from 'react'
import Button from '../../components/Button'
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Home = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/game");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-b from-white to-slate-50">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-16">
          <div className="order-2 md:order-1 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900">
              Welcome to Shifumi Game!
            </h1>
            <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-600 max-w-xl mx-auto md:mx-0">
              Test your skills against the computer in this classic game of Rock, Paper, Scissors.
            </p>

            <div className="mt-8 flex justify-center md:justify-start">
              <div className="w-full sm:w-auto">
                <Button buttomProps={{ text: "Play Game", action: handleClick, className: "text-lg w-full sm:w-auto px-6 py-3" }} />
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 flex items-center justify-center md:justify-end">
            <div className="w-40 sm:w-56 md:w-72 lg:w-80">
              <Image
                src="/assets/logo.png"
                alt="Shifumi logo - rock paper scissors"
                width={512}
                height={512}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 40vw, 30vw"
                className="w-full h-auto object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home