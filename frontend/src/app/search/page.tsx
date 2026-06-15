'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AmazonHeader from '../../components/AmazonHeader';
import { Star, ShieldCheck, Check, Award, Compass, ThumbsUp, HelpCircle } from 'lucide-react';

interface ProductResult {
  id: string; // can be string ID of listing or new product
  productId?: string; // ID of the base new product if used
  productName: string;
  brand: string;
  category: string;
  price: number;
  productImage: string;
  isUsed: boolean;
  rating?: number;
  reviewsCount?: number;
  isPrime?: boolean;
  isFulfilled?: boolean;
  shipping?: string;
  
  // Used listing fields
  condition?: string;
  conditionScore?: number;
  trustScore?: number;
  isPurchasedOnAmazon?: boolean;
  isSellerVerified?: boolean;
  isAiVerified?: boolean;
  sellerName?: string;
  conditionNotes?: string;
  
  // Resell Enhancements
  ownershipConfidence?: number;
  functionalScore?: number;
  productMatchScore?: number;
  currentAmazonPrice?: number;
  buyerPrice?: number;
  amazonFee?: number;
  sustainabilityScore?: number;
  sustainabilityBadge?: string;
  co2Savings?: number;
  proximityDetails?: {
    distanceKm: number;
    phase: string;
    audience: string;
    deliveryTime: string;
    saleTime: string;
  };
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'new' | 'used'>('all');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/products?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Apply frontend filters
  const filteredResults = results.filter(p => {
    if (filterType === 'new') return !p.isUsed;
    if (filterType === 'used') return p.isUsed;
    return true;
  });

