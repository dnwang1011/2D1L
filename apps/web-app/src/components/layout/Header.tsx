import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-primary text-textLight shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-accent">
          2Dots1Line V4
        </Link>
        <div className="space-x-4">
          <Link href="/today" className="hover:text-accent">Today</Link>
          <Link href="/chat" className="hover:text-accent">Chat</Link>
          <Link href="/lifeweb" className="hover:text-accent">Lifeweb</Link>
          <Link href="/settings" className="hover:text-accent">Settings</Link>
          <Link href="/login" className="bg-accent px-3 py-1 rounded hover:bg-opacity-80 text-sm">Login</Link>
        </div>
      </nav>
    </header>
  );
} 