'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wallet,
  Target,
  Calendar,
  Activity,
  Settings,
  Zap,
  BarChart3,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Portfolio', href: '/portfolio', icon: Wallet },
  { name: 'Triggers', href: '/triggers', icon: Target },
  { name: 'Scheduler', href: '/scheduler', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Spaces', href: '/spaces', icon: Zap },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <h1 className="text-xl font-bold text-primary">Recurring Executor</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
          <div className="h-8 w-8 rounded-full bg-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Agent Status</p>
            <p className="text-xs text-muted-foreground">Running</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
