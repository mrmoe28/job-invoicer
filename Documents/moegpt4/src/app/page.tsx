'use client';

import { Button } from '@/components/shared/Button';
import { Logo } from '@/components/shared/Logo';

export default function HomePage() {
  return (
    <div className="bg-gray-900 text-white flex flex-col items-center justify-center min-h-screen p-6">
      <header className="w-full flex justify-between items-center px-6 py-4">
        <Logo />
        <Button text="Sign up" className="bg-white text-black rounded-full px-4 py-2" />
      </header>

      <main className="flex flex-col items-center justify-center flex-grow text-center">
        <Logo className="w-16 h-16 mb-4" />
        <h1 className="text-4xl font-bold">Welcome to GPT Part Searcher</h1>
        <p className="text-sm text-gray-400 mt-2">By ai-gen.co</p>
        <p className="text-base mt-4 text-gray-400">
          Discover the amazing features of GPT Part Searcher.
        </p>
        <Button text="Get Started" className="mt-6 bg-white text-black rounded-full px-6 py-3" />
        <p className="mt-4 text-sm text-gray-400">
          Sign up or Log in to chat
        </p>
      </main>

      <footer className="w-full bg-gray-800 text-white py-4 text-center">
        <p>© 2023 GPT Part Searcher. All rights reserved.</p>
      </footer>
    </div>
  );
} 