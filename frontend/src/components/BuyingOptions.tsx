'use client';

import React, { useState } from 'react';
import { ShieldCheck, Info, Check, Award, AlertTriangle, Eye, Video, RefreshCw, X } from 'lucide-react';

interface BuyingOption {
  listingId: string;
  sellerName: string;
  sellerId: string;
  price: number;
  condition: string;
  conditionScore: number;
  trustScore: number;
  isPurchasedOnAmazon: boolean;
  isSellerVerified: boolean;
  isAiVerified: boolean;
  conditionNotes: string;
  description: string;
  video: string | null;
  images: string[];
  ownershipConfidence: number;
  functionalScore: number;
  productMatchScore?: number;
  proximityDetails?: {
    distanceKm: number;
    phase: string;
    audience: string;
    deliveryTime: string;
    saleTime: string;
  };
  buyerPrice: number;
  amazonFee: number;
  sustainabilityScore?: number;
  sustainabilityBadge?: string;
  co2Savings?: number;
  aiInspectionDetails: {
    condition: string;
    score: number;
    confidence: number;
    detectedIssues: string[];
    ownershipConfidence: number;
    functionalScore: number;
    productMatchScore: number;
    expectedAttributes?: {
      brand: string;
      model: string;
      category: string;
      color: string;
    };
    detectedAttributes?: {
      brand: string;
      model: string;
      category: string;
      color: string;
    };
    functionalChecks?: {
      powersOn?: boolean;
      chargingWorks?: boolean;
      cameraWorks?: boolean;
      speakerWorks?: boolean;
      wifiWorks?: boolean;
      touchWorks?: boolean;
      [key: string]: boolean | undefined;
    };
  } | null;
}

interface BuyingOptionsProps {
  options: BuyingOption[];
  onPurchaseSuccess: () => void;
}

