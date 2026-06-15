'use client';

import React, { useState, useEffect, Suspense } from 'react';
import AmazonHeader from '../../components/AmazonHeader';
import { HeartHandshake, ShieldCheck, MapPin, Sparkles, ArrowLeft, Leaf, Gift, Truck, Check, Loader2, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Organization {
  name: string;
  type: string;
  address: string;
  distanceKm: number;
  lat: number;
  lng: number;
  beneficiaryType: string;
  estimatedBeneficiaries: number;
  matchScore: number;
}

interface ProductDetails {
  orderId: string;
  productName: string;
  brand: string;
  category: string;
  productImage: string;
  conditionScore: number;
  conditionCategory: string;
  impact: {
    credits: number;
    co2Saved: number;
    wastePrevented: number;
    beneficiariesCount: number;
    impactText: string;
  };
}

function DonationOpportunitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const scoreParam = searchParams.get('conditionScore');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data States
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userAddress, setUserAddress] = useState('');
  const [userZip, setUserZip] = useState('');

  // Selection States
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submittingDonation, setSubmittingDonation] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState<any | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Missing order identifier.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch AI evaluation results for the product return
        const evalRes = await fetch(`http://localhost:5000/api/orders/${orderId}/evaluate-return`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conditionScore: scoreParam ? parseInt(scoreParam) : undefined })
        });
        
        if (!evalRes.ok) {
          throw new Error('Failed to evaluate product condition.');
        }
        const evalData = await evalRes.json();
        setProduct(evalData);

        // 2. Discover nearby organizations using user's location via backend Places query
        const orgRes = await fetch(`http://localhost:5000/api/sustainability/donation-places?category=${evalData.category}&conditionScore=${evalData.conditionScore}`);
        if (!orgRes.ok) {
          throw new Error('Failed to fetch nearby organizations.');
        }
        const orgData = await orgRes.json();
        setOrganizations(orgData.organizations);
        setUserAddress(orgData.address);
        setUserZip(orgData.zipCode);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error communicating with backend services.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, scoreParam]);

  const handleSelectOrg = (org: Organization) => {
    setSelectedOrg(org);
    setShowConfirmModal(true);
  };

  const handleConfirmDonation = async () => {
    if (!product || !selectedOrg) return;
    setSubmittingDonation(true);
    try {
      const res = await fetch('http://localhost:5000/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: product.orderId,
          orgName: selectedOrg.name,
          orgType: selectedOrg.type,
          distanceKm: selectedOrg.distanceKm,
          matchScore: selectedOrg.matchScore,
          beneficiaries: selectedOrg.estimatedBeneficiaries,
          beneficiaryType: selectedOrg.beneficiaryType,
          conditionScore: product.conditionScore,
          conditionCategory: product.conditionCategory,
          co2Savings: product.impact.co2Saved,
          wastePrevented: product.impact.wastePrevented,
          greenCreditsEarned: product.impact.credits,
          impactStory: product.impact.impactText
        })
      });

      if (!res.ok) {
        throw new Error('Failed to register donation.');
      }

      const data = await res.json();
      setDonationSuccess(data.donation);
      
      // Dispatch layout storage update to sync headers
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
    } finally {
      setSubmittingDonation(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen text-black font-sans">
        <AmazonHeader />
        <div className="flex flex-col items-center justify-center py-32 space-y-3">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-[#e47911] rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-semibold">Intelligently discovering nearby charity networks...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white min-h-screen text-black font-sans">
        <AmazonHeader />
        <main className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-750">Routing Query Error</h2>
          <p className="text-gray-655">{error || 'Could not load return parameters.'}</p>
          <Link href="/orders" className="inline-block bg-[#febd69] hover:bg-[#f3a847] text-black font-bold px-4 py-2 rounded text-xs">
            Return to Orders
          </Link>
        </main>
      </div>
    );
  }

  // Calculate dynamic parameters
  const remainingLife = (product.conditionScore / 20).toFixed(1);

  return (
    <div className="bg-gray-100 min-h-screen text-black pb-16 font-sans">
      <AmazonHeader />

      <main className="max-w-6xl mx-auto px-4 py-6">
        
        {/* Navigation back */}
        <Link href="/orders" className="text-xs text-[#007185] hover:text-[#c45500] hover:underline mb-6 font-bold flex items-center gap-1.5 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-4">
          
          {/* Left Column: Product Info & Environmental Impact */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Product card info */}
            <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-950 pb-2 border-b border-gray-200">
                Item Evaluated
              </h2>
              <div className="flex gap-4 items-center">
                <img src={product.productImage} alt={product.productName} className="w-20 h-20 object-contain rounded border border-gray-200 p-1 bg-white" />
                <div className="space-y-1">
                  <h3 className="font-bold text-xs text-gray-800 line-clamp-2 leading-snug">{product.productName}</h3>
                  <p className="text-[10px] text-gray-500 font-bold">Category: {product.category}</p>
                  <p className="text-[10px] text-orange-700 font-bold">Condition Score: {product.conditionScore}/100 ({product.conditionCategory})</p>
                </div>
              </div>
              <div className="bg-orange-50/50 border border-orange-200 p-3 rounded text-center text-xs font-bold text-gray-700">
                <span>Estimated Remaining Life: </span>
                <span className="text-orange-700 text-sm font-extrabold">{remainingLife} Years</span>
              </div>
            </div>

            {/* Environmental Impact Metrics card */}
            <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-950 pb-2 border-b border-gray-200 flex items-center gap-1">
                <Leaf className="h-4.5 w-4.5 text-emerald-600" /> Circular Impact Metrics
              </h2>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 font-semibold text-gray-750">
                  <span>Carbon Offset Saving:</span>
                  <span className="text-emerald-700 font-extrabold flex items-center gap-0.5">
                    🌿 {product.impact.co2Saved} kg CO₂
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 font-semibold text-gray-750">
                  <span>Waste Prevented:</span>
                  <span className="text-emerald-800 font-extrabold">
                    📦 {product.impact.wastePrevented} kg Landfill Diverted
                  </span>
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-750">
                  <span>Green Credits Earned:</span>
                  <span className="text-orange-700 font-black flex items-center gap-0.5">
                    <Gift className="h-4 w-4" /> +{product.impact.credits} Credits
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                * Environmental factors calculated using the Amazon Circular Commerce ledger based on manufacturing emissions and packaging materials.
              </p>
            </div>

            {/* Delivery address banner */}
            <div className="bg-[#f7fafe] border border-[#d8e8fc] p-4 rounded-lg shadow-sm space-y-2 text-xs">
              <span className="font-bold text-blue-900 block flex items-center gap-1">
                <MapPin className="h-4 w-4" /> User Shipping Address
              </span>
              <p className="text-gray-700 leading-normal font-semibold">
                {userAddress} (Zip: {userZip})
              </p>
              <p className="text-[10px] text-gray-500 font-medium">
                Organizations are discovered automatically based on this address. No pincode input required.
              </p>
            </div>

          </div>

          {/* Right Column: NGO Discovery results list */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm space-y-6">
              <div className="border-b border-gray-200 pb-3.5 space-y-1">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <HeartHandshake className="h-6.5 w-6.5 text-emerald-600" /> Optimal Donation Match Opportunities
                </h1>
                <p className="text-xs text-gray-500 font-semibold">
                  Intelligent matching engine evaluated organizations based on category relevance, distance from your address, and impact potential.
                </p>
              </div>

              {organizations.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500 font-semibold">
                  No matching organizations discovered within 100km radius.
                </div>
              ) : (
                <div className="space-y-4">
                  {organizations.map((org, idx) => (
                    <div 
                      key={idx}
                      className="border border-gray-200 rounded-lg p-5 hover:border-emerald-500 hover:shadow-md transition-all duration-200 bg-white grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                    >
                      {/* Left: Score Badge */}
                      <div className="md:col-span-2 flex flex-col items-center justify-center p-3.5 bg-gray-50 rounded-lg border border-gray-150">
                        <span className="text-[9px] text-gray-450 uppercase font-black tracking-wider block">Match Score</span>
                        <span className="text-2xl font-extrabold text-emerald-700">{org.matchScore}</span>
                        <span className="text-[9px] text-[#007185] font-bold block mt-1">out of 100</span>
                      </div>

                      {/* Middle: Details */}
                      <div className="md:col-span-7 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-sm text-gray-900 leading-tight">
                            {org.name}
                          </h3>
                          <span className="bg-emerald-50 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wide">
                            {org.type}
                          </span>
                        </div>
                        <p className="text-gray-500 font-semibold flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>{org.address}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-blue-800 font-bold">{org.distanceKm} km away</span>
                        </p>
                        
                        <p className="text-gray-700 font-semibold flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5 text-[#ff9900]" />
                          <span>Supports <strong>{org.estimatedBeneficiaries} {org.beneficiaryType}</strong> in the local district.</span>
                        </p>
                      </div>

                      {/* Right: Button */}
                      <div className="md:col-span-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSelectOrg(org)}
                          className="w-full md:w-auto bg-[#ff9900] hover:bg-[#e68a00] text-black font-extrabold text-xs px-5 py-2.5 rounded shadow-sm hover:shadow transition-all border border-[#a88734] cursor-pointer text-center"
                        >
                          Donate Here
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>

      </main>

      {/* Confirmation & AI Impact Story Modal */}
      {showConfirmModal && selectedOrg && !donationSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#ffa41c]" />
                <h3 className="text-base font-bold">AI Impact Story Preview</h3>
              </div>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              
              {/* Highlight AI Impact Story */}
              <div className="bg-[#f0faf5] border-2 border-emerald-500/30 p-5 rounded-lg space-y-3">
                <div className="flex items-center gap-1.5">
                  <HeartHandshake className="h-5 w-5 text-emerald-600" />
                  <span className="font-extrabold text-emerald-900 uppercase tracking-wider text-xs">Social Impact Generated</span>
                </div>
                <p className="text-sm font-bold text-emerald-950 leading-relaxed italic font-serif">
                  "{product.impact.impactText}"
                </p>
                <p className="text-xs text-emerald-800 leading-normal font-medium">
                  By routing this return directly to <strong>{selectedOrg.name}</strong>, Amazon prevents packaging wastage, bypasses long warehouse storage loops, and brings digital resources directly into local centers.
                </p>
              </div>

              <div className="space-y-2.5 text-xs font-semibold text-gray-700">
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Logistics Schedule</span>
                <div className="flex gap-3 bg-gray-50 p-3 rounded border border-gray-200">
                  <Truck className="h-5 w-5 text-[#e47911] mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-gray-900 block">Amazon Logistics Circular Courier</span>
                    <span className="block text-gray-500 font-medium leading-normal">
                      We will collect the item directly from your doorstep within 24 hours. No printer, packaging box, or returns label required.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDonation}
                  disabled={submittingDonation}
                  className="px-5 py-2 bg-[#ff9900] hover:bg-[#e68a00] text-black font-extrabold rounded text-xs flex items-center gap-1 border border-[#a88734] shadow-sm cursor-pointer"
                >
                  {submittingDonation ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scheduling...
                    </>
                  ) : (
                    'Confirm Donation'
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {donationSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden text-center p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <Check className="h-9 w-9 stroke-[3]" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900">Donation Confirmed!</h3>
              <p className="text-xs text-gray-550 font-semibold">
                Your item has been scheduled for Amazon Carrier pickup.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-250 p-4 rounded text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-emerald-200 pb-1 font-semibold text-emerald-800">
                <span>Credits Rewarded:</span>
                <span className="font-extrabold flex items-center gap-0.5">
                  <Gift className="h-3.5 w-3.5 text-emerald-600" /> +{donationSuccess.greenCreditsEarned} Credits
                </span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-800">
                <span>Certificate ID:</span>
                <span className="font-mono font-bold">{donationSuccess.certificateId}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push('/impact-dashboard')}
                className="w-full bg-[#ff9900] hover:bg-[#e68a00] text-black font-extrabold text-xs py-2.5 rounded shadow-sm border border-[#a88734] cursor-pointer flex items-center justify-center gap-1.5"
              >
                Go to Impact Dashboard <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DonationOpportunitiesPage() {
  return (
    <Suspense fallback={
      <div className="bg-white min-h-screen text-black font-sans">
        <AmazonHeader />
        <div className="flex flex-col items-center justify-center py-32 space-y-3">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-[#e47911] rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-semibold">Loading donation opportunities routing screen...</p>
        </div>
      </div>
    }>
      <DonationOpportunitiesContent />
    </Suspense>
  );
}
