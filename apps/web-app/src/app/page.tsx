import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6 text-primary">Welcome to 2Dots1Line V4</h1>
      <p className="mb-4 text-lg">
        Connect your thoughts, illuminate your life. This is the starting point of your journey.
      </p>
      <nav className="space-x-4">
        <Link href="/chat" className="text-secondary hover:underline">Go to Chat</Link>
        <Link href="/login" className="text-secondary hover:underline">Login</Link>
        <Link href="/signup" className="text-secondary hover:underline">Sign Up</Link>
      </nav>
    </div>
  );
} 