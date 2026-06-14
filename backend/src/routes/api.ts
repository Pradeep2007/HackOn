import express, { Request, Response, Router } from 'express';
import { upload } from '../config/multer';
import User from '../models/User';
import Order from '../models/Order';
import Listing from '../models/Listing';
import AIReport from '../models/AIReport';
import TrustScore from '../models/TrustScore';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';

const router: Router = express.Router();

// Mock catalog of new products
const NEW_PRODUCTS = [
  {
    id: 'new-iphone-14',
    productName: 'iPhone 14 (128 GB) - Blue',
    brand: 'Apple',
    category: 'Electronics',
    price: 69999,
    productImage: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=300&q=80',
    isUsed: false,
    rating: 4.6,
    reviewsCount: 3841,
    isPrime: true,
    isFulfilled: true,
    shipping: 'FREE delivery tomorrow'
  },
  {
    id: 'new-macbook-air-m2',
    productName: 'MacBook Air M2 (8GB RAM, 256GB SSD) - Space Grey',
    brand: 'Apple',
    category: 'Electronics',
    price: 99999,
    productImage: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=300&q=80',
    isUsed: false,
    rating: 4.8,
    reviewsCount: 1982,
    isPrime: true,
    isFulfilled: true,
    shipping: 'FREE delivery Wednesday'
  },
  {
    id: 'new-sony-headphones',
    productName: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Black',
    brand: 'Sony',
    category: 'Electronics',
    price: 29999,
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
    isUsed: false,
    rating: 4.5,
    reviewsCount: 2942,
    isPrime: true,
    isFulfilled: true,
    shipping: 'FREE delivery Friday'
  }
];

// Helper to get active mock user "John Doe"
const getActiveUser = async (): Promise<any> => {
  return await User.findOne({ email: 'john@amazon.com' });
};

