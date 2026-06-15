'use client';

import React from 'react';
import AmazonHeader from '../components/AmazonHeader';
import Link from 'next/link';
import { ShieldCheck, Video, Tag, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-[#eaeded] min-h-screen text-black pb-12 font-sans">
      <AmazonHeader />

      {/* Hero Banner Area */}
      <div className="relative w-full min-h-[420px] md:min-h-[460px] lg:h-[480px] bg-gradient-to-b from-[#b3d4fc]/40 via-[#d3e9ff]/20 to-[#eaeded] overflow-hidden flex flex-col lg:flex-row items-center lg:items-start justify-between px-6 md:px-12 lg:px-16 pt-8 md:pt-12 lg:pt-16 pb-28 border-b border-gray-300">
        <div className="max-w-xl space-y-4 z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
          <span className="bg-[#002f6c] text-[#febd69] font-bold text-[10px] md:text-xs uppercase tracking-widest px-2.5 py-1 rounded w-fit">
            Introducing Amazon Resell
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-950 leading-tight">
            Sell what you bought, buy with 100% trust.
          </h1>
          <p className="text-xs md:text-sm text-gray-750 font-medium leading-relaxed max-w-lg">
            Amazon customers can now list pre-owned items previously purchased on Amazon.
            Our AI scans your inspection videos to verify quality, matching it against your order history ledger.
          </p>
          <div className="flex gap-4 pt-1">
            <Link 
              href="/orders" 
              className="bg-[#ffd814] hover:bg-[#f7ca00] text-black font-bold text-xs px-5 py-2.5 rounded shadow-sm border border-[#e2c027] transition-all hover:scale-105 active:scale-95"
            >
              Sell Your Items
            </Link>
            <Link 
              href="/search?q=iPhone" 
              className="bg-[#fff] hover:bg-gray-50 text-gray-850 font-bold text-xs px-5 py-2.5 rounded shadow-sm border border-gray-300 transition-all hover:scale-105 active:scale-95"
            >
              Shop Used Store
            </Link>
          </div>
        </div>

        {/* Hero visual */}
        <div className="hidden lg:flex items-center gap-6 relative w-96 h-64 justify-center mt-6 lg:mt-0">
          <div className="bg-white p-4 rounded-lg shadow-lg rotate-[-3deg] absolute top-2 left-0 border border-gray-200 w-44 space-y-2 transition-transform hover:scale-105 duration-300 cursor-pointer">
            <span className="text-[10px] text-green-700 font-bold block">✓ Purchased on Amazon</span>
            <img src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=150&q=80" className="h-20 w-full object-contain" />
            <div className="font-bold text-xs text-gray-900">iPhone 14 (Used)</div>
            <div className="text-gray-500 text-[10px]">AI Verified Score: 88</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg rotate-[4deg] absolute top-6 right-4 border border-gray-200 w-44 space-y-2 transition-transform hover:scale-105 duration-300 cursor-pointer">
            <span className="text-[10px] text-blue-700 font-bold block">✓ AI Inspection Checked</span>
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80" className="h-20 w-full object-contain" />
            <div className="font-bold text-xs text-gray-900">Sony WH-1000XM5</div>
            <div className="text-gray-500 text-[10px]">AI Verified Score: 92</div>
          </div>
        </div>
      </div>

      {/* Main Grid Category Cards */}
      <main className="max-w-7xl mx-auto px-4 -mt-20 lg:-mt-24 relative z-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Your Orders */}
        <div className="bg-white p-5 rounded-sm shadow border border-gray-200 flex flex-col justify-between space-y-4 min-h-[320px]">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Sell Your Delivered Items</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Resell products you previously purchased on Amazon. Check your delivered orders to find eligible products.
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <img src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=100&q=80" className="h-12 w-full object-contain bg-gray-50 p-1 border border-gray-100 rounded" />
              <img src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=100&q=80" className="h-12 w-full object-contain bg-gray-50 p-1 border border-gray-100 rounded" />
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80" className="h-12 w-full object-contain bg-gray-50 p-1 border border-gray-100 rounded" />
            </div>
          </div>
          <Link href="/orders" className="text-xs text-[#007185] hover:text-[#c45500] hover:underline font-bold flex items-center gap-0.5 mt-auto self-start">
            Go to Returns & Orders <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 2: Unified Shop */}
        <div className="bg-white p-5 rounded-sm shadow border border-gray-200 flex flex-col justify-between space-y-4 min-h-[320px]">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Shop New + Used Together</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Search the Amazon marketplace and explore used resell offers displayed directly alongside brand-new options.
            </p>
            <div className="bg-gray-50 border border-gray-200 p-2.5 rounded mt-3 text-xs space-y-1">
              <div className="flex justify-between font-bold text-gray-700 border-b border-gray-200 pb-1">
                <span>Offer Condition</span>
                <span>Price</span>
              </div>
              <div className="flex justify-between">
                <span>New iPhone 14</span>
                <span className="font-bold">₹69,999</span>
              </div>
              <div className="flex justify-between text-green-700 font-semibold">
                <span>Used - Excellent</span>
                <span className="font-bold">₹45,999</span>
              </div>
              <div className="flex justify-between text-blue-700 font-semibold">
                <span>Used - Good</span>
                <span className="font-bold">₹41,999</span>
              </div>
            </div>
          </div>
          <Link href="/search?q=iPhone+14" className="text-xs text-[#007185] hover:text-[#c45500] hover:underline font-bold flex items-center gap-0.5 self-start">
            Search "iPhone 14" resell listings <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Card 3: AI Condition Inspection */}
        <div className="bg-white p-5 rounded-sm shadow border border-gray-200 flex flex-col justify-between space-y-4 min-h-[320px]">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Amazon AI Inspection</h3>
            <p className="text-xs text-gray-650 leading-relaxed">
              Every resell listing contains a machine-learning defect scan log generated by uploading a 10s video.
            </p>
            <div className="mt-3 bg-blue-50 border border-blue-100 p-3 rounded space-y-2 text-[11px] text-blue-800 font-medium">
              <div className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-[#e47911]" />
                <span>Video Visual Defect Analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verification Checklist Integration</span>
              </div>
              <div className="flex items-center gap-1">
                <Video className="h-3.5 w-3.5" />
                <span>Ledger Order History Audits</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-auto">
            Powered by Amazon AI Vision
          </span>
        </div>

        {/* Card 4: Catalog Products */}
        <div className="bg-white p-5 rounded-sm shadow border border-gray-200 flex flex-col justify-between space-y-4 min-h-[320px]">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Explore Popular Catalog</h3>
            <p className="text-xs text-gray-650 leading-relaxed">
              Browse the official detail pages to view standard products and customer resell offers.
            </p>
            <div className="space-y-2 mt-4 font-semibold text-xs text-[#007185]">
              <Link href="/products/new-iphone-14" className="block hover:underline hover:text-[#c45500]">
                • iPhone 14 Detail Page →
              </Link>
              <Link href="/products/new-macbook-air-m2" className="block hover:underline hover:text-[#c45500]">
                • MacBook Air M2 Detail Page →
              </Link>
              <Link href="/products/new-sony-headphones" className="block hover:underline hover:text-[#c45500]">
                • Sony WH-1000XM5 Detail Page →
              </Link>
            </div>
          </div>
          <div className="text-[11px] text-gray-500 font-medium pt-2">
            Click to view buying options.
          </div>
        </div>

      </main>

      {/* Feature Walkthrough explanation section */}
      <section className="max-w-7xl mx-auto px-4 mt-8 bg-white p-6 rounded-sm shadow border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          How to Test the Amazon Resell Flow (Judge Walkthrough)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-700 leading-relaxed">
          <div className="space-y-2 border-r border-gray-200 pr-4">
            <div className="text-2xl font-black text-[#e47911] bg-orange-50 w-8 h-8 flex items-center justify-center rounded-full">1</div>
            <h3 className="font-bold text-sm text-gray-900">Delivered Orders Portal</h3>
            <p>
              Navigate to the <Link href="/orders" className="text-[#007185] hover:underline font-bold">Returns & Orders</Link> page. You will see delivered orders seeded in John Doe's purchase history.
            </p>
          </div>

          <div className="space-y-2 border-r border-gray-200 pr-4">
            <div className="text-2xl font-black text-[#e47911] bg-orange-50 w-8 h-8 flex items-center justify-center rounded-full">2</div>
            <h3 className="font-bold text-sm text-gray-900">Inspect & Publish Item</h3>
            <p>
              Click <strong>"Sell This Item"</strong> on the iPhone 14 order. Upload a mock video, click <strong>"Analyze Condition"</strong> to run the visual scanner, set a price, and click <strong>"Publish Listing"</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-2xl font-black text-[#e47911] bg-orange-50 w-8 h-8 flex items-center justify-center rounded-full">3</div>
            <h3 className="font-bold text-sm text-gray-900">Unified Shopping Discovery</h3>
            <p>
              Search for <strong>"iPhone 14"</strong>. You will see both the New Amazon Product and your newly listed Used Product listed by customer John Doe side-by-side! Click on the new product detail page to inspect the <strong>"Other Buying Options"</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
