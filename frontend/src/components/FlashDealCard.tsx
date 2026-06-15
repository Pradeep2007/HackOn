'use client';

import React, { useState, useEffect } from 'react';
import { Tag, MapPin, Navigation, Compass, ShieldCheck, Sparkles, CheckCircle2, Clock, Users } from 'lucide-react';
import { API_URL } from '@/config';

export interface FlashDeal {
  _id: string;
  productName: string;
  brand: string;
  category: string;
  productImage: string;
  conditionGrade: string;
  conditionScore: number;
  discountPercent: number;
  distanceKm: number;
  originalPrice: number;
  dealPrice: number;
  durationMinutes: number;
  timeLeftSeconds: number;
  potentialBuyers: number;
  status: 'Active' | 'Claimed' | 'Expired';
  hubLocation: string;
  assignedBuyer?: string;
  routeOptimized?: boolean;
}

interface FlashDealCardProps {
  deal: FlashDeal;
  onClaimSuccess: (updatedDeal: FlashDeal) => void;
}

export default function FlashDealCard({ deal, onClaimSuccess }: FlashDealCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(deal.timeLeftSeconds);
  const [claiming, setClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(deal.status === 'Claimed');
  const [isExpired, setIsExpired] = useState(deal.status === 'Expired');

  // Sync state if deal updates from parent
  useEffect(() => {
    setIsClaimed(deal.status === 'Claimed');
    setIsExpired(deal.status === 'Expired');
    setSecondsLeft(deal.timeLeftSeconds);
  }, [deal]);

  // Countdown timer effect
  useEffect(() => {
    if (deal.status !== 'Active' || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [deal.status, secondsLeft]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClaim = async () => {
    if (deal.status !== 'Active' || secondsLeft <= 0 || claiming) return;

    setClaiming(true);
    try {
      const res = await fetch(`${API_URL}/api/flash-deals/${deal._id}/claim`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setIsClaimed(true);
        onClaimSuccess(data.deal);
        // Dispatch a storage sync event to refresh wallet counts in the header
        window.dispatchEvent(new Event('storage'));
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to claim deal.');
      }
    } catch (err) {
      console.error(err);
      alert('Error communicating with server.');
    } finally {
      setClaiming(false);
    }
  };

  const getConditionColor = (grade: string) => {
    if (grade === 'Open Box') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  // Mini canvas SVG route representation
  const renderMiniMap = () => {
    return (
      <div className="relative h-24 w-full bg-slate-50 border border-slate-200 rounded overflow-hidden mt-3">
        {/* Simple grid lines background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
        
        {/* Hub dot */}
        <div className="absolute top-1/2 left-8 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="h-4 w-4 bg-[#131921] border-2 border-white rounded-full flex items-center justify-center shadow">
            <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full" />
          </div>
          <span className="text-[8px] text-gray-500 font-bold mt-1 bg-white/80 px-1 rounded">Hub</span>
        </div>

        {/* Route Line */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none">
          <path
            d="M 40,48 Q 120,20 200,48"
            fill="none"
            stroke={isClaimed ? '#10b981' : '#cbd5e1'}
            strokeWidth="2"
            strokeDasharray={isClaimed ? '0' : '4,4'}
            className={isClaimed ? '' : 'animate-[dash_2s_linear_infinite]'}
          />
        </svg>

        {/* Buyer/User dot */}
        <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="h-4 w-4 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center shadow">
            <div className="h-1.5 w-1.5 bg-white rounded-full" />
          </div>
          <span className="text-[8px] text-emerald-700 font-bold mt-1 bg-white/80 px-1 rounded">You</span>
        </div>

        {/* Truck/Delivery indicator */}
        {isClaimed ? (
          <div className="absolute top-[32%] left-[110px] -translate-x-1/2 bg-emerald-100 border border-emerald-300 text-emerald-800 text-[8px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1 animate-bounce">
            <Navigation className="h-2 w-2 rotate-90" /> Optimized Route
          </div>
        ) : (
          <div className="absolute top-[20%] left-[110px] -translate-x-1/2 bg-amber-50 border border-amber-200 text-amber-700 text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
            {deal.distanceKm} km transit
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`border rounded-md p-4 bg-white shadow-sm flex flex-col justify-between transition-all duration-300 relative ${isClaimed ? 'border-emerald-300 ring-2 ring-emerald-50' : 'border-gray-250 hover:shadow-md'}`}>
      
      {/* Dynamic badging */}
      <div className="flex flex-wrap gap-1 mb-2">
        <span className="bg-orange-100 text-orange-850 text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded">
          ⚡ {deal.discountPercent}% OFF Flash Deal
        </span>
        <span className="bg-blue-100 text-blue-800 text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded">
          📍 Proximity Return
        </span>
        {isClaimed && (
          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
            ✓ Claimed
          </span>
        )}
      </div>

      {/* Main content grid */}
      <div className="flex gap-3">
        {/* Product Image */}
        <div className="w-20 h-20 shrink-0 bg-gray-50 p-1.5 border border-gray-150 rounded flex items-center justify-center">
          <img src={deal.productImage} alt={deal.productName} className="max-h-full max-w-full object-contain" />
        </div>

        {/* Product text */}
        <div className="flex-grow min-w-0">
          <h4 className="font-bold text-sm text-gray-900 truncate">{deal.productName}</h4>
          <span className="text-[10px] text-gray-500 font-medium block mb-1">{deal.category}</span>
          
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[10px] font-bold border px-1 rounded ${getConditionColor(deal.conditionGrade)}`}>
              {deal.conditionGrade}
            </span>
            <span className="text-[10px] text-gray-500 font-semibold">
              Score: {deal.conditionScore}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-black text-gray-900">₹{deal.dealPrice.toLocaleString('en-IN')}</span>
            <span className="text-xs text-gray-400 line-through">₹{deal.originalPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Demand & Transit details */}
      <div className="border-t border-gray-100 mt-3 pt-2 space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 font-medium flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-blue-600" /> Nearby Interest:
          </span>
          <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
            {deal.potentialBuyers} buyers within 15 km
          </span>
        </div>

        {renderMiniMap()}
      </div>

      {/* Footer claim area */}
      <div className="border-t border-gray-100 mt-3 pt-3 flex items-center justify-between gap-3">
        {/* Countdown timer */}
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Claim window</span>
          {isClaimed ? (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Reserved Today
            </span>
          ) : isExpired ? (
            <span className="text-xs text-red-500 font-bold flex items-center gap-0.5">
              ⚠️ Expired
            </span>
          ) : (
            <span className="text-sm font-black text-red-650 flex items-center gap-1 font-mono">
              <Clock className="h-3.5 w-3.5 animate-pulse" /> {formatTime(secondsLeft)}
            </span>
          )}
        </div>

        {/* Claim button */}
        <button
          onClick={handleClaim}
          disabled={deal.status !== 'Active' || secondsLeft <= 0 || isClaimed || claiming}
          className={`px-4 py-2 text-xs font-bold rounded shadow-sm transition-all flex items-center gap-1 ${
            isClaimed
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
              : isExpired
              ? 'bg-gray-100 text-gray-400 border border-gray-250 cursor-not-allowed'
              : 'bg-[#ffd814] hover:bg-[#f7ca00] text-black border border-[#e2c027] hover:scale-105 active:scale-95 cursor-pointer'
          }`}
        >
          {claiming ? 'Claiming...' : isClaimed ? 'Reserved' : isExpired ? 'Expired' : 'Claim Deal'}
        </button>
      </div>
    </div>
  );
}