export default function BuyingOptions({ options, onPurchaseSuccess }: BuyingOptionsProps) {
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const handleBuy = async (listingId: string) => {
    setPurchasingId(listingId);
    try {
      const response = await fetch(`http://localhost:5000/api/listings/${listingId}/buy`, {
        method: 'POST',
      });
      if (response.ok) {
        setPurchaseSuccess(true);
        setTimeout(() => {
          setPurchaseSuccess(false);
          onPurchaseSuccess();
        }, 3000);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to complete transaction.');
      }
    } catch (error) {
      console.error('Error purchasing listing:', error);
      alert('Error connecting to backend.');
    } finally {
      setPurchasingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOption(prev => (prev === id ? null : id));
  };

  if (options.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center text-sm text-gray-500">
        No customer resale offers available for this product yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success Modal */}
      {purchaseSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-2xl border border-gray-100 flex flex-col items-center space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600 font-bold" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Order Placed Successfully!</h3>
            <p className="text-sm text-gray-600">
              Your purchase of the customer used item is verified and processed under the 
              <strong> Amazon Resell Protection Guarantee</strong>.
            </p>
            <div className="bg-green-50 text-green-800 text-xs px-3 py-1.5 rounded font-medium">
              Order reference created on Amazon Ledger ✓
            </div>
          </div>
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative bg-black p-2 rounded-lg max-w-lg w-full">
            <button 
              onClick={() => setActiveVideo(null)} 
              className="absolute -top-10 right-0 text-white bg-black/40 hover:bg-black/80 p-1 rounded-full text-sm font-bold flex items-center gap-1"
            >
              <X className="h-5 w-5" /> Close
            </button>
            <video 
              src={`http://localhost:5000${activeVideo}`} 
              controls 
              autoPlay 
              className="w-full rounded h-auto max-h-[70vh]" 
            />
            <p className="text-xs text-gray-400 mt-2 text-center">
              Original Seller Inspection Video Upload (AI Scanned)
            </p>
          </div>
        </div>
      )}

      {/* Buying Options List */}
      <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wide flex justify-between">
          <span>Customer Resell Offers ({options.length})</span>
          <span className="text-[#007185] flex items-center gap-1 font-semibold normal-case">
            <ShieldCheck className="h-4 w-4" /> Amazon Trust Protected
          </span>
        </div>

        <div className="divide-y divide-gray-200">
          {options.map((option) => (
            <div key={option.listingId} className="p-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                               {/* Seller & Trust Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-base">
                      ₹{(option.buyerPrice || option.price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-500 font-normal">
                      (Includes ₹{(option.amazonFee || 0).toLocaleString('en-IN')} Amazon Resell Fee. Payout: ₹{option.price.toLocaleString('en-IN')})
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      option.condition === 'Like New' ? 'bg-[#cbf3f0] text-[#00bbf9]' :
                      option.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                      option.condition === 'Good' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Used - {option.condition}
                    </span>
                    <span className="text-xs text-gray-500">
                      Seller: <span className="font-semibold text-gray-800">{option.sellerName}</span>
                    </span>
                  </div>

                  {/* Trust metrics & badges */}
                  <div className="flex items-center gap-1.5 text-xs flex-wrap font-semibold">
                    <div className="flex items-center gap-1 bg-[#f0faf5] border border-emerald-200 px-2 py-0.5 rounded text-emerald-800 text-[10px]" title="Overall Trust Score calculated by Amazon Ledger and AI verification">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Trust Score: {option.trustScore}/100</span>
                    </div>

                    {option.isPurchasedOnAmazon && (
                      <span className="text-green-700 flex items-center gap-0.5 bg-green-50 border border-green-200 px-2 py-0.5 rounded text-[10px]" title="Purchase history verified natively in Amazon Customer ledger">
                        ✓ Purchased on Amazon
                      </span>
                    )}

                    {option.sustainabilityBadge && (
                      <span className="text-emerald-700 flex items-center gap-0.5 bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded text-[10px]" title={`Sustainability Score: ${option.sustainabilityScore}/100`}>
                        🌿 {option.sustainabilityBadge} Badge ({option.sustainabilityScore}/100)
                      </span>
                    )}

                    {option.co2Savings !== undefined && (
                      <span className="text-emerald-800 bg-[#f0faf5] border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                        Saved {option.co2Savings}kg CO₂
                      </span>
                    )}

                    {option.isAiVerified && (
                      <span className="text-blue-700 flex items-center gap-0.5 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[10px]" title="Cosmetic verification score verified by neural network visual scans">
                        🛡️ Condition Score: {option.conditionScore}/100
                      </span>
                    )}

                    <span className="bg-purple-50 border border-purple-200 text-purple-800 px-2 py-0.5 rounded text-[10px]" title="Ownership verified via verification code displayed with physical product">
                      🔑 Ownership: {option.ownershipConfidence}%
                    </span>

                    {option.productMatchScore !== undefined && (
                      <span className="bg-cyan-50 border border-cyan-200 text-cyan-800 px-2 py-0.5 rounded text-[10px]" title="AI verified item attributes match original order details">
                        🔍 Match: {option.productMatchScore}%
                      </span>
                    )}

                    {option.functionalScore !== undefined && (
                      <span className="bg-orange-50 border border-orange-200 text-orange-800 px-2 py-0.5 rounded text-[10px]" title="Seller hardware verification check status">
                        ⚙️ Functional: {option.functionalScore}%
                      </span>
                    )}
                  </div>

                  {/* Proximity local matching line */}
                  {option.proximityDetails && (
                    <div className="text-[11px] font-bold text-gray-800 bg-blue-55/60 border border-blue-100 p-1.5 rounded w-fit flex items-center gap-2">
                      <span>📍 Local Pickup/Delivery: {option.proximityDetails.deliveryTime} ({option.proximityDetails.distanceKm} km away)</span>
                      <span className="text-gray-400 font-normal">|</span>
                      <span className="text-gray-500 font-semibold text-[10px]">{option.proximityDetails.phase}</span>
                    </div>
                  )}

                  <p className="text-xs text-gray-650 italic mt-1 line-clamp-1">
                    "{option.conditionNotes}"
                  </p>
                </div>

                {/* Buy Button & Expand Actions */}
                <div className="flex items-center gap-2 self-start md:self-center">
                  <button
                    onClick={() => toggleExpand(option.listingId)}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded bg-white hover:bg-gray-100 text-gray-700 flex items-center gap-1 font-semibold"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {expandedOption === option.listingId ? 'Hide Logs' : 'View Scan'}
                  </button>

                  <button
                    onClick={() => handleBuy(option.listingId)}
                    disabled={purchasingId !== null}
                    className="bg-[#ff9900] hover:bg-[#e68a00] text-black font-semibold text-xs px-4 py-1.5 rounded shadow-sm hover:shadow transition-all border border-[#a88734]"
                  >
                    {purchasingId === option.listingId ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Buy Now
                      </span>
                    ) : (
                      'Buy Used'
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Inspection Details */}
              {expandedOption === option.listingId && (
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#fafafa] p-3 rounded border border-gray-100 animate-in slide-in-from-top-1 duration-200">
                  {/* Inspection Log */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block flex items-center gap-1">
                      🛡️ Amazon AI Inspection Details
                    </span>
                    {option.aiInspectionDetails ? (
                      <div className="space-y-2.5 text-xs text-gray-700">
                        <div className="grid grid-cols-5 gap-1.5 text-center text-[9px] font-bold">
                          <div className="bg-white p-1 rounded border border-gray-200">
                            <span className="text-gray-400 block font-normal uppercase">Trust Score</span>
                            <span className="text-xs font-extrabold text-emerald-700">{option.trustScore}/100</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-gray-200">
                            <span className="text-gray-400 block font-normal uppercase">Ownership</span>
                            <span className="text-xs font-extrabold text-purple-700">{option.aiInspectionDetails.ownershipConfidence}%</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-gray-200">
                            <span className="text-gray-400 block font-normal uppercase">Product Match</span>
                            <span className="text-xs font-extrabold text-cyan-700">{option.aiInspectionDetails.productMatchScore || 100}%</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-gray-200">
                            <span className="text-gray-400 block font-normal uppercase">Condition</span>
                            <span className="text-xs font-extrabold text-orange-700">{option.aiInspectionDetails.score}/100</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-gray-200">
                            <span className="text-gray-400 block font-normal uppercase">Functional</span>
                            <span className="text-xs font-extrabold text-gray-800">{option.aiInspectionDetails.functionalScore}%</span>
                          </div>
                        </div>

                        {/* Product Match Verification logs */}
                        {option.aiInspectionDetails.expectedAttributes && option.aiInspectionDetails.detectedAttributes && (
                          <div className="bg-white p-2 rounded border border-gray-200 text-[10px] space-y-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Product Match Verification Logs</span>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <span className="text-gray-400 block font-normal uppercase">Expected from Ledger:</span>
                                <span className="font-semibold text-gray-900">{option.aiInspectionDetails.expectedAttributes.brand} {option.aiInspectionDetails.expectedAttributes.model} ({option.aiInspectionDetails.expectedAttributes.color})</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block font-normal uppercase">Detected in Scan:</span>
                                <span className="font-semibold text-green-700">{option.aiInspectionDetails.detectedAttributes.brand} {option.aiInspectionDetails.detectedAttributes.model} ({option.aiInspectionDetails.detectedAttributes.color})</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Functional checklist logs */}
                        {option.aiInspectionDetails.functionalChecks && Object.keys(option.aiInspectionDetails.functionalChecks).length > 0 ? (
                          <div className="bg-white p-2 rounded border border-gray-200 space-y-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Functional Verification Logs</span>
                            <div className="grid grid-cols-2 gap-1 text-[10px] font-medium text-gray-600">
                              {Object.entries(option.aiInspectionDetails.functionalChecks).map(([chk, val]) => (
                                <div key={chk} className="flex items-center gap-1">
                                  <span className={val ? 'text-green-600 font-black' : 'text-red-650 font-black'}>
                                    {val ? '✓' : '✗'}
                                  </span>
                                  <span className="capitalize">{chk.replace(/([A-Z])/g, ' $1')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white p-2.5 rounded border border-gray-200 text-[10px] text-gray-500 font-medium leading-relaxed">
                            ℹ️ Category-specific functional checklist is bypassed for Furniture. Verification is based entirely on cosmetic inspections.
                          </div>
                        )}

                        <div className="space-y-1">
                          <span className="font-semibold text-gray-655">Detected Issues & Log Notes:</span>
                          <ul className="space-y-1 list-disc pl-4 text-gray-600 text-[11px]">
                            {option.aiInspectionDetails.detectedIssues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">This listing was verified through purchase ledger check without video inspection logs.</p>
                    )}

                    {option.video && (
                      <button
                        onClick={() => setActiveVideo(option.video)}
                        className="mt-2 text-xs font-bold text-[#007185] hover:text-[#004f5d] flex items-center gap-1"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Play Seller Verification Video
                      </button>
                    )}
                  </div>

                  {/* Description & Images */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                      Description & Media
                    </span>
                    <p className="text-xs text-gray-650 leading-relaxed">
                      {option.description}
                    </p>
                    {option.images.length > 0 && (
                      <div className="flex gap-1.5 overflow-x-auto pt-1.5">
                        {option.images.map((imgUrl, i) => (
                          <img 
                            key={i} 
                            src={imgUrl.startsWith('/uploads/') ? `http://localhost:5000${imgUrl}` : imgUrl} 
                            alt={`listing-${i}`} 
                            className="w-14 h-14 object-cover rounded border border-gray-200 bg-white"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
