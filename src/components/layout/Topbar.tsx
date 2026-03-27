'use client';

import { Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TopbarProps {
  userEmail: string | null;
}

export function Topbar({ userEmail }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8 dark:bg-slate-900">
      <div className="w-96">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-10 bg-slate-50 dark:bg-slate-800"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
            {userEmail?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="font-medium text-muted-foreground">{userEmail}</span>
        </div>
      </div>
    </header>
  );
}
