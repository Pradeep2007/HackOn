import User from '../models/User';
import Order from '../models/Order';
import Listing from '../models/Listing';
import AIReport from '../models/AIReport';
import TrustScore from '../models/TrustScore';

export const seedDatabase = async (): Promise<void> => {
  try {
    // Clear all existing data
    await User.deleteMany({});
    await Order.deleteMany({});
    await Listing.deleteMany({});
    await AIReport.deleteMany({});
    await TrustScore.deleteMany({});

    console.log('[Seeder] Cleared database collections.');

    // 1. Create Default Logged-in User (John Doe)
    const john = await User.create({
      name: 'John Doe',
      email: 'john@amazon.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      trustScore: 94,
      ratingsCount: 12,
      defaultZipCode: '110001',
      defaultAddress: 'Barakhamba Road, Connaught Place, New Delhi 110001'
    });

    // 2. Create another seller for demo purposes (Jane Smith)
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
        user: john._id,
        score: 94,
        factors: [
          { factorName: 'Account Age', impact: 10, description: 'Amazon customer since 2019' },
          { factorName: 'Original Purchase Match', impact: 40, description: '100% of listings verified against real Amazon order history' },
          { factorName: 'AI Check rate', impact: 30, description: 'All listings passed visual AI inspection' },
          { factorName: 'Delivery Speed', impact: 14, description: 'Average delivery within 2 days' }
        ]
      },
      {
        user: jane._id,
        score: 92,
        factors: [
          { factorName: 'Account Age', impact: 8, description: 'Amazon customer since 2021' },
          { factorName: 'Original Purchase Match', impact: 40, description: '100% of listings verified against real Amazon order history' },
          { factorName: 'AI Check rate', impact: 30, description: 'All listings passed visual AI inspection' },
          { factorName: 'Positive Feedback', impact: 14, description: '92% positive rating on used goods sales' }
        ]
      }
    ]);

    // 3. Create Orders for John Doe (so he can resell them)
    // Phone
    const orderIPhone = await Order.create({
      user: john._id,
      productName: 'iPhone 14 (128 GB) - Blue',
      brand: 'Apple',
      category: 'Electronics',
      purchaseDate: new Date('2025-10-15'),
      originalPurchasePrice: 69999,
      productImage: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=300&q=80',
      orderId: '403-1284931-8392183',
      deliveryStatus: 'Delivered'
    });

    // Laptop
    const orderMacBook = await Order.create({
      user: john._id,
      productName: 'MacBook Air M2 (8GB RAM, 256GB SSD) - Space Grey',
      brand: 'Apple',
      category: 'Electronics',
      purchaseDate: new Date('2025-08-01'),
      originalPurchasePrice: 99999,
      productImage: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=300&q=80',
      orderId: '403-9932194-0192842',
      deliveryStatus: 'Delivered'
    });

    // Headphones
    const orderSony = await Order.create({
      user: john._id,
      productName: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Black',
      brand: 'Sony',
      category: 'Electronics',
      purchaseDate: new Date('2025-11-20'),
      originalPurchasePrice: 29999,
      productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
      orderId: '403-4921938-2281048',
      deliveryStatus: 'Delivered'
    });

    // Furniture (New Category seeded to testDynamic checks)
    const orderChair = await Order.create({
      user: john._id,
      productName: 'Green Soul Ergonomic Office Chair - Grey & Black',
      brand: 'Green Soul',
      category: 'Furniture',
      purchaseDate: new Date('2025-05-12'),
      originalPurchasePrice: 8999,
      productImage: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=300&q=80',
      orderId: '403-5592811-0192410',
      deliveryStatus: 'Delivered'
    });

    console.log('[Seeder] Orders seeded successfully for John.');

    // 4. Create an Order for Jane Smith (so she has already listed used products)
    const janeOrderIPhone = await Order.create({
      user: jane._id,
      productName: 'iPhone 14 (128 GB) - Blue',
      brand: 'Apple',
      category: 'Electronics',
      purchaseDate: new Date('2025-05-10'),
      originalPurchasePrice: 69999,
      productImage: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=300&q=80',
      orderId: '403-5182910-0982341',
      deliveryStatus: 'Delivered'
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
      deliveryStatus: 'Delivered'
    });

    // 5. Seed pre-existing Used Listings by Jane Smith
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
      detectedAttributes: { brand: 'Apple', model: 'iPhone 14', category: 'Electronics', color: 'Blue' }
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
      detectedAttributes: { brand: 'Sony', model: 'WH-1000XM5', category: 'Electronics', color: 'Black' }
    });

    console.log('[Seeder] Pre-existing listings seeded successfully.');
  } catch (error) {
    console.error('[Seeder] Error seeding database:', error);
  }
};
