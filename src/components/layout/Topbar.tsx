'use client';

import { Search, User, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';

interface TopbarProps {
  userEmail: string | null;
  onMenuToggle?: () => void;
}

export function Topbar({ userEmail, onMenuToggle }: TopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 md:px-8 dark:bg-slate-900 z-30">
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="w-full max-w-sm hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-10 bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-1"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <ThemeToggle />
        <div className="flex items-center space-x-2 text-sm ml-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
            {userEmail?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="font-medium text-muted-foreground hidden sm:inline-block max-w-[150px] truncate">
            {userEmail}
          </span>
        </div>
      </div>
    </header>
  );
}
