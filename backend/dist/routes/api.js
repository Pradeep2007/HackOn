"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReturnExpiryDate = exports.getReturnWindowDays = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = require("../config/multer");
const User_1 = __importDefault(require("../models/User"));
const Order_1 = __importDefault(require("../models/Order"));
const Listing_1 = __importDefault(require("../models/Listing"));
const AIReport_1 = __importDefault(require("../models/AIReport"));
const TrustScore_1 = __importDefault(require("../models/TrustScore"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const rapidapi_1 = require("../services/rapidapi");
const mongoose_1 = __importDefault(require("mongoose"));
const Donation_1 = __importDefault(require("../models/Donation"));
const googlemaps_1 = require("../services/googlemaps");
const FlashDeal_1 = __importDefault(require("../models/FlashDeal"));
const router = express_1.default.Router();
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000';
// Mock/Fetched catalog mapping helper
const getCatalogProduct = async (productId) => {
    return await (0, rapidapi_1.fetchAmazonProductData)(productId);
};
// Unique verification code helper
const getVerificationCode = (orderId) => {
    const digits = orderId.replace(/[^0-9]/g, '');
    return `AMZ-${digits.substring(digits.length - 4)}`;
};
// Return window eligibility calculator
const getReturnWindowDays = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes('electronics') ||
        cat.includes('smartphone') ||
        cat.includes('headphone') ||
        cat.includes('echo') ||
        cat.includes('kindle') ||
        cat.includes('smartwatch') ||
        cat.includes('tablet') ||
        cat.includes('laptop') ||
        cat.includes('appliances')) {
        return 7;
    }
    if (cat.includes('fashion') ||
        cat.includes('apparel') ||
        cat.includes('clothing') ||
        cat.includes('shoes')) {
        return 10;
    }
    return 30; // General Products
};
exports.getReturnWindowDays = getReturnWindowDays;
const getReturnExpiryDate = (purchaseDate, category) => {
    const windowDays = (0, exports.getReturnWindowDays)(category);
    return new Date(purchaseDate.getTime() + windowDays * 24 * 60 * 60 * 1000);
};
exports.getReturnExpiryDate = getReturnExpiryDate;
// Proximity local delivery calculator
const calculateProximity = (sellerZip, buyerZip = '110001') => {
    const sz = sellerZip.trim();
    const bz = buyerZip.trim();
    if (sz === bz) {
        return {
            distanceKm: 1.2,
            phase: 'Stage 1 (0-25 km)',
            audience: 'Local Neighborhood',
            deliveryTime: '2-4 hours',
            saleTime: '2-3 days'
        };
    }
    if (sz.substring(0, 3) === bz.substring(0, 3)) {
        return {
            distanceKm: 8.5,
            phase: 'Stage 1 (0-25 km)',
            audience: 'Local District',
            deliveryTime: '4-6 hours',
            saleTime: '2-5 days'
        };
    }
    if (sz.substring(0, 2) === bz.substring(0, 2)) {
        return {
            distanceKm: 65,
            phase: 'Stage 2 (Nearby Cities)',
            audience: 'Metropolitan Area',
            deliveryTime: '1 day',
            saleTime: '3-6 days'
        };
    }
    return {
        distanceKm: 1150,
        phase: 'Stage 3 (Nationwide)',
        audience: 'Nationwide Buyers',
        deliveryTime: '2-3 days',
        saleTime: '5-9 days'
    };
};
// Smart Pricing calculation formula
const calculateRecommendedPrice = (currentPrice, purchaseDate, condition) => {
    const today = new Date();
    const purchase = new Date(purchaseDate);
    const ageInMonths = (today.getFullYear() - purchase.getFullYear()) * 12 + today.getMonth() - purchase.getMonth();
    // Age Factors
    let ageFactor = 0.35;
    if (ageInMonths <= 3)
        ageFactor = 0.90;
    else if (ageInMonths <= 6)
        ageFactor = 0.85;
    else if (ageInMonths <= 12)
        ageFactor = 0.75;
    else if (ageInMonths <= 24)
        ageFactor = 0.65;
    else if (ageInMonths <= 36)
        ageFactor = 0.50;
    // Condition Factors
    let conditionFactor = 0.40;
    if (condition === 'Like New')
        conditionFactor = 0.95;
    else if (condition === 'Excellent')
        conditionFactor = 0.85;
    else if (condition === 'Good')
        conditionFactor = 0.75;
    else if (condition === 'Fair')
        conditionFactor = 0.60;
    else if (condition === 'Poor')
        conditionFactor = 0.40;
    const recommendedPrice = Math.round(currentPrice * ageFactor * conditionFactor);
    const recommendedRange = [
        Math.round(recommendedPrice * 0.9),
        Math.round(recommendedPrice * 1.1)
    ];
    return {
        ageInMonths,
        ageFactor,
        conditionFactor,
        recommendedPrice,
        recommendedRange
    };
};
// Active user lookup helper
let activeEmail = 'seller@amazonresell.com'; // Default active user
const getActiveUser = async () => {
    let user = await User_1.default.findOne({ email: activeEmail });
    if (!user) {
        user = await User_1.default.findOne({});
    }
    return user;
};
// Auth Sign-In / Login API
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Auth Failed: Account not found.' });
        }
        if (email === 'seller@amazonresell.com' && password !== 'seller123') {
            return res.status(401).json({ error: 'Invalid password.' });
        }
        if (email === 'buyer@amazonresell.com' && password !== 'buyer123') {
            return res.status(401).json({ error: 'Invalid password.' });
        }
        activeEmail = email;
        res.json({ success: true, user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/auth/logout', async (req, res) => {
    try {
        activeEmail = 'seller@amazonresell.com'; // reset to seller
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 1. GET /api/user - Get active seller
router.get('/user', async (req, res) => {
    try {
        const user = await getActiveUser();
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const scoreDoc = await TrustScore_1.default.findOne({ user: user._id });
        res.json({ user, trustScoreDetails: scoreDoc || null });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 2. GET /api/orders - Get order history
router.get('/orders', async (req, res) => {
    try {
        const user = await getActiveUser();
        if (!user) {
            return res.status(404).json({ error: 'Seed user not found.' });
        }
        const orders = await Order_1.default.find({ user: user._id });
        const ordersWithDetails = await Promise.all(orders.map(async (order) => {
            const listing = await Listing_1.default.findOne({ order: order._id });
            const verificationCode = getVerificationCode(order.orderId);
            // Fetch price using RapidAPI Amazon service
            let currentAmazonPrice = order.originalPurchasePrice;
            const apiData = await getCatalogProduct(order.productName);
            if (apiData)
                currentAmazonPrice = apiData.price;
            return {
                ...order.toObject(),
                isAlreadyListed: !!listing,
                listingId: listing ? listing._id : null,
                verificationCode,
                currentAmazonPrice
            };
        }));
        res.json(ordersWithDetails);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 3. GET /api/orders/:id - Single order details
router.get('/orders/:id', async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        const verificationCode = getVerificationCode(order.orderId);
        // Fetch from RapidAPI service
        let currentAmazonPrice = order.originalPurchasePrice;
        const apiData = await getCatalogProduct(order.productName);
        if (apiData)
            currentAmazonPrice = apiData.price;
        const pricingOptions = {
            'Like New': calculateRecommendedPrice(currentAmazonPrice, order.purchaseDate, 'Like New'),
            'Excellent': calculateRecommendedPrice(currentAmazonPrice, order.purchaseDate, 'Excellent'),
            'Good': calculateRecommendedPrice(currentAmazonPrice, order.purchaseDate, 'Good'),
            'Fair': calculateRecommendedPrice(currentAmazonPrice, order.purchaseDate, 'Fair'),
            'Poor': calculateRecommendedPrice(currentAmazonPrice, order.purchaseDate, 'Poor')
        };
        res.json({
            order,
            verificationCode,
            currentAmazonPrice,
            smartPricingOptions: pricingOptions
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 4. POST /api/listings/analyze-condition - AI Video scan with expected/detected product match verification
router.post('/listings/analyze-condition', multer_1.upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a video file for inspection.' });
        }
        const videoPath = `/uploads/${req.file.filename}`;
        const { orderId, imei, serialNumber, simulateMismatch } = req.body;
        const order = await Order_1.default.findById(orderId);
        if (!order) {
            return res.status(400).json({ error: 'Order not found.' });
        }
        // 1. EXTRACT EXPECTED ATTRIBUTES FROM ORDER
        const expectedBrand = order.brand;
        const expectedCategory = order.category;
        let expectedModel = 'iPhone 14';
        let expectedColor = 'Blue';
        if (order.productName.toLowerCase().includes('macbook')) {
            expectedModel = 'MacBook Air M2';
            expectedColor = 'Space Grey';
        }
        else if (order.productName.toLowerCase().includes('sony')) {
            expectedModel = 'WH-1000XM5';
            expectedColor = 'Black';
        }
        else if (order.productName.toLowerCase().includes('chair')) {
            expectedModel = 'Ergonomic Chair';
            expectedColor = 'Grey & Black';
        }
        let expectedAttributes = {
            brand: expectedBrand,
            model: expectedModel,
            category: expectedCategory,
            color: expectedColor
        };
        // Call FastAPI visual check python server on port 8000
        let fastapiResult = null;
        try {
            const fs = require('fs');
            const blob = new Blob([fs.readFileSync(req.file.path)]);
            const body = new FormData();
            body.append('video', blob, req.file.originalname);
            body.append('orderId', orderId);
            body.append('brand', expectedBrand);
            body.append('model', expectedModel);
            body.append('category', expectedCategory);
            body.append('color', expectedColor);
            body.append('simulateMismatch', simulateMismatch || 'false');
            body.append('functionalChecks', req.body.functionalChecks || '{}');
            const fastapiRes = await fetch(`${AI_ENGINE_URL}/analyze`, {
                method: 'POST',
                body
            });
            if (fastapiRes.ok) {
                fastapiResult = await fastapiRes.json();
            }
        }
        catch (err) {
            console.log('[AI Engine] FastAPI Visual check engine offline. Falling back to local visual check simulation.');
        }
        // 2. EXTRACT DETECTED ATTRIBUTES (Simulate AI Video scans)
        let detectedAttributes = { ...expectedAttributes };
        let productMatchScore = 96; // base perfect match score
        let selectedReport = null;
        if (fastapiResult) {
            productMatchScore = fastapiResult.productMatchScore;
            expectedAttributes = fastapiResult.expectedAttributes;
            detectedAttributes = fastapiResult.detectedAttributes;
            selectedReport = {
                conditionCategory: fastapiResult.conditionCategory,
                conditionScore: fastapiResult.conditionScore,
                confidenceScore: 92,
                detectedIssues: fastapiResult.detectedIssues
            };
        }
        else {
            // Fallback local visual checks
            if (simulateMismatch === 'true') {
                detectedAttributes = {
                    brand: 'Apple',
                    model: 'iPhone 14',
                    category: 'Electronics',
                    color: 'Blue'
                };
                productMatchScore = 12; // Far below 70%
            }
            const reports = [
                {
                    conditionCategory: 'Excellent',
                    conditionScore: 88,
                    confidenceScore: 92,
                    detectedIssues: ['Minor light scratches on frame', 'No glass cracks', 'Ports clean']
                },
                {
                    conditionCategory: 'Like New',
                    conditionScore: 96,
                    confidenceScore: 95,
                    detectedIssues: ['Pristine display condition', 'Zero visible scratches', 'Ports clean']
                },
                {
                    conditionCategory: 'Good',
                    conditionScore: 82,
                    confidenceScore: 90,
                    detectedIssues: ['Moderate scuffs on corners', 'Back panel wear', 'No structural cracks']
                }
            ];
            const localReport = reports[Math.floor(Math.random() * reports.length)];
            selectedReport = {
                conditionCategory: localReport.conditionCategory,
                conditionScore: localReport.conditionScore,
                confidenceScore: localReport.confidenceScore,
                detectedIssues: localReport.detectedIssues
            };
        }
        // STAGE 2.5: VERIFY PRODUCT MATCH (Anti-Fraud check)
        if (productMatchScore < 70) {
            return res.status(400).json({
                error: 'Verification Failed: Uploaded product does not match purchased product.',
                reason: `Expected brand: ${expectedBrand} and model: ${expectedModel}. Detected brand: ${detectedAttributes.brand} and model: ${detectedAttributes.model} in video.`,
                productMatchScore,
                expectedAttributes,
                detectedAttributes
            });
        }
        // 3. PARSE FUNCTIONAL CHECKS
        let functionalChecks = {};
        let functionalScore = 100;
        if (expectedCategory !== 'Furniture') {
            functionalChecks = {
                powersOn: true,
                chargingWorks: true,
                cameraWorks: true,
                speakerWorks: true,
                wifiWorks: true,
                touchWorks: true
            };
            if (req.body.functionalChecks) {
                try {
                    functionalChecks = JSON.parse(req.body.functionalChecks);
                    const keys = Object.keys(functionalChecks);
                    const passed = keys.filter(k => functionalChecks[k] === true).length;
                    functionalScore = Math.round((passed / keys.length) * 100);
                }
                catch (e) {
                    // fallback 100
                }
            }
        }
        else {
            // Furniture has no checklists
            functionalChecks = null;
            functionalScore = 100;
        }
        if (functionalScore < 100 && expectedCategory !== 'Furniture') {
            selectedReport.conditionCategory = 'Fair';
            selectedReport.conditionScore = Math.round(functionalScore * 0.8);
            selectedReport.detectedIssues = ['Failed component checks', 'Moderate physical scuffs', 'Light casing wear'];
        }
        // 5. CALCULATE AI OWNERSHIP CONFIDENCE
        let ownershipConfidence = 95; // base score if code is in video
        if (expectedCategory !== 'Furniture' && !imei && !serialNumber) {
            ownershipConfidence = 75; // low confidence if hardware keys omitted
        }
        // 6. COMPREHENSIVE TRUST MODEL CALCULATION
        const purchaseVerificationScore = 100; // verified purchase ledger
        const trustScore = Math.round((purchaseVerificationScore * 0.3) +
            (ownershipConfidence * 0.2) +
            (productMatchScore * 0.2) +
            (selectedReport.conditionScore * 0.15) +
            (functionalScore * 0.15));
        const report = await AIReport_1.default.create({
            conditionCategory: selectedReport.conditionCategory,
            conditionScore: selectedReport.conditionScore,
            confidenceScore: selectedReport.confidenceScore,
            detectedIssues: selectedReport.detectedIssues,
            videoPath,
            // Scores
            ownershipConfidence,
            functionalScore,
            functionalChecks,
            trustScore,
            productMatchScore,
            expectedAttributes,
            detectedAttributes
        });
        res.json(report);
    }
    catch (error) {
        console.error('AI analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});
// 5. POST /api/listings - Publish listing (with verification validations)
router.post('/listings', multer_1.upload.array('images', 5), async (req, res) => {
    try {
        const { orderId, sellingPrice, description, conditionNotes, aiReportId, imei, serialNumber, verificationCode, zipCode } = req.body;
        const files = req.files;
        const user = await getActiveUser();
        if (!user) {
            return res.status(404).json({ error: 'Seller account not found.' });
        }
        const order = await Order_1.default.findById(orderId);
        if (!order) {
            return res.status(400).json({ error: 'Order not found.' });
        }
        // verifications
        if (order.user.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Permission Denied.' });
        }
        if (order.deliveryStatus !== 'Delivered') {
            return res.status(400).json({ error: 'Order not delivered.' });
        }
        if (order.returnStatus === 'Returned') {
            return res.status(400).json({ error: 'Product was returned.' });
        }
        const returnExpiryDate = (0, exports.getReturnExpiryDate)(order.purchaseDate, order.category);
        if (new Date() <= returnExpiryDate) {
            return res.status(400).json({ error: 'Cannot resell while the product is still within its return window.' });
        }
        const existingListing = await Listing_1.default.findOne({ order: order._id });
        if (existingListing) {
            return res.status(400).json({ error: 'Listing already active.' });
        }
        const imagePaths = files && files.length > 0
            ? files.map(file => `/uploads/${file.filename}`)
            : [order.productImage];
        // Read AI report metrics
        let isAiVerified = false;
        let ownershipConfidence = 80;
        let functionalScore = 100;
        let functionalChecks = null;
        let trustScore = 90;
        let productMatchScore = 100;
        let expectedAttributes = null;
        let detectedAttributes = null;
        if (aiReportId && mongoose_1.default.Types.ObjectId.isValid(aiReportId)) {
            const report = await AIReport_1.default.findById(aiReportId);
            if (report) {
                isAiVerified = true;
                ownershipConfidence = report.ownershipConfidence;
                functionalScore = report.functionalScore || 100;
                functionalChecks = report.functionalChecks;
                trustScore = report.trustScore;
                productMatchScore = report.productMatchScore;
                expectedAttributes = report.expectedAttributes;
                detectedAttributes = report.detectedAttributes;
            }
        }
        // Revenue Model: Added 10% fee (Min 500, Max 3000)
        const priceVal = parseFloat(sellingPrice);
        const amazonFee = Math.min(3000, Math.max(500, Math.round(priceVal * 0.1)));
        const buyerPrice = priceVal + amazonFee;
        const listing = await Listing_1.default.create({
            order: order._id,
            seller: user._id,
            sellingPrice: priceVal,
            description,
            conditionNotes,
            images: imagePaths,
            aiReport: aiReportId || null,
            isPurchasedOnAmazon: true,
            isSellerVerified: true,
            isAiVerified,
            status: 'Active',
            imei,
            serialNumber,
            verificationCode,
            zipCode: zipCode || '110001',
            // Trust scores
            ownershipConfidence,
            functionalScore,
            functionalChecks,
            trustScore,
            productMatchScore,
            expectedAttributes,
            detectedAttributes,
            // Revenue & Sustainability
            buyerPrice,
            amazonFee,
            sustainabilityScore: order.sustainabilityScore || 85,
            sustainabilityBadge: order.sustainabilityBadge || 'Silver',
            co2Savings: order.co2Savings || 12
        });
        res.status(201).json({
            success: true,
            message: 'Listing published successfully!',
            listing
        });
    }
    catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({ error: error.message });
    }
});
// 6. GET /api/products (Unified Search: New + Used side-by-side)
router.get('/products', async (req, res) => {
    try {
        const query = (req.query.q || '').toLowerCase();
        let buyerZip = req.query.zipCode;
        if (!buyerZip) {
            const activeUser = await getActiveUser();
            buyerZip = activeUser ? activeUser.defaultZipCode : '110001';
        }
        // Fetch catalog products dynamically
        const catalog = await Promise.all(['new-iphone-14', 'new-macbook-air-m2', 'new-sony-headphones', 'new-office-chair'].map(async (id) => {
            const prod = await getCatalogProduct(id);
            return {
                id,
                productName: prod.productName,
                brand: prod.brand,
                category: prod.category,
                price: prod.price,
                productImage: prod.images[0] || '',
                rating: prod.rating,
                reviewsCount: prod.reviewsCount,
                isPrime: true,
                isFulfilled: true,
                shipping: 'FREE Delivery by Amazon',
                isUsed: false
            };
        }));
        let matchedNew = catalog;
        if (query) {
            matchedNew = catalog.filter(p => p.productName.toLowerCase().includes(query) ||
                p.brand.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query));
        }
        // Fetch active resell listings
        const activeListings = await Listing_1.default.find({ status: 'Active' })
            .populate('order')
            .populate('seller')
            .populate('aiReport');
        const matchedUsed = activeListings.filter(listing => {
            const order = listing.order;
            if (!order)
                return false;
            const terms = `${order.productName} ${order.brand} ${order.category}`.toLowerCase();
            return query ? terms.includes(query) : true;
        }).map(listing => {
            const order = listing.order;
            const seller = listing.seller;
            const report = listing.aiReport;
            // Proximity distance matching
            const proximity = calculateProximity(listing.zipCode, buyerZip);
            return {
                id: listing._id,
                productId: order.productName.toLowerCase().includes('iphone 14') ? 'new-iphone-14' :
                    order.productName.toLowerCase().includes('macbook') ? 'new-macbook-air-m2' :
                        order.productName.toLowerCase().includes('chair') ? 'new-office-chair' : 'new-sony-headphones',
                productName: `${order.productName} (Used - ${report?.conditionCategory || 'Good'})`,
                brand: order.brand,
                category: order.category,
                price: listing.sellingPrice,
                productImage: listing.images[0] || order.productImage,
                isUsed: true,
                condition: report?.conditionCategory || 'Good',
                conditionScore: report?.conditionScore || 85,
                trustScore: listing.trustScore || report?.trustScore || 88,
                ownershipConfidence: listing.ownershipConfidence || report?.ownershipConfidence || 90,
                productMatchScore: listing.productMatchScore || report?.productMatchScore || 100,
                functionalScore: listing.functionalScore || report?.functionalScore || 100,
                isPurchasedOnAmazon: listing.isPurchasedOnAmazon,
                isSellerVerified: listing.isSellerVerified,
                isAiVerified: listing.isAiVerified,
                sellerName: seller?.name || 'Amazon Customer',
                conditionNotes: listing.conditionNotes,
                description: listing.description,
                // Smart Pricing metadata
                currentAmazonPrice: order.originalPurchasePrice,
                proximityDetails: proximity,
                // Sustainability & Revenue parameters
                buyerPrice: listing.buyerPrice || (listing.sellingPrice + Math.min(3000, Math.max(500, Math.round(listing.sellingPrice * 0.1)))),
                amazonFee: listing.amazonFee || Math.min(3000, Math.max(500, Math.round(listing.sellingPrice * 0.1))),
                sustainabilityScore: listing.sustainabilityScore || order.sustainabilityScore || 85,
                sustainabilityBadge: listing.sustainabilityBadge || order.sustainabilityBadge || 'Silver',
                co2Savings: listing.co2Savings || order.co2Savings || 12
            };
        });
        res.json([...matchedNew, ...matchedUsed]);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 7. GET /api/products/:id - Product Detail Page & Other Buying Options
router.get('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        let buyerZip = req.query.zipCode;
        if (!buyerZip) {
            const activeUser = await getActiveUser();
            buyerZip = activeUser ? activeUser.defaultZipCode : '110001';
        }
        // Fetch base catalog product using RapidAPI Amazon service
        const baseProduct = await getCatalogProduct(productId);
        if (!baseProduct) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        let searchName = '';
        if (productId === 'new-iphone-14')
            searchName = 'iphone 14';
        else if (productId === 'new-macbook-air-m2')
            searchName = 'macbook';
        else if (productId === 'new-sony-headphones')
            searchName = 'sony wh';
        else if (productId === 'new-office-chair')
            searchName = 'chair';
        const activeListings = await Listing_1.default.find({ status: 'Active' })
            .populate('order')
            .populate('seller')
            .populate('aiReport');
        const buyingOptions = activeListings.filter(listing => {
            const order = listing.order;
            return order && order.productName.toLowerCase().includes(searchName);
        }).map(listing => {
            const order = listing.order;
            const seller = listing.seller;
            const report = listing.aiReport;
            const proximity = calculateProximity(listing.zipCode, buyerZip);
            return {
                listingId: listing._id,
                sellerName: seller?.name || 'Amazon Customer',
                sellerId: seller?._id,
                price: listing.sellingPrice,
                condition: report?.conditionCategory || 'Good',
                conditionScore: report?.conditionScore || 85,
                // Individual trust model scores output separately
                trustScore: listing.trustScore || report?.trustScore || 88,
                ownershipConfidence: listing.ownershipConfidence || report?.ownershipConfidence || 90,
                productMatchScore: listing.productMatchScore || report?.productMatchScore || 100,
                functionalScore: listing.functionalScore || report?.functionalScore || 100,
                isPurchasedOnAmazon: listing.isPurchasedOnAmazon,
                isSellerVerified: listing.isSellerVerified,
                isAiVerified: listing.isAiVerified,
                conditionNotes: listing.conditionNotes,
                description: listing.description,
                video: report?.videoPath || null,
                images: listing.images,
                zipCode: listing.zipCode,
                proximityDetails: proximity,
                aiInspectionDetails: report ? {
                    condition: report.conditionCategory,
                    score: report.conditionScore,
                    confidence: report.confidenceScore,
                    detectedIssues: report.detectedIssues,
                    ownershipConfidence: report.ownershipConfidence || 90,
                    functionalScore: report.functionalScore || 100,
                    productMatchScore: report.productMatchScore || 100,
                    functionalChecks: report.functionalChecks,
                    expectedAttributes: report.expectedAttributes,
                    detectedAttributes: report.detectedAttributes
                } : null,
                // Sustainability & Revenue parameters
                buyerPrice: listing.buyerPrice || (listing.sellingPrice + Math.min(3000, Math.max(500, Math.round(listing.sellingPrice * 0.1)))),
                amazonFee: listing.amazonFee || Math.min(3000, Math.max(500, Math.round(listing.sellingPrice * 0.1))),
                sustainabilityScore: listing.sustainabilityScore || order.sustainabilityScore || 85,
                sustainabilityBadge: listing.sustainabilityBadge || order.sustainabilityBadge || 'Silver',
                co2Savings: listing.co2Savings || order.co2Savings || 12
            };
        });
        res.json({
            product: {
                id: productId,
                productName: baseProduct.productName,
                brand: baseProduct.brand,
                category: baseProduct.category,
                price: baseProduct.price,
                productImage: baseProduct.images[0] || '',
                rating: baseProduct.rating,
                reviewsCount: baseProduct.reviewsCount,
                isPrime: true,
                isFulfilled: true,
                shipping: 'FREE Delivery by Amazon'
            },
            otherBuyingOptions: buyingOptions
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 8. POST /api/listings/:id/buy - Complete buying transaction of a listing
router.post('/listings/:id/buy', async (req, res) => {
    try {
        const listingId = req.params.id;
        const buyer = await getActiveUser();
        if (!buyer) {
            return res.status(404).json({ error: 'Buyer account not found.' });
        }
        const listing = await Listing_1.default.findById(listingId).populate('seller').populate('order');
        if (!listing || listing.status !== 'Active') {
            return res.status(400).json({ error: 'Listing is no longer active.' });
        }
        if (listing.seller.toString() === buyer._id.toString()) {
            return res.status(400).json({ error: 'You cannot purchase your own resell listing.' });
        }
        listing.status = 'Sold';
        await listing.save();
        const transaction = await Transaction_1.default.create({
            buyer: buyer._id,
            seller: listing.seller,
            listing: listing._id,
            amount: listing.buyerPrice || listing.sellingPrice,
            paymentStatus: 'Completed'
        });
        // Award 5% credit reward to buyer for refurbished shopping
        const order = listing.order;
        const creditReward = Math.round((listing.buyerPrice || listing.sellingPrice) * 0.05);
        buyer.currentCredits += creditReward;
        buyer.lifetimeCredits += creditReward;
        buyer.refurbishedPurchases += 1;
        buyer.greenActionsCount += 1;
        buyer.co2Saved += listing.co2Savings || 12;
        buyer.rewardHistory.push({
            activity: `Purchased Refurbished ${order?.productName || 'Item'}`,
            credits: creditReward,
            co2Saved: listing.co2Savings || 12,
            date: new Date()
        });
        // Check tier upgrade status
        if (buyer.lifetimeCredits >= 2000)
            buyer.tier = 'Circular Champion';
        else if (buyer.lifetimeCredits >= 1000)
            buyer.tier = 'Carbon Hero';
        else if (buyer.lifetimeCredits >= 500)
            buyer.tier = 'Eco Warrior';
        await buyer.save();
        res.json({
            success: true,
            message: 'Transaction completed successfully! Item purchased.',
            transaction
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 9. POST /api/orders/:id/return - Initiate smart returns with green credits
router.post('/orders/:id/return', async (req, res) => {
    try {
        const { returnOption } = req.body;
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        if (order.returnStatus === 'Returned') {
            return res.status(400).json({ error: 'Product already returned.' });
        }
        const returnExpiryDate = (0, exports.getReturnExpiryDate)(order.purchaseDate, order.category);
        if (new Date() > returnExpiryDate) {
            return res.status(400).json({ error: 'Return window has expired.' });
        }
        const user = await getActiveUser();
        if (!user) {
            return res.status(404).json({ error: 'User not logged in.' });
        }
        let credits = 0;
        let co2 = 2; // standard pickup baseline savings (kg)
        if (returnOption === 'flexible') {
            credits = 50;
            co2 = 5;
        }
        else if (returnOption === 'hub') {
            credits = 100;
            co2 = 12;
        }
        order.returnStatus = 'Returned';
        order.returnOption = returnOption;
        order.returnCreditsEarned = credits;
        await order.save();
        // Credit reward wallet
        user.currentCredits += credits;
        user.lifetimeCredits += credits;
        user.co2Saved += co2;
        user.greenActionsCount += 1;
        user.rewardHistory.push({
            activity: `Smart Return (${returnOption}) for ${order.productName}`,
            credits,
            co2Saved: co2,
            date: new Date()
        });
        // Check tier upgrade status
        if (user.lifetimeCredits >= 2000)
            user.tier = 'Circular Champion';
        else if (user.lifetimeCredits >= 1000)
            user.tier = 'Carbon Hero';
        else if (user.lifetimeCredits >= 500)
            user.tier = 'Eco Warrior';
        await user.save();
        res.json({
            success: true,
            message: 'Smart Return processed successfully!',
            order,
            user
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 10. POST /api/sustainability/redeem - Redeem green credits for vouchers
router.post('/sustainability/redeem', async (req, res) => {
    try {
        const { cost, reward } = req.body;
        const user = await getActiveUser();
        if (!user) {
            return res.status(404).json({ error: 'User not logged in.' });
        }
        if (user.currentCredits < cost) {
            return res.status(400).json({ error: 'Insufficient Green Credits balance.' });
        }
        user.currentCredits -= cost;
        user.redeemedCredits += cost;
        const couponCode = `AMZ-ECO-${Math.floor(1000 + Math.random() * 9000)}`;
        const newCoupon = {
            code: couponCode,
            reward,
            cost,
            date: new Date()
        };
        user.couponsRedeemed.push(newCoupon);
        await user.save();
        res.json({
            success: true,
            message: 'Voucher redeemed successfully!',
            coupon: newCoupon,
            user
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 11. GET /api/sustainability/admin-stats - Corporate sustainability performance
router.get('/sustainability/admin-stats', async (req, res) => {
    try {
        const allUsers = await User_1.default.find({});
        // Aggregates
        const totalCo2 = allUsers.reduce((sum, u) => sum + (u.co2Saved || 0), 0);
        const totalCredits = allUsers.reduce((sum, u) => sum + (u.lifetimeCredits || 0), 0);
        const activeMembers = allUsers.filter(u => u.lifetimeCredits > 0).length;
        const participationRate = Math.round((activeMembers / (allUsers.length || 1)) * 100);
        res.json({
            totalCo2Saved: totalCo2 || 525,
            totalCreditsIssued: totalCredits || 2350,
            participationRate: participationRate || 75,
            returnReductionRate: 14.5
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 12. GET /api/sustainability/seller-stats - Seller circular dashboard stats
router.get('/sustainability/seller-stats', async (req, res) => {
    try {
        const user = await getActiveUser();
        if (!user) {
            return res.status(404).json({ error: 'User not logged in.' });
        }
        // Active + Sold listings
        const listings = await Listing_1.default.find({ seller: user._id }).populate('order');
        const sold = listings.filter(l => l.status === 'Sold');
        const active = listings.filter(l => l.status === 'Active');
        const totalEarnings = sold.reduce((sum, l) => sum + l.sellingPrice, 0);
        const totalCarbonSaved = sold.reduce((sum, l) => sum + (l.co2Savings || 12), 0);
        res.json({
            totalEarnings,
            totalCarbonSaved,
            activeCount: active.length,
            soldCount: sold.length,
            listings
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 13. POST /api/orders/:id/evaluate-return - Evaluate return item using AI
router.post('/orders/:id/evaluate-return', multer_1.upload.single('video'), async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        if (order.returnStatus === 'Returned') {
            return res.status(400).json({ error: 'Product already returned.' });
        }
        const returnExpiryDate = (0, exports.getReturnExpiryDate)(order.purchaseDate, order.category);
        if (new Date() > returnExpiryDate) {
            return res.status(400).json({ error: 'Return window has expired.' });
        }
        const { simulateMismatch, conditionScore: overrideScore } = req.body;
        // 1. EXTRACT EXPECTED ATTRIBUTES FROM ORDER
        const expectedBrand = order.brand;
        const expectedCategory = order.category;
        let expectedModel = 'iPhone 14';
        let expectedColor = 'Blue';
        if (order.productName.toLowerCase().includes('macbook')) {
            expectedModel = 'MacBook Air M2';
            expectedColor = 'Space Grey';
        }
        else if (order.productName.toLowerCase().includes('sony')) {
            expectedModel = 'WH-1000XM5';
            expectedColor = 'Black';
        }
        else if (order.productName.toLowerCase().includes('chair')) {
            expectedModel = 'Ergonomic Chair';
            expectedColor = 'Grey & Black';
        }
        let expectedAttributes = {
            brand: expectedBrand,
            model: expectedModel,
            category: expectedCategory,
            color: expectedColor
        };
        // Call FastAPI visual check python server on port 8000
        let fastapiResult = null;
        if (req.file) {
            try {
                const fs = require('fs');
                const { Blob } = require('buffer');
                const blob = new Blob([fs.readFileSync(req.file.path)]);
                const body = new FormData();
                body.append('video', blob, req.file.originalname);
                body.append('orderId', order._id.toString());
                body.append('brand', expectedBrand);
                body.append('model', expectedModel);
                body.append('category', expectedCategory);
                body.append('color', expectedColor);
                body.append('simulateMismatch', simulateMismatch || 'false');
                body.append('functionalChecks', req.body.functionalChecks || '{}');
                const fastapiRes = await fetch(`${AI_ENGINE_URL}/analyze`, {
                    method: 'POST',
                    body
                });
                if (fastapiRes.ok) {
                    fastapiResult = await fastapiRes.json();
                }
            }
            catch (err) {
                console.log('[AI Engine] FastAPI return check offline, falling back to local simulation.');
            }
        }
        // 2. EXTRACT DETECTED ATTRIBUTES & SCORE
        let detectedAttributes = { ...expectedAttributes };
        let productMatchScore = 96;
        let conditionScore = 84;
        if (fastapiResult) {
            productMatchScore = fastapiResult.productMatchScore;
            expectedAttributes = fastapiResult.expectedAttributes;
            detectedAttributes = fastapiResult.detectedAttributes;
            conditionScore = fastapiResult.conditionScore;
        }
        else {
            // Fallback local visual checks simulation
            if (simulateMismatch === 'true') {
                detectedAttributes = {
                    brand: 'Apple',
                    model: 'iPhone 14',
                    category: 'Electronics',
                    color: 'Blue'
                };
                productMatchScore = 12; // Mismatch fraud trigger
            }
            if (overrideScore) {
                conditionScore = parseInt(overrideScore);
            }
            else {
                const name = order.productName.toLowerCase();
                if (name.includes('sony'))
                    conditionScore = 84;
                else if (name.includes('macbook'))
                    conditionScore = 92;
                else if (name.includes('iphone'))
                    conditionScore = 94;
                else if (name.includes('chair'))
                    conditionScore = 38;
                else
                    conditionScore = Math.floor(40 + Math.random() * 55);
            }
        }
        // STAGE 2.5: VERIFY PRODUCT MATCH (Anti-Fraud check)
        if (productMatchScore < 70) {
            return res.status(400).json({
                error: 'Verification Failed: Uploaded product does not match returned product details.',
                reason: `Expected brand: ${expectedBrand} and model: ${expectedModel}. Detected brand: ${detectedAttributes.brand} and model: ${detectedAttributes.model} in return video.`,
                productMatchScore,
                expectedAttributes,
                detectedAttributes
            });
        }
        let conditionCategory = 'Good';
        if (conditionScore > 90)
            conditionCategory = 'Like New';
        else if (conditionScore > 80)
            conditionCategory = 'Excellent';
        else if (conditionScore > 65)
            conditionCategory = 'Good';
        else if (conditionScore > 40)
            conditionCategory = 'Fair';
        else
            conditionCategory = 'Poor';
        let ownershipConfidence = 95;
        if (!overrideScore && !req.file) {
            ownershipConfidence = 75; // low confidence if no video file uploaded
        }
        let recommendedRoute = 'Donate';
        let resaleEligible = false;
        let donationEligible = false;
        let refurbishEligible = false;
        let recycleEligible = false;
        let priorityRoutes = [];
        if (conditionScore > 75) {
            resaleEligible = true;
            donationEligible = true;
            refurbishEligible = true;
            recycleEligible = false; // Priority: 1. Resell, 2. Donate
            recommendedRoute = 'Resell';
            priorityRoutes = ['Resell', 'Donate'];
        }
        else if (conditionScore >= 40) {
            resaleEligible = false;
            donationEligible = true;
            refurbishEligible = true;
            recycleEligible = true; // Priority: 1. Donate, 2. Refurbish
            recommendedRoute = 'Donate';
            priorityRoutes = ['Donate', 'Refurbish'];
        }
        else {
            resaleEligible = false;
            donationEligible = false;
            refurbishEligible = true;
            recycleEligible = true; // Priority: 1. Refurbish, 2. Recycle
            recommendedRoute = 'Refurbish';
            priorityRoutes = ['Refurbish', 'Recycle'];
        }
        // Recommendation Engine: impact and credits
        const name = order.productName.toLowerCase();
        let credits = 150;
        let co2 = order.co2Savings || 15;
        let waste = 1.0; // kg
        let beneficiariesCount = 100;
        let impactText = 'This item can support digital learning for students.';
        if (name.includes('laptop')) {
            credits = 300;
            co2 = 150;
            waste = 2.0;
            beneficiariesCount = 3; // helps 3 students access online education
            impactText = 'This laptop can help 3 students access online education.';
        }
        else if (name.includes('tablet')) {
            credits = 300;
            co2 = 80;
            waste = 0.5;
            beneficiariesCount = 30; // support digital learning for entire classroom
            impactText = 'This tablet can support digital learning for an entire classroom.';
        }
        else if (name.includes('book')) {
            credits = 150;
            co2 = 5;
            waste = 1.2;
            beneficiariesCount = 500;
            impactText = 'This bookshelf or books can improve access to educational materials for hundreds of readers.';
        }
        else if (name.includes('headphones') || name.includes('sony')) {
            credits = 250; // Educational items
            co2 = 28;
            waste = 0.3;
            beneficiariesCount = 80;
            impactText = 'These headphones can support remote learning and focus for students in local centers.';
        }
        else if (order.category === 'Furniture' || name.includes('chair')) {
            credits = 150;
            co2 = 15;
            waste = 15.0;
            beneficiariesCount = 150;
            impactText = 'This ergonomic chair can provide healthy seating for community workers.';
        }
        res.json({
            orderId: order._id,
            productName: order.productName,
            brand: order.brand,
            category: order.category,
            productImage: order.productImage,
            conditionScore,
            conditionCategory,
            productMatchScore,
            ownershipConfidence,
            resaleEligible,
            donationEligible,
            refurbishEligible,
            recycleEligible,
            recommendedRoute,
            priorityRoutes,
            impact: {
                credits,
                co2Saved: co2,
                wastePrevented: waste,
                beneficiariesCount,
                impactText
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 14. GET /api/sustainability/donation-places - Query Google Maps Places API for NGOs
router.get('/sustainability/donation-places', async (req, res) => {
    try {
        const user = await getActiveUser();
        if (!user) {
            return res.status(404).json({ error: 'Active user not found.' });
        }
        const category = req.query.category || 'Electronics';
        const conditionScore = parseInt(req.query.conditionScore) || 84;
        // Discover organizations (Google Places Progressive Search)
        const organizations = await (0, googlemaps_1.discoverNearbyOrganizations)(user.defaultAddress, user.defaultZipCode, category, conditionScore);
        res.json({
            address: user.defaultAddress,
            zipCode: user.defaultZipCode,
            organizations
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 15. POST /api/donations - Route a return item to donation
router.post('/donations', async (req, res) => {
    try {
        const { orderId, orgName, orgType, distanceKm, matchScore, beneficiaries, beneficiaryType, conditionScore, conditionCategory, co2Savings, wastePrevented, greenCreditsEarned, impactStory } = req.body;
        const user = await getActiveUser();
        if (!user) {
            return res.status(404).json({ error: 'User not logged in.' });
        }
        const order = await Order_1.default.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        // Generate unique Certificate ID
        const certificateId = `AMZ-DON-${Math.floor(100000 + Math.random() * 900000)}`;
        const donation = await Donation_1.default.create({
            user: user._id,
            order: order._id,
            productName: order.productName,
            brand: order.brand,
            category: order.category,
            productImage: order.productImage,
            conditionScore,
            conditionCategory,
            organizationName: orgName,
            organizationType: orgType,
            distanceKm,
            matchScore,
            beneficiariesHelped: beneficiaries,
            beneficiaryType,
            co2Savings,
            wastePrevented,
            greenCreditsEarned,
            impactStory,
            certificateId,
            status: 'Created',
            pickupAddress: user.defaultAddress,
            timeline: [
                { status: 'Donation Created', timestamp: new Date(), description: 'Intelligent AI evaluation routed return to charity.' },
                { status: 'Organization Suggested', timestamp: new Date(), description: 'Google Maps Places found optimal matching center.' },
                { status: 'Organization Selected', timestamp: new Date(), description: `Confirmed donation route to ${orgName}.` },
                { status: 'Pickup Scheduled', timestamp: new Date(), description: 'Amazon carrier pickup scheduled within 24 hours.' }
            ]
        });
        // Update order return status
        order.returnStatus = 'Returned';
        order.returnOption = 'standard';
        order.returnCreditsEarned = greenCreditsEarned;
        await order.save();
        // Credit user's wallet
        user.currentCredits += greenCreditsEarned;
        user.lifetimeCredits += greenCreditsEarned;
        user.co2Saved += co2Savings;
        user.wastePrevented += wastePrevented;
        user.greenActionsCount += 1;
        user.rewardHistory.push({
            activity: `Donated ${order.productName} to ${orgName}`,
            credits: greenCreditsEarned,
            co2Saved: co2Savings,
            date: new Date()
        });
        // Upgrade tier
        if (user.lifetimeCredits >= 2000)
            user.tier = 'Circular Champion';
        else if (user.lifetimeCredits >= 1000)
            user.tier = 'Carbon Hero';
        else if (user.lifetimeCredits >= 500)
            user.tier = 'Eco Warrior';
        await user.save();
        res.status(201).json({
            success: true,
            donation
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 16. GET /api/donations - Get user's donations list
router.get('/donations', async (req, res) => {
    try {
        const user = await getActiveUser();
        if (!user) {
            return res.status(404).json({ error: 'User not logged in.' });
        }
        const donations = await Donation_1.default.find({ user: user._id }).sort({ createdAt: -1 });
        res.json(donations);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 17. GET /api/donations/:id - Retrieve specific donation details
router.get('/donations/:id', async (req, res) => {
    try {
        const donation = await Donation_1.default.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found.' });
        }
        res.json(donation);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 18. POST /api/donations/:id/advance-status - Timeline simulator to advance pick-up and delivery
router.post('/donations/:id/advance-status', async (req, res) => {
    try {
        const donation = await Donation_1.default.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found.' });
        }
        const statuses = [
            'Created',
            'Pickup Scheduled',
            'Picked Up',
            'Delivered',
            'Impact Recorded'
        ];
        const currentIndex = statuses.indexOf(donation.status);
        if (currentIndex < statuses.length - 1) {
            const nextStatus = statuses[currentIndex + 1];
            donation.status = nextStatus;
            let description = '';
            if (nextStatus === 'Pickup Scheduled') {
                description = 'Amazon Logistics agent assigned. Pickup scheduled within 24 hours.';
            }
            else if (nextStatus === 'Picked Up') {
                description = 'Amazon driver successfully verified and collected the item.';
            }
            else if (nextStatus === 'Delivered') {
                description = `Item delivered directly to ${donation.organizationName} and verified by staff.`;
            }
            else if (nextStatus === 'Impact Recorded') {
                description = `Social impact certificates generated. ${donation.beneficiariesHelped} ${donation.beneficiaryType} are now utilizing the resource.`;
            }
            donation.timeline.push({
                status: nextStatus,
                timestamp: new Date(),
                description
            });
            await donation.save();
        }
        res.json(donation);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 19. GET /api/sustainability/leaderboard - Top circular contributors leaderboard
router.get('/sustainability/leaderboard', async (req, res) => {
    try {
        const users = await User_1.default.find({}).select('name avatar lifetimeCredits co2Saved wastePrevented').lean();
        // Supplement with dummy leaderboard data to make it look full and exciting
        const dummyContributors = [
            { name: 'Sarah Connor', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', lifetimeCredits: 2450, co2Saved: 512, wastePrevented: 110, productsDonated: 6 },
            { name: 'David Beckham', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', lifetimeCredits: 1850, co2Saved: 380, wastePrevented: 92, productsDonated: 4 },
            { name: 'Emma Watson', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', lifetimeCredits: 1600, co2Saved: 350, wastePrevented: 78, productsDonated: 3 },
            { name: 'Robert Downey Jr.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', lifetimeCredits: 1350, co2Saved: 290, wastePrevented: 64, productsDonated: 3 }
        ];
        // Get donations counts per real user
        const realContributors = await Promise.all(users.map(async (u) => {
            const donationsCount = await Donation_1.default.countDocuments({ user: u._id });
            return {
                name: u.name,
                avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
                lifetimeCredits: u.lifetimeCredits || 0,
                co2Saved: u.co2Saved || 0,
                wastePrevented: u.wastePrevented || 0,
                productsDonated: donationsCount || (u.email === 'seller@amazonresell.com' ? 1 : 0) // seed seller default
            };
        }));
        const allContributors = [...realContributors, ...dummyContributors];
        allContributors.sort((a, b) => b.lifetimeCredits - a.lifetimeCredits);
        res.json(allContributors);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ==========================================
// HYPERLOCAL FLASH DEAL ENGINE ENDPOINTS
// ==========================================
// GET /api/flash-deals - Get all hyperlocal flash deals
router.get('/flash-deals', async (req, res) => {
    try {
        const deals = await FlashDeal_1.default.find().sort({ distanceKm: 1 });
        res.json(deals);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/flash-deals/:id/claim - Claim a hyperlocal flash deal
router.post('/flash-deals/:id/claim', async (req, res) => {
    try {
        const { id } = req.params;
        const deal = await FlashDeal_1.default.findById(id);
        if (!deal) {
            return res.status(404).json({ error: 'Flash deal not found.' });
        }
        if (deal.status !== 'Active') {
            return res.status(400).json({ error: 'This deal is no longer active.' });
        }
        const user = await getActiveUser();
        if (!user) {
            return res.status(404).json({ error: 'Active user session not found.' });
        }
        // Update deal state
        deal.status = 'Claimed';
        deal.assignedBuyer = user.name;
        deal.routeOptimized = true;
        await deal.save();
        // Award +50 Green Credits & update user stats
        const creditsAwarded = 50;
        user.currentCredits += creditsAwarded;
        user.lifetimeCredits += creditsAwarded;
        user.greenActionsCount += 1;
        // Add activity to user's rewardHistory
        user.rewardHistory.push({
            activity: `Claimed Flash Deal: ${deal.productName} (+50 Credits)`,
            credits: creditsAwarded,
            co2Saved: 8,
            date: new Date()
        });
        user.co2Saved += 8;
        await user.save();
        res.json({ success: true, deal, user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/flash-deals/analytics - Get recovery and diversion metrics
router.get('/flash-deals/analytics', async (req, res) => {
    try {
        const deals = await FlashDeal_1.default.find({});
        const totalCreated = deals.length;
        const claimedDeals = deals.filter(d => d.status === 'Claimed');
        const totalClaimed = claimedDeals.length;
        const avgClaimTime = totalClaimed > 0 ? 4.2 : 0;
        const revenueRecovered = claimedDeals.reduce((sum, d) => sum + d.dealPrice, 0);
        const totalOriginalPrice = deals.reduce((sum, d) => sum + d.originalPrice, 0);
        const baseRevenueRecovered = 385000;
        const baseOriginalValue = 425000;
        const finalRevenueRecovered = baseRevenueRecovered + revenueRecovered;
        const finalOriginalValue = baseOriginalValue + claimedDeals.reduce((sum, d) => sum + d.originalPrice, 0);
        const calculatedRecoveryScore = Math.round((finalRevenueRecovered / finalOriginalValue) * 100);
        res.json({
            totalCreated: totalCreated + 45,
            totalClaimed: totalClaimed + 41,
            avgClaimTime: avgClaimTime || 4.2,
            revenueRecovered: finalRevenueRecovered,
            recoveryScore: calculatedRecoveryScore || 91,
            inventoryDiverted: totalClaimed + 41,
            sameDayDeliveries: totalClaimed + 41
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
