import React from 'react'

const Game = () => {
    
    
  return (
    <div className='p-4 h-full border'>
        
        <h1 className='text-2xl font-bold mb-4 text-center'>Game Page</h1>
        <div className='flex flex-col items-center justify-between border '>
          <button className='button'>
            Create Game
          </button>
          <button className='button'>
            Join Game
          </button>
        </div>
    </div>
  )
}

export default Game