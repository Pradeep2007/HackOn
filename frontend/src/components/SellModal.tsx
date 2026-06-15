'use client';

import React, { useState, useEffect } from 'react';
import { X, Play, Loader2, Sparkles, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

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
}

interface SellModalProps {
  order: Order;
  onClose: () => void;
  onPublishSuccess: () => void;
}

// Category-specific checklists helper
const getInitialChecklist = (productName: string, category?: string) => {
  const name = productName.toLowerCase();
  const cat = category?.toLowerCase();
  if (cat === 'furniture') {
    return {};
  }
  if (name.includes('iphone') || name.includes('phone') || name.includes('pixel')) {
    return {
      powersOn: true,
      chargingWorks: true,
      cameraWorks: true,
      speakerWorks: true,
      wifiWorks: true,
      touchWorks: true
    };
  }
  if (name.includes('macbook') || name.includes('laptop') || name.includes('dell')) {
    return {
      powersOn: true,
      keyboardWorks: true,
      screenWorks: true,
      touchpadWorks: true,
      wifiWorks: true,
      batteryCharges: true
    };
  }
  if (name.includes('sony') || name.includes('headphone') || name.includes('earbud') || name.includes('audio')) {
    return {
      powersOn: true,
      chargingWorks: true,
      bluetoothWorks: true,
      audioBalance: true,
      noiseCancellingWorks: true,
      buttonsWork: true
    };
  }
  return {
    powersOn: true,
    chargingWorks: true,
    buttonsWork: true,
    portIntegrity: true,
    indicatorLight: true,
    casingIntact: true
  };
};

