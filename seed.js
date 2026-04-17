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

  // ── Home Goods – Cleaning ─────────────────────────────────────────────────
  {
    name: 'Electric Spin Scrubber',
    description: 'Cordless power scrubber with 3 interchangeable brush heads for bathroom tiles, tub, grout and kitchen surfaces. 360° rotation, rechargeable via USB-C, extendable handle up to 1.2m.',
    price: 29.99, category: 'Home Goods', stock: 130,
    images: ['https://images.unsplash.com/photo-1556909114-44e3e9399b30?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-005', cost: 9.00, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Cordless Handheld Mini Vacuum',
    description: 'Portable cordless vacuum with 6000Pa suction, HEPA filter, and 25-minute battery life. Lightweight at 0.8 kg – perfect for car interiors, desks and stairs.',
    price: 44.99, category: 'Home Goods', stock: 95,
    images: ['https://images.unsplash.com/photo-1558618047-3c8a0e197be8?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-006', cost: 14.00, shippingProfile: 'Standard', processingDays: 5, syncStatus: 'synced' },
  },
  {
    name: 'Lint Remover – Electric Fabric Shaver',
    description: 'Rechargeable fabric shaver with stainless-steel floating blades and large lint catcher. Removes pills from sweaters, sofas and blankets without snagging.',
    price: 19.99, category: 'Home Goods', stock: 200,
    images: ['https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-007', cost: 5.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Electric Window Cleaner & Squeegee Vacuum',
    description: 'Cordless window vacuum with powerful suction to streak-free dry glass in one pass. Includes spray bottle and two microfibre cleaning pads.',
    price: 34.99, category: 'Home Goods', stock: 80,
    images: ['https://images.unsplash.com/photo-1527515545081-5db817172677?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-008', cost: 10.50, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Microfiber Cleaning Cloth Set (12-Pack)',
    description: 'Ultra-soft 300 GSM microfibre cloths that trap dust without scratching. Machine washable, reusable 500+ times. Ideal for glass, stainless steel and car detailing.',
    price: 14.99, category: 'Home Goods', stock: 350,
    images: ['https://images.unsplash.com/photo-1583947582886-f1530a5c2547?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-009', cost: 3.50, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Drain Hair Catcher – Sink & Shower Filter (4-Pack)',
    description: 'Stainless-steel mesh drain protectors that catch hair, soap scum and debris before they clog your pipes. Fits most standard 1.5–2 inch drains.',
    price: 9.99, category: 'Home Goods', stock: 500,
    images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-010', cost: 2.00, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Drill Brush Cleaning Kit (5-Piece)',
    description: 'Power-scrubber attachment set for any standard drill. Includes flat, round and angle brushes for tile grout, bathtubs, wheels and carpet stains.',
    price: 17.99, category: 'Home Goods', stock: 160,
    images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-011', cost: 4.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Multi-Surface Cleaning Brush Set (6-Piece)',
    description: 'Ergonomic set of 6 cleaning brushes with nylon bristles for bottles, grout, corners, keyboards and cookware. Non-scratch bristles with comfortable grip handles.',
    price: 22.99, category: 'Home Goods', stock: 175,
    images: ['https://images.unsplash.com/photo-1563920443079-783e5c786b83?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-012', cost: 6.00, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Silicone Toilet Brush Set',
    description: 'Modern wall-mounted silicone toilet brush with slim holder. Hygienic quick-dry design with flexible bristles that reach under the rim. No dripping, no odours.',
    price: 18.99, category: 'Home Goods', stock: 220,
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-013', cost: 5.00, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Reusable Cleaning Gel (Universal Dust Cleaner)',
    description: 'Putty-like cleaning gel that gets into every vent, keyboard gap and car air duct to lift dust, crumbs and debris without residue. Reusable up to 50 times per piece.',
    price: 12.99, category: 'Home Goods', stock: 400,
    images: ['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-014', cost: 2.50, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },

  // ── Skincare (continued) ─────────────────────────────────────────────────
  {
    name: 'Niacinamide 10% + Zinc Pore Serum',
    description: 'Lightweight niacinamide serum that visibly minimises pores, controls oil and fades blemish marks. Fragrance-free, vegan.',
    price: 16.99, category: 'Skincare', stock: 220,
    images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-SK-005', cost: 4.50, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Kaolin Clay Clarifying Face Mask',
    description: 'Deep-cleansing white and pink kaolin clay mask that draws out impurities, reduces shine and tightens pores. Suitable for oily and combination skin.',
    price: 14.99, category: 'Skincare', stock: 175,
    images: ['https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-SK-006', cost: 3.80, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Invisible Sunscreen SPF 50+ (50ml)',
    description: 'Ultra-light, non-greasy daily sunscreen with SPF 50+ PA++++ protection. No white cast, waterproof and sweat-resistant.',
    price: 18.99, category: 'Skincare', stock: 300,
    images: ['https://images.unsplash.com/photo-1511174271151-bbf73057e254?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-SK-007', cost: 5.00, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Korean Hydrating Sheet Mask Set (10-Pack)',
    description: 'Essence-soaked cotton sheet masks with hyaluronic acid and green tea extract. Each mask delivers an intensive 20-minute hydration treatment.',
    price: 12.99, category: 'Skincare', stock: 400,
    images: ['https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-SK-008', cost: 2.80, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Glycolic Acid 7% Resurfacing Toner',
    description: 'Exfoliating toner with 7% glycolic acid plus amino acids to smooth skin texture, fade dark spots and prep skin for serums.',
    price: 22.99, category: 'Skincare', stock: 160,
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-SK-009', cost: 6.00, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: '24K Gold Collagen Eye Patches (30 Pairs)',
    description: 'Hydrogel under-eye patches infused with 24K gold and collagen to reduce puffiness, dark circles and fine lines in 20 minutes.',
    price: 13.99, category: 'Skincare', stock: 280,
    images: ['https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-SK-010', cost: 3.50, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },

  // ── Electronics (continued) ───────────────────────────────────────────────
  {
    name: 'Ring Light 18" with Phone Holder & Tripod',
    description: '18-inch bi-colour LED ring light with adjustable tripod (up to 2m), phone holder and remote control. 3 colour modes, 10 brightness levels.',
    price: 34.99, category: 'Electronics', stock: 75,
    images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-EL-005', cost: 11.00, shippingProfile: 'Standard', processingDays: 5, syncStatus: 'synced' },
  },
  {
    name: '65W GaN USB-C Wall Charger (4-Port)',
    description: 'Ultra-compact 65W GaN charger with 2× USB-C (PD) + 2× USB-A ports. Charges a laptop, tablet and two phones simultaneously.',
    price: 29.99, category: 'Electronics', stock: 120,
    images: ['https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-EL-006', cost: 9.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Compact Wireless Mechanical Keyboard',
    description: '75% layout wireless mechanical keyboard with Bluetooth 5.0 + 2.4G dongle, hot-swap switches and per-key RGB backlighting.',
    price: 49.99, category: 'Electronics', stock: 60,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-EL-007', cost: 16.00, shippingProfile: 'Standard', processingDays: 6, syncStatus: 'synced' },
  },
  {
    name: 'Portable Mini Projector 1080p',
    description: 'Pocket projector with native 1080p, built-in Android, Wi-Fi, HDMI and USB. 200" image, 20,000-hour LED life, runs up to 3 hours on battery.',
    price: 79.99, category: 'Electronics', stock: 45,
    images: ['https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-EL-008', cost: 28.00, shippingProfile: 'Standard', processingDays: 7, syncStatus: 'synced' },
  },
  {
    name: '3-in-1 Wireless Charging Station',
    description: 'Simultaneous wireless charging pad for phone (15W), smartwatch and earbuds. Foldable design with cable management.',
    price: 39.99, category: 'Electronics', stock: 90,
    images: ['https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-EL-009', cost: 12.00, shippingProfile: 'ePacket', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Smart RGB LED Strip Lights 5m',
    description: 'App-controlled LED strip lights with 16 million colours, music sync mode, timer and voice assistant compatibility. Cuttable, adhesive-backed.',
    price: 19.99, category: 'Electronics', stock: 200,
    images: ['https://images.unsplash.com/photo-1550985616-10810253b84d?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-EL-010', cost: 5.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },

  // ── Home Goods – Kitchen ──────────────────────────────────────────────────
  {
    name: 'Bamboo Cutting Board Set (3-Piece)',
    description: 'Graduated set of 3 bamboo cutting boards with juice grooves and non-slip feet. Knife-friendly, eco-friendly material.',
    price: 27.99, category: 'Home Goods', stock: 130,
    images: ['https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-015', cost: 8.50, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Digital Kitchen Scale 5kg / 1g',
    description: 'Slim stainless-steel precision scale with tare function, 4 units (g/oz/lb/ml) and auto-off. Includes batteries.',
    price: 14.99, category: 'Home Goods', stock: 250,
    images: ['https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-016', cost: 4.00, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Travel Mini Electric Kettle 0.5L',
    description: 'Compact 500ml travel kettle that boils water in 3 minutes. Dual-voltage 110/240V, folds flat with hidden base and auto shut-off.',
    price: 24.99, category: 'Home Goods', stock: 100,
    images: ['https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-017', cost: 7.50, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Non-Stick Ceramic Pan Set (3-Piece)',
    description: '20/24/28 cm ceramic-coated non-stick frying pans. PFOA-free, oven-safe to 220°C, compatible with all hob types including induction.',
    price: 49.99, category: 'Home Goods', stock: 70,
    images: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-018', cost: 17.00, shippingProfile: 'Standard', processingDays: 5, syncStatus: 'synced' },
  },
  {
    name: 'Tension Pole Shower Caddy Organiser',
    description: 'Rust-proof aluminium tension pole caddy with 4 adjustable shelves and hook rail. No drilling required; fits ceilings 2m–2.8m.',
    price: 32.99, category: 'Home Goods', stock: 85,
    images: ['https://images.unsplash.com/photo-1595125798090-87f16bc0b43c?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-019', cost: 10.00, shippingProfile: 'Standard', processingDays: 5, syncStatus: 'synced' },
  },
  {
    name: 'Magnetic Knife Holder Strip 40cm',
    description: 'Strong 40cm stainless-steel magnetic knife bar that keeps blades visible and accessible. Includes wall-mount hardware.',
    price: 21.99, category: 'Home Goods', stock: 140,
    images: ['https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-HG-020', cost: 6.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },

  // ── Wellness (continued) ──────────────────────────────────────────────────
  {
    name: 'Vitamin D3 + K2 5000IU (90 Softgels)',
    description: 'High-potency Vitamin D3 5000IU paired with MK-7 Vitamin K2 for optimal calcium metabolism, immune health and bone density.',
    price: 15.99, category: 'Wellness', stock: 280,
    images: ['https://images.unsplash.com/photo-1550572017-4fcdbb59cc32?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-WE-005', cost: 4.50, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Melatonin Sleep Gummies 5mg (60ct)',
    description: 'Drug-free melatonin gummies with added L-theanine and chamomile for faster sleep onset and deeper rest. Vegan, no gelatin.',
    price: 12.99, category: 'Wellness', stock: 320,
    images: ['https://images.unsplash.com/photo-1618939304347-e91b1f33d2ab?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-WE-006', cost: 3.50, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Electric Shiatsu Neck & Shoulder Massager',
    description: 'Heated deep-tissue shiatsu massager with 8 rotating nodes, 3 intensity levels and auto-off timer. Relieves knots in neck, shoulders and back.',
    price: 34.99, category: 'Wellness', stock: 110,
    images: ['https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-WE-007', cost: 10.50, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Reflexology Foot Roller (Pair)',
    description: 'Bamboo wood foot massage rollers with raised pressure nodes that stimulate acupressure points for plantar fasciitis relief and relaxation.',
    price: 16.99, category: 'Wellness', stock: 190,
    images: ['https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-WE-008', cost: 4.50, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Deep Tissue Body Foam Roller 60cm',
    description: 'High-density EPP foam roller for post-workout muscle recovery, myofascial release and IT band work. Firm density, moulded surface pattern.',
    price: 24.99, category: 'Wellness', stock: 140,
    images: ['https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-WE-009', cost: 7.00, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Turmeric & Black Pepper Extract (90 Caps)',
    description: '95% curcuminoid turmeric with BioPerine® black pepper for significantly better absorption. Anti-inflammatory joint and gut support.',
    price: 17.99, category: 'Wellness', stock: 240,
    images: ['https://images.unsplash.com/photo-1615485290382-4db0a0ae07a0?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-WE-010', cost: 5.00, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },

  // ── Fitness (continued) ───────────────────────────────────────────────────
  {
    name: 'Ab Roller Wheel with Knee Pad',
    description: 'Dual-wheel ab roller with non-slip handles and thick foam knee pad for full core workouts. Includes foam elbow support.',
    price: 14.99, category: 'Fitness', stock: 270,
    images: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-FI-005', cost: 3.80, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'No-Screw Doorframe Pull-Up Bar',
    description: 'Adjustable door-frame pull-up bar fits openings 62–100cm wide. 200kg load capacity. No screws needed – pressure-fit design.',
    price: 22.99, category: 'Fitness', stock: 160,
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-FI-006', cost: 7.00, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'High-Density Foam Roller 33cm',
    description: 'Travel-size 33cm × 14cm high-density smooth foam roller for targeted muscle relief, warm-up and cool-down. Lightweight at 300g.',
    price: 19.99, category: 'Fitness', stock: 200,
    images: ['https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-FI-007', cost: 5.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Adjustable Ankle & Wrist Weights (2×1.5kg)',
    description: 'Neoprene-wrapped adjustable ankle and wrist weights for walking, aerobics and rehabilitation. Each weight 1.5kg, sold as a pair.',
    price: 18.99, category: 'Fitness', stock: 220,
    images: ['https://images.unsplash.com/photo-1550259979-ed79b48d2a30?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-FI-008', cost: 5.80, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Compression Knee Sleeve (Pair)',
    description: 'Medical-grade compression knee sleeves for running, squatting and joint support. Moisture-wicking fabric, available S–XXL.',
    price: 16.99, category: 'Fitness', stock: 280,
    images: ['https://images.unsplash.com/photo-1571019612041-d19dc6ab71bd?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-FI-009', cost: 4.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Battle Rope 9m Gym Fitness Rope',
    description: 'Heavy-duty 38mm diameter battle rope made from durable polypropylene with heat-shrink ends. Anchors not included.',
    price: 44.99, category: 'Fitness', stock: 50,
    images: ['https://images.unsplash.com/photo-1598289431512-b97b0917afec?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-FI-010', cost: 15.00, shippingProfile: 'Standard', processingDays: 6, syncStatus: 'synced' },
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
  {
    name: 'Auto-Rotating Ceramic Curling Wand 32mm',
    description: 'Automatic rotating curling iron with ceramic barrel for heatless-looking, long-lasting curls. 3 temperature settings, left/right rotation.',
    price: 34.99, category: 'Beauty', stock: 85,
    images: ['https://images.unsplash.com/photo-1522337615020-0a53f1ecd5c3?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-BE-005', cost: 10.00, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'IPL Permanent Hair Removal Device',
    description: 'At-home IPL device with 500,000 flashes for permanent hair reduction on face, arms, legs and bikini line. 5 energy levels.',
    price: 79.99, category: 'Beauty', compareAtPrice: 99.99, stock: 60,
    images: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-BE-006', cost: 24.00, shippingProfile: 'ePacket', processingDays: 5, syncStatus: 'synced' },
  },
  {
    name: 'Gel Nail Polish Starter Kit (24 Colours)',
    description: 'Complete gel nail kit with 24 chip-resistant gel polishes, LED lamp, base coat, top coat and all accessories. Salon results at home.',
    price: 29.99, category: 'Beauty', stock: 100,
    images: ['https://images.unsplash.com/photo-1600612253971-2e3a00adc5e4?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-BE-007', cost: 9.50, shippingProfile: 'Standard', processingDays: 5, syncStatus: 'synced' },
  },
  {
    name: 'Professional 120-Colour Eyeshadow Palette',
    description: 'Mega eyeshadow palette with 120 blendable shades in matte, shimmer and glitter finishes. Long-wearing, cruelty-free formula.',
    price: 22.99, category: 'Beauty', stock: 130,
    images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-BE-008', cost: 7.00, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Pore Vacuum Blackhead Remover',
    description: 'USB-rechargeable suction blackhead remover with 4 interchangeable heads and 5 suction levels for nose, forehead and chin.',
    price: 18.99, category: 'Beauty', stock: 150,
    images: ['https://images.unsplash.com/photo-1599391398131-cd12dfc6c24b?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-BE-009', cost: 5.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Eyelash Lift & Tint Home Kit',
    description: 'Salon-grade lash lift and tint kit for dramatic, curled lashes that last 6–8 weeks. Includes all solutions, rods, tints and tools.',
    price: 24.99, category: 'Beauty', stock: 120,
    images: ['https://images.unsplash.com/photo-1583692331507-fc0bd348695d?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-BE-010', cost: 7.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },

  // ── Nutrition ─────────────────────────────────────────────────────────────
  {
    name: 'Whey Protein Isolate – Vanilla (1kg)',
    description: '90% protein whey isolate with 27g protein per serving, low fat, low sugar. Instantised for smooth, clump-free mixing.',
    price: 34.99, category: 'Nutrition', stock: 180,
    images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-NU-001', cost: 11.00, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Vegan Pea Protein Powder (750g)',
    description: 'Plant-based pea protein with 22g protein per serving. Unflavoured, no artificial sweeteners, mixes into smoothies and bakes.',
    price: 32.99, category: 'Nutrition', stock: 160,
    images: ['https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-NU-002', cost: 10.00, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Omega-3 Fish Oil 1000mg (90 Softgels)',
    description: 'Triglyceride-form omega-3 with 650mg EPA + DHA per serving for cardiovascular, brain and joint health. Lemon-flavoured, no fishy aftertaste.',
    price: 14.99, category: 'Nutrition', stock: 300,
    images: ['https://images.unsplash.com/photo-1532619187608-e5375cab36aa?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-NU-003', cost: 4.00, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Probiotic 50 Billion CFU (30 Capsules)',
    description: '10-strain probiotic blend with 50 billion CFU per capsule for gut health, digestion and immune support. Delayed-release, refrigeration-free.',
    price: 19.99, category: 'Nutrition', stock: 220,
    images: ['https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-NU-004', cost: 6.00, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Ashwagandha KSM-66 Root Extract (60 Caps)',
    description: 'Clinically studied KSM-66® ashwagandha to reduce cortisol, improve stress resilience, energy and thyroid function.',
    price: 18.99, category: 'Nutrition', stock: 200,
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-NU-005', cost: 5.50, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Turmeric Curcumin 1500mg (90 Capsules)',
    description: '95% curcuminoids turmeric with BioPerine® black pepper extract for maximum absorption. Supports inflammation, joints and gut health.',
    price: 16.99, category: 'Nutrition', stock: 250,
    images: ['https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-NU-006', cost: 4.80, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Biotin 10,000mcg Hair & Nail Gummies',
    description: 'High-dose biotin gummies with added zinc, vitamin B5 and keratin to strengthen hair, nails and support healthy skin.',
    price: 13.99, category: 'Nutrition', stock: 280,
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-NU-007', cost: 3.80, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Greens & Superfoods Powder (30 Servings)',
    description: 'Daily greens blend with 50+ superfoods including spirulina, chlorella, wheatgrass and adaptogens. One scoop = 10 servings of vegetables.',
    price: 29.99, category: 'Nutrition', stock: 170,
    images: ['https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-NU-008', cost: 9.00, shippingProfile: 'Standard', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Electrolyte Hydration Powder (30 Sachets)',
    description: 'Zero-sugar electrolyte drink mix with sodium, potassium, magnesium and B-vitamins for rapid rehydration during sport and travel.',
    price: 17.99, category: 'Nutrition', stock: 240,
    images: ['https://images.unsplash.com/photo-1559583985-c80ab5285ccc?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-NU-009', cost: 5.00, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Digestive Enzyme Complex (60 Capsules)',
    description: '18-enzyme blend including protease, amylase, lipase and lactase to reduce bloating, improve nutrient absorption and ease digestion.',
    price: 21.99, category: 'Nutrition', stock: 190,
    images: ['https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-NU-010', cost: 6.50, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },

  // ── Kitchen ───────────────────────────────────────────────────────────────
  {
    name: 'Digital Air Fryer 4.5L',
    description: 'Rapid-air technology air fryer with 4.5L basket, 10 preset programmes, digital touch display and 60-minute timer. 80% less fat than deep frying.',
    price: 59.99, category: 'Kitchen', stock: 80,
    images: ['https://images.unsplash.com/photo-1528712306091-ed0763094c98?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-KI-001', cost: 20.00, shippingProfile: 'Standard', processingDays: 6, syncStatus: 'synced' },
  },
  {
    name: 'Glass Spice Jar Set (12-Pack) with Labels',
    description: '12 airtight 150ml glass spice jars with bamboo lids, chalkboard labels, marker and funnel. Stackable and dishwasher safe.',
    price: 24.99, category: 'Kitchen', stock: 180,
    images: ['https://images.unsplash.com/photo-1543393716-375f47996a77?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-KI-002', cost: 7.00, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Cold Brew Coffee Maker 1.5L',
    description: 'Borosilicate glass cold brew pitcher with ultra-fine stainless mesh filter. Brew 12–24 h in fridge for smooth, low-acid coffee.',
    price: 27.99, category: 'Kitchen', stock: 110,
    images: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-KI-003', cost: 8.50, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Reusable Mesh Produce Bags (15-Pack)',
    description: 'Lightweight organic-cotton mesh bags in 3 sizes for fruit, vegetables and bulk goods. Machine washable, plastic-free alternative.',
    price: 11.99, category: 'Kitchen', stock: 350,
    images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-KI-004', cost: 2.50, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },
  {
    name: 'Portable USB Blender Bottle 400ml',
    description: 'USB-rechargeable mini blender with 6 stainless steel blades for smoothies, shakes and protein mixes on the go. BPA-free, 400ml.',
    price: 22.99, category: 'Kitchen', stock: 160,
    images: ['https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-KI-005', cost: 7.00, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Stainless Steel Bento Lunch Box Set',
    description: '3-tier stainless steel bento box with leak-proof lid and silicone seal. Includes cutlery set and carry bag. Holds 1.5L total.',
    price: 26.99, category: 'Kitchen', stock: 130,
    images: ['https://images.unsplash.com/photo-1607301405345-5d1e9d5f15c5?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-KI-006', cost: 8.50, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Salad Spinner & Mixing Bowl 5L',
    description: 'Large 5L salad spinner with push-button mechanism, non-slip base and locking lid. Works as serving bowl and colander.',
    price: 19.99, category: 'Kitchen', stock: 120,
    images: ['https://images.unsplash.com/photo-1556906781-64da0f90fe22?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-KI-007', cost: 6.00, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Silicone Baking Mat Set (3-Pack)',
    description: 'Non-stick BPA-free silicone baking sheets for oven, pastry rolling and freezer use. Replaces parchment paper – reusable 3,000+ times.',
    price: 16.99, category: 'Kitchen', stock: 200,
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-KI-008', cost: 4.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Electric Food Steamer 3-Tier 9L',
    description: 'BPA-free 3-tier food steamer with 9L capacity, 60-minute timer and drip tray. Steam vegetables, fish, dumplings and rice simultaneously.',
    price: 39.99, category: 'Kitchen', stock: 90,
    images: ['https://images.unsplash.com/photo-1557499305-0af888c3d8ec?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-KI-009', cost: 13.00, shippingProfile: 'Standard', processingDays: 5, syncStatus: 'synced' },
  },
  {
    name: 'Instant-Read Digital Meat Thermometer',
    description: 'Foldable probe thermometer with 1-second response time, ±0.5°C accuracy and backlit display. Waterproof, magnetic back for fridge mounting.',
    price: 12.99, category: 'Kitchen', stock: 260,
    images: ['https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-KI-010', cost: 3.20, shippingProfile: 'ePacket', processingDays: 2, syncStatus: 'synced' },
  },

  // ── Pet Care ──────────────────────────────────────────────────────────────
  {
    name: 'Deshedding Pet Grooming Brush',
    description: 'Stainless-steel deshedding tool with ergonomic handle and ejector button. Removes up to 95% of loose undercoat for dogs and cats.',
    price: 19.99, category: 'Pet Care', stock: 200,
    images: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-PC-001', cost: 5.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Automatic Pet Water Fountain 2.5L',
    description: 'Whisper-quiet 2.5L pet water fountain with triple filtration (activated carbon + foam + cotton) for fresh, circulating water 24/7.',
    price: 29.99, category: 'Pet Care', stock: 130,
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-PC-002', cost: 9.00, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'GPS Pet Tracker & Activity Monitor',
    description: 'Waterproof GPS + LTE pet collar tracker with real-time location, virtual fence alerts and 7-day activity tracking. Works globally.',
    price: 39.99, category: 'Pet Care', stock: 80,
    images: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-PC-003', cost: 14.00, shippingProfile: 'ePacket', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Dog Snuffle Mat – Nose Work Feeding Rug',
    description: 'Handmade fleece snuffle mat that hides kibble and treats to encourage natural foraging, slow eating and mental stimulation.',
    price: 22.99, category: 'Pet Care', stock: 150,
    images: ['https://images.unsplash.com/photo-1601758174493-45d0a4d2e27f?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-PC-004', cost: 6.50, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Cat Tree Tower with Scratching Post',
    description: 'Multi-level 150cm cat tree with two condos, sisal scratching posts, perch and hanging toy. Easy assembly, removable washable covers.',
    price: 59.99, category: 'Pet Care', stock: 55,
    images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-PC-005', cost: 22.00, shippingProfile: 'Standard', processingDays: 6, syncStatus: 'synced' },
  },
  {
    name: 'Airline-Approved Pet Carrier Backpack',
    description: 'Expandable mesh pet backpack with airline-cabin-sized compartment (up to 8kg), ventilation windows, fleece pad and safety leash clip.',
    price: 44.99, category: 'Pet Care', stock: 90,
    images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-PC-006', cost: 14.00, shippingProfile: 'Standard', processingDays: 5, syncStatus: 'synced' },
  },
  {
    name: 'No-Pull Dog Harness with Handle',
    description: 'Padded mesh no-pull harness with front and back D-rings, reflective stitching and quick-release buckles. Available XS–XL.',
    price: 24.99, category: 'Pet Care', stock: 170,
    images: ['https://images.unsplash.com/photo-1568572933382-74d440642117?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-PC-007', cost: 7.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'XL Waterproof Cat Litter Mat',
    description: 'Double-layer honeycomb trapping mat (60×90cm) catches litter particles as your cat exits the box. Easy-clean, non-toxic and phthalate-free.',
    price: 17.99, category: 'Pet Care', stock: 200,
    images: ['https://images.unsplash.com/photo-1525253086316-d0c936c814f8?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-PC-008', cost: 5.00, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
  },
  {
    name: 'Self-Cooling Pet Mat 90×50cm',
    description: 'Gel-filled self-cooling mat that activates on contact with no electricity needed. Keeps pets up to 3–4°C cooler than ambient temperature.',
    price: 27.99, category: 'Pet Care', stock: 130,
    images: ['https://images.unsplash.com/photo-1601758177266-bc599de87707?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-PC-009', cost: 9.00, shippingProfile: 'Standard', processingDays: 4, syncStatus: 'synced' },
  },
  {
    name: 'Interactive Dog Puzzle Toy – Level 3',
    description: 'Advanced Level 3 interactive puzzle that challenges dogs to slide, flip and spin pieces to reveal hidden treats. Dishwasher-safe ABS plastic.',
    price: 21.99, category: 'Pet Care', stock: 160,
    images: ['https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800'],
    supplier: { name: 'aliexpress', productId: 'AE-PC-010', cost: 6.50, shippingProfile: 'ePacket', processingDays: 3, syncStatus: 'synced' },
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
