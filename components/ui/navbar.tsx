import React from 'react';
import Link from 'next/link';
import { Github } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../LanguageSwitcher';

export function Navbar() {
  const t = useTranslations();

  return (
    <nav className="flex items-center justify-between px-6 h-14 border-b bg-background">
      <div className="flex items-center">
        <Link href="/" className="text-xl font-bold">
          Portfolio Balancer
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <LanguageSwitcher />
        <Link 
          href="https://github.com/suenot/portfolio-balancer" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center space-x-1 hover:text-primary"
        >
          <Github className="h-5 w-5" />
          <span className="hidden sm:inline">GitHub</span>
        </Link>
      </div>
    </nav>
  );
} 