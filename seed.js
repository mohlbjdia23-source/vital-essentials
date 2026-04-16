/**
 * Seed script – populates the database with realistic dropshipping products.
 *
 * Usage:
 *   node seed.js
 *   NODE_ENV=development MONGODB_URI=mongodb://localhost:27017/vital-essentials node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./server/models/Product');
const User = require('./server/models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vital-essentials';

const products = [
  // ── Skincare ──────────────────────────────────────────────────────────────
  {
    name: 'Vitamin C Brightening Serum',
    description: 'Advanced 20% Vitamin C serum with hyaluronic acid and ferulic acid for radiant, even skin tone. Reduces dark spots and boosts collagen.',
    price: 24.99, category: 'Skincare', stock: 150, images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-SK-001', cost: 6.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Retinol Anti-Aging Night Cream',
    description: 'Concentrated retinol formula to reduce wrinkles and fine lines overnight. With peptides and niacinamide for skin renewal.',
    price: 32.99, category: 'Skincare', stock: 120, images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-SK-002', cost: 8.20, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Hyaluronic Acid Moisturizer SPF 30',
    description: 'Lightweight daily moisturizer combining hydrating hyaluronic acid with broad-spectrum SPF 30 protection.',
    price: 19.99, category: 'Skincare', stock: 200, images: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-SK-003', cost: 5.00, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Jade Facial Roller & Gua Sha Set',
    description: 'Natural jade stone roller and gua sha board set for lymphatic drainage, puffiness reduction and improved circulation.',
    price: 18.99, category: 'Skincare', stock: 180, images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-SK-004', cost: 4.00, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },

  // ── Electronics ───────────────────────────────────────────────────────────
  {
    name: 'Wireless Noise-Cancelling Earbuds',
    description: 'True wireless earbuds with active noise cancellation, 30-hour battery life and IPX5 water resistance. Crystal clear audio for work and play.',
    price: 49.99, category: 'Electronics', stock: 85, images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-EL-001', cost: 15.00, shippingProfile: 'ePacket', processingDays: 5, syncStatus: 'synced' },
  },
  {
    name: 'Portable Magnetic Power Bank 10000mAh',
    description: 'Slim MagSafe-compatible power bank with 10000mAh capacity, USB-C PD 20W fast charging and built-in LED indicator.',
    price: 39.99, category: 'Electronics', stock: 100, images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-EL-002', cost: 12.50, shippingProfile: 'ePacket', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'LED Desk Lamp with USB Charging Port',
    description: 'Eye-caring LED desk lamp with 5 colour modes, stepless dimming, USB-A charging port and memory function.',
    price: 29.99, category: 'Electronics', stock: 65, images: ['https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-EL-003', cost: 9.00, shippingProfile: 'Standard', processingDays: 5, syncStatus: 'synced' },
  },
  {
    name: 'Smart Watch Fitness Tracker',
    description: 'Full-touch smartwatch with heart rate, SpO2, sleep tracking, 100+ sport modes and 7-day battery life. Compatible with iOS and Android.',
    price: 59.99, category: 'Electronics', stock: 70, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-EL-004', cost: 18.00, shippingProfile: 'ePacket', processingDays: 5, syncStatus: 'synced' },
  },

  // ── Home Goods ────────────────────────────────────────────────────────────
  {
    name: 'Ultrasonic Cool Mist Humidifier',
    description: 'Quiet ultrasonic humidifier with 3L capacity, 360° nozzle, sleep mode and auto shut-off. Runs up to 20 hours.',
    price: 34.99, category: 'Home Goods', stock: 90, images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-001', cost: 11.00, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Bamboo Organiser Drawer Dividers (6-Pack)',
    description: 'Adjustable bamboo drawer dividers to keep your kitchen, office and bedroom organised. Natural, eco-friendly material.',
    price: 22.99, category: 'Home Goods', stock: 200, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-002', cost: 6.00, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Silicone Reusable Food Storage Bags (5-Pack)',
    description: 'Leakproof, BPA-free silicone bags for food storage. Dishwasher safe, freezer safe and microwave safe.',
    price: 17.99, category: 'Home Goods', stock: 250, images: ['https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-003', cost: 4.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Essential Oil Diffuser 500ml',
    description: 'Wood-grain aromatherapy diffuser with 7 LED colours, timer, auto shut-off and whisper-quiet operation.',
    price: 27.99, category: 'Home Goods', stock: 80, images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-004', cost: 9.50, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },

  // ── Wellness ──────────────────────────────────────────────────────────────
  {
    name: 'Collagen Peptides Supplement (60 Capsules)',
    description: 'Hydrolysed marine collagen peptides with added Vitamin C for skin elasticity, joint health and hair strength.',
    price: 28.99, category: 'Wellness', stock: 130, images: ['https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-WE-001', cost: 8.00, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Acupressure Mat & Pillow Set',
    description: 'Lotus spike acupressure mat and neck pillow set for back pain relief, muscle relaxation and stress reduction.',
    price: 34.99, category: 'Wellness', stock: 110, images: ['https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-WE-002', cost: 10.00, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Meditation Cushion Set',
    description: 'Buckwheat-filled zafu meditation cushion and zabuton mat set. Removable, washable cotton cover.',
    price: 44.99, category: 'Wellness', stock: 60, images: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-WE-003', cost: 14.00, shippingProfile: 'Standard', processingDays: 5, syncStatus: 'synced' },
  },
  {
    name: 'Magnesium Glycinate 400mg (90 Tablets)',
    description: 'High-absorption magnesium glycinate for sleep quality, muscle relaxation and stress support. Non-GMO, vegan.',
    price: 21.99, category: 'Wellness', stock: 200, images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-WE-004', cost: 6.00, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },

  // ── Fitness ───────────────────────────────────────────────────────────────
  {
    name: 'Resistance Band Set (5 Levels)',
    description: 'Professional-grade latex resistance bands for strength training, stretching and rehabilitation. Includes carry bag.',
    price: 19.99, category: 'Fitness', stock: 300, images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-FI-001', cost: 5.00, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Adjustable Dumbbell 5–25 kg',
    description: 'Space-saving adjustable dumbbell with click-to-adjust weight selector from 5 to 25 kg. Replaces 9 separate dumbbells.',
    price: 89.99, category: 'Fitness', stock: 40, images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-FI-002', cost: 30.00, shippingProfile: 'Standard', processingDays: 7, syncStatus: 'synced' },
  },
  {
    name: 'Non-Slip Yoga Mat 6mm',
    description: 'Extra-thick 6mm TPE yoga mat with alignment lines. Superior grip, eco-friendly material, includes carry strap.',
    price: 29.99, category: 'Fitness', stock: 150, images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-FI-003', cost: 8.50, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Jump Rope with Counter',
    description: 'Speed jump rope with ball-bearing handles, digital counter and adjustable cable length up to 3 metres.',
    price: 14.99, category: 'Fitness', stock: 250, images: ['https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-FI-004', cost: 3.50, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },

  // ── Beauty ────────────────────────────────────────────────────────────────
  {
    name: 'LED Face Mask Therapy Device',
    description: 'Professional 7-colour LED photon therapy mask for anti-ageing, acne reduction and skin rejuvenation. FDA cleared.',
    price: 79.99, category: 'Beauty', compareAtPrice: 99.99, stock: 50,
    images: ['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-BE-001', cost: 22.00, shippingProfile: 'ePacket', processingDays: 5, syncStatus: 'synced' },
  },
  {
    name: 'Derma Roller 0.25mm (3-Pack)',
    description: 'Medical-grade titanium micro-needling derma roller for improved serum absorption and skin texture.',
    price: 16.99, category: 'Beauty', stock: 180, images: ['https://images.unsplash.com/photo-1629451893516-c16b6aba2e17?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-BE-002', cost: 4.00, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Electric Face Cleansing Brush',
    description: 'Sonic facial cleansing brush with 3 speed settings, silicone head and waterproof design for deep pore cleansing.',
    price: 24.99, category: 'Beauty', stock: 95, images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-BE-003', cost: 7.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Eyebrow Shaping Stencil Kit (24 Shapes)',
    description: 'Reusable eyebrow template stencils with 24 different arch shapes. Includes mini spoolie and mapping string.',
    price: 9.99, category: 'Beauty', stock: 500, images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-BE-004', cost: 2.00, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Clear existing products
    const deleted = await Product.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing products`);

    // Insert products
    const inserted = await Product.insertMany(products);
    console.log(`Inserted ${inserted.length} products`);

    // Seed a default admin user if one doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vitalessentials.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const passwordHash = await User.hashPassword(adminPassword);
      await User.create({
        name: 'Admin',
        email: adminEmail,
        passwordHash,
        role: 'admin',
      });
      console.log(`Admin user created: ${adminEmail}`);
    } else {
      console.log(`Admin user already exists: ${adminEmail}`);
    }

    console.log('Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seedDatabase();
