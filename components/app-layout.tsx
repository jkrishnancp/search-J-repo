'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Admin', href: '/admin', icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <Briefcase className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white">JobTracker</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            isActive
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors'
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-700 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Briefcase className="h-6 w-6 text-slate-900" />
              <span className="text-lg font-bold text-slate-900">JobTracker</span>
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/80" onClick={() => setSidebarOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-slate-900" onClick={(e) => e.stopPropagation()}>
              <div className="flex h-16 shrink-0 items-center justify-between px-6">
                <div className="flex items-center">
                  <Briefcase className="h-8 w-8 text-white" />
                  <span className="ml-2 text-xl font-bold text-white">JobTracker</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-300 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col px-6">
                <ul role="list" className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            isActive
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors'
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>
        )}

        <main className="py-10 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
