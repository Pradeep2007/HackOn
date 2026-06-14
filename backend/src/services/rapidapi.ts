import dotenv from 'dotenv';

dotenv.config();

export interface AmazonProductData {
  productName: string;
  brand: string;
  category: string;
  price: number;
  images: string[];
  rating: number;
  reviewsCount: number;
  attributes: {
    color: string;
    model: string;
    [key: string]: string;
  };
}

// Fallback high-fidelity dataset matching our seeded products
const MOCK_RAPIDAPI_DATA: Record<string, AmazonProductData> = {
  'new-iphone-14': {
    productName: 'iPhone 14 (128 GB) - Blue',
    brand: 'Apple',
    category: 'Electronics',
    price: 69999,
    images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=300&q=80'],
    rating: 4.6,
    reviewsCount: 3841,
    attributes: {
      color: 'Blue',
      model: 'iPhone 14',
      storage: '128 GB'
    }
  },
  'new-macbook-air-m2': {
    productName: 'MacBook Air M2 (8GB RAM, 256GB SSD) - Space Grey',
    brand: 'Apple',
    category: 'Electronics',
    price: 99999,
    images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=300&q=80'],
    rating: 4.8,
    reviewsCount: 1982,
    attributes: {
      color: 'Space Grey',
      model: 'MacBook Air M2',
      ram: '8 GB'
    }
  },
  'new-sony-headphones': {
    productName: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Black',
    brand: 'Sony',
    category: 'Electronics',
    price: 29999,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80'],
    rating: 4.5,
    reviewsCount: 2942,
    attributes: {
      color: 'Black',
      model: 'WH-1000XM5',
      type: 'Over-Ear'
    }
  },
  'new-office-chair': {
    productName: 'Green Soul Ergonomic Office Chair - Grey & Black',
    brand: 'Green Soul',
    category: 'Furniture',
    price: 8999,
    images: ['https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=300&q=80'],
    rating: 4.3,
    reviewsCount: 1204,
    attributes: {
      color: 'Grey & Black',
      model: 'Ergonomic Chair',
      material: 'Mesh'
    }
  }
};

export const fetchAmazonProductData = async (productId: string): Promise<AmazonProductData> => {
  const apiKey = process.env.RAPIDAPI_KEY;
  const apiHost = process.env.RAPIDAPI_HOST || 'amazon-price1.p.rapidapi.com';

  const lookupKey = productId.toLowerCase().includes('iphone') ? 'new-iphone-14' :
                    productId.toLowerCase().includes('macbook') ? 'new-macbook-air-m2' :
                    productId.toLowerCase().includes('sony') ? 'new-sony-headphones' : 'new-office-chair';

  if (!apiKey) {
    console.log(`[RapidAPI] API Key absent. Resolving mock product details for: ${lookupKey}`);
    return MOCK_RAPIDAPI_DATA[lookupKey];
  }

  try {
    console.log(`[RapidAPI] Fetching real product data for ${lookupKey} using host ${apiHost}`);
    
    // Simulate calling the real RapidAPI Amazon endpoint (e.g. GET Product Details)
    const response = await fetch(`https://${apiHost}/amazonPrice?asin=${lookupKey}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost
      }
    });

    if (!response.ok) {
      throw new Error(`RapidAPI responded with status: ${response.status}`);
    }

    const data = await response.json() as any;
    
    // Map RapidAPI response fields to our standard AmazonProductData structure
    return {
      productName: data.title || MOCK_RAPIDAPI_DATA[lookupKey].productName,
      brand: data.brand || MOCK_RAPIDAPI_DATA[lookupKey].brand,
      category: data.category || MOCK_RAPIDAPI_DATA[lookupKey].category,
      price: data.price ? Math.round(data.price) : MOCK_RAPIDAPI_DATA[lookupKey].price,
      images: data.images || MOCK_RAPIDAPI_DATA[lookupKey].images,
      rating: data.rating || MOCK_RAPIDAPI_DATA[lookupKey].rating,
      reviewsCount: data.totalReviews || MOCK_RAPIDAPI_DATA[lookupKey].reviewsCount,
      attributes: {
        color: data.color || MOCK_RAPIDAPI_DATA[lookupKey].attributes.color,
        model: data.model || MOCK_RAPIDAPI_DATA[lookupKey].attributes.model,
      }
    };
  } catch (error) {
    console.warn('[RapidAPI] Live request failed. Falling back to local data:', error);
    return MOCK_RAPIDAPI_DATA[lookupKey];
  }
};
