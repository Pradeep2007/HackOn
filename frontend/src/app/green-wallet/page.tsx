'use client';

import React, { useState, useEffect, Suspense } from 'react';
import AmazonHeader from '../../components/AmazonHeader';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronRight, Landmark, CreditCard, Gift, ShieldCheck, Ticket, Award, Zap, 
  Compass, Leaf, Droplet, Trash2, Activity, ArrowRight, HeartHandshake, MapPin, 
  Sparkles, Truck, Check, Loader2, Download, Users, Calendar, FileText, Play, 
  X, AlertCircle, RefreshCw, DollarSign, BarChart2, ShoppingBag, Eye 
} from 'lucide-react';

interface User {
  name: string;
  email: string;
  trustScore: number;
  currentCredits: number;
  lifetimeCredits: number;
  redeemedCredits: number;
  tier: 'Green Explorer' | 'Eco Warrior' | 'Carbon Hero' | 'Circular Champion';
  co2Saved: number;
  waterSaved: number;
  wastePrevented: number;
  refurbishedPurchases: number;
  greenActionsCount: number;
  rewardHistory: Array<{
    activity: string;
    credits: number;
    co2Saved?: number;
    date: string;
  }>;
  couponsRedeemed: Array<{
    code: string;
    reward: string;
    cost: number;
    date: string;
  }>;
}

interface Donation {
  _id: string;
  productName: string;
  brand: string;
  category: string;
  productImage: string;
  conditionScore: number;
  conditionCategory: string;
  organizationName: string;
  organizationType: string;
  distanceKm: number;
  matchScore: number;
  beneficiariesHelped: number;
  beneficiaryType: string;
  co2Savings: number;
  wastePrevented: number;
  greenCreditsEarned: number;
  certificateId: string;
  status: 'Created' | 'Pickup Scheduled' | 'Picked Up' | 'Delivered' | 'Impact Recorded';
  timeline: Array<{
    status: string;
    timestamp: string;
    description: string;
  }>;
  pickupAddress: string;
  createdAt: string;
}

interface LeaderboardUser {
  name: string;
  avatar: string;
  lifetimeCredits: number;
  co2Saved: number;
  wastePrevented: number;
  productsDonated: number;
}

interface SellerStats {
  totalEarnings: number;
  totalCarbonSaved: number;
  activeCount: number;
  soldCount: number;
  listings: Array<{
    _id: string;
    sellingPrice: number;
    buyerPrice: number;
    amazonFee: number;
    status: string;
    sustainabilityScore: number;
    co2Savings: number;
    conditionNotes: string;
    trustScore: number;
    order: {
      productName: string;
      productImage: string;
      brand: string;
      category: string;
    };
  }>;
}

interface RewardItem {
  id: string;
  reward: string;
  cost: number;
  description: string;
  badge?: string;
  color: string;
}

const REWARDS: RewardItem[] = [
  { id: '1', reward: '₹50 Shopping Coupon', cost: 500, description: 'Get flat ₹50 off on any purchase on Amazon.in.', badge: 'Popular', color: 'from-orange-500 to-amber-500' },
  { id: '2', reward: '₹100 Shopping Coupon', cost: 1000, description: 'Get flat ₹100 off on any purchase on Amazon.in.', badge: 'Best Value', color: 'from-emerald-500 to-teal-500' },
  { id: '3', reward: '₹250 Shopping Coupon', cost: 2000, description: 'Get flat ₹250 off on any purchase on Amazon.in.', color: 'from-blue-500 to-indigo-500' },
  { id: '4', reward: '₹500 Shopping Coupon', cost: 4000, description: 'Get flat ₹500 off on any purchase on Amazon.in.', badge: 'Premium', color: 'from-purple-500 to-pink-500' },
  { id: '5', reward: 'Free Resell Delivery Voucher', cost: 300, description: 'Waive off home shipping/delivery fees on your next pre-owned purchase.', color: 'from-[#007185] to-cyan-600' },
  { id: '6', reward: '10% Extra Discount Coupon', cost: 800, description: 'Get an additional 10% off (up to ₹200) on any verified customer resell item.', color: 'from-[#c45500] to-orange-600' },
];

export default function GreenWalletPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#eaeded] min-h-screen text-black font-sans">
        <AmazonHeader />
        <div className="flex flex-col items-center justify-center py-32 space-y-3">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-semibold">Loading Sustainability Hub...</p>
        </div>
      </div>
    }>
      <GreenWalletContent />
    </Suspense>
  );
}

function GreenWalletContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState('wallet'); // 'wallet' | 'carbon' | 'impact' | 'rewards'
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Donation lists
  const [donations, setDonations] = useState<Donation[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [activeCertificate, setActiveCertificate] = useState<Donation | null>(null);
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  // Rewards states
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCoupon, setSuccessCoupon] = useState<any | null>(null);

  // Seller dashboard states
  const [sellerStats, setSellerStats] = useState<SellerStats | null>(null);

  const fetchData = async () => {
    try {
      // Fetch user profile
      const userRes = await fetch('http://localhost:5000/api/user');
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.user) {
          setUser(userData.user);
        }
      }

      // Fetch user's donations
      const donRes = await fetch('http://localhost:5000/api/donations');
      if (donRes.ok) {
        const donData = await donRes.json();
        setDonations(donData);
      }

      // Fetch circular leaderboard
      const leadRes = await fetch('http://localhost:5000/api/sustainability/leaderboard');
      if (leadRes.ok) {
        const leadData = await leadRes.json();
        setLeaderboard(leadData);
      }

      // Fetch seller stats
      const sellerRes = await fetch('http://localhost:5000/api/sustainability/seller-stats');
      if (sellerRes.ok) {
        const sellerData = await sellerRes.json();
        setSellerStats(sellerData);
      }
    } catch (err) {
      console.error('Error loading consolidated hub stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (tabParam && ['wallet', 'carbon', 'impact', 'rewards'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const changeTab = (tabName: string) => {
    setActiveTab(tabName);
    router.push(`/green-wallet?tab=${tabName}`);
  };

  const getTierThreshold = (tier: string) => {
    switch (tier) {
      case 'Green Explorer': return { next: 'Eco Warrior', min: 0, max: 500 };
      case 'Eco Warrior': return { next: 'Carbon Hero', min: 500, max: 1000 };
      case 'Carbon Hero': return { next: 'Circular Champion', min: 1000, max: 2000 };
      case 'Circular Champion': return { next: 'Ultimate Champion', min: 2000, max: 5000 };
      default: return { next: 'Unknown', min: 0, max: 100 };
    }
  };

  // Handlers for Donation status progression
  const handleAdvanceStatus = async (donationId: string) => {
    setAdvancingId(donationId);
    try {
      const res = await fetch(`http://localhost:5000/api/donations/${donationId}/advance-status`, {
        method: 'POST'
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdvancingId(null);
    }
  };

  // Handlers for Reward Vouchers claim
  const handleRedeem = async (reward: RewardItem) => {
    if (!user) return;
    if (user.currentCredits < reward.cost) {
      setErrorMsg(`Insufficient balance. You need ${reward.cost - user.currentCredits} more credits.`);
      return;
    }

    setRedeemingId(reward.id);
    setErrorMsg(null);
    setSuccessCoupon(null);

    try {
      const response = await fetch('http://localhost:5000/api/sustainability/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cost: reward.cost, reward: reward.reward })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to redeem.');
      }

      const data = await response.json();
      setSuccessCoupon(data.coupon);
      setUser(data.user);
      
      window.dispatchEvent(new Event('storage'));
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during redemption.');
    } finally {
      setRedeemingId(null);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bg-[#eaeded] min-h-screen text-black font-sans">
        <AmazonHeader />
        <div className="flex flex-col items-center justify-center py-32 space-y-3">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-semibold">Loading Sustainability Hub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[#eaeded] min-h-screen text-black font-sans">
        <AmazonHeader />
        <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded border border-gray-300 shadow-sm text-center">
          <Landmark className="h-12 w-12 text-gray-400 mx-auto mb-2 animate-bounce" />
          <p className="font-bold text-gray-800">Cannot load account details.</p>
          <Link href="/login" className="inline-block mt-4 bg-[#f0c14b] text-black font-semibold text-xs px-4 py-2 rounded border border-[#a88734]">
            Go to Login Page
          </Link>
        </div>
      </div>
    );
  }

  // Carbon Page Threshold Calculations
  const { next, min, max } = getTierThreshold(user.tier);
  const progressPercent = Math.min(100, Math.max(0, ((user.lifetimeCredits - min) / (max - min)) * 100));

  // Donation aggregations
  const totalDonations = donations.length;
  const totalBeneficiaries = donations.reduce((sum, d) => sum + (d.status === 'Impact Recorded' || d.status === 'Delivered' ? d.beneficiariesHelped : 0), 0);
  const totalOrganizations = new Set(donations.map(d => d.organizationName)).size;
  const totalWaste = donations.reduce((sum, d) => sum + d.wastePrevented, 0);
  const totalCo2 = donations.reduce((sum, d) => sum + d.co2Savings, 0);
  const totalCredits = donations.reduce((sum, d) => sum + d.greenCreditsEarned, 0);

  const activeDonations = donations.filter(d => d.status !== 'Impact Recorded');
  const completedDonations = donations.filter(d => d.status === 'Impact Recorded' || d.status === 'Delivered');

  return (
    <div className="bg-[#eaeded] min-h-screen text-black pb-16 font-sans">
      <AmazonHeader />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* Navigation Breadcrumbs */}
        <div className="text-xs text-gray-500 flex items-center gap-1 font-medium">
          <Link href="/" className="hover:text-[#c45500] hover:underline">Your Account</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#007185]">Sustainability Hub</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-bold capitalize">
            {activeTab === 'wallet' ? 'Wallet & Ledger' : activeTab === 'carbon' ? 'Carbon Footprint' : activeTab === 'impact' ? 'Donation Impact' : 'Rewards Store'}
          </span>
        </div>

        {/* Unified Dashboard Header */}
        <div className="border-b border-gray-300 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-normal text-gray-900 flex items-center gap-2">
              <Leaf className="h-8 w-8 text-emerald-600 fill-emerald-50" />
              Sustainability Hub
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Manage your Green Credits, analyze carbon footprints, track charitable donations, and redeem shopping rewards.
            </p>
          </div>
          
          {user && (
            <div className="bg-white border border-emerald-200 rounded-lg py-2.5 px-4 shadow-sm flex items-center gap-3 shrink-0">
              <div className="bg-emerald-50 text-emerald-705 p-2 rounded-full">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 font-black uppercase tracking-wider block leading-none">Wallet Balance</span>
                <span className="text-xl font-extrabold text-emerald-800">{user.currentCredits} <span className="text-xs font-semibold text-gray-500">Credits</span></span>
              </div>
            </div>
          )}
        </div>

        {/* Sub-tab Switched Header Navigation Bar */}
        <div className="bg-[#232f3e] text-white rounded-lg p-1 shadow flex flex-wrap gap-1 border border-gray-700">
          <button
            onClick={() => changeTab('wallet')}
            className={`flex-1 py-2.5 px-4 rounded font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'wallet'
                ? 'bg-emerald-600 text-white shadow'
                : 'hover:bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            <Landmark className="h-4 w-4" />
            Wallet & Resell Ledger
          </button>
          <button
            onClick={() => changeTab('carbon')}
            className={`flex-1 py-2.5 px-4 rounded font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'carbon'
                ? 'bg-emerald-600 text-white shadow'
                : 'hover:bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            <Leaf className="h-4 w-4" />
            Carbon Footprint
          </button>
          <button
            onClick={() => changeTab('impact')}
            className={`flex-1 py-2.5 px-4 rounded font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'impact'
                ? 'bg-emerald-600 text-white shadow'
                : 'hover:bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            <HeartHandshake className="h-4 w-4" />
            Donation Impact
          </button>
          <button
            onClick={() => changeTab('rewards')}
            className={`flex-1 py-2.5 px-4 rounded font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'rewards'
                ? 'bg-emerald-600 text-white shadow'
                : 'hover:bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            <Gift className="h-4 w-4" />
            Rewards Store
          </button>
        </div>

        {/* -------------------- TAB CONTENT PANELS -------------------- */}

        {/* TAB 1: WALLET & RESELL LEDGER */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            
            {/* Wallet Balance Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white border-2 border-emerald-500 rounded-lg p-5 shadow-sm space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-bl">
                  Active Wallet
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Available Balance</span>
                <span className="text-4xl font-black text-emerald-700 tracking-tight block">
                  {user.currentCredits || 0}
                </span>
                <span className="text-[10px] text-gray-500 font-medium block">
                  Green Credits (10 Credits = ₹1)
                </span>
                <div className="bg-emerald-50 text-emerald-800 text-[10px] font-bold p-1.5 rounded border border-emerald-100 text-center select-none">
                  Estimated Value: ₹{Math.round((user.currentCredits || 0) / 10)}
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Lifetime Earned</span>
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight block">
                  {user.lifetimeCredits || 0}
                </span>
                <span className="text-[10px] text-gray-500 font-medium block">
                  Total credits earned since joining.
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-700 pt-3 border-t border-gray-100 mt-2">
                  <Award className="h-4 w-4 text-[#febd69] fill-[#febd69] stroke-orange-700" />
                  <span>Rank: {user.tier}</span>
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Redeemed</span>
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight block">
                  {user.redeemedCredits || 0}
                </span>
                <span className="text-[10px] text-gray-500 font-medium block">
                  Credits exchanged for vouchers.
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-700 pt-3 border-t border-gray-100 mt-2">
                  <Ticket className="h-4 w-4 text-orange-600" />
                  <span>Redeemed {user.couponsRedeemed.length || 0} Coupons</span>
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">CO₂ Saved Balance</span>
                <span className="text-3xl font-extrabold text-emerald-700 tracking-tight block">
                  {user.co2Saved || 0} <span className="text-sm font-semibold">kg</span>
                </span>
                <span className="text-[10px] text-gray-500 font-medium block">
                  Greenhouse gas preventions.
                </span>
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-700 pt-3 border-t border-gray-100 mt-2">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  <span>Circular Actions: {user.greenActionsCount}</span>
                </div>
              </div>
            </div>

            {/* SELLER COMMERCIAL STATS (Integrated from Seller Dashboard) */}
            <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm space-y-4">
              <div className="border-b border-gray-200 pb-2 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <BarChart2 className="h-4.5 w-4.5 text-[#c45500]" />
                  Resell Listings & Earnings Ledger
                </h3>
                <span className="text-[9px] bg-orange-100 text-orange-850 border border-orange-200 px-2 py-0.5 rounded font-black font-mono">
                  COMMERCIAL WALLET
                </span>
              </div>

              {sellerStats ? (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-55 border border-gray-200 rounded p-3 text-center">
                      <span className="text-[9px] text-gray-400 font-bold uppercase block">Total Sales Cash Receive</span>
                      <span className="text-xl font-extrabold text-gray-900 block mt-0.5">₹{sellerStats.totalEarnings?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="bg-gray-55 border border-gray-200 rounded p-3 text-center">
                      <span className="text-[9px] text-gray-400 font-bold uppercase block">Selling Carbon Savings</span>
                      <span className="text-xl font-extrabold text-emerald-700 block mt-0.5">{sellerStats.totalCarbonSaved || 0} kg CO₂</span>
                    </div>
                    <div className="bg-gray-55 border border-gray-200 rounded p-3 text-center">
                      <span className="text-[9px] text-gray-400 font-bold uppercase block">Active Sell Offers</span>
                      <span className="text-xl font-extrabold text-blue-700 block mt-0.5">{sellerStats.activeCount || 0} items</span>
                    </div>
                    <div className="bg-gray-55 border border-gray-200 rounded p-3 text-center">
                      <span className="text-[9px] text-gray-400 font-bold uppercase block">Successfully Sold</span>
                      <span className="text-xl font-extrabold text-emerald-600 block mt-0.5">{sellerStats.soldCount || 0} items</span>
                    </div>
                  </div>

                  {/* Listings Catalog Table */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Your Listed Resale Catalog</span>
                    
                    {sellerStats.listings.length === 0 ? (
                      <p className="text-xs text-gray-500 py-6 text-center border border-dashed rounded bg-gray-50/50">
                        No products listed for resell. Sell items from your orders history.
                      </p>
                    ) : (
                      <div className="overflow-x-auto border border-gray-200 rounded">
                        <table className="w-full text-xs text-left text-gray-650 font-medium">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[10px] uppercase font-bold">
                              <th className="py-2.5 px-3">Item</th>
                              <th className="py-2.5 text-center">Status</th>
                              <th className="py-2.5 text-center">Trust Score</th>
                              <th className="py-2.5 text-right">You Receive</th>
                              <th className="py-2.5 text-right">Amazon Fee</th>
                              <th className="py-2.5 text-right">Buyer Price</th>
                              <th className="py-2.5 px-3 text-center">CO₂ Saved</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {sellerStats.listings.map((listing) => (
                              <tr key={listing._id} className="hover:bg-gray-50/50 bg-white">
                                <td className="py-2.5 px-3">
                                  <div className="flex gap-2.5 items-center">
                                    <img 
                                      src={listing.order?.productImage} 
                                      alt="product" 
                                      className="w-8 h-8 object-contain bg-white rounded border p-0.5"
                                    />
                                    <div>
                                      <span className="font-bold text-gray-900 block truncate max-w-[150px]">{listing.order?.productName}</span>
                                      <span className="text-[9px] text-gray-400 block font-mono">{listing.conditionNotes}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2.5 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                    listing.status === 'Active' ? 'bg-blue-50 text-blue-700 border border-blue-150' : 'bg-green-50 text-green-700 border border-green-150'
                                  }`}>
                                    {listing.status}
                                  </span>
                                </td>
                                <td className="py-2.5 text-center">
                                  <span className="bg-[#f0faf5] border border-emerald-150 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-extrabold">
                                    {listing.trustScore}%
                                  </span>
                                </td>
                                <td className="py-2.5 text-right font-bold text-gray-900">₹{listing.sellingPrice.toLocaleString('en-IN')}</td>
                                <td className="py-2.5 text-right text-gray-450 font-semibold">₹{listing.amazonFee.toLocaleString('en-IN')}</td>
                                <td className="py-2.5 text-right font-bold text-[#007185]">₹{listing.buyerPrice.toLocaleString('en-IN')}</td>
                                <td className="py-2.5 px-3 text-center font-bold text-emerald-600">
                                  +{listing.co2Savings || 12} kg
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Ledger Transactions & Redeemed Coupons double column */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Reward History Ledger (8 cols) */}
              <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm md:col-span-8 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm border-b border-gray-200 pb-2 flex justify-between items-center">
                  <span>Green Credits Ledger History</span>
                  <span className="text-[10px] text-gray-450 font-bold uppercase font-mono">Ledger Audited ✓</span>
                </h3>

                {user.rewardHistory.length === 0 ? (
                  <p className="text-xs text-gray-550 py-10 text-center">No credits transaction events logged.</p>
                ) : (
                  <div className="divide-y divide-gray-150 max-h-[420px] overflow-y-auto pr-1 font-sans">
                    {user.rewardHistory.map((item, idx) => (
                      <div key={idx} className="py-3.5 flex justify-between items-center text-xs gap-4 hover:bg-gray-50/50 px-1.5 rounded transition-colors">
                        <div className="space-y-1">
                          <p className="font-bold text-gray-800">{item.activity}</p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-emerald-700 text-sm block">+{item.credits} Credits</span>
                          {item.co2Saved ? (
                            <span className="text-[10px] text-emerald-600 block font-semibold">Saved {item.co2Saved}kg CO₂</span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Redeemed Coupons (4 cols) */}
              <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm md:col-span-4 space-y-4">
                <h3 className="font-bold text-gray-900 text-sm border-b border-gray-200 pb-2">
                  Your Redeemed Shopping Coupons
                </h3>

                {user.couponsRedeemed.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 space-y-2 text-xs">
                    <Ticket className="h-8 w-8 text-gray-300 mx-auto" />
                    <p className="font-medium">No shopping coupons redeemed yet.</p>
                    <p className="text-[10px] text-gray-400">Exchange credits in the rewards store tab to claim your first Amazon coupon code.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                    {user.couponsRedeemed.map((coupon, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded p-4 space-y-2 relative shadow-sm">
                        <div className="absolute top-2 right-2 text-[8px] bg-amber-200 text-amber-800 font-black px-1.5 py-0.5 rounded font-mono border border-amber-300">
                          ACTIVE
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-gray-400 block uppercase">Reward Voucher</span>
                          <h4 className="font-black text-gray-900 text-sm">{coupon.reward}</h4>
                        </div>
                        
                        <div className="bg-white px-2 py-1.5 border border-dashed border-orange-300 rounded text-center">
                          <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Coupon Code</span>
                          <span className="font-mono font-black text-sm text-[#c45500] tracking-widest">{coupon.code}</span>
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-gray-550 pt-1">
                          <span>Cost: {coupon.cost} credits</span>
                          <span>{new Date(coupon.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Wallet Ledger Info Guide */}
            <div className="bg-[#fafafa] border border-gray-300 rounded-lg p-4 flex gap-3 text-xs leading-relaxed text-gray-550 items-start">
              <ShieldCheck className="h-5 w-5 text-[#007185] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="font-bold text-gray-700">Wallet Protection & Guidelines</h5>
                <p>
                  Green Credits are non-transferable, expire 1 year after the date of issue, and cannot be traded for cash. Coupons generated under your profile can only be applied to orders placed from the same profile.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CARBON FOOTPRINT */}
        {activeTab === 'carbon' && (
          <div className="space-y-6">
            
            {/* Top Impact Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-lg p-5 shadow-sm space-y-4 hover:shadow transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider block">Carbon Emissions Prevented</span>
                    <span className="text-4xl font-extrabold text-emerald-700 tracking-tight block">
                      {user.co2Saved || 0} <span className="text-sm font-semibold">kg CO₂</span>
                    </span>
                  </div>
                  <div className="p-2.5 bg-emerald-100 rounded-full text-emerald-700">
                    <Leaf className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-[11px] text-gray-650 leading-relaxed font-semibold">
                  Equivalent to planting <strong className="text-emerald-700">{Math.round((user.co2Saved || 0) / 20) || 1} trees</strong> and letting them grow for a full year. Avoided via purchasing pre-owned items and drop-off logistics return loops.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-5 shadow-sm space-y-4 hover:shadow transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs text-blue-800 font-bold uppercase tracking-wider block">Water Consumption Saved</span>
                    <span className="text-4xl font-extrabold text-blue-700 tracking-tight block">
                      {user.waterSaved || 0} <span className="text-sm font-semibold">Liters</span>
                    </span>
                  </div>
                  <div className="p-2.5 bg-blue-100 rounded-full text-blue-700">
                    <Droplet className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-[11px] text-gray-650 leading-relaxed font-semibold">
                  Calculated based on manufacturing resource bypass calculations of your refurbished purchases. Equivalent to <strong className="text-blue-700">{Math.round((user.waterSaved || 0) / 15) || 5} average showers</strong>.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-lg p-5 shadow-sm space-y-4 hover:shadow transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs text-amber-800 font-bold uppercase tracking-wider block">Landfill Waste Prevented</span>
                    <span className="text-4xl font-extrabold text-amber-700 tracking-tight block">
                      {user.wastePrevented || 0} <span className="text-sm font-semibold">kg</span>
                    </span>
                  </div>
                  <div className="p-2.5 bg-amber-100 rounded-full text-amber-700">
                    <Trash2 className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-[11px] text-gray-650 leading-relaxed font-semibold">
                  Direct physical weight diverted from garbage landfills by participating in local drop-off returns and reselling products instead of discarding them.
                </p>
              </div>
            </div>

            {/* Middle Section: Reward Tier & Credits Progress */}
            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5 space-y-3 flex items-center gap-4">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-full flex items-center justify-center shrink-0 w-24 h-24 text-emerald-600 relative shadow-inner">
                  <Award className="h-12 w-12 text-[#febd69] fill-[#febd69] stroke-orange-700 stroke-[1.5]" />
                  <Zap className="h-5 w-5 text-emerald-500 absolute bottom-1.5 right-1.5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Circular Economy Tier</span>
                  <h3 className="text-xl font-bold text-gray-900">{user.tier}</h3>
                  <p className="text-xs text-gray-500 leading-normal font-semibold">
                    You are in the top <strong className="text-emerald-700">15%</strong> of local circular economy champions. Keep it up!
                  </p>
                </div>
              </div>

              <div className="md:col-span-7 space-y-3">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Lifetime Credits: <span className="text-emerald-700 font-black">{user.lifetimeCredits}</span></span>
                  <span>Next Tier: <span className="text-blue-700 font-black">{next}</span> ({max} Credits)</span>
                </div>
                
                {/* Bar */}
                <div className="w-full bg-gray-200 h-3.5 rounded-full overflow-hidden border border-gray-300">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-1000 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-gray-450 font-bold">
                  <span>Tier min: {min}</span>
                  <span className="text-emerald-700 font-semibold">{Math.round(max - user.lifetimeCredits)} more credits to level up!</span>
                  <span>Tier max: {max}</span>
                </div>
              </div>
            </div>

            {/* Lower Section: Summary Stats Cards & Activity Feed */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Quick Metrics (Col 1) */}
              <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-sm border-b border-gray-200 pb-2">
                  Circular Actions Summary
                </h3>
                
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-semibold">Refurbished Purchases</span>
                    <span className="font-bold text-gray-900 bg-blue-50 px-2 py-0.5 border border-blue-150 rounded">{user.refurbishedPurchases || 0} items</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-semibold">Smart Green Returns</span>
                    <span className="font-bold text-gray-900 bg-green-50 px-2 py-0.5 border border-green-150 rounded">
                      {user.rewardHistory.filter(h => h.activity.includes('Return')).length || 0} actions
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-semibold">Carbon Actions Completed</span>
                    <span className="font-bold text-gray-900 bg-amber-50 px-2 py-0.5 border border-amber-150 rounded">{user.greenActionsCount || 0} times</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-semibold">Wallet Credit Balance</span>
                    <span className="font-extrabold text-[#e47911] text-sm">{user.currentCredits || 0} credits</span>
                  </div>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded text-[11px] text-emerald-800 font-medium leading-relaxed">
                  🌱 <strong>5% Shopping Rewards:</strong> Get a 5% credit back into your Green Wallet whenever you purchase an AI-verified customer pre-owned listing on Amazon!
                </div>
              </div>

              {/* Activity Feed (Col 2 & 3) */}
              <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm space-y-4 md:col-span-2">
                <h3 className="font-bold text-gray-900 text-sm border-b border-gray-200 pb-2 flex justify-between items-center">
                  <span>Recent Sustainability Activity Ledger</span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase font-mono">Ledger Verified ✓</span>
                </h3>

                {user.rewardHistory.length === 0 ? (
                  <p className="text-xs text-gray-500 py-10 text-center">No sustainability events recorded on your ledger yet.</p>
                ) : (
                  <div className="divide-y divide-gray-150 max-h-56 overflow-y-auto pr-1">
                    {user.rewardHistory.map((item, idx) => (
                      <div key={idx} className="py-3 flex justify-between items-center text-xs gap-3">
                        <div className="space-y-1">
                          <p className="font-bold text-gray-800 leading-snug">{item.activity}</p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            Date: {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-emerald-700 text-sm block">+{item.credits} Credits</span>
                          {item.co2Saved ? (
                            <span className="text-[10px] text-emerald-600 block font-semibold">Saved {item.co2Saved}kg CO₂</span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sustainability FAQ Info */}
            <section className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm space-y-3 text-xs leading-relaxed text-gray-650">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-[#007185]" />
                About the Amazon Resell Circular Economy Program
              </h4>
              <p>
                The Amazon Resell Program helps reduce carbon emissions, waste, and resource usage. When you choose to purchase an AI-inspected pre-owned product, or return an order through drop-off hubs or flexible pick-ups, you prevent manufacturing, packaging, and shipping overheads. Amazon rewards these eco-conscious decisions with <strong>Green Credits</strong>, redeemable for shopping discounts.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-medium text-gray-700">
                <div className="bg-gray-50 p-2.5 rounded border border-gray-150">
                  <strong className="text-gray-900">1. Ledger Match Tracking</strong>
                  <p className="text-[11px] text-gray-500 mt-0.5">Every resell product is verified against the original purchase record to guarantee authenticity.</p>
                </div>
                <div className="bg-gray-50 p-2.5 rounded border border-gray-150">
                  <strong className="text-gray-900">2. Smart Return Logistics</strong>
                  <p className="text-[11px] text-gray-500 mt-0.5">Drop-off returns allow carrier vehicles to optimize routes, reducing carbon emissions by up to 80%.</p>
                </div>
                <div className="bg-gray-50 p-2.5 rounded border border-gray-150">
                  <strong className="text-gray-900">3. Carbon Incentives</strong>
                  <p className="text-[11px] text-gray-500 mt-0.5">Used purchases grant 5% credits back, encouraging sustainable secondary commerce loops.</p>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* TAB 3: DONATION IMPACT */}
        {activeTab === 'impact' && (
          <div className="space-y-6">
            
            {/* Global KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-white border border-gray-300 rounded-lg p-4 text-center shadow-sm">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase block">Products Donated</span>
                <span className="text-2xl font-extrabold text-emerald-800 block mt-1">{totalDonations} Items</span>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-4 text-center shadow-sm">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase block">Students Helped</span>
                <span className="text-2xl font-extrabold text-blue-700 block mt-1">{totalBeneficiaries}+</span>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-4 text-center shadow-sm">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase block">NGOs Supported</span>
                <span className="text-2xl font-extrabold text-purple-700 block mt-1">{totalOrganizations} Centers</span>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-4 text-center shadow-sm">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase block">Waste Diverted</span>
                <span className="text-2xl font-extrabold text-emerald-700 block mt-1">{totalWaste.toFixed(1)} kg</span>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-4 text-center shadow-sm">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase block">CO₂ Saved</span>
                <span className="text-2xl font-extrabold text-emerald-600 block mt-1">🌿 {totalCo2} kg</span>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-4 text-center shadow-sm">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase block">Credits Earned</span>
                <span className="text-2xl font-extrabold text-[#e47911] block mt-1">+{totalCredits} Cr</span>
              </div>
            </div>

            {/* Split layout for tracking timelines vs Leaderboard/badges */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: timelines and certificates (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Active timelines */}
                <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm space-y-6">
                  <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                      <Truck className="h-5 w-5 text-[#e47911]" /> Active Donation Logistics Tracking
                    </h2>
                    <span className="bg-orange-50 text-orange-850 text-[10px] px-2 py-0.5 rounded font-black border border-orange-200 uppercase tracking-wide">
                      Real-time Ledger
                    </span>
                  </div>

                  {activeDonations.length === 0 ? (
                    <p className="text-xs text-gray-550 font-semibold text-center py-6">
                      No active donations scheduled for transport. Initiate a return to start the flow.
                    </p>
                  ) : (
                    <div className="space-y-8 divide-y divide-gray-100 pt-1">
                      {activeDonations.map((donation, dIdx) => {
                        const statuses = ['Created', 'Pickup Scheduled', 'Picked Up', 'Delivered', 'Impact Recorded'];
                        const currentStep = statuses.indexOf(donation.status);

                        return (
                          <div key={donation._id} className={`${dIdx > 0 ? 'pt-6' : ''} space-y-5`}>
                            <div className="flex justify-between items-center gap-4 flex-wrap text-xs">
                              <div className="flex gap-4 items-center">
                                <img src={donation.productImage} alt={donation.productName} className="w-10 h-10 object-contain rounded border bg-white p-1" />
                                <div>
                                  <span className="font-bold text-gray-900 block leading-tight">{donation.productName}</span>
                                  <span className="text-[10px] text-gray-500 block">Certificate ID: {donation.certificateId}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 font-bold">Logistics:</span>
                                <span className="bg-[#fcf3d7] text-[#c45500] px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                                  {donation.status}
                                </span>
                                
                                <button
                                  type="button"
                                  onClick={() => handleAdvanceStatus(donation._id)}
                                  disabled={advancingId === donation._id || donation.status === 'Impact Recorded'}
                                  className="bg-[#232f3e] hover:bg-gray-800 text-[#ffa41c] text-[9px] px-2.5 py-1 rounded font-extrabold flex items-center gap-1 shadow disabled:opacity-50 cursor-pointer"
                                  title="Simulate dispatch updates"
                                >
                                  {advancingId === donation._id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Play className="h-2.5 w-2.5 fill-[#ffa41c]" />
                                  )}
                                  Dispatch Update
                                </button>
                              </div>
                            </div>

                            {/* Timeline Slider */}
                            <div className="relative pt-2">
                              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10" />
                              <div 
                                className="absolute top-5 left-0 h-1 bg-emerald-500 -z-10 transition-all duration-300" 
                                style={{ width: `${(currentStep / (statuses.length - 1)) * 100}%` }}
                              />
                              <div className="flex justify-between text-[9px] font-bold text-gray-500">
                                {statuses.map((stepName, stepIdx) => {
                                  const isActive = stepIdx <= currentStep;
                                  const isCurrent = stepIdx === currentStep;
                                  return (
                                    <div key={stepIdx} className="flex flex-col items-center text-center space-y-2 max-w-[70px]">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                                        isCurrent ? 'bg-orange-50 border-[#ffa41c] text-[#ffa41c]' :
                                        isActive ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300 text-gray-400'
                                      }`}>
                                        {isActive && !isCurrent ? (
                                          <Check className="h-3 w-3 stroke-[3]" />
                                        ) : (
                                          <span>{stepIdx + 1}</span>
                                        )}
                                      </div>
                                      <span className={`block font-extrabold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {stepName.replace(' ', '\n')}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Logs */}
                            <div className="bg-gray-50 border border-gray-150 p-3 rounded text-[11px] leading-normal text-gray-700 font-semibold space-y-1">
                              <span className="text-[9px] text-gray-400 uppercase tracking-wider block font-black">Transport Log Ledger</span>
                              {donation.timeline.slice(-1).map((log, idx) => (
                                <div key={idx} className="flex justify-between gap-4">
                                  <span>• {log.description}</span>
                                  <span className="text-gray-400 shrink-0">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Certificates list */}
                <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm space-y-4">
                  <h2 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-200 flex items-center gap-1.5">
                    <FileText className="h-5 w-5 text-emerald-600" /> Circular Donation Certificates
                  </h2>
                  
                  {completedDonations.length === 0 ? (
                    <p className="text-xs text-gray-550 font-semibold text-center py-4">
                      No certificates unlocked. Completed NGO donations generate printable PDF-style documents.
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-100 text-xs">
                      {completedDonations.map((don) => (
                        <div key={don._id} className="py-3 flex justify-between items-center gap-4 flex-wrap font-semibold bg-white">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-gray-800 block">{don.productName}</span>
                            <span className="text-gray-550 block">Donated to {don.organizationName} on {new Date(don.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setActiveCertificate(don)}
                            className="px-3.5 py-1.5 bg-[#f0faf5] hover:bg-[#e0f2e9] text-emerald-800 font-extrabold rounded border border-emerald-250 flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="h-3.5 w-3.5 text-emerald-600" /> View Certificate
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Badges & Contributors (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Achievements Badges */}
                <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm space-y-3.5">
                  <h2 className="text-base font-bold text-gray-955 pb-2 border-b border-gray-200 flex items-center gap-1">
                    <Sparkles className="h-4.5 w-4.5 text-[#ffa41c]" /> Achievement Badges
                  </h2>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-300" title="First donation completed">
                        🌱
                      </div>
                      <span className="text-[8px] text-gray-500 font-extrabold block mt-1 leading-tight">First Life</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        donations.some(d => d.productName.toLowerCase().includes('laptop') || d.productName.toLowerCase().includes('tablet'))
                          ? 'bg-purple-100 border-purple-300' : 'bg-gray-100 border-gray-200 grayscale opacity-40'
                      }`} title="Digital educational item donated">
                        🎓
                      </div>
                      <span className="text-[8px] text-gray-500 font-extrabold block mt-1 leading-tight">Edu Sponsor</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        totalCo2 >= 100 ? 'bg-emerald-100 border-emerald-300' : 'bg-gray-100 border-gray-200 grayscale opacity-40'
                      }`} title="Saved 100kg+ CO2 emissions">
                        🌿
                      </div>
                      <span className="text-[8px] text-gray-500 font-extrabold block mt-1 leading-tight">Carbon Pro</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-full bg-[#fcf3d7] flex items-center justify-center border-2 border-yellow-300" title="Sustainable return member">
                        🛡️
                      </div>
                      <span className="text-[8px] text-gray-550 font-extrabold block mt-1 leading-tight">Eco Shield</span>
                    </div>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-gray-955 pb-2 border-b border-gray-200 flex items-center gap-1.5">
                    <Users className="h-5 w-5 text-blue-700" /> Top Contributors
                  </h2>
                  
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((u, idx) => (
                      <div key={idx} className="flex justify-between items-center gap-3 text-xs font-semibold bg-white">
                        <div className="flex gap-2 items-center">
                          <span className="text-gray-400 font-bold text-sm w-4">{idx + 1}</span>
                          <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover border" />
                          <span className="text-gray-850 font-extrabold truncate max-w-[110px]">{u.name}</span>
                        </div>
                        
                        <div className="text-right text-[10px] text-gray-500 font-bold space-y-0.5">
                          <span className="text-emerald-800 block">🌿 {u.co2Saved} kg CO₂</span>
                          <span className="block text-[#e47911]">{u.lifetimeCredits} Credits</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 4: REWARDS STORE */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            
            {/* Header Points card */}
            <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                  <Gift className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Green Rewards Store</h3>
                  <p className="text-xs text-gray-550 font-semibold mt-0.5">
                    Exchange circular economy green credits for shopping vouchers.
                  </p>
                </div>
              </div>
              
              <div className="bg-[#f0faf5] border border-emerald-250 rounded py-2 px-6 text-center min-w-[180px] shrink-0">
                <span className="text-[9px] text-emerald-800 font-black uppercase tracking-wider block">Your Balance</span>
                <span className="text-2xl font-extrabold text-emerald-700">{user.currentCredits}</span>
                <span className="text-[9px] text-gray-400 font-bold block mt-0.5">Credits ({user.tier})</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-xs text-red-800 rounded-md flex items-center gap-2 font-semibold animate-pulse">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Coupon Code generated */}
            {successCoupon && (
              <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-emerald-400 text-xs rounded-lg space-y-3 relative shadow-md">
                <button 
                  onClick={() => setSuccessCoupon(null)} 
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-650 font-extrabold cursor-pointer text-sm"
                >
                  ✕
                </button>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-500 text-white rounded-full shrink-0">
                    <Check className="h-4.5 w-4.5 stroke-[3]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-emerald-900 text-sm">Voucher Code Generated Successfully!</h4>
                    <p className="text-[11px] text-emerald-700 leading-relaxed font-semibold">
                      Deducted <strong className="text-emerald-900">{successCoupon.cost} credits</strong> from your wallet. Apply this code at checkout to claim your reward.
                    </p>
                  </div>
                </div>

                <div className="max-w-xs bg-white border border-dashed border-emerald-300 p-3 rounded mx-auto text-center space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold block uppercase tracking-wider">Coupon Code (Copy & Apply)</span>
                  <span className="font-mono font-black text-lg text-emerald-800 tracking-widest block">{successCoupon.code}</span>
                  <span className="text-[10px] text-[#febd69] font-bold block">{successCoupon.reward}</span>
                </div>
              </div>
            )}

            {/* Rewards Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {REWARDS.map((reward) => {
                const isAffordable = user.currentCredits >= reward.cost;
                
                return (
                  <div key={reward.id} className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
                    <div className={`bg-gradient-to-r ${reward.color} p-4 text-white relative`}>
                      {reward.badge && (
                        <span className="absolute top-2.5 right-2.5 bg-white text-gray-900 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm">
                          {reward.badge}
                        </span>
                      )}
                      <Ticket className="h-6 w-6 opacity-30 absolute bottom-2 right-2 text-white" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-white/75 block">Shopping Discount</span>
                      <h3 className="text-lg font-black tracking-tight">{reward.reward}</h3>
                    </div>

                    <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-655 font-medium leading-relaxed font-semibold">
                          {reward.description}
                        </p>
                        <span className="text-xs text-gray-400 font-bold block pt-1">
                          Exchange rate: {reward.cost} credits
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-xs">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-400 font-semibold uppercase">Cost</span>
                          <span className="font-extrabold text-[#c45500] text-sm">{reward.cost} pts</span>
                        </div>

                        <button
                          onClick={() => handleRedeem(reward)}
                          disabled={!isAffordable || redeemingId === reward.id}
                          className={`px-4 py-1.5 rounded text-[11px] font-bold shadow-sm transition-all flex items-center gap-1.5 ${
                            redeemingId === reward.id ? 'bg-gray-100 text-gray-400 border border-gray-300' :
                            isAffordable 
                              ? 'bg-[#ffd814] hover:bg-[#f7ca00] text-black border border-[#f0c14b] cursor-pointer'
                              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                          }`}
                        >
                          {redeemingId === reward.id ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" /> Claiming...
                            </>
                          ) : (
                            'Claim Coupon'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rewards FAQ terms */}
            <section className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm space-y-2 text-xs text-gray-500 leading-relaxed font-medium">
              <h4 className="font-bold text-gray-800 text-sm">Coupon Usage Terms</h4>
              <p>
                Vouchers redeemed here are valid for 90 days from the date of issue. Once credits are traded, they cannot be refunded. Standard product return guidelines apply, but coupon discount values are non-refundable in the event of a product return.
              </p>
            </section>

          </div>
        )}

      </main>

      {/* CERTIFICATE PRINTABLE MODAL OVERLAY */}
      {activeCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto font-sans text-black">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-2xl p-8 space-y-6 relative print:p-0 print:shadow-none print:border-none">
            
            <button
              onClick={() => setActiveCertificate(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black hover:bg-gray-200 p-1.5 rounded-full print:hidden"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Border Frame */}
            <div className="border-8 border-double border-emerald-600 p-8 text-center space-y-6 bg-[#fcfdfa] relative">
              
              <div className="absolute top-4 right-4 w-16 h-16 border-4 border-dashed border-yellow-500 rounded-full flex items-center justify-center text-[10px] font-black text-yellow-600 bg-yellow-50/50 uppercase rotate-12">
                Certified
              </div>

              <div className="space-y-1.5">
                <Leaf className="h-10 w-10 text-emerald-600 mx-auto" />
                <h1 className="text-2xl font-black text-emerald-900 tracking-wider font-serif">CERTIFICATE OF SUSTAINABILITY</h1>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Amazon Circular Commerce Alliance</span>
              </div>

              <div className="space-y-1 text-xs text-gray-655 font-medium leading-relaxed">
                <p>This document verifies that a verified Amazon customer item has been successfully evaluated,</p>
                <p>prevented from entering corporate landfills, and routed directly to charity.</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-gray-400 uppercase tracking-wider block font-bold">This certificate is proudly awarded to</span>
                <span className="text-xl font-bold text-gray-900 border-b border-gray-300 pb-1 px-8 inline-block font-serif">
                  {user ? user.name : 'Amazon Customer'}
                </span>
              </div>

              <div className="space-y-2 max-w-md mx-auto text-xs text-gray-755 font-semibold bg-white p-4 rounded border border-gray-150 leading-relaxed shadow-sm">
                <p>For donating <strong>{activeCertificate.productName}</strong> ({activeCertificate.brand})</p>
                <p>to <strong>{activeCertificate.organizationName}</strong> ({activeCertificate.organizationType}).</p>
                <div className="border-t border-gray-100 pt-2 mt-2 grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-gray-400 block font-normal uppercase">Environmental Impact:</span>
                    <span className="text-emerald-700 font-extrabold">🌿 {activeCertificate.co2Savings}kg CO₂ Saved</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-normal uppercase">Beneficiaries Helped:</span>
                    <span className="text-blue-800 font-extrabold">{activeCertificate.beneficiariesHelped} {activeCertificate.beneficiaryType}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 max-w-sm mx-auto text-xs">
                <div className="border-t border-gray-350 pt-1 text-center text-gray-500 font-semibold">
                  <span>{new Date(activeCertificate.createdAt).toLocaleDateString()}</span>
                  <span className="text-[9px] text-gray-400 block font-normal uppercase tracking-wider">Donation Date</span>
                </div>
                <div className="border-t border-gray-350 pt-1 text-center text-gray-500 font-semibold">
                  <span className="font-mono font-bold text-gray-700">{activeCertificate.certificateId}</span>
                  <span className="text-[9px] text-gray-400 block font-normal uppercase tracking-wider">Verification Serial</span>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setActiveCertificate(null)}
                className="px-4 py-2 border border-gray-300 rounded text-xs font-bold text-gray-755 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-sm border border-emerald-600 cursor-pointer"
              >
                <FileText className="h-4.5 w-4.5" /> Print / PDF Certificate
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
