import User from '../models/User';
import Order from '../models/Order';
import Listing from '../models/Listing';
import AIReport from '../models/AIReport';
import TrustScore from '../models/TrustScore';
import Donation from '../models/Donation';

export const seedDatabase = async (): Promise<void> => {
  try {
    // Clear all existing data
    await User.deleteMany({});
    await Order.deleteMany({});
    await Listing.deleteMany({});
    await AIReport.deleteMany({});
    await TrustScore.deleteMany({});
    await Donation.deleteMany({});

    console.log('[Seeder] Cleared database collections.');

    // 1. Create Demo Seller (seller@amazonresell.com)
    const seller = await User.create({
      name: 'John Seller',
      email: 'seller@amazonresell.com',
      password: 'seller123',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      trustScore: 94,
      ratingsCount: 12,
      defaultZipCode: '110001',
      defaultAddress: 'Barakhamba Road, Connaught Place, New Delhi 110001',
      
      // Wallet initial stats
      currentCredits: 450,
      lifetimeCredits: 850,
      redeemedCredits: 400,
      tier: 'Eco Warrior',
      co2Saved: 185,
      waterSaved: 1200,
      wastePrevented: 42,
      refurbishedPurchases: 2,
      greenActionsCount: 4,
      rewardHistory: [
        { activity: 'Flexible Pickup Return', credits: 50, co2Saved: 5, date: new Date('2026-04-10') },
        { activity: 'Hub Drop-off Return', credits: 100, co2Saved: 12, date: new Date('2026-05-15') },
        { activity: 'Purchased Refurbished Item', credits: 300, co2Saved: 72, date: new Date('2026-05-20') }
      ],
      couponsRedeemed: [
        { code: 'AMZ-ECO-50', reward: '₹50 Shopping Coupon', cost: 500, date: new Date('2026-05-21') }
      ]
    });

    // 2. Create Demo Buyer (buyer@amazonresell.com)
    const buyer = await User.create({
      name: 'Alice Buyer',
      email: 'buyer@amazonresell.com',
      password: 'buyer123',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      trustScore: 97,
      ratingsCount: 5,
      defaultZipCode: '110025',
      defaultAddress: 'Jamia Nagar, Okhla, New Delhi 110025',
      
      // Wallet initial stats
      currentCredits: 1200,
      lifetimeCredits: 1500,
      redeemedCredits: 300,
      tier: 'Carbon Hero',
      co2Saved: 340,
      waterSaved: 2500,
      wastePrevented: 88,
      refurbishedPurchases: 4,
      greenActionsCount: 7,
      rewardHistory: [
        { activity: 'Purchased Refurbished Sony Headphones', credits: 1000, co2Saved: 28, date: new Date('2026-03-01') },
        { activity: 'Flexible Pickup Return', credits: 50, co2Saved: 5, date: new Date('2026-04-12') }
      ],
      couponsRedeemed: []
    });

    // 3. Create another seller for demo purposes (Jane Smith)
    const jane = await User.create({
      name: 'Jane Smith',
      email: 'jane@amazon.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      trustScore: 92,
      ratingsCount: 8,
      defaultZipCode: '110025',
      defaultAddress: 'Jamia Nagar, Okhla, New Delhi 110025'
    });

    console.log('[Seeder] Users seeded successfully.');

    // Seed Trust Scores
    await TrustScore.create([
      {
        user: seller._id,
        score: 94,
        factors: [
          { factorName: 'Account Age', impact: 10, description: 'Amazon customer since 2019' },
          { factorName: 'Original Purchase Match', impact: 40, description: '100% of listings verified against real Amazon order history' },
          { factorName: 'AI Check rate', impact: 30, description: 'All listings passed visual AI inspection' },
          { factorName: 'Delivery Speed', impact: 14, description: 'Average delivery within 2 days' }
        ]
      },
      {
        user: buyer._id,
        score: 97,
        factors: [
          { factorName: 'Account Age', impact: 12, description: 'Amazon customer since 2018' },
          { factorName: 'Sustainability score', impact: 50, description: 'Purchased 4 refurbished items, preventing 340kg CO2 emissions' }
        ]
      }
    ]);

    // 4. Create Orders for John Seller (so he can resell them or return them)
    // Phone
    const orderIPhone = await Order.create({
      user: seller._id,
      productName: 'iPhone 14 (128 GB) - Blue',
      brand: 'Apple',
      category: 'Electronics',
      purchaseDate: new Date('2025-10-15'),
      originalPurchasePrice: 69999,
      productImage: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=300&q=80',
      orderId: '403-1284931-8392183',
      deliveryStatus: 'Delivered',
      sustainabilityScore: 82,
      sustainabilityBadge: 'Gold',
      co2Savings: 72,
      packaging: '100% Recyclable Cardboard',
      repairability: 7,
      returnRate: 3
    });

    // Laptop
    const orderMacBook = await Order.create({
      user: seller._id,
      productName: 'MacBook Air M2 (8GB RAM, 256GB SSD) - Space Grey',
      brand: 'Apple',
      category: 'Electronics',
      purchaseDate: new Date('2025-08-01'),
      originalPurchasePrice: 99999,
      productImage: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=300&q=80',
      orderId: '403-9932194-0192842',
      deliveryStatus: 'Delivered',
      sustainabilityScore: 88,
      sustainabilityBadge: 'Gold',
      co2Savings: 145,
      packaging: '100% Recycled Cardboard & Paper Pulp Packaging',
      repairability: 6,
      returnRate: 2
    });

    // Headphones
    const orderSony = await Order.create({
      user: seller._id,
      productName: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Black',
      brand: 'Sony',
      category: 'Electronics',
      purchaseDate: new Date('2025-11-20'),
      originalPurchasePrice: 29999,
      productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
      orderId: '403-4921938-2281048',
      deliveryStatus: 'Delivered',
      sustainabilityScore: 84,
      sustainabilityBadge: 'Silver',
      co2Savings: 28,
      packaging: 'Plastic-free recycled paper packaging',
      repairability: 8,
      returnRate: 4
    });

    // Furniture
    const orderChair = await Order.create({
      user: seller._id,
      productName: 'Green Soul Ergonomic Office Chair - Grey & Black',
      brand: 'Green Soul',
      category: 'Furniture',
      purchaseDate: new Date('2025-05-12'),
      originalPurchasePrice: 8999,
      productImage: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=300&q=80',
      orderId: '403-5592811-0192410',
      deliveryStatus: 'Delivered',
      sustainabilityScore: 78,
      sustainabilityBadge: 'Bronze',
      co2Savings: 15,
      packaging: 'Recycled Cardboard with minimal plastic tape',
      repairability: 9,
      returnRate: 5
    });

    console.log('[Seeder] Orders seeded successfully for John Seller.');

    // 5. Create an Order for Jane Smith (so she has already listed used products)
    const janeOrderIPhone = await Order.create({
      user: jane._id,
      productName: 'iPhone 14 (128 GB) - Blue',
      brand: 'Apple',
      category: 'Electronics',
      purchaseDate: new Date('2025-05-10'),
      originalPurchasePrice: 69999,
      productImage: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=300&q=80',
      orderId: '403-5182910-0982341',
      deliveryStatus: 'Delivered',
      sustainabilityScore: 82,
      sustainabilityBadge: 'Gold',
      co2Savings: 72
    });

    const janeOrderSony = await Order.create({
      user: jane._id,
      productName: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Black',
      brand: 'Sony',
      category: 'Electronics',
      purchaseDate: new Date('2025-06-15'),
      originalPurchasePrice: 29999,
      productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
      orderId: '403-7721839-4482103',
      deliveryStatus: 'Delivered',
      sustainabilityScore: 84,
      sustainabilityBadge: 'Silver',
      co2Savings: 28
    });

    // 6. Seed pre-existing Used Listings by Jane Smith (with revenue model fields)
    // iPhone 14
    const reportJaneIPhone = await AIReport.create({
      conditionCategory: 'Excellent',
      conditionScore: 88,
      confidenceScore: 92,
      detectedIssues: ['Minor scratches on frame', 'No visible glass cracks', 'Light battery wear'],
      ownershipConfidence: 94,
      functionalScore: 100,
      functionalChecks: { powersOn: true, chargingWorks: true, cameraWorks: true, speakerWorks: true, wifiWorks: true, touchWorks: true },
      trustScore: 92,
      productMatchScore: 96,
      expectedAttributes: { brand: 'Apple', model: 'iPhone 14', category: 'Electronics', color: 'Blue' },
      detectedAttributes: { brand: 'Apple', model: 'iPhone 14', category: 'Electronics', color: 'Blue' }
    });

    await Listing.create({
      order: janeOrderIPhone._id,
      seller: jane._id,
      sellingPrice: 45999,
      description: 'Used iPhone 14 in great condition. Selling because I upgraded to iPhone 15. The device is fully functional, screen has zero scratches.',
      conditionNotes: 'Small scratch on the bottom edge, otherwise like new. Box and original charger included.',
      images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=300&q=80'],
      aiReport: reportJaneIPhone._id,
      isPurchasedOnAmazon: true,
      isSellerVerified: true,
      isAiVerified: true,
      status: 'Active',
      verificationCode: 'AMZ-2341',
      zipCode: '110025',
      ownershipConfidence: 94,
      functionalScore: 100,
      functionalChecks: { powersOn: true, chargingWorks: true, cameraWorks: true, speakerWorks: true, wifiWorks: true, touchWorks: true },
      trustScore: 92,
      productMatchScore: 96,
      expectedAttributes: { brand: 'Apple', model: 'iPhone 14', category: 'Electronics', color: 'Blue' },
      detectedAttributes: { brand: 'Apple', model: 'iPhone 14', category: 'Electronics', color: 'Blue' },
      
      // Revenue Model & Sustainability mapping
      buyerPrice: 48999, // sellingPrice + 3000 fee
      amazonFee: 3000,
      sustainabilityScore: 82,
      sustainabilityBadge: 'Gold',
      co2Savings: 72
    });

    // Sony WH-1000XM5
    const reportJaneSony = await AIReport.create({
      conditionCategory: 'Good',
      conditionScore: 81,
      confidenceScore: 94,
      detectedIssues: ['Headband padding slightly worn', 'No audio distortions', 'Pristine outer casing'],
      ownershipConfidence: 92,
      functionalScore: 100,
      functionalChecks: { audioWorks: true, bluetoothWorks: true, chargingWorks: true },
      trustScore: 88,
      productMatchScore: 98,
      expectedAttributes: { brand: 'Sony', model: 'WH-1000XM5', category: 'Electronics', color: 'Black' },
      detectedAttributes: { brand: 'Sony', model: 'WH-1000XM5', category: 'Electronics', color: 'Black' }
    });

    await Listing.create({
      order: janeOrderSony._id,
      seller: jane._id,
      sellingPrice: 19999,
      description: 'Selling my Sony WH-1000XM5 headphones. The noise cancellation is perfect. Only cosmetic wear on headbands.',
      conditionNotes: 'Worn headband, but earcups are in great shape. Comes with carrying case.',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80'],
      aiReport: reportJaneSony._id,
      isPurchasedOnAmazon: true,
      isSellerVerified: true,
      isAiVerified: true,
      status: 'Active',
      verificationCode: 'AMZ-1048',
      zipCode: '110001',
      ownershipConfidence: 92,
      functionalScore: 100,
      functionalChecks: { audioWorks: true, bluetoothWorks: true, chargingWorks: true },
      trustScore: 88,
      productMatchScore: 98,
      expectedAttributes: { brand: 'Sony', model: 'WH-1000XM5', category: 'Electronics', color: 'Black' },
      detectedAttributes: { brand: 'Sony', model: 'WH-1000XM5', category: 'Electronics', color: 'Black' },
      
      // Revenue Model & Sustainability mapping
      buyerPrice: 21999, // sellingPrice + 2000 fee
      amazonFee: 2000,
      sustainabilityScore: 84,
      sustainabilityBadge: 'Silver',
      co2Savings: 28
    });

    console.log('[Seeder] Pre-existing listings seeded successfully.');
  } catch (error) {
    console.error('[Seeder] Error seeding database:', error);
  }
};