export default function SellModal({ order, onClose, onPublishSuccess }: SellModalProps) {
  // Form Inputs
  const [sellingPrice, setSellingPrice] = useState('');
  const [description, setDescription] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [zipCode, setZipCode] = useState('110001'); // Auto-populated from profile
  
  // Hardware verifications
  const [imei, setImei] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // Functional Checklist (loaded dynamically based on product name)
  const [functionalChecks, setFunctionalChecks] = useState<any>({});

  // Media Files
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  // States
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(true);
  const [currentAmazonPrice, setCurrentAmazonPrice] = useState(order.originalPurchasePrice);
  const [smartPricingOptions, setSmartPricingOptions] = useState<any>(null);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<any | null>(null);
  const [aiRejection, setAiRejection] = useState<any | null>(null);
  const [simulateMismatch, setSimulateMismatch] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize dynamic checklist based on order item name and category
  useEffect(() => {
    if (order) {
      setFunctionalChecks(getInitialChecklist(order.productName, order.category));
    }
  }, [order]);

  // Fetch smart pricing options & user defaults (verification code + zipcode)
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoadingOrderDetails(true);
        const res = await fetch(`http://localhost:5000/api/orders/${order._id}`);
        if (res.ok) {
          const data = await res.json();
          setVerificationCode(data.verificationCode);
          setCurrentAmazonPrice(data.currentAmazonPrice);
          setSmartPricingOptions(data.smartPricingOptions);
        }

        // Fetch seller zipcode from profile
        const userRes = await fetch('http://localhost:5000/api/user');
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.user?.defaultZipCode) {
            setZipCode(userData.user.defaultZipCode);
          }
        }
      } catch (err) {
        console.error('Error fetching modal defaults:', err);
      } finally {
        setLoadingOrderDetails(false);
      }
    };
    fetchOrderDetails();
  }, [order._id]);

  // Handle Checklist Toggles
  const handleChecklistChange = (key: string) => {
    setFunctionalChecks((prev: any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // File Handlers
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...filesArray].slice(0, 5));
    }
  };

  // Run AI Analysis
  const handleAnalyzeCondition = async () => {
    if (!videoFile) {
      setErrorMsg('Please upload a product inspection video first.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);
    setAiReport(null);
    setAiRejection(null);

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('orderId', order._id);
    formData.append('imei', imei);
    formData.append('serialNumber', serialNumber);
    formData.append('simulateMismatch', simulateMismatch ? 'true' : 'false');
    formData.append('functionalChecks', JSON.stringify(functionalChecks));

    try {
      const response = await fetch('http://localhost:5000/api/listings/analyze-condition', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.productMatchScore !== undefined && errorData.productMatchScore < 70) {
          setAiRejection(errorData);
          setAnalyzing(false);
          return;
        }
        throw new Error(errorData.error || 'AI analysis failed.');
      }

      const data = await response.json();
      
      // Scanning animation delay
      setTimeout(() => {
        setAiReport(data);
        setAnalyzing(false);
        setAiRejection(null);
        
        // Auto-recommend selling price
        const cat = data.conditionCategory;
        if (smartPricingOptions && smartPricingOptions[cat]) {
          const recPrice = smartPricingOptions[cat].recommendedPrice;
          setSellingPrice(recPrice.toString());
        }

        setConditionNotes(
          `AI Verified (${data.conditionCategory}). Trust Score: ${data.trustScore}%. Ownership Confidence: ${data.ownershipConfidence}%. Product Match Score: ${data.productMatchScore}%.`
        );
      }, 3000);
    } catch (err: any) {
      setAnalyzing(false);
      setErrorMsg(err.message || 'An error occurred during video analysis.');
    }
  };

  // Submit Listing
  const handlePublishListing = async () => {
    if (!sellingPrice) {
      setErrorMsg('Please enter a selling price.');
      return;
    }
    if (parseFloat(sellingPrice) > order.originalPurchasePrice) {
      setErrorMsg('Selling price cannot exceed the original purchase price.');
      return;
    }
    if (!description) {
      setErrorMsg('Please enter a product description.');
      return;
    }
    if (!conditionNotes) {
      setErrorMsg('Please write details about the condition.');
      return;
    }
    if (!zipCode) {
      setErrorMsg('Please enter your local Zip Code pin.');
      return;
    }

    setPublishing(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('orderId', order._id);
    formData.append('sellingPrice', sellingPrice);
    formData.append('description', description);
    formData.append('conditionNotes', conditionNotes);
    formData.append('imei', imei);
    formData.append('serialNumber', serialNumber);
    formData.append('verificationCode', verificationCode);
    formData.append('zipCode', zipCode);
    
    if (aiReport) {
      formData.append('aiReportId', aiReport._id);
    }

    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish listing.');
      }

      setPublishing(false);
      onPublishSuccess();
    } catch (err: any) {
      setPublishing(false);
      setErrorMsg(err.message || 'An error occurred while publishing listing.');
    }
  };

  const getPricingInsights = () => {
    if (!aiReport || !smartPricingOptions) return null;
    const cat = aiReport.conditionCategory;
    const recommendation = smartPricingOptions[cat];
    if (!recommendation) return null;

    const userPrice = parseFloat(sellingPrice) || 0;
    const recommendedPrice = recommendation.recommendedPrice;
    
    const isBelow = userPrice <= recommendedPrice;

    return {
      recommendedPrice,
      recommendedRange: recommendation.recommendedRange,
      isBelow,
      expectedSaleTime: isBelow ? '2-5 Days' : '10-15 Days',
      probability: isBelow ? '92%' : '45%'
    };
  };

  const priceInsights = getPricingInsights();
  const isPhone = order.productName.toLowerCase().includes('iphone');
  const isLaptop = order.productName.toLowerCase().includes('macbook') || order.productName.toLowerCase().includes('laptop');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 overflow-y-auto p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-5xl shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#f3a847]" />
            <h2 className="text-xl font-bold text-gray-800">Sell This Item (Amazon Customer Resell)</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-black p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loadingOrderDetails ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#e47911]" />
            <p className="text-sm text-gray-550 font-bold">Initializing Smart Pricing & Ledger details...</p>
          </div>
        ) : (
          /* Content Body */
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[78vh] overflow-y-auto">
            
            {/* Prominent Verification Code Banner */}
            <div className="col-span-1 lg:col-span-2 bg-[#f7fafe] border border-[#c8e1ff] p-4 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs animate-in fade-in duration-200">
              <div className="space-y-1">
                <h4 className="font-bold text-[#002f6c] uppercase tracking-wider flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#007185]" />
                  Ownership Verification Code Required
                </h4>
                <p className="text-[11px] text-gray-650 leading-relaxed font-semibold">
                  ⚠️ To verify ownership, you must display the unique verification code <strong className="text-blue-700 font-mono text-xs">{verificationCode}</strong> alongside the physical product in your uploaded video before publishing the listing.
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-200 text-center shrink-0 min-w-[150px]">
                <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Verification Key</span>
                <span className="text-xl font-extrabold text-blue-700 font-mono tracking-widest">{verificationCode}</span>
              </div>
            </div>

            {/* Left Column: Read-Only Order Details & Badges */}
            <div className="space-y-5 border-r border-gray-200 pr-0 lg:pr-6">
              
              {/* Order Box */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-150 space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 pb-1.5">
                  <span className="font-bold text-gray-700 text-xs uppercase tracking-wide">
                    Original Order Details
                  </span>
                  <span className="bg-[#febd69]/20 text-[#c45500] font-bold px-2 py-0.5 rounded text-[10px]">
                    Ledger Match ✓
                  </span>
                </div>
                
                <div className="flex gap-4">
                  <img 
                    src={order.productImage} 
                    alt={order.productName} 
                    className="w-20 h-20 object-contain rounded border border-gray-200 bg-white p-1"
                  />
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-gray-900 leading-snug line-clamp-2">
                      {order.productName}
                    </h4>
                    <p className="text-gray-500">
                      Brand: <span className="font-semibold text-gray-700">{order.brand}</span> | 
                      Category: <span className="font-semibold text-gray-700 ml-1">{order.category}</span>
                    </p>
                    <p className="text-gray-500">
                      Order ID: <span className="font-semibold text-gray-700">{order.orderId}</span>
                    </p>
                    <p className="text-gray-500">
                      Purchase Date: <span className="font-semibold text-gray-700">{new Date(order.purchaseDate).toLocaleDateString()}</span>
                    </p>
                    <p className="text-xs text-gray-900 font-bold mt-1">
                      Original Price: <span className="text-gray-600 font-normal">₹{order.originalPurchasePrice.toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Ownership Verification Instructions */}
              <div className="bg-[#f7fafe] p-4 rounded-md border border-[#c8e1ff] space-y-3 text-xs">
                <h4 className="font-bold text-[#002f6c] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#007185]" />
                  Ownership Verification
                </h4>
                
                <div className="bg-white p-3 rounded border border-blue-150 space-y-2 text-gray-700 font-medium">
                  <div className="flex justify-between items-center text-[10px] border-b border-gray-100 pb-1">
                    <span>VERIFICATION CODE</span>
                    <span className="font-black text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-150">
                      {verificationCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    ⚠️ To publish, you must show this **Verification Code ({verificationCode})** and the **Physical Product** together inside your uploaded inspection video.
                  </p>
                </div>

                {/* IMEI/Serial inputs for Electronics */}
                <div className="space-y-3 pt-1">
                  {isPhone ? (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 mb-1">
                        Device IMEI Number (Required for Phone Resell)
                      </label>
                      <input 
                        type="text" 
                        value={imei}
                        onChange={(e) => setImei(e.target.value)}
                        placeholder="Enter 15-digit IMEI number"
                        className="block w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#f3a847]"
                      />
                    </div>
                  ) : isLaptop ? (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 mb-1">
                        Laptop Serial Number (Required for Laptop Resell)
                      </label>
                      <input 
                        type="text" 
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        placeholder="Enter device serial number"
                        className="block w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#f3a847]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-gray-750 mb-1">
                        Product Serial Number (Required for Electronics Resell)
                      </label>
                      <input 
                        type="text" 
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        placeholder="Enter device serial number"
                        className="block w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#f3a847]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Functional Verification Checklist (Dynamic based on product category) */}
              {Object.keys(functionalChecks).length > 0 ? (
                <div className="bg-[#fafafa] p-4 rounded-md border border-gray-200 space-y-3 animate-in fade-in duration-200">
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
                    Category-Specific Functional Checklist
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    {Object.keys(functionalChecks).map((key) => {
                      const label = key.replace(/([A-Z])/g, ' $1');
                      return (
                        <label key={key} className="flex items-center gap-2 cursor-pointer hover:text-gray-900 text-gray-700 capitalize">
                          <input
                            type="checkbox"
                            checked={functionalChecks[key]}
                            onChange={() => handleChecklistChange(key)}
                            className="rounded text-[#e47911] focus:ring-[#e47911] h-4 w-4"
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-[#fcf8e3] border border-[#faebcc] p-4 rounded-md text-xs text-[#8a6d3b] space-y-1.5 animate-in fade-in duration-200">
                  <h4 className="font-bold text-[#8a6d3b] block uppercase tracking-wider text-[10px]">
                    ⚙️ Functional Verification Bypassed
                  </h4>
                  <p className="leading-relaxed">
                    This item is categorized as <strong>{order.category}</strong>. Amazon Resell guidelines do not require functional diagnostics for general furniture.
                  </p>
                </div>
              )}

              {/* Location display from profile (read-only / static confirmation) */}
              <div className="space-y-1 bg-gray-50 border border-gray-200 p-3 rounded-md text-xs">
                <span className="font-bold text-gray-500 block uppercase text-[10px]">Seller Location Pincode</span>
                <span className="font-bold text-gray-900">📍 {zipCode} (Fetched from Default Address)</span>
              </div>

            </div>

            {/* Right Column: Listing Details & AI analysis */}
            <div className="space-y-6">
              
              {/* Media Uploads */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800 text-xs uppercase border-b border-gray-200 pb-1">
                  Upload Media
                </h3>
                
                {/* Video */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-655 mb-1">
                    Inspection Video (Max 10s showing device + code {verificationCode})
                  </label>
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleVideoChange}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 border border-gray-300 rounded"
                  />
                  <div className="mt-2.5 flex items-center gap-2 bg-red-50/50 border border-red-100 p-2 rounded">
                    <input 
                      type="checkbox"
                      id="simulateMismatch"
                      checked={simulateMismatch}
                      onChange={(e) => setSimulateMismatch(e.target.checked)}
                      className="rounded text-red-650 focus:ring-red-500 h-4 w-4"
                    />
                    <label htmlFor="simulateMismatch" className="text-[11px] font-bold text-red-800 cursor-pointer select-none">
                      Simulate Mismatch Upload (Forces AI Product Match Failure)
                    </label>
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-655 mb-1">
                    Product Images (Upload up to 5 photos)
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImagesChange}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 border border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* AI Scan Analysis Block */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                  <h3 className="font-bold text-gray-800 text-xs uppercase flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-[#f3a847]" />
                    AI Condition Scan
                  </h3>
                  <button
                    type="button"
                    onClick={handleAnalyzeCondition}
                    disabled={analyzing || !videoFile}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                      videoFile 
                        ? 'bg-gradient-to-r from-[#f3a847] to-[#e47911] text-white hover:opacity-95'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-300'
                    }`}
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      'Analyze Video'
                    )}
                  </button>
                </div>

                {/* AI Scope Boundary Info Box */}
                <div className="text-[10px] text-gray-500 bg-gray-50 p-2.5 rounded border border-gray-150 leading-relaxed">
                  ℹ️ <strong>AI Scan Scope:</strong> The computer vision scanner audits external, physical cosmetic parameters (scratches, dents, cracks) visible in the video, and performs anti-fraud matching. It does not run internal diagnostics.
                </div>

                {/* Laser scan animation */}
                {analyzing && (
                  <div className="border border-blue-200 bg-blue-50/40 rounded-md p-6 flex flex-col items-center justify-center space-y-2 relative overflow-hidden h-32">
                    <div className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-bounce w-full top-0" />
                    <Loader2 className="h-6 w-6 text-[#007185] animate-spin" />
                    <p className="text-xs font-bold text-[#002f6c] animate-pulse">
                      Amazon AI scanning video for code {verificationCode} and product match...
                    </p>
                  </div>
                )}

                {/* AI Mismatch Rejection Warning Card */}
                {aiRejection && (
                  <div className="border border-red-300 bg-red-50/50 rounded-md p-4 space-y-3 text-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 border-b border-red-200 pb-2">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                      <div>
                        <h4 className="font-extrabold text-red-800 text-sm">Resell Listing Rejected</h4>
                        <p className="text-[10px] text-red-600 font-semibold">AI Product Match Verification Failed (Score: {aiRejection.productMatchScore}%)</p>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-gray-700 leading-relaxed font-medium">
                      {aiRejection.reason}
                    </p>

                    <div className="bg-white p-3 rounded border border-red-150 space-y-2">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">AI Scan Discrepancy Log:</span>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 font-bold uppercase block">Expected from Order Ledger:</span>
                          <ul className="space-y-0.5 text-gray-700 list-inside list-disc">
                            <li>Brand: <span className="font-extrabold text-gray-900">{aiRejection.expectedAttributes?.brand}</span></li>
                            <li>Model: <span className="font-extrabold text-gray-900">{aiRejection.expectedAttributes?.model}</span></li>
                            <li>Category: <span className="font-extrabold text-gray-900">{aiRejection.expectedAttributes?.category}</span></li>
                            <li>Color: <span className="font-extrabold text-gray-900">{aiRejection.expectedAttributes?.color}</span></li>
                          </ul>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-red-500 font-bold uppercase block">Detected in Video:</span>
                          <ul className="space-y-0.5 text-red-700 list-inside list-disc">
                            <li>Brand: <span className="font-extrabold text-red-900">{aiRejection.detectedAttributes?.brand}</span></li>
                            <li>Model: <span className="font-extrabold text-red-900">{aiRejection.detectedAttributes?.model}</span></li>
                            <li>Category: <span className="font-extrabold text-red-900">{aiRejection.detectedAttributes?.category}</span></li>
                            <li>Color: <span className="font-extrabold text-red-900">{aiRejection.detectedAttributes?.color}</span></li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-100/55 border border-red-200 p-2.5 rounded text-[10px] font-bold text-red-800 leading-relaxed">
                      ⚠️ Amazon anti-fraud guidelines require the uploaded video to match your original purchased item. Please upload a new video showing the correct item alongside the code <strong>{verificationCode}</strong> and scan again.
                    </div>
                  </div>
                )}

                {/* AI Condition Inspection Report */}
                {aiReport && (
                  <div className="border border-green-200 bg-[#f4faf4] rounded-md p-3.5 space-y-3 text-xs animate-in fade-in slide-in-from-bottom-2 duration-350">
                    <div className="flex items-center justify-between border-b border-green-100 pb-1.5">
                      <span className="font-black text-[#1e4620] tracking-wider uppercase flex items-center gap-1 text-[10px]">
                        🛡️ Amazon AI Inspection Log
                      </span>
                      <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        AI Verified ✓
                      </span>
                    </div>

                    {/* 4 Distinct Trust Vectors displayed separately */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-white p-1.5 rounded border border-green-150">
                        <span className="block text-[9px] text-gray-400 font-bold uppercase">Trust Score</span>
                        <span className="font-extrabold text-emerald-700 text-sm">{aiReport.trustScore}/100</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-green-150">
                        <span className="block text-[9px] text-gray-400 font-bold uppercase">Ownership</span>
                        <span className="font-extrabold text-blue-700 text-sm">{aiReport.ownershipConfidence}%</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-green-150">
                        <span className="block text-[9px] text-gray-400 font-bold uppercase">Product Match</span>
                        <span className="font-extrabold text-[#007185] text-sm">{aiReport.productMatchScore || 100}%</span>
                      </div>
                      <div className="bg-white p-1.5 rounded border border-green-150">
                        <span className="block text-[9px] text-gray-400 font-bold uppercase">Condition</span>
                        <span className="font-extrabold text-orange-700 text-sm">{aiReport.conditionScore}/100</span>
                      </div>
                    </div>

                    {/* Product Match Verification Logs */}
                    {aiReport.expectedAttributes && aiReport.detectedAttributes && (
                      <div className="bg-white p-2.5 rounded border border-green-150 text-[10px] space-y-1">
                        <span className="font-bold text-gray-500 uppercase tracking-wider block">Product Match Verification Logs:</span>
                        <div className="flex justify-between items-center text-gray-700 border-b border-gray-100 pb-1">
                          <span>Brand: <span className="font-bold text-gray-900">{aiReport.expectedAttributes.brand}</span></span>
                          <span className="text-green-700 font-semibold">Matched ✓</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-700 border-b border-gray-100 pb-1">
                          <span>Model: <span className="font-bold text-gray-900">{aiReport.expectedAttributes.model}</span></span>
                          <span className="text-green-700 font-semibold">Matched ✓</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-700">
                          <span>Color: <span className="font-bold text-gray-900">{aiReport.expectedAttributes.color}</span></span>
                          <span className="text-green-700 font-semibold">Matched ✓</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 bg-white p-2.5 rounded border border-green-100">
                      <span className="text-[10px] font-bold text-gray-700 block uppercase">Detected Defect Logs:</span>
                      <ul className="text-[11px] space-y-1 text-gray-650 pl-3 list-disc">
                        {aiReport.detectedIssues.map((issue: string, idx: number) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Smart Pricing & Input Fields */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-xs uppercase border-b border-gray-200 pb-1">
                  Resale Pricing
                </h3>

                {/* Display Current Fetched Amazon Price */}
                <div className="bg-gray-55 p-3 rounded border border-gray-250 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-500 font-semibold block uppercase text-[10px]">Current Amazon Price</span>
                    <span className="font-extrabold text-base text-gray-900">₹{currentAmazonPrice.toLocaleString('en-IN')}</span>
                  </div>
                  {aiReport && smartPricingOptions && (
                    <div className="text-right">
                      <span className="text-gray-500 font-semibold block uppercase text-[10px]">Recommended Resale</span>
                      <span className="font-extrabold text-base text-[#007185]">
                        ₹{smartPricingOptions[aiReport.conditionCategory].recommendedPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pricing range advice */}
                {aiReport && smartPricingOptions && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs text-gray-700 space-y-1">
                    <div className="flex justify-between font-bold text-[#002f6c]">
                      <span>Recommended Price Range:</span>
                      <span>
                        ₹{smartPricingOptions[aiReport.conditionCategory].recommendedRange[0].toLocaleString('en-IN')} - 
                        ₹{smartPricingOptions[aiReport.conditionCategory].recommendedRange[1].toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-550 leading-relaxed font-semibold">
                      Based on current price, device age, visual inspections, and checklists.
                    </p>
                  </div>
                )}

                {/* Selling Price Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-755 mb-1">
                    Your Payout Price (You Receive)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-xs">
                      ₹
                    </div>
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder="e.g. 33150"
                      className="block w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#f3a847]"
                    />
                  </div>
                  
                  {/* Dynamic Pricing Split breakdown */}
                  {parseFloat(sellingPrice) > 0 && (() => {
                    const priceVal = parseFloat(sellingPrice) || 0;
                    const amazonFee = Math.min(3000, Math.max(500, Math.round(priceVal * 0.1)));
                    const buyerPrice = priceVal + amazonFee;
                    return (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-xs space-y-2 mt-2 font-semibold">
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Seller Receives:</span>
                          <span className="font-bold text-gray-900">₹{priceVal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Amazon Resell Fee (10%):</span>
                          <span className="font-bold text-gray-900">+ ₹{amazonFee.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-1.5 flex justify-between items-center text-gray-850 font-bold">
                          <span>Final Buyer Price:</span>
                          <span className="text-[#007185] font-black text-sm">₹{buyerPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-[9px] text-gray-400 font-normal leading-normal">
                          * Amazon Resell fee is 10% (min ₹500, max ₹3,000), covering AI inspection, ledger audit validation, and escrow protection.
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Fast Selling Insights / Warnings */}
                {aiReport && priceInsights && (
                  <div className="animate-in fade-in duration-200">
                    {priceInsights.isBelow ? (
                      /* Fast selling positive insights */
                      <div className="p-3 bg-green-50 border border-green-200 rounded text-xs text-green-800 space-y-2">
                        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-green-900">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>For Faster Selling</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                          <div className="bg-white p-1 rounded border border-green-150">
                            <span className="text-gray-400 block font-normal">Rec Price</span>
                            <span className="text-xs text-gray-800">₹{priceInsights.recommendedPrice.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-green-150">
                            <span className="text-gray-400 block font-normal">Sale Time</span>
                            <span className="text-xs text-gray-800">{priceInsights.expectedSaleTime}</span>
                          </div>
                          <div className="bg-white p-1 rounded border border-green-150">
                            <span className="text-gray-400 block font-normal">Probability</span>
                            <span className="text-xs text-green-700 font-extrabold">{priceInsights.probability}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-green-700 font-semibold leading-snug">
                          ✓ Price is at or below recommended value. High chance of immediate sale!
                        </p>
                      </div>
                    ) : (
                      /* Warning insights if user sets higher price */
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-yellow-600 mt-0.5" />
                        <p className="text-[11px] leading-snug font-semibold">
                          This price is above Amazon's recommended value of **₹{priceInsights.recommendedPrice.toLocaleString('en-IN')}** and may take longer to sell.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Descriptions */}
                <div className="grid grid-cols-1 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-0.5">
                      Seller Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Usage details, boxed items, reasons..."
                      className="block w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:focus:ring-[#f3a847]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-0.5">
                      Condition & Defect Notes
                    </label>
                    <textarea
                      rows={2}
                      value={conditionNotes}
                      onChange={(e) => setConditionNotes(e.target.value)}
                      placeholder="Specific hardware or software comments..."
                      className="block w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:focus:ring-[#f3a847]"
                    />
                  </div>
                </div>

              </div>

              {/* Error Box */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2 animate-pulse">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handlePublishListing}
            disabled={publishing || analyzing || loadingOrderDetails || aiRejection !== null}
            className={`px-5 py-2 text-xs font-black rounded shadow-sm transition-all ${
              publishing || aiRejection !== null
                ? 'bg-yellow-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[#febd69] hover:bg-[#f3a847] text-black cursor-pointer'
            }`}
          >
            {publishing ? 'Publishing...' : aiRejection !== null ? 'Listing Blocked' : 'Publish Listing'}
          </button>
        </div>

      </div>
    </div>
  );
}
