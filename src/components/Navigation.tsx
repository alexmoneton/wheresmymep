'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'MEPs', href: '/meps' },
    { name: 'Committees', href: '/committees' },
    { name: 'Topics', href: '/topics' },
    { name: 'Rankings', href: '/rankings' },
    { name: 'API Docs', href: '/api-docs' },
    { name: 'About', href: '/about' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">Where's My MEP?</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/pricing">
              <Button variant="outline" size="sm">
                Pricing
              </Button>
            </Link>
            <Link href="/api-keys">
              <Button variant="outline" size="sm">
                API Keys
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/alerts">
              <Button size="sm">
                Create Alert
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="pt-4 border-t">
                    <Link href="/pricing" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full mb-2">
                        Pricing
                      </Button>
                    </Link>
                    <Link href="/api-keys" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full mb-2">
                        API Keys
                      </Button>
                    </Link>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full mb-2">
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/alerts" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">
                        Create Alert
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
