require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Merchant = require('../models/Merchant');
const Product = require('../models/Product');

const PRODUCT_IMAGES = {
  shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
  socks: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400',
  watch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  gloves: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  bottle: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
  tshirt: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
  earbuds: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
  band: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400',
  shorts: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400',
  cap: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400',
  backpack: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
  yoga: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Merchant.deleteMany({}),
      Product.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create merchant user
    const merchantUser = await User.create({
      name: 'SportZone Admin',
      email: 'merchant@sportzone.in',
      password: 'merchant123',
      role: 'merchant',
    });

    const merchant = await Merchant.create({
      name: 'SportZone Admin',
      businessName: 'SportZone India',
      email: 'merchant@sportzone.in',
      phone: '+91-9876543210',
      description: 'India\'s premier sports & fitness e-commerce platform',
      category: 'Sports & Fitness',
      userId: merchantUser._id,
      settings: { currency: 'INR', taxRate: 18, enableUpsell: true, enableAIRecommendations: true },
      stats: { totalRevenue: 124500, totalOrders: 47, upsellRevenue: 8450, aiAssistedRevenue: 42300 },
    });

    merchantUser.merchantId = merchant._id;
    await merchantUser.save();

    // Create customer user
    await User.create({
      name: 'Raj Gaurav',
      email: 'customer@demo.in',
      password: 'customer123',
      role: 'customer',
    });

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@razorpay.in',
      password: 'admin123',
      role: 'admin',
    });

    // Create products
    const products = await Product.insertMany([
      {
        name: 'Nike Air Zoom Running Shoes',
        description: 'Lightweight and breathable running shoes with superior cushioning for long-distance runs. Features Nike Air technology for maximum comfort.',
        price: 3999,
        originalPrice: 5499,
        category: 'Running',
        subcategory: 'Shoes',
        brand: 'Nike',
        stock: 50,
        image: PRODUCT_IMAGES.shoes,
        tags: ['running', 'shoes', 'nike', 'sport', 'athletic', 'footwear'],
        merchantId: merchant._id,
        rating: 4.7,
        reviewCount: 234,
        isFeatured: true,
        salesCount: 89,
        specifications: { size: '6-12 UK', color: 'Blue/White', weight: '285g', material: 'Mesh upper' },
      },
      {
        name: 'Premium Sports Socks (Pack of 3)',
        description: 'High-performance moisture-wicking sports socks with arch support. Anti-blister cushioning for all-day comfort during runs and workouts.',
        price: 499,
        originalPrice: 699,
        category: 'Accessories',
        subcategory: 'Socks',
        brand: 'SportZone',
        stock: 200,
        image: PRODUCT_IMAGES.socks,
        tags: ['socks', 'running', 'sports', 'accessories', 'comfort'],
        merchantId: merchant._id,
        rating: 4.5,
        reviewCount: 456,
        salesCount: 342,
        specifications: { size: 'Free size', color: 'White/Black', material: 'Cotton blend' },
      },
      {
        name: 'Garmin Forerunner Sports Watch',
        description: 'GPS-enabled sports watch with heart rate monitoring, sleep tracking, and 20+ sport modes. 7-day battery life with AMOLED display.',
        price: 12999,
        originalPrice: 16999,
        category: 'Electronics',
        subcategory: 'Smartwatch',
        brand: 'Garmin',
        stock: 25,
        image: PRODUCT_IMAGES.watch,
        tags: ['watch', 'gps', 'sports', 'fitness', 'tracker', 'smartwatch'],
        merchantId: merchant._id,
        rating: 4.8,
        reviewCount: 128,
        isFeatured: true,
        salesCount: 34,
        specifications: { display: 'AMOLED 1.2"', battery: '7 days', waterproof: '5ATM', connectivity: 'Bluetooth 5.0' },
      },
      {
        name: 'Gym Training Gloves Pro',
        description: 'Full-finger gym gloves with padded palm protection. Non-slip grip for heavy lifting with wrist support strap. Breathable mesh back.',
        price: 799,
        originalPrice: 1199,
        category: 'Fitness',
        subcategory: 'Gloves',
        brand: 'SportZone',
        stock: 80,
        image: PRODUCT_IMAGES.gloves,
        tags: ['gym', 'gloves', 'fitness', 'training', 'weightlifting'],
        merchantId: merchant._id,
        rating: 4.4,
        reviewCount: 89,
        salesCount: 67,
        specifications: { size: 'S/M/L/XL', material: 'Leather + Spandex', color: 'Black' },
      },
      {
        name: 'Hydro Flask Water Bottle 1L',
        description: 'Double-wall vacuum insulated stainless steel bottle. Keeps drinks cold 24 hours, hot 12 hours. Leak-proof lid with flip top cap.',
        price: 1299,
        originalPrice: 1799,
        category: 'Accessories',
        subcategory: 'Hydration',
        brand: 'Hydro Flask',
        stock: 100,
        image: PRODUCT_IMAGES.bottle,
        tags: ['bottle', 'water', 'hydration', 'sports', 'running', 'gym'],
        merchantId: merchant._id,
        rating: 4.6,
        reviewCount: 312,
        isFeatured: true,
        salesCount: 156,
        specifications: { capacity: '1000ml', material: 'Stainless Steel', insulation: 'Double wall vacuum', bpaFree: true },
      },
      {
        name: 'DriFit Running T-Shirt',
        description: 'Ultra-lightweight moisture-wicking running t-shirt with 4-way stretch fabric. Flatlock seams prevent chafing. Reflective strips for night runs.',
        price: 1199,
        originalPrice: 1699,
        category: 'Running',
        subcategory: 'Apparel',
        brand: 'SportZone',
        stock: 75,
        image: PRODUCT_IMAGES.tshirt,
        tags: ['tshirt', 'running', 'apparel', 'clothing', 'dryfit', 'jersey'],
        merchantId: merchant._id,
        rating: 4.5,
        reviewCount: 178,
        salesCount: 112,
        specifications: { sizes: 'XS-3XL', material: 'Polyester 92% + Spandex 8%', fit: 'Regular' },
      },
      {
        name: 'Sony WF-1000XM5 Sports Earbuds',
        description: 'Industry-leading noise cancellation with 24-hour battery life. IPX4 water resistant for workouts. Crystal clear audio with dual driver technology.',
        price: 8999,
        originalPrice: 12999,
        category: 'Electronics',
        subcategory: 'Audio',
        brand: 'Sony',
        stock: 30,
        image: PRODUCT_IMAGES.earbuds,
        tags: ['earbuds', 'wireless', 'sports', 'audio', 'bluetooth', 'sony'],
        merchantId: merchant._id,
        rating: 4.9,
        reviewCount: 567,
        isFeatured: true,
        salesCount: 78,
        specifications: { battery: '24 hours', noiseCancellation: 'Yes', waterproof: 'IPX4', connectivity: 'Bluetooth 5.3' },
      },
      {
        name: 'Mi Smart Band 8 Pro',
        description: 'Advanced fitness tracking with 1.74" AMOLED display. Tracks 150+ workouts, blood oxygen, stress and sleep. 14-day battery life.',
        price: 2999,
        originalPrice: 3999,
        category: 'Electronics',
        subcategory: 'Fitness Tracker',
        brand: 'Xiaomi',
        stock: 60,
        image: PRODUCT_IMAGES.band,
        tags: ['fitness band', 'tracker', 'smartband', 'health', 'wearable'],
        merchantId: merchant._id,
        rating: 4.3,
        reviewCount: 892,
        salesCount: 234,
        specifications: { display: 'AMOLED 1.74"', battery: '14 days', sensors: 'HR, SpO2, GPS', waterproof: '5ATM' },
      },
      {
        name: 'Flex Pro Running Shorts',
        description: '4-way stretch running shorts with built-in liner and secure zip pocket. Lightweight and quick-dry fabric for intense workouts and runs.',
        price: 999,
        originalPrice: 1499,
        category: 'Running',
        subcategory: 'Apparel',
        brand: 'SportZone',
        stock: 90,
        image: PRODUCT_IMAGES.shorts,
        tags: ['shorts', 'running', 'gym', 'training', 'apparel'],
        merchantId: merchant._id,
        rating: 4.4,
        reviewCount: 145,
        salesCount: 98,
        specifications: { sizes: 'XS-3XL', material: 'Polyester', length: '7 inch inseam' },
      },
      {
        name: 'Sport Performance Cap',
        description: 'Structured 6-panel cap with sweat-wicking sweatband. UV protection fabric. Adjustable snap-back closure. Perfect for outdoor runs.',
        price: 599,
        originalPrice: 899,
        category: 'Accessories',
        subcategory: 'Headwear',
        brand: 'SportZone',
        stock: 120,
        image: PRODUCT_IMAGES.cap,
        tags: ['cap', 'hat', 'running', 'sports', 'accessories', 'outdoor'],
        merchantId: merchant._id,
        rating: 4.2,
        reviewCount: 67,
        salesCount: 45,
      },
      {
        name: 'Osprey Athletic Gym Backpack',
        description: 'Spacious 30L gym backpack with dedicated shoe compartment, laptop sleeve and multiple organizer pockets. Ergonomic padded shoulder straps.',
        price: 2499,
        originalPrice: 3499,
        category: 'Accessories',
        subcategory: 'Bags',
        brand: 'Osprey',
        stock: 35,
        image: PRODUCT_IMAGES.backpack,
        tags: ['backpack', 'bag', 'gym', 'sports', 'travel'],
        merchantId: merchant._id,
        rating: 4.6,
        reviewCount: 223,
        salesCount: 56,
        specifications: { capacity: '30L', material: 'Nylon', laptop: '15 inch sleeve' },
      },
      {
        name: 'Manduka Pro Yoga Mat',
        description: 'Premium 6mm thick eco-friendly yoga mat with non-slip surface. Closed cell surface prevents sweat absorption. Lifetime guarantee.',
        price: 3499,
        originalPrice: 4999,
        category: 'Fitness',
        subcategory: 'Yoga',
        brand: 'Manduka',
        stock: 40,
        image: PRODUCT_IMAGES.yoga,
        tags: ['yoga', 'mat', 'fitness', 'meditation', 'exercise'],
        merchantId: merchant._id,
        rating: 4.8,
        reviewCount: 334,
        isFeatured: true,
        salesCount: 89,
        specifications: { thickness: '6mm', length: '71 inches', material: 'PVC-free rubber', nonSlip: true },
      },
    ]);

    console.log(`Created ${products.length} products`);

    // Set up cross-sells and upsells
    const shoes = products.find(p => p.name.includes('Running Shoes'));
    const socks = products.find(p => p.name.includes('Socks'));
    const tshirt = products.find(p => p.name.includes('T-Shirt'));
    const shorts = products.find(p => p.name.includes('Shorts'));
    const bottle = products.find(p => p.name.includes('Water Bottle'));
    const cap = products.find(p => p.name.includes('Cap'));
    const watch = products.find(p => p.name.includes('Sports Watch'));
    const band = products.find(p => p.name.includes('Smart Band'));
    const earbuds = products.find(p => p.name.includes('Earbuds'));
    const gloves = products.find(p => p.name.includes('Gloves'));
    const backpack = products.find(p => p.name.includes('Backpack'));
    const yoga = products.find(p => p.name.includes('Yoga Mat'));

    // Shoes upsell: socks, running shorts, cap
    await Product.findByIdAndUpdate(shoes._id, {
      upsellProducts: [socks._id, shorts._id, cap._id],
      crossSellProducts: [tshirt._id, bottle._id],
    });

    // Watch upsell: band, earbuds
    await Product.findByIdAndUpdate(watch._id, {
      upsellProducts: [band._id, earbuds._id],
      crossSellProducts: [bottle._id, backpack._id],
    });

    // Earbuds upsell: watch, band
    await Product.findByIdAndUpdate(earbuds._id, {
      upsellProducts: [watch._id, band._id],
    });

    // Gym gloves upsell: backpack, bottle, shorts
    await Product.findByIdAndUpdate(gloves._id, {
      upsellProducts: [backpack._id, bottle._id],
      crossSellProducts: [shorts._id, tshirt._id],
    });

    // Yoga mat upsell: bottle, gloves
    await Product.findByIdAndUpdate(yoga._id, {
      upsellProducts: [bottle._id, gloves._id],
    });

    console.log('✅ Seed data created successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('  Customer: customer@demo.in / customer123');
    console.log('  Merchant: merchant@sportzone.in / merchant123');
    console.log('  Admin:    admin@razorpay.in / admin123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
