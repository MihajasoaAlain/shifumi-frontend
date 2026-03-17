import React from 'react'
import Button from '../../components/Button'

const Home = () => {
  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <div className="container mx-auto py-12">
        <h1 className="text-4xl font-bold mb-4 text-center">Welcome to Shifumi Game!</h1>
        <p className="text-lg mb-8 text-center">Test your skills against the computer in this classic game of Rock, Paper, Scissors.</p>
      </div>
      <div className="  border border-gray-700 rounded-lg mb-8 flex items-center justify-center">
      ici logo

      </div>
     <Button/>
    </main>
  )
}

export default Home