  const renderStars = (rating = 4.5) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < floor) {
        stars.push(<Star key={i} className="h-3.5 w-3.5 fill-[#de7921] text-[#de7921]" />);
      } else if (i === floor && rating % 1 !== 0) {
        stars.push(<Star key={i} className="h-3.5 w-3.5 fill-[#de7921] text-[#de7921] opacity-70" />);
      } else {
        stars.push(<Star key={i} className="h-3.5 w-3.5 text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div className="bg-white min-h-screen text-black pb-12 font-sans">
      <AmazonHeader />

      {/* Info bar */}
      <div className="border-b border-gray-300 px-6 py-2 text-xs text-gray-650 bg-white shadow-sm flex justify-between items-center">
        <div>
          {loading ? (
            <span>Searching...</span>
          ) : (
            <span>
              1-{filteredResults.length} of {filteredResults.length} results for <span className="text-red-700 font-bold">"{query || 'All Products'}"</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">Sort by:</span>
          <select className="bg-gray-100 border border-gray-300 rounded px-1.5 py-0.5 font-semibold text-gray-750">
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Avg. Customer Review</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        
        {/* Left Sidebar Filters */}
        <aside className="w-56 shrink-0 hidden md:block text-xs space-y-6">
          {/* Condition Filter */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-gray-900">Condition</h4>
            <ul className="space-y-1.5 font-medium text-gray-700 text-xs">
              <li>
                <button 
                  onClick={() => setFilterType('all')} 
                  className={`hover:text-[#c45500] cursor-pointer flex items-center gap-1.5 ${filterType === 'all' ? 'text-[#c45500] font-bold' : ''}`}
                >
                  Show All ({results.length})
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setFilterType('new')} 
                  className={`hover:text-[#c45500] cursor-pointer flex items-center gap-1.5 ${filterType === 'new' ? 'text-[#c45500] font-bold' : ''}`}
                >
                  New Only ({results.filter(r => !r.isUsed).length})
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setFilterType('used')} 
                  className={`hover:text-[#c45500] cursor-pointer flex items-center gap-1.5 ${filterType === 'used' ? 'text-[#c45500] font-bold' : ''}`}
                >
                  Used Resell ({results.filter(r => r.isUsed).length})
                </button>
              </li>
            </ul>
          </div>

          {/* Amazon Resell Protection Guarantee box */}
          <div className="bg-[#f7fafe] border border-[#d8e8fc] p-3 rounded space-y-2">
            <h5 className="font-bold text-gray-900 flex items-center gap-1 text-[11px]">
              <ShieldCheck className="h-4 w-4 text-[#007185]" />
              Amazon Resell Guarantee
            </h5>
            <p className="text-[10px] text-gray-650 leading-relaxed">
              Every used item marked with <span className="text-green-700 font-bold">Purchased on Amazon</span> is guaranteed to be the exact original item purchased under this customer's account. No counterfeit risk.
            </p>
          </div>
        </aside>

        {/* Main Search Results Grid */}
        <div className="flex-grow">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-2">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-[#e47911] rounded-full animate-spin" />
              <p className="text-sm text-gray-500 font-semibold">Searching the Amazon marketplace...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-20 text-center space-y-2 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-base text-gray-500 font-semibold">No results found matching "{query}".</p>
              <p className="text-xs text-gray-400">Try searching for "iPhone 14", "MacBook", or "Sony".</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((product) => {
                const isItemUsed = product.isUsed;
                const baseId = isItemUsed ? product.productId : product.id;
                
                return (
                  <div 
                    key={product.id} 
                    className="border border-gray-200 rounded-md p-4 bg-white flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Product Image */}
                    <div className="w-48 h-48 shrink-0 flex items-center justify-center bg-gray-50/50 rounded p-2 border border-gray-100">
                      <img 
                        src={product.productImage.startsWith('/uploads/') ? `http://localhost:5000${product.productImage}` : product.productImage} 
                        alt={product.productName} 
                        className="max-h-44 max-w-full object-contain mix-blend-multiply"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow space-y-2">
                      <Link 
                        href={`/products/${baseId}${isItemUsed ? '#buying-options' : ''}`}
                        className="text-lg font-medium text-gray-900 hover:text-[#c45500] leading-snug line-clamp-2"
                      >
                        {product.productName}
                      </Link>
                      
                      <p className="text-xs text-gray-500">
                        Brand: <span className="font-semibold text-gray-800">{product.brand}</span>
                      </p>

                      {/* Ratings for new products */}
                      {!isItemUsed && (
                        <div className="flex items-center gap-1">
                          <div className="flex">{renderStars(product.rating)}</div>
                          <span className="text-xs text-[#007185] hover:text-[#c45500] cursor-pointer">
                            {product.reviewsCount?.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Price Section */}
                      <div className="space-y-1">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-medium text-gray-700">₹</span>
                            <span className="text-2xl font-bold text-gray-900">
                              {isItemUsed ? (product.buyerPrice || product.price).toLocaleString('en-IN') : product.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                          {isItemUsed && (
                            <span className="text-[10px] text-gray-400 block font-normal -mt-0.5">
                              (Includes ₹{(product.amazonFee || 0).toLocaleString('en-IN')} Amazon Resell Fee. Seller payout: ₹{product.price.toLocaleString('en-IN')})
                            </span>
                          )}
                        </div>

                        {/* Badges and details depending on New vs Used */}
                        {!isItemUsed ? (
                          <div className="flex items-center gap-2 text-xs flex-wrap">
                            {product.isPrime && (
                              <span className="bg-[#00a8e8] text-white font-black px-1 py-0.5 rounded italic text-[9px] tracking-wide">
                                prime
                              </span>
                            )}
                            {product.isFulfilled && (
                              <span className="text-gray-500 text-[10px]">
                                Fulfilled by Amazon
                              </span>
                            )}
                            <span className="text-gray-655 ml-1">{product.shipping}</span>
                          </div>
                        ) : (
                          /* Used Product Badges (This is a core requirement) */
                          <div className="space-y-2 bg-[#f9f9f9] border border-gray-200 rounded p-3 max-w-xl">
                            <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold">
                              {product.isPurchasedOnAmazon && (
                                <span className="text-green-700 flex items-center gap-0.5 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded text-[10px]">
                                  ✓ Purchased on Amazon
                                </span>
                              )}
                              {product.isAiVerified && (
                                <span className="text-blue-700 flex items-center gap-0.5 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[10px]">
                                  ✓ AI Verified
                                </span>
                              )}
                              {product.sustainabilityBadge && (
                                <span className="text-emerald-700 flex items-center gap-0.5 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px]" title={`Sustainability Score: ${product.sustainabilityScore}/100`}>
                                  🌿 {product.sustainabilityBadge} Badge ({product.sustainabilityScore}/100)
                                </span>
                              )}
                              {product.co2Savings !== undefined && (
                                <span className="text-emerald-800 bg-[#f0faf5] border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                                  Saved {product.co2Savings}kg CO₂
                                </span>
                              )}
                              {product.trustScore && (
                                <span className="bg-[#f0faf5] border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-[10px]">
                                  Trust Score: {product.trustScore}/100
                                </span>
                              )}
                              {product.isAiVerified && product.conditionScore && (
                                <span className="bg-[#f0f8ff] border border-blue-200 text-blue-800 px-2 py-0.5 rounded text-[10px]">
                                  🛡️ Condition: {product.conditionScore}/100
                                </span>
                              )}
                              {product.ownershipConfidence && (
                                <span className="bg-purple-50 border border-purple-200 text-purple-800 px-2 py-0.5 rounded text-[10px] flex items-center gap-0.5">
                                  🔑 Ownership: {product.ownershipConfidence}%
                                </span>
                              )}
                              {product.productMatchScore !== undefined && (
                                <span className="bg-cyan-50 border border-cyan-200 text-cyan-800 px-2 py-0.5 rounded text-[10px]">
                                  🔍 Match: {product.productMatchScore}%
                                </span>
                              )}
                              {product.functionalScore !== undefined && (
                                <span className="bg-orange-50 border border-orange-200 text-orange-800 px-2 py-0.5 rounded text-[10px]">
                                  ⚙️ Functional: {product.functionalScore}%
                                </span>
                              )}
                            </div>

                            {/* Proximity Location Delivery details */}
                            {product.proximityDetails && (
                              <div className="text-[11px] font-bold text-gray-800 bg-blue-50/50 border border-blue-100 p-1.5 rounded flex justify-between items-center">
                                <span>📍 Local Match: {product.proximityDetails.deliveryTime} ({product.proximityDetails.distanceKm} km away)</span>
                                <span className="text-[10px] text-[#007185] normal-case">{product.proximityDetails.phase}</span>
                              </div>
                            )}

                            {/* Price Comparison */}
                            <div className="text-xs text-gray-500 pt-1">
                              Current Amazon Price: <span className="font-bold text-gray-700">₹{product.currentAmazonPrice?.toLocaleString('en-IN')}</span> | 
                              <span className="text-green-700 font-bold ml-1">You save: ₹{((product.currentAmazonPrice || 0) - product.price).toLocaleString('en-IN')}</span>
                            </div>

                            {/* Additional info about condition */}
                            <div className="text-[11px] text-gray-655 leading-snug space-y-1 border-t border-gray-200 pt-1.5">
                              <div>
                                <span className="font-bold text-gray-800">Condition Notes:</span> "{product.conditionNotes}"
                              </div>
                              <div className="text-[10px] text-gray-400">
                                Seller: {product.sellerName} | Condition rating: {product.condition} (Inspection Score: {product.conditionScore}/100)
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Buy Box Link */}
                      <div className="pt-2">
                        <Link 
                          href={`/products/${baseId}${isItemUsed ? '#buying-options' : ''}`}
                          className="inline-block bg-[#ffd814] hover:bg-[#f7ca00] text-black font-semibold text-xs px-4 py-2 rounded-md shadow-sm border border-[#f0c14b] text-center"
                        >
                          {isItemUsed ? 'View Resell Offer' : 'See Buying Options'}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="bg-white min-h-screen text-black pb-12 font-sans flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-[#e47911] rounded-full animate-spin" />
        <p className="mt-2 text-sm text-gray-500">Loading search interface...</p>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
