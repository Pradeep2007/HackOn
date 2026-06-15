'use client';

import React, { useState, useEffect } from 'react';
import AmazonHeader from '../../../components/AmazonHeader';
import BuyingOptions from '../../../components/BuyingOptions';
import { Star, ShieldCheck, MapPin, Truck, RefreshCw, Lock, ChevronDown, Check } from 'lucide-react';
import Link from 'next/link';

interface ProductDetails {
  id: string;
  productName: string;
  brand: string;
  category: string;
  price: number;
  productImage: string;
  rating: number;
  reviewsCount: number;
  isPrime: boolean;
  isFulfilled: boolean;
  shipping: string;
}

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
  buyerPrice: number;
  amazonFee: number;
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

interface ProductPageData {
  product: ProductDetails;
  otherBuyingOptions: BuyingOption[];
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const productId = params.id;
  const [data, setData] = useState<ProductPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Proximity Matching states (automatically fetched)
  const [buyerZip, setBuyerZip] = useState('110001'); 
  const [buyerAddress, setBuyerAddress] = useState('Barakhamba Road, Connaught Place, New Delhi');

  // 1. Fetch user shipping details first
  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/user');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setBuyerZip(data.user.defaultZipCode);
            setBuyerAddress(data.user.defaultAddress);
          }
        }
      } catch (err) {
        console.error('Error fetching buyer profile address:', err);
      }
    };
    fetchUserAddress();
  }, []);

  // 2. Fetch product details when zip or product changes
  const fetchProductData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/products/${productId}?zipCode=${buyerZip}`);
      if (!res.ok) {
        throw new Error('Product not found in catalog.');
      }
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, buyerZip]);

  const renderStars = (rating = 4.5) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < floor) {
        stars.push(<Star key={i} className="h-4 w-4 fill-[#de7921] text-[#de7921]" />);
      } else if (i === floor && rating % 1 !== 0) {
        stars.push(<Star key={i} className="h-4 w-4 fill-[#de7921] text-[#de7921] opacity-70" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;
  };

  if (loading && !data) {
    return (
      <div className="bg-white min-h-screen text-black font-sans">
        <AmazonHeader />
        <div className="flex flex-col items-center justify-center py-32 space-y-2">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-[#e47911] rounded-full animate-spin" />
          <p className="text-sm text-gray-550 font-medium">Loading product page details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white min-h-screen text-black font-sans">
        <AmazonHeader />
        <main className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-755 font-sans">Product Not Found</h2>
          <p className="text-gray-655">{error || 'Could not load product details.'}</p>
          <Link href="/" className="inline-block bg-[#febd69] hover:bg-[#f3a847] text-black font-bold px-4 py-2 rounded text-xs">
            Return to Homepage
          </Link>
        </main>
      </div>
    );
  }

  const { product, otherBuyingOptions } = data;

  return (
    <div className="bg-white min-h-screen text-black pb-16 font-sans">
      <AmazonHeader />

      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Navigation Breadcrumbs */}
        <div className="text-xs text-gray-550 mb-6 flex items-center gap-1 font-semibold">
          <span>Electronics</span>
          <span className="text-gray-400">/</span>
          <span>Mobiles & Accessories</span>
          <span className="text-gray-400">/</span>
          <span>Smartphones</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500 line-clamp-1">{product.productName}</span>
        </div>

        {/* Top Fold: Image, Description, Buy Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Left Column: Product Image */}
          <div className="lg:col-span-5 flex flex-col items-center space-y-4">
            <div className="border border-gray-255 rounded p-4 w-full max-w-md bg-white flex items-center justify-center h-96">
              <img 
                src={product.productImage} 
                alt={product.productName} 
                className="max-h-80 max-w-full object-contain"
              />
            </div>
            <p className="text-xs text-gray-550 font-medium text-center">
              Roll over image to zoom in
            </p>
          </div>

          {/* Middle Column: Details */}
          <div className="lg:col-span-4 space-y-4 pr-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-medium text-gray-900 leading-tight">
                {product.productName}
              </h1>
              <span className="text-xs text-[#007185] hover:text-[#c45500] cursor-pointer font-bold block">
                Brand Store: {product.brand}
              </span>
            </div>

            {/* Ratings summary */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
              <div className="flex">{renderStars(product.rating)}</div>
              <span className="text-xs text-[#007185] hover:text-[#c45500] cursor-pointer font-semibold">
                {product.reviewsCount.toLocaleString()} ratings
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-[#007185] hover:text-[#c45500] cursor-pointer font-semibold">
                120 answered questions
              </span>
            </div>

            {/* Price Box */}
            <div className="space-y-1">
              <div className="text-red-700 text-xs font-semibold uppercase tracking-wider">
                Limited Time Deal
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl text-red-700 font-light">-15%</span>
                <span className="text-sm font-semibold text-gray-700">₹</span>
                <span className="text-3xl font-bold text-gray-950">
                  {product.price.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                M.R.P.: <span className="line-through">₹{(product.price * 1.15).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </p>
              <div className="text-xs text-gray-755">
                Inclusive of all taxes
              </div>
            </div>

            {/* Features list */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <h3 className="font-bold text-sm text-gray-800">About this item</h3>
              <ul className="text-xs text-gray-700 space-y-2 list-disc pl-4 leading-relaxed font-medium">
                <li>Super Retina XDR display with ProMotion technology for a faster, more responsive feel</li>
                <li>Advanced camera system for better photos in any light condition</li>
                <li>A15 Bionic chip with 5-core GPU for lightning-fast performance</li>
                <li>Durable design with Ceramic Shield and industry-leading IP68 water resistance</li>
                <li>Supports 5G cellular connectivity for ultra-fast downloads and streaming</li>
              </ul>
            </div>
          </div>

          {/* Right Column: New Product Buy Box */}
          <div className="lg:col-span-3 space-y-4">
            <div className="border border-gray-300 rounded-md p-4 bg-white space-y-4 shadow-sm text-xs font-medium text-gray-850">
              
              <div className="flex items-baseline gap-1">
                <span className="text-gray-655">₹</span>
                <span className="text-2xl font-bold text-gray-900">
                  {product.price.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {product.isPrime && (
                  <span className="bg-[#00a8e8] text-white font-black px-1 py-0.5 rounded italic text-[9px] tracking-wide">
                    prime
                  </span>
                )}
                <span className="text-[#007185] font-bold">FREE delivery</span>
              </div>

              <p className="text-gray-905 font-bold">
                In Stock.
              </p>

              <div className="space-y-2 text-center">
                <button className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-black py-2 rounded-md shadow-sm font-semibold border border-[#fcd200]">
                  Add to Cart
                </button>
                <button className="w-full bg-[#ffa41c] hover:bg-[#fa8f14] text-white py-2 rounded-md shadow-sm font-semibold border border-[#fa8f14]">
                  Buy Now
                </button>
              </div>

              <div className="text-[11px] text-gray-500 border-t border-gray-200 pt-3 space-y-1">
                <div className="flex justify-between">
                  <span>Ships from:</span>
                  <span className="font-semibold text-gray-800">Amazon.in</span>
                </div>
                <div className="flex justify-between">
                  <span>Sold by:</span>
                  <span className="font-semibold text-gray-800">Appario Retail Private Ltd</span>
                </div>
              </div>
            </div>

            {/* Quick jump to customer resells box */}
            {otherBuyingOptions.length > 0 && (
              <a 
                href="#buying-options"
                className="block border-2 border-[#f3a847] hover:bg-[#f3a847]/10 p-3 rounded-md bg-[#fffaf0] space-y-1 cursor-pointer transition-colors"
              >
                <span className="block text-[10px] text-orange-800 uppercase font-black tracking-wider flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-[#007185]" />
                  Verified Used Option Available
                </span>
                <span className="block text-xs font-semibold text-gray-700">
                  Buy from verified Amazon customers starting at <span className="font-bold text-gray-900 text-sm">₹{Math.min(...otherBuyingOptions.map(o => o.price)).toLocaleString('en-IN')}</span>
                </span>
                <span className="text-xs text-[#007185] hover:underline font-bold block pt-1">
                  See Other Buying Options ({otherBuyingOptions.length}) ↓
                </span>
              </a>
            )}
          </div>

        </div>

        {/* Bottom fold: Other Buying Options Resale Section */}
        <section id="buying-options" className="border-t border-gray-300 pt-8 mt-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-3">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Other Buying Options (Verified Customer Resell)
              </h2>
              <p className="text-xs text-gray-500 font-medium max-w-2xl leading-relaxed">
                These products were originally purchased on Amazon by verified customers and analyzed using Amazon's AI Condition Inspection system. 
              </p>
            </div>

            {/* Proximity local matching zipcode block (dynamically loaded) */}
            <div className="flex items-center gap-2 bg-[#f7fafe] border border-[#d8e8fc] p-2.5 rounded text-xs font-semibold">
              <span>📍 Shipping Matches Default Address:</span>
              <span className="text-blue-700 bg-blue-50 border border-blue-150 px-2 py-0.5 rounded text-[10px]">
                {buyerAddress} (Zip: {buyerZip})
              </span>
            </div>
          </div>

          <BuyingOptions 
            options={otherBuyingOptions} 
            onPurchaseSuccess={fetchProductData}
          />
        </section>

      </main>
    </div>
  );
}