// 1. GET /api/user - Get current active user (John Doe)
router.get('/user', async (req: Request, res: Response) => {
  try {
    const user = await getActiveUser();
    if (!user) {
      return res.status(404).json({ error: 'User not found. Run database seed.' });
    }
    const scoreDoc = await TrustScore.findOne({ user: user._id });
    res.json({
      user,
      trustScoreDetails: scoreDoc || null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/orders - Get user's order history
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const user = await getActiveUser();
    if (!user) {
      return res.status(404).json({ error: 'Seed user not found.' });
    }
    const orders = await Order.find({ user: user._id });
    
    // For each order, check if it's already listed
    const ordersWithListingStatus = await Promise.all(
      orders.map(async (order) => {
        const listing = await Listing.findOne({ order: order._id });
        return {
          ...order.toObject(),
          isAlreadyListed: !!listing,
          listingId: listing ? listing._id : null
        };
      })
    );

    res.json(ordersWithListingStatus);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET /api/orders/:id - Get details of a single order
router.get('/orders/:id', async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. POST /api/listings/analyze-condition - Simulate AI Condition Analysis
router.post('/listings/analyze-condition', upload.single('video'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a video file for inspection.' });
    }

    const videoPath = `/uploads/${req.file.filename}`;
    
    // Simulate AI analysis details based on simple heuristics or clean randomization
    const reports = [
      {
        conditionCategory: 'Excellent' as const,
        conditionScore: 88,
        confidenceScore: 92,
        detectedIssues: ['Minor light scratches on chassis', 'No screen cracks', 'Ports clean and operational', 'Battery health 92%']
      },
      {
        conditionCategory: 'Like New' as const,
        conditionScore: 96,
        confidenceScore: 95,
        detectedIssues: ['Pristine display condition', 'Zero visible scratches', 'Ports clean', 'Battery health 99%']
      },
      {
        conditionCategory: 'Good' as const,
        conditionScore: 82,
        confidenceScore: 90,
        detectedIssues: ['Moderate scuffs on back panel', 'Corner wear visible', 'Screen intact', 'Fully functional keys']
      },
      {
        conditionCategory: 'Fair' as const,
        conditionScore: 68,
        confidenceScore: 88,
        detectedIssues: ['Heavy scratches on screen', 'Scuff marks on frame', 'Battery health 81%']
      }
    ];

    // Pick a random report configuration (mostly Excellent or Like New for our demo products)
    const reportIndex = Math.floor(Math.random() * 2); // Picks Excellent or Like New
    const selectedReport = reports[reportIndex];

    const report = await AIReport.create({
      ...selectedReport,
      videoPath
    });

    res.json(report);
  } catch (error: any) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. POST /api/listings - Publish a used listing (with verification checks)
router.post('/listings', upload.array('images', 5), async (req: Request, res: Response) => {
  try {
    const { orderId, sellingPrice, description, conditionNotes, aiReportId } = req.body;
    const files = req.files as Express.Multer.File[];
    
    const user = await getActiveUser();
    if (!user) {
      return res.status(404).json({ error: 'Seller account not found.' });
    }

    // Retrieve order to run Mongoose-level verifications
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ error: 'Invalid Order: Product was not purchased on Amazon.' });
    }

    // Verification 1: Order belongs to seller
    if (order.user.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Permission Denied: Order does not belong to you.' });
    }

    // Verification 2: Order was delivered
    if (order.deliveryStatus !== 'Delivered') {
      return res.status(400).json({ error: 'Verification Failed: Product has not been delivered yet.' });
    }

    // Verification 3: Product is not already listed
    const existingListing = await Listing.findOne({ order: order._id });
    if (existingListing) {
      return res.status(400).json({ error: 'Verification Failed: Product is already listed for resale.' });
    }

    // Upload image paths
    const imagePaths = files && files.length > 0 
      ? files.map(file => `/uploads/${file.filename}`) 
      : [order.productImage]; // Fallback to original purchase image if none uploaded

    // Verify AI Report is valid
    let isAiVerified = false;
    if (aiReportId && mongoose.Types.ObjectId.isValid(aiReportId)) {
      const report = await AIReport.findById(aiReportId);
      if (report) {
        isAiVerified = true;
      }
    }

    const listing = await Listing.create({
      order: order._id,
      seller: user._id,
      sellingPrice: parseFloat(sellingPrice),
      description,
      conditionNotes,
      images: imagePaths,
      aiReport: aiReportId || null,
      isPurchasedOnAmazon: true,
      isSellerVerified: true,
      isAiVerified,
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Listing published successfully!',
      listing
    });
  } catch (error: any) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. GET /api/products (Unified Search: New + Used side-by-side)
router.get('/products', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || '').toLowerCase();
    
    // Filter static new products catalog
    let matchedNew = NEW_PRODUCTS;
    if (query) {
      matchedNew = NEW_PRODUCTS.filter(p => 
        p.productName.toLowerCase().includes(query) || 
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Fetch active listings from the database, populated with order and seller info
    const activeListings = await Listing.find({ status: 'Active' })
      .populate('order')
      .populate('seller')
      .populate('aiReport');

    // Filter used listings based on search query
    const matchedUsed = activeListings.filter(listing => {
      const order = listing.order as any;
      if (!order) return false;
      const terms = `${order.productName} ${order.brand} ${order.category}`.toLowerCase();
      return query ? terms.includes(query) : true;
    }).map(listing => {
      const order = listing.order as any;
      const seller = listing.seller as any;
      const report = listing.aiReport as any;
      
      return {
        id: listing._id,
        productId: order.productName.toLowerCase().includes('iphone 14') ? 'new-iphone-14' : 
                   order.productName.toLowerCase().includes('macbook') ? 'new-macbook-air-m2' : 'new-sony-headphones',
        productName: `${order.productName} (Used - ${report?.conditionCategory || 'Good'})`,
        brand: order.brand,
        category: order.category,
        price: listing.sellingPrice,
        productImage: listing.images[0] || order.productImage,
        isUsed: true,
        condition: report?.conditionCategory || 'Good',
        conditionScore: report?.conditionScore || 85,
        trustScore: seller?.trustScore || 92,
        isPurchasedOnAmazon: listing.isPurchasedOnAmazon,
        isSellerVerified: listing.isSellerVerified,
        isAiVerified: listing.isAiVerified,
        sellerName: seller?.name || 'Amazon Customer',
        conditionNotes: listing.conditionNotes,
        description: listing.description
      };
    });

    // Merge new and used together in same array
    const unifiedResults = [...matchedNew, ...matchedUsed];
    
    res.json(unifiedResults);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. GET /api/products/:id - Product Detail Page & Other Buying Options
router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    
    // Find base product from catalog
    const baseProduct = NEW_PRODUCTS.find(p => p.id === productId);
    if (!baseProduct) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Find all used listings corresponding to this product type
    let searchName = '';
    if (productId === 'new-iphone-14') searchName = 'iphone 14';
    else if (productId === 'new-macbook-air-m2') searchName = 'macbook';
    else if (productId === 'new-sony-headphones') searchName = 'sony wh';

    const activeListings = await Listing.find({ status: 'Active' })
      .populate('order')
      .populate('seller')
      .populate('aiReport');

    const buyingOptions = activeListings.filter(listing => {
      const order = listing.order as any;
      return order && order.productName.toLowerCase().includes(searchName);
    }).map(listing => {
      const order = listing.order as any;
      const seller = listing.seller as any;
      const report = listing.aiReport as any;
      
      return {
        listingId: listing._id,
        sellerName: seller?.name || 'Amazon Customer',
        sellerId: seller?._id,
        price: listing.sellingPrice,
        condition: report?.conditionCategory || 'Good',
        conditionScore: report?.conditionScore || 85,
        trustScore: seller?.trustScore || 92,
        isPurchasedOnAmazon: listing.isPurchasedOnAmazon,
        isSellerVerified: listing.isSellerVerified,
        isAiVerified: listing.isAiVerified,
        conditionNotes: listing.conditionNotes,
        description: listing.description,
        video: report?.videoPath || null,
        images: listing.images,
        aiInspectionDetails: report ? {
          condition: report.conditionCategory,
          score: report.conditionScore,
          confidence: report.confidenceScore,
          detectedIssues: report.detectedIssues
        } : null
      };
    });

    res.json({
      product: baseProduct,
      otherBuyingOptions: buyingOptions
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. POST /api/listings/:id/buy - Complete buying transaction of a listing
router.post('/listings/:id/buy', async (req: Request, res: Response) => {
  try {
    const listingId = req.params.id;
    const buyer = await getActiveUser(); // For the demo, buyer is also the logged-in user
    
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer account not found.' });
    }

    const listing = await Listing.findById(listingId).populate('seller');
    if (!listing || listing.status !== 'Active') {
      return res.status(400).json({ error: 'Listing is no longer active.' });
    }

    if (listing.seller.toString() === buyer._id.toString()) {
      return res.status(400).json({ error: 'You cannot purchase your own resell listing.' });
    }

    // Update listing status
    listing.status = 'Sold';
    await listing.save();

    // Create Transaction
    const transaction = await Transaction.create({
      buyer: buyer._id,
      seller: listing.seller,
      listing: listing._id,
      amount: listing.sellingPrice,
      paymentStatus: 'Completed'
    });

    res.json({
      success: true,
      message: 'Transaction completed successfully! Item purchased.',
      transaction
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
