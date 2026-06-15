'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ShoppingCart, MapPin, Menu, ChevronDown } from 'lucide-react';

export default function AmazonHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('John Doe');
  const [trustScore, setTrustScore] = useState<number | null>(null);

  useEffect(() => {
    // Sync search input with URL search param
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);

    // Fetch user info from backend
    fetch('http://localhost:5000/api/user')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserName(data.user.name);
          setTrustScore(data.user.trustScore);
        }
      })
      .catch(err => console.log('Error fetching user info:', err));
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="w-full text-white font-sans text-sm select-none">
      {/* Top Main Nav */}
      <div className="bg-[#131921] px-4 py-2 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-1 border border-transparent hover:border-white p-1 rounded-sm cursor-pointer">
          <Link href="/" className="flex flex-col items-start leading-none pt-1">
            <span className="text-xl font-black tracking-tight text-white flex items-center">
              amazon<span className="text-[#febd69] font-medium text-xs pt-1">.in</span>
            </span>
            <span className="text-[10px] text-[#febd69] font-semibold -mt-1 ml-5">resell</span>
          </Link>
        </div>

        {/* Deliver To */}
        <div className="hidden md:flex flex-col justify-center border border-transparent hover:border-white p-1 rounded-sm cursor-pointer leading-none">
          <span className="text-xs text-gray-300 ml-5">Deliver to John</span>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-white -mt-1" />
            <span className="font-bold text-sm">New Delhi 110001</span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-grow flex items-center h-10 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#f3a847]">
          <div className="bg-gray-100 text-gray-700 px-3 h-full flex items-center text-xs border-r border-gray-300 hover:bg-gray-200 cursor-pointer gap-1">
            All <ChevronDown className="h-3 w-3" />
          </div>
          <input
            type="text"
            placeholder="Search Amazon.in"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow px-3 h-full text-black placeholder-gray-500 focus:outline-none text-base"
          />
          <button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] text-[#111] px-6 h-full flex items-center justify-center cursor-pointer transition-colors duration-150">
            <Search className="h-5 w-5 font-bold" />
          </button>
        </form>

        {/* Right Nav Options */}
        <div className="flex items-center gap-3">
          {/* Country / Lang */}
          <div className="hidden lg:flex items-center gap-1 border border-transparent hover:border-white p-2 rounded-sm cursor-pointer font-bold">
            <span className="text-base">🇮🇳</span>
            <span>EN</span>
            <ChevronDown className="h-3 w-3 text-gray-400 mt-1" />
          </div>

          {/* Account & Lists */}
          <div className="flex flex-col border border-transparent hover:border-white p-2 rounded-sm cursor-pointer leading-none">
            <span className="text-xs text-gray-300">Hello, {userName}</span>
            <div className="flex items-center gap-1 font-bold">
              <span>Account & Lists</span>
              <ChevronDown className="h-3 w-3 text-gray-400 mt-1" />
            </div>
            {trustScore && (
              <span className="text-[10px] text-[#febd69] font-medium mt-0.5">
                Trust Score: {trustScore}
              </span>
            )}
          </div>

          {/* Returns & Orders */}
          <Link href="/orders" className="flex flex-col border border-transparent hover:border-white p-2 rounded-sm cursor-pointer leading-none">
            <span className="text-xs text-gray-300">Returns</span>
            <span className="font-bold">& Orders</span>
          </Link>

          {/* Cart */}
          <div className="flex items-center border border-transparent hover:border-white p-2 rounded-sm cursor-pointer font-bold relative">
            <ShoppingCart className="h-7 w-7" />
            <span className="absolute left-[22px] top-[4px] text-xs font-bold text-[#f3a847] bg-[#131921] rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
            <span className="self-end ml-1 text-sm hidden sm:inline">Cart</span>
          </div>
        </div>
      </div>

      {/* Sub Nav Bar */}
      <div className="bg-[#232f3e] px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 border border-transparent hover:border-white p-1 rounded-sm cursor-pointer font-bold">
            <Menu className="h-4 w-4" />
            <span>All</span>
          </div>
          <span className="border border-transparent hover:border-white p-1 rounded-sm cursor-pointer">Today's Deals</span>
          <Link href="/orders" className="border border-transparent hover:border-white p-1 rounded-sm cursor-pointer font-bold text-[#febd69]">Sell This Item</Link>
          <Link href="/green-wallet" className="border border-transparent hover:border-white p-1 rounded-sm cursor-pointer font-bold text-emerald-400 hover:text-white transition-colors">Green Wallet</Link>
        </div>
        <div className="font-bold text-[#febd69] hidden lg:block">
          ✓ Real Amazon Resale — Guaranteed Authentic
        </div>
      </div>
    </header>
  );
}
