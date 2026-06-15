'use client';

import React, { useState, useEffect } from 'react';
import AmazonHeader from '../../components/AmazonHeader';
import FlashDealCard, { FlashDeal } from '../../components/FlashDealCard';
import { API_URL } from '@/config';
import { Tag, Sparkles, Navigation, CheckCircle2, Clock, DollarSign, Award, Truck, BarChart3, AlertCircle, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Analytics {
  totalCreated: number;
  totalClaimed: number;
  avgClaimTime: number;
  revenueRecovered: number;
  recoveryScore: number;
  inventoryDiverted: number;
  sameDayDeliveries: number;
}

export default function FlashDealsDashboard() {
  const [deals, setDeals] = useState<FlashDeal[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'claimed' | 'expired'>('live');
  const [selectedClaimedDeal, setSelectedClaimedDeal] = useState<FlashDeal | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Push Notification simulation states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState<any>(null);

  const fetchData = async () => {
    try {
      const dealsRes = await fetch(`${API_URL}/api/flash-deals`);
      if (dealsRes.ok) {
        const dealsData = await dealsRes.json();
        setDeals(dealsData);
        
        // Auto-select first claimed deal if available for visualization
        const claimed = dealsData.filter((d: FlashDeal) => d.status === 'Claimed');
        if (claimed.length > 0 && !selectedClaimedDeal) {
          setSelectedClaimedDeal(claimed[0]);
        }
      }

      const analyticsRes = await fetch(`${API_URL}/api/flash-deals/analytics`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.error('Error fetching flash deal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Simulate incoming Flash Deal notification banner after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotificationData({
        name: 'Amazon Echo Dot (5th Gen)',
        discountPercent: 15,
        originalPrice: 4499,
        dealPrice: 3824,
        distanceKm: 12
      });
      setShowNotification(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleClaimSuccess = (updatedDeal: FlashDeal) => {
    fetchData();
    setSelectedClaimedDeal(updatedDeal);
  };

  const getFilteredDeals = () => {
    if (activeTab === 'live') {
      return deals.filter(d => d.status === 'Active');
    } else if (activeTab === 'claimed') {
      return deals.filter(d => d.status === 'Claimed');
    } else {
      return deals.filter(d => d.status === 'Expired');
    }
  };

  const activeFilteredDeals = getFilteredDeals();

  return (
    <div className="bg-[#eaeded] min-h-screen text-black pb-12 font-sans relative">
      <AmazonHeader />

      {/* Push Notification Toast Notification */}
      {showNotification && notificationData && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white border-l-4 border-orange-500 rounded-md shadow-2xl p-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-start">
            <div className="flex gap-2.5">
              <div className="h-9 w-9 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                <Tag className="h-5 w-5 text-orange-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-orange-700 tracking-wider uppercase">⚡ FLASH DEAL ALERT</h4>
                <p className="text-xs font-bold text-gray-900">{notificationData.name} Available Nearby</p>
                <p className="text-[11px] text-gray-650">
                  Claim this open-box return within 15 minutes for <strong>{notificationData.discountPercent}% Off</strong> (₹{notificationData.dealPrice} only).
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-bold">
                    📍 {notificationData.distanceKm} km away
                  </span>
                  <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded font-bold">
                    Same-day delivery
                  </span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowNotification(false)} className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setShowNotification(false);
                setActiveTab('live');
              }}
              className="bg-[#ffd814] hover:bg-[#f7ca00] text-black font-bold text-[10px] px-3 py-1.5 rounded shadow-sm border border-[#e2c027] cursor-pointer"
            >
              View Opportunity
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Header Breadcrumbs & Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-md shadow border border-gray-250">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold mb-1">
              <Link href="/" className="hover:underline">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/green-wallet" className="hover:underline">Sustainability Hub</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-800">Flash Deals</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              ⚡ Hyperlocal Flash Deal Engine <span className="bg-[#002f6c] text-[#febd69] text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Circular Loop</span>
            </h1>
            <p className="text-xs text-gray-650 mt-1 max-w-xl">
              Amazon Return Recovery Hub. High-quality electronics returns (Condition Score &gt; 75) are immediately routed to local city hubs and matched with nearby demand to prevent redundant warehouse transit.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-md flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <Award className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-[10px] text-emerald-800 font-black uppercase tracking-wider">Transport Reduction Reward</div>
              <div className="text-xs text-emerald-700 font-medium">Claim deals to save logistics emissions and earn <strong className="font-extrabold text-emerald-800">+50 Green Credits</strong> per claim!</div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {/* Widget 1: Created */}
            <div className="bg-white p-4 rounded-md shadow border border-gray-250 flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Flash Deals Created</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-gray-900">{analytics.totalCreated}</span>
                <span className="bg-gray-100 text-gray-600 text-[9px] px-1 py-0.5 rounded font-bold">100% inspected</span>
              </div>
            </div>

            {/* Widget 2: Claimed */}
            <div className="bg-white p-4 rounded-md shadow border border-gray-250 flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Deals Claimed</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-emerald-600">{analytics.totalClaimed}</span>
                <span className="bg-emerald-50 text-emerald-700 text-[9px] px-1 py-0.5 rounded font-bold">
                  {Math.round((analytics.totalClaimed / analytics.totalCreated) * 100)}% Claim Rate
                </span>
              </div>
            </div>

            {/* Widget 3: Average Claim Time */}
            <div className="bg-white p-4 rounded-md shadow border border-gray-250 flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Avg Claim Speed</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-blue-600">{analytics.avgClaimTime} min</span>
                <span className="bg-blue-50 text-blue-700 text-[9px] px-1 py-0.5 rounded font-bold">Instantly matched</span>
              </div>
            </div>

            {/* Widget 4: Revenue Recovered */}
            <div className="bg-white p-4 rounded-md shadow border border-gray-250 flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Revenue Recovered</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-gray-900">₹{analytics.revenueRecovered.toLocaleString('en-IN')}</span>
                <span className="bg-yellow-50 text-yellow-800 text-[9px] px-1 py-0.5 rounded font-bold">Direct return sale</span>
              </div>
            </div>

            {/* Widget 5: Amazon Recovery Score */}
            <div className="bg-white p-4 rounded-md shadow border border-[#febd69] bg-gradient-to-b from-[#febd69]/5 to-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#febd69] text-gray-900 font-black text-[8px] px-2 py-0.5 rounded-bl">KEY KPI</div>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Recovery Score</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-[#e47911]">{analytics.recoveryScore}%</span>
                <span className="text-gray-500 text-[9px] font-bold">vs 48% normal</span>
              </div>
            </div>

            {/* Widget 6: Same-Day Deliveries */}
            <div className="bg-white p-4 rounded-md shadow border border-gray-250 flex flex-col justify-between">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Warehouse Diverted</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-emerald-700">{analytics.inventoryDiverted} items</span>
                <span className="bg-emerald-50 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold">0km double transit</span>
              </div>
            </div>

          </div>
        )}

        {/* Dashboard layout splits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT 2 COLUMNS: Deals Grid and Tabs */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Navigation Tabs */}
            <div className="bg-white border border-gray-200 rounded-md p-1.5 flex gap-2 shadow-sm">
              <button
                onClick={() => setActiveTab('live')}
                className={`flex-grow md:flex-initial px-5 py-2.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === 'live'
                    ? 'bg-[#131921] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Clock className="h-4 w-4" /> Live Opportunities ({deals.filter(d => d.status === 'Active').length})
              </button>
              
              <button
                onClick={() => setActiveTab('claimed')}
                className={`flex-grow md:flex-initial px-5 py-2.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === 'claimed'
                    ? 'bg-[#131921] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" /> Claimed / Assigned ({deals.filter(d => d.status === 'Claimed').length})
              </button>

              <button
                onClick={() => setActiveTab('expired')}
                className={`flex-grow md:flex-initial px-5 py-2.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === 'expired'
                    ? 'bg-[#131921] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <AlertCircle className="h-4 w-4" /> Expired Deals ({deals.filter(d => d.status === 'Expired').length})
              </button>
            </div>

            {/* Loading / Results grid */}
            {loading ? (
              <div className="bg-white border border-gray-250 p-12 rounded-md shadow-sm text-center flex flex-col items-center justify-center space-y-3">
                <div className="h-10 w-10 border-4 border-gray-300 border-t-[#ffd814] rounded-full animate-spin" />
                <span className="text-xs text-gray-500 font-bold">Querying local city hub inventory...</span>
              </div>
            ) : activeFilteredDeals.length === 0 ? (
              <div className="bg-white border border-gray-250 p-12 rounded-md shadow-sm text-center space-y-2">
                <Tag className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="font-bold text-gray-800 text-sm">No deals in this category</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {activeTab === 'live'
                    ? 'All local returns have been successfully claimed or timed out. Check back soon for new opportunities!'
                    : 'No deals recorded here yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeFilteredDeals.map((deal) => (
                  <FlashDealCard
                    key={deal._id}
                    deal={deal}
                    onClaimSuccess={handleClaimSuccess}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Product Journey Visualization & Help */}
          <div className="space-y-6">
            
            {/* Visual 1: Product Journey Timeline */}
            <div className="bg-white border border-gray-250 rounded-md p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-black text-sm text-gray-900 tracking-wide uppercase">📦 Hyperlocal Product Journey</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Real-time circular logistics route mapping</p>
              </div>

              {selectedClaimedDeal ? (
                <div className="space-y-4">
                  {/* Selected product banner */}
                  <div className="bg-slate-50 border border-gray-200 rounded p-3 flex items-center gap-3">
                    <img src={selectedClaimedDeal.productImage} className="h-9 w-9 object-contain bg-white border rounded p-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-gray-900 truncate">{selectedClaimedDeal.productName}</div>
                      <div className="text-[9px] text-gray-500">Claimed by {selectedClaimedDeal.assignedBuyer || 'Demo Buyer'}</div>
                    </div>
                  </div>

                  {/* Vertical Timeline */}
                  <div className="relative pl-6 border-l-2 border-emerald-500 space-y-5 ml-3">
                    
                    {/* Step 1: Purchased */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 h-4 w-4 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                      </div>
                      <div className="text-[11px] font-bold text-gray-900">Product Purchased</div>
                      <p className="text-[9px] text-gray-500">Original order logged in Amazon Purchase Ledger.</p>
                    </div>

                    {/* Step 2: Returned */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 h-4 w-4 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                      </div>
                      <div className="text-[11px] font-bold text-gray-900">Product Returned</div>
                      <p className="text-[9px] text-gray-500">Customer initiated return; picked up locally.</p>
                    </div>

                    {/* Step 3: AI Evaluated */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 h-4 w-4 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                      </div>
                      <div className="text-[11px] font-bold text-gray-900">AI Quality Inspection Passed</div>
                      <p className="text-[9px] text-gray-500">FastAPI scans confirmed Grade: <strong>{selectedClaimedDeal.conditionGrade}</strong> ({selectedClaimedDeal.conditionScore}% score).</p>
                    </div>

                    {/* Step 4: Flash Deal Created */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 h-4 w-4 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                      </div>
                      <div className="text-[11px] font-bold text-gray-900">Flash Deal Created at City Hub</div>
                      <p className="text-[9px] text-gray-500">Listed with {selectedClaimedDeal.discountPercent}% discount at {selectedClaimedDeal.hubLocation}.</p>
                    </div>

                    {/* Step 5: Buyer Claimed */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 h-4 w-4 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                      </div>
                      <div className="text-[11px] font-bold text-gray-900">Nearby Buyer Assigned</div>
                      <p className="text-[9px] text-gray-500">Inventory reserved on the spot. Local delivery route optimized.</p>
                    </div>

                    {/* Step 6: Delivery */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 h-4 w-4 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center animate-ping">
                        <div className="h-1.5 w-1.5 bg-white rounded-full" />
                      </div>
                      <div className="text-[11px] font-bold text-amber-700">Out for Same-Day Delivery</div>
                      <p className="text-[9px] text-gray-500">Optimized dispatch from Hub. Expected arrival within 3-6 hours.</p>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded p-6 text-center text-xs text-gray-500">
                  Select or claim a deal from the "Claimed" tab to visualize its circular route lifecycle.
                </div>
              )}
            </div>

            {/* Visual 2: Circular Decision Tree */}
            <div className="bg-white border border-gray-250 rounded-md p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-black text-sm text-gray-900 tracking-wide uppercase">💡 AI Return Decision Matrix</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">How returns are evaluated and routed</p>
              </div>

              <div className="space-y-2.5 text-[11px] text-gray-750 font-medium">
                <div className="border border-gray-200 rounded p-2.5 space-y-1">
                  <div className="font-bold text-gray-950">1. Customer Uploads Video</div>
                  <p className="text-[10px] text-gray-500">AI Vision Engine scans verification codes and cosmetic/hardware logs.</p>
                </div>
                <div className="border border-gray-200 rounded p-2.5 space-y-1 bg-amber-50/50 border-amber-200">
                  <div className="font-bold text-amber-800">2. Proximity & Quality Thresholds</div>
                  <p className="text-[10px] text-gray-500">If condition score is &gt; 75 and local interest is high, the item is sent to the local City Hub for a <strong>Flash Deal</strong>.</p>
                </div>
                <div className="border border-gray-200 rounded p-2.5 space-y-1 bg-emerald-50/50 border-emerald-200">
                  <div className="font-bold text-emerald-800">3. Alternate Circular Routing</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-gray-500">
                    <li>Condition Excellent &rarr; Standard Resell</li>
                    <li>High Social Needs &rarr; NGO Match (Donation)</li>
                    <li>Blemished Electronics &rarr; Refurbish Loop</li>
                    <li>Unusable &rarr; Recycle Depot</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
