'use client';

import React, { useState, useEffect } from 'react';
import AmazonHeader from '../../components/AmazonHeader';
import SellModal from '../../components/SellModal';
import { Package, CheckCircle2, ChevronRight, ShoppingBag, ShieldCheck, Check, Truck, Leaf, Gift, X, Loader2, Sparkles, HeartHandshake, Trash2, RotateCcw, Sliders, Video, Award } from 'lucide-react';
import Link from 'next/link';

interface Order {
  _id: string;
  productName: string;
  brand: string;
  category: string;
  purchaseDate: string;
  originalPurchasePrice: number;
  productImage: string;
  orderId: string;
  deliveryStatus: string;
  isAlreadyListed: boolean;
  listingId: string | null;
  returnStatus?: 'None' | 'Return Initiated' | 'Returned';
  returnOption?: 'standard' | 'flexible' | 'hub';
  returnCreditsEarned?: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnOrder, setReturnOrder] = useState<Order | null>(null);
  
  // Toast Alert states
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showReturnToast, setShowReturnToast] = useState(false);
  const [creditsEarned, setCreditsEarned] = useState(0);

  // Return Modal selected option
  const [selectedReturnOption, setSelectedReturnOption] = useState<'standard' | 'flexible' | 'hub'>('flexible');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // AI Return Evaluation Wizard States
  const [aiEvalOrder, setAiEvalOrder] = useState<Order | null>(null);
  const [aiEvalStep, setAiEvalStep] = useState<'scan' | 'scanning' | 'results'>('scan');
  const [aiEvalResult, setAiEvalResult] = useState<any | null>(null);
  const [aiEvalScanningText, setAiEvalScanningText] = useState('');
  const [simulatedScore, setSimulatedScore] = useState<number>(84);
  const [aiEvalVideo, setAiEvalVideo] = useState<File | null>(null);
  const [simulateMismatch, setSimulateMismatch] = useState<boolean>(false);
  const [showRecycleToast, setShowRecycleToast] = useState(false);

  const handleStartAiEvaluation = (order: Order) => {
    setAiEvalOrder(order);
    setAiEvalStep('scan');
    setAiEvalResult(null);
    setAiEvalVideo(null);
    setSimulateMismatch(false);
    
    // Suggest default simulated scores based on products to match spec examples
    const name = order.productName.toLowerCase();
    if (name.includes('sony') || name.includes('headphones')) setSimulatedScore(84);
    else if (name.includes('macbook') || name.includes('laptop')) setSimulatedScore(92);
    else if (name.includes('iphone') || name.includes('phone')) setSimulatedScore(94);
    else if (name.includes('chair')) setSimulatedScore(38);
    else setSimulatedScore(80);
  };

  const runSimulatedScan = async () => {
    if (!aiEvalOrder) return;
    setAiEvalStep('scanning');
    
    const scanTexts = [
      'Extracting circular physical features...',
      'Matching serial signature with purchase ledger...',
      'Analyzing cosmetic surface scratches and functional integrity...',
      'Calculating ownership confidence & match index...',
      'Finalizing donation & circular routing priorities...'
    ];

    for (let i = 0; i < scanTexts.length; i++) {
      setAiEvalScanningText(scanTexts[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      const formData = new FormData();
      if (aiEvalVideo) {
        formData.append('video', aiEvalVideo);
      }
      formData.append('conditionScore', simulatedScore.toString());
      formData.append('simulateMismatch', simulateMismatch ? 'true' : 'false');

      const res = await fetch(`http://localhost:5000/api/orders/${aiEvalOrder._id}/evaluate-return`, {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setAiEvalResult(data);
        setAiEvalStep('results');
      } else {
        const errData = await res.json();
        alert(errData.error || 'AI Return Evaluation failed.');
        setAiEvalStep('scan');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to AI Evaluation service.');
      setAiEvalStep('scan');
    }
  };

  const handleRecycleConfirm = async () => {
    if (!aiEvalOrder) return;
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${aiEvalOrder._id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnOption: 'hub' }) // locker hub recycling dropoff
      });
      if (res.ok) {
        setAiEvalOrder(null);
        setCreditsEarned(150); // Recycle credit
        setShowRecycleToast(true);
        fetchOrders();
        setTimeout(() => setShowRecycleToast(false), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/orders');
      if (!res.ok) {
        throw new Error('Failed to fetch orders from backend. Is the server running?');
      }
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePublishSuccess = () => {
    setSelectedOrder(null);
    setShowSuccessToast(true);
    fetchOrders(); // Refresh order listing status
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);
  };

  const handleReturnConfirm = async () => {
    if (!returnOrder) return;
    setSubmittingReturn(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${returnOrder._id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnOption: selectedReturnOption })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to process return.');
      }

      const data = await res.json();
      
      // Setup reward toast
      setCreditsEarned(data.order.returnCreditsEarned || 0);
      setReturnOrder(null);
      setShowReturnToast(true);
      
      // Sync layout headers
      window.dispatchEvent(new Event('storage'));
      
      fetchOrders(); // Refresh orders
      setTimeout(() => {
        setShowReturnToast(false);
      }, 5000);
    } catch (err: any) {
      alert(err.message || 'An error occurred.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen text-black pb-12 font-sans">
      <AmazonHeader />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Navigation Breadcrumbs */}
        <div className="text-xs text-gray-500 mb-4 flex items-center gap-1 font-medium">
          <Link href="/" className="hover:text-[#c45500] hover:underline">Your Account</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#c45500]">Your Orders</span>
        </div>

        <h1 className="text-3xl font-normal text-gray-900 mb-6">Your Orders</h1>

        {/* Resell Success Toast / Alert */}
        {showSuccessToast && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="p-1 bg-green-500 text-white rounded-full">
              <Check className="h-4 w-4 stroke-[3]" />
            </div>
            <div>
              <h4 className="font-bold text-green-900 text-sm">Resell Listing Published Successfully!</h4>
              <p className="text-xs text-green-700 mt-0.5 font-medium">
                Your item has been verified through Amazon Ledger, AI scan analyzed, and published to the search results.
              </p>
              <Link 
                href="/search?q=sony" 
                className="text-xs text-[#007185] hover:text-[#c45500] hover:underline font-bold mt-2 block"
              >
                Go search and view your listing →
              </Link>
            </div>
          </div>
        )}

        {/* Return Success Toast / Alert */}
        {showReturnToast && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-md flex items-start gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="p-1.5 bg-emerald-600 text-white rounded-full">
              <Leaf className="h-4.5 w-4.5 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-emerald-900 text-sm">Smart Return Registered!</h4>
              <p className="text-xs text-emerald-700 font-medium">
                Return pickup scheduled. You earned <strong className="text-emerald-900">+{creditsEarned} Green Credits</strong>, credited directly to your <Link href="/green-wallet" className="font-bold hover:underline">Green Wallet</Link>!
              </p>
            </div>
          </div>
        )}

        {/* Recycle Success Toast / Alert */}
        {showRecycleToast && (
          <div className="mb-6 p-4 bg-[#f0faf5] border border-emerald-200 rounded-md flex items-start gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="p-1.5 bg-emerald-600 text-white rounded-full">
              <Leaf className="h-4.5 w-4.5 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-emerald-900 text-sm">Recycling Drop-off Registered!</h4>
              <p className="text-xs text-emerald-750 font-medium">
                Locker Hub recycling route selected. You earned <strong className="text-emerald-900">+{creditsEarned} Green Credits</strong> for routing this device to a local recycling partner.
              </p>
            </div>
          </div>
        )}

        {/* Tabs navigation */}
        <div className="flex border-b border-gray-300 text-sm mb-6 font-semibold text-gray-655">
          <span className="border-b-2 border-[#e47911] pb-3 text-black px-4 cursor-pointer">Orders</span>
          <span className="pb-3 hover:text-black px-4 cursor-pointer">Buy Again</span>
          <span className="pb-3 hover:text-black px-4 cursor-pointer">Not Yet Shipped</span>
          <span className="pb-3 hover:text-black px-4 cursor-pointer">Cancelled Orders</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <div className="w-8 h-8 border-4 border-gray-350 border-t-[#e47911] rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Fetching your order history...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded text-sm text-red-800">
            <h4 className="font-bold">Cannot connect to backend server</h4>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-xs font-semibold text-gray-500">
              Note: Make sure to start the backend Node.js Express server to spin up the mock databases.
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-200 p-8 rounded text-center text-gray-550 space-y-3">
            <ShoppingBag className="h-10 w-10 mx-auto text-gray-400" />
            <p>You haven't purchased any items recently on Amazon.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                
                {/* Order Header Card Info */}
                <div className="bg-[#f3f3f3] border-b border-gray-300 p-3.5 flex flex-wrap justify-between items-center gap-4 text-xs text-gray-600">
                  <div className="flex gap-6">
                    <div>
                      <span className="block uppercase text-[10px] font-bold text-gray-500">Order Placed</span>
                      <span className="font-medium">
                        {new Date(order.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div>
                      <span className="block uppercase text-[10px] font-bold text-gray-500">Total</span>
                      <span className="font-medium">₹{order.originalPurchasePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="block uppercase text-[10px] font-bold text-gray-500">Ship To</span>
                      <span className="text-[#007185] hover:text-[#c45500] cursor-pointer font-semibold">John Doe</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-gray-500 uppercase text-[10px] font-bold">Order # {order.orderId}</span>
                    <span className="text-[#007185] hover:text-[#c45500] cursor-pointer font-semibold">View order details</span>
                  </div>
                </div>

                {/* Order Product Details Card */}
                <div className="p-4 flex flex-col md:flex-row justify-between gap-6">
                  
                  {/* Left info product details */}
                  <div className="flex gap-4 items-start flex-grow">
                    <img 
                      src={order.productImage} 
                      alt={order.productName} 
                      className="w-24 h-24 object-contain rounded border border-gray-200 p-1 shrink-0 bg-white"
                    />
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer leading-snug line-clamp-2">
                        {order.productName}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        Brand: <span className="text-gray-700 font-bold">{order.brand}</span>
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 bg-green-50 text-green-800 text-xs px-2 py-0.5 rounded font-semibold w-fit">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        <span>
                          {order.returnStatus === 'Returned' ? 'Returned' : `${order.deliveryStatus} on ${new Date(order.purchaseDate).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex flex-col gap-2 shrink-0 w-full md:w-56 text-center text-xs">
                    {order.returnStatus === 'Returned' ? (
                      <div className="border-2 border-emerald-300 bg-emerald-50 rounded-md p-3.5 flex flex-col items-center space-y-1.5 shadow-sm">
                        <span className="text-[10px] text-emerald-850 font-black uppercase tracking-wider flex items-center gap-1">
                          ✓ Item Returned
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold bg-white px-2 py-0.5 rounded border border-gray-200 capitalize">
                          {order.returnOption === 'hub' ? 'Community Hub Drop-off' : `${order.returnOption} Pickup`}
                        </span>
                        <span className="text-xs text-emerald-700 font-extrabold flex items-center gap-0.5">
                          <Gift className="h-3.5 w-3.5" /> +{order.returnCreditsEarned} Credits Earned
                        </span>
                      </div>
                    ) : (
                      <>
                        <button className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-black py-2 rounded-md shadow-sm font-semibold transition-colors duration-150 border border-[#fcd200]">
                          Buy Again
                        </button>
                        <button className="w-full bg-white hover:bg-gray-50 text-gray-800 py-2 rounded-md shadow-sm border border-gray-300 font-medium transition-colors duration-150">
                          Track Package
                        </button>
                        <button 
                          onClick={() => handleStartAiEvaluation(order)}
                          className="w-full bg-white hover:bg-gray-50 text-gray-800 py-2 rounded-md shadow-sm border border-gray-300 font-medium transition-colors duration-150"
                        >
                          Return Item
                        </button>

                        {/* Resell Feature Button */}
                        {order.isAlreadyListed ? (
                          <div className="border border-green-300 bg-green-50 rounded-md p-2 flex flex-col items-center">
                            <span className="text-[10px] text-green-800 font-bold uppercase tracking-wider flex items-center gap-1">
                              ✓ Listed for Resale
                            </span>
                            <Link 
                              href={`/search?q=${encodeURIComponent(order.brand)}`}
                              className="text-[11px] text-[#007185] hover:text-[#c45500] hover:underline font-bold mt-1"
                            >
                              View in Search Results
                            </Link>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="w-full bg-gradient-to-b from-white to-gray-100 hover:from-gray-50 hover:to-gray-150 text-black py-2 rounded-md shadow-sm border-2 border-[#febd69] font-bold hover:border-[#f3a847] transition-all flex items-center justify-center gap-1"
                          >
                            <ShieldCheck className="h-4 w-4 text-[#007185]" />
                            Sell This Item
                          </button>
                        )}
                      </>
                    )}
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      {/* Resell Modal */}
      {selectedOrder && (
        <SellModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onPublishSuccess={handlePublishSuccess}
        />
      )}

      {/* Smart Returns Modal */}
      {returnOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Truck className="h-5.5 w-5.5 text-[#e47911]" />
                <h3 className="text-base font-bold text-gray-800">Amazon Smart Returns Selection</h3>
              </div>
              <button 
                onClick={() => setReturnOrder(null)} 
                className="text-gray-500 hover:text-black p-1 rounded-full hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs text-[#002f6c] leading-relaxed font-semibold">
                🌿 Help reduce carrier fuel emissions! Select a flexible pick-up or locker hub drop-off option to save carbon footprint and earn Green Wallet Credits.
              </div>

              <div className="space-y-3.5">
                {/* Option 1: Standard */}
                <label className={`block border p-4 rounded-lg cursor-pointer transition-all ${
                  selectedReturnOption === 'standard' ? 'border-[#e47911] bg-orange-50/20' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-start gap-3 text-xs">
                    <input 
                      type="radio" 
                      name="returnOption" 
                      checked={selectedReturnOption === 'standard'}
                      onChange={() => setSelectedReturnOption('standard')}
                      className="mt-1 text-[#e47911] focus:ring-[#e47911]"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-900 block">Standard Home Pickup</span>
                      <span className="text-gray-550 block leading-normal">
                        Carrier comes to your doorstep during standard carrier route dispatches.
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold block pt-1 uppercase">
                        Reward: 0 Credits | Baseline Carbon Saving (2kg CO₂ Saved)
                      </span>
                    </div>
                  </div>
                </label>

                {/* Option 2: Flexible */}
                <label className={`block border p-4 rounded-lg cursor-pointer transition-all ${
                  selectedReturnOption === 'flexible' ? 'border-emerald-500 bg-green-50/20' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-start gap-3 text-xs">
                    <input 
                      type="radio" 
                      name="returnOption" 
                      checked={selectedReturnOption === 'flexible'}
                      onChange={() => setSelectedReturnOption('flexible')}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-emerald-800 block flex items-center gap-1.5">
                        Flexible Carrier Pickup (Recommended)
                        <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">CO₂ Opt-In</span>
                      </span>
                      <span className="text-gray-655 block leading-normal">
                        Carrier bundles your pickup with nearby neighborhood drop-offs within 48 hours, optimizing fuel usage.
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold block pt-1 uppercase flex items-center gap-0.5">
                        <Leaf className="h-3.5 w-3.5 text-emerald-600" /> Reward: +50 Green Credits | +5 kg CO₂ Saved
                      </span>
                    </div>
                  </div>
                </label>

                {/* Option 3: Hub Drop-off */}
                <label className={`block border p-4 rounded-lg cursor-pointer transition-all ${
                  selectedReturnOption === 'hub' ? 'border-blue-500 bg-blue-50/20' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-start gap-3 text-xs">
                    <input 
                      type="radio" 
                      name="returnOption" 
                      checked={selectedReturnOption === 'hub'}
                      onChange={() => setSelectedReturnOption('hub')}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-blue-800 block flex items-center gap-1.5">
                        Community Locker Hub Drop-off
                        <span className="bg-blue-100 text-blue-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Max Savings</span>
                      </span>
                      <span className="text-gray-655 block leading-normal">
                        Divert route overheads completely by dropping off at your nearest Amazon Drop-off Partner or Hub Locker.
                      </span>
                      <span className="text-[10px] text-blue-700 font-bold block pt-1 uppercase flex items-center gap-0.5">
                        <Leaf className="h-3.5 w-3.5 text-emerald-600 animate-pulse" /> Reward: +100 Green Credits | +12 kg CO₂ Saved
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setReturnOrder(null)}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReturnConfirm}
                disabled={submittingReturn}
                className="px-5 py-2 text-xs font-black bg-[#febd69] hover:bg-[#f3a847] text-black rounded shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                {submittingReturn ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing...
                  </>
                ) : (
                  'Confirm Return'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Return Evaluation Wizard Modal */}
      {aiEvalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#ffa41c]" />
                <h3 className="text-base font-bold">Amazon AI Return Evaluation</h3>
              </div>
              <button 
                onClick={() => setAiEvalOrder(null)} 
                className="text-gray-405 hover:text-white p-1 rounded-full hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step 1: Scan Options */}
            {aiEvalStep === 'scan' && (
              <div className="p-6 space-y-4">
                <div className="flex gap-4 items-center bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <img src={aiEvalOrder.productImage} alt={aiEvalOrder.productName} className="w-16 h-16 object-contain rounded bg-white p-1" />
                  <div>
                    <h4 className="font-bold text-gray-800">{aiEvalOrder.productName}</h4>
                    <p className="text-xs text-gray-500 font-semibold">Order ID: {aiEvalOrder.orderId}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="font-bold text-gray-700 block">Simulate Video Condition Grading</span>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Set a condition score to simulate the routing priority recommendations. This demonstrates how our AI determines Resell vs. Donation vs. Recycling eligibility.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      type="button" 
                      onClick={() => setSimulatedScore(84)}
                      className={`p-3 rounded-lg border text-center font-bold transition-all ${
                        simulatedScore === 84 ? 'border-[#e47911] bg-orange-50/20 text-[#e47911]' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="block text-xs font-semibold">Like New / Excellent</span>
                      <span className="text-lg font-black block">84%</span>
                      <span className="block text-[10px] text-gray-500 font-normal mt-1 leading-tight">Priority: 1. Resell<br/>2. Donate</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setSimulatedScore(55)}
                      className={`p-3 rounded-lg border text-center font-bold transition-all ${
                        simulatedScore === 55 ? 'border-[#e47911] bg-orange-50/20 text-[#e47911]' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="block text-xs font-semibold">Good / Fair</span>
                      <span className="text-lg font-black block">55%</span>
                      <span className="block text-[10px] text-gray-500 font-normal mt-1 leading-tight">Priority: 1. Donate<br/>2. Refurbish</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setSimulatedScore(30)}
                      className={`p-3 rounded-lg border text-center font-bold transition-all ${
                        simulatedScore === 30 ? 'border-[#e47911] bg-orange-50/20 text-[#e47911]' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="block text-xs font-semibold">Poor / Damaged</span>
                      <span className="text-lg font-black block">30%</span>
                      <span className="block text-[10px] text-gray-500 font-normal mt-1 leading-tight">Priority: 1. Refurbish<br/>2. Recycle</span>
                    </button>
                  </div>
                </div>

                {/* Return Video File Upload */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-gray-700 block">Upload Verification Video</span>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAiEvalVideo(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Video className="h-7 w-7 text-gray-400 mb-1" />
                    {aiEvalVideo ? (
                      <span className="text-xs font-bold text-green-700">✓ Video Selected: {aiEvalVideo.name}</span>
                    ) : (
                      <>
                        <span className="font-bold text-gray-700 block text-[11px]">Choose Return Verification Video</span>
                        <span className="text-[9px] text-gray-400 block max-w-sm mt-0.5 font-medium">
                          Click to select a 10s video. If omitted, we will run simulated grading based on your selected preset score.
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Simulate Fraud Mismatch Toggle */}
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-gray-700 mt-2 select-none">
                  <input 
                    type="checkbox"
                    checked={simulateMismatch}
                    onChange={(e) => setSimulateMismatch(e.target.checked)}
                    className="rounded text-[#e47911] focus:ring-[#e47911]"
                  />
                  <span>Simulate Anti-Fraud Product Mismatch (forces verification failure)</span>
                </label>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setAiEvalOrder(null)}
                    className="px-4 py-2 border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={runSimulatedScan}
                    className="px-5 py-2 bg-[#ff9900] hover:bg-[#e68a00] text-black font-bold rounded text-xs flex items-center gap-1 border border-[#a88734] shadow-sm cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Start AI Visual Scan
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Scanning State */}
            {aiEvalStep === 'scanning' && (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-gray-200 border-t-[#ffa41c] rounded-full animate-spin" />
                  <Sparkles className="h-8 w-8 text-[#ffa41c] animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-base text-gray-800">AI Engine Analyzing Return Video</h4>
                  <p className="text-xs text-orange-600 font-bold animate-pulse">{aiEvalScanningText}</p>
                </div>
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#ffa41c] h-full rounded-full animate-pulse" style={{ width: '80%' }} />
                </div>
              </div>
            )}

            {/* Step 3: AI Results & Actions */}
            {aiEvalStep === 'results' && aiEvalResult && (
              <div className="p-6 space-y-5">
                {/* Visual Indicators */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center shadow-sm">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Condition Score</span>
                    <span className="text-xl font-extrabold text-[#e47911] block">{aiEvalResult.conditionScore}%</span>
                    <span className="text-[9px] font-bold text-orange-700 bg-orange-100/50 px-1.5 py-0.5 rounded capitalize inline-block mt-1">
                      {aiEvalResult.conditionCategory}
                    </span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center shadow-sm">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Product Match</span>
                    <span className="text-xl font-extrabold text-blue-700 block">{aiEvalResult.productMatchScore}%</span>
                    <span className="text-[9px] font-bold text-blue-750 bg-blue-100/50 px-1.5 py-0.5 rounded inline-block mt-1">
                      Verified Match
                    </span>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center shadow-sm">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Ownership Trust</span>
                    <span className="text-xl font-extrabold text-purple-750 block">{aiEvalResult.ownershipConfidence}%</span>
                    <span className="text-[9px] font-bold text-purple-750 bg-purple-100/50 px-1.5 py-0.5 rounded inline-block mt-1">
                      Key Validated
                    </span>
                  </div>
                </div>

                {/* Eligibility checklist */}
                <div className="bg-[#fcfcfc] border border-gray-200 rounded-lg p-4 space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider block">Circular Eligibility Analysis</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className={aiEvalResult.resaleEligible ? 'text-green-600 font-extrabold' : 'text-red-500 font-extrabold'}>
                        {aiEvalResult.resaleEligible ? '✓' : '✗'}
                      </span>
                      <span className={aiEvalResult.resaleEligible ? 'text-gray-800' : 'text-gray-400'}>Resale Eligible</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={aiEvalResult.donationEligible ? 'text-green-600 font-extrabold' : 'text-red-500 font-extrabold'}>
                        {aiEvalResult.donationEligible ? '✓' : '✗'}
                      </span>
                      <span className={aiEvalResult.donationEligible ? 'text-gray-800' : 'text-gray-400'}>Donation Eligible</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={aiEvalResult.refurbishEligible ? 'text-green-600 font-extrabold' : 'text-red-500 font-extrabold'}>
                        {aiEvalResult.refurbishEligible ? '✓' : '✗'}
                      </span>
                      <span className={aiEvalResult.refurbishEligible ? 'text-gray-800' : 'text-gray-400'}>Refurbish Eligible</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={aiEvalResult.recycleEligible ? 'text-green-600 font-extrabold' : 'text-red-500 font-extrabold'}>
                        {aiEvalResult.recycleEligible ? '✓' : '✗'}
                      </span>
                      <span className={aiEvalResult.recycleEligible ? 'text-gray-800' : 'text-gray-400'}>Recycling Eligible</span>
                    </div>
                  </div>
                </div>

                {/* Recommendation Engine Box */}
                <div className="border-2 border-dashed border-[#e47911] bg-orange-50/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-[#e47911]" />
                    <span className="font-extrabold text-[#e47911] uppercase tracking-wider text-xs">Give Your Product a Second Life</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                    {aiEvalResult.impact.impactText} Instead of sending this item to a warehouse, consider donating it to a nearby organization.
                  </p>
                  
                  {/* Impact Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-center">
                    <div className="bg-white p-2 rounded border border-gray-150">
                      <span className="block text-[8px] text-gray-400 uppercase font-semibold">Potentially Helped</span>
                      <span className="text-xs font-black text-blue-700">
                        {aiEvalResult.productName.toLowerCase().includes('laptop') ? '3 Students' :
                         aiEvalResult.productName.toLowerCase().includes('tablet') ? '1 Classroom' :
                         aiEvalResult.productName.toLowerCase().includes('book') ? 'Hundreds' : '80+ Students'}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-150">
                      <span className="block text-[8px] text-gray-400 uppercase font-semibold">Carbon Savings</span>
                      <span className="text-xs font-black text-emerald-600">🌿 {aiEvalResult.impact.co2Saved}kg CO₂</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-150">
                      <span className="block text-[8px] text-gray-400 uppercase font-semibold">Waste Prevented</span>
                      <span className="text-xs font-black text-emerald-800">📦 {aiEvalResult.impact.wastePrevented}kg</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-150">
                      <span className="block text-[8px] text-gray-400 uppercase font-semibold">Credits Reward</span>
                      <span className="text-xs font-black text-[#e47911]">+{aiEvalResult.impact.credits} Credits</span>
                    </div>
                  </div>
                </div>

                {/* User Actions */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Choose Circular Action</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Action 1: Donate */}
                    <Link
                      href={`/donation-opportunities?orderId=${aiEvalResult.orderId}&conditionScore=${aiEvalResult.conditionScore}`}
                      onClick={() => setAiEvalOrder(null)}
                      className={`p-3.5 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                        aiEvalResult.donationEligible ? 'border-emerald-500 bg-emerald-50/20 hover:bg-emerald-50/40' : 'opacity-50 pointer-events-none border-gray-200'
                      }`}
                    >
                      <HeartHandshake className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-emerald-900 block flex items-center gap-1.5">
                          Donate Product
                          <span className="bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wide">Recommended</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold block">Route to nearby NGO or School</span>
                      </div>
                    </Link>

                    {/* Action 2: Resell */}
                    <button
                      type="button"
                      disabled={!aiEvalResult.resaleEligible}
                      onClick={() => {
                        setSelectedOrder(aiEvalOrder);
                        setAiEvalOrder(null);
                      }}
                      className={`p-3.5 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                        aiEvalResult.resaleEligible ? 'border-[#febd69] bg-orange-50/20 hover:bg-orange-50/40' : 'opacity-50 border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <Award className="h-5 w-5 text-[#ff9900] shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-gray-900 block">Resell Product</span>
                        <span className="text-[10px] text-[#007185] font-semibold block font-sans">List used for peer-to-peer sale</span>
                      </div>
                    </button>

                    {/* Action 3: Recycle */}
                    <button
                      type="button"
                      disabled={!aiEvalResult.recycleEligible}
                      onClick={handleRecycleConfirm}
                      className={`p-3.5 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                        aiEvalResult.recycleEligible ? 'border-gray-400 bg-gray-50 hover:bg-gray-100' : 'opacity-50 border-gray-200 cursor-not-allowed font-medium'
                      }`}
                    >
                      <Trash2 className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-gray-900 block">Recycle Product</span>
                        <span className="text-[10px] text-gray-500 font-semibold block">Locker drop-off recycling (+150 Credits)</span>
                      </div>
                    </button>

                    {/* Action 4: Refund/Return */}
                    <button
                      type="button"
                      onClick={() => {
                        setReturnOrder(aiEvalOrder);
                        setAiEvalOrder(null);
                      }}
                      className="p-3.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-left flex items-start gap-2.5 transition-all"
                    >
                      <RotateCcw className="h-5 w-5 text-gray-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-gray-900 block">Return or Refund</span>
                        <span className="text-[10px] text-gray-550 block font-semibold">Initiate standard carrier returns</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Back button */}
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setAiEvalStep('scan')}
                    className="px-4 py-2 border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                  >
                    <Sliders className="h-3.5 w-3.5" /> Adjust Score
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
