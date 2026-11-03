#!/usr/bin/env node
/**
 * Builds src/mock-data/catalogue.json (and a DY-style product feed CSV in
 * feed/) for the POINTX prototype. Items are modelled on what the live app
 * shows — X Store merchandise with points / Point+Money prices, e-Coupons,
 * Eat Around dining, scan-&-pay Shops with points back, Missions, Partner
 * points transfers, XTravel and Donations.
 *
 * Standard POINTX rate: 12.5 points = ฿1. A "-10%" item is priced at 90% of
 * price × 12.5. All values are illustrative demo data.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RATE = 12.5;
const TODAY = '2026-11-02';

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['’.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const items = [];
let seq = 100000;
const nextId = () => String(++seq);

const img = (brandId, id) => `https://www.pointx.com/assets/items/${brandId}/${id}.jpg`;

/* ------------------------------------------------------------------ */
/* X Store products                                                    */
/* ------------------------------------------------------------------ */
function product(name, brand, price, opts = {}) {
  const id = nextId();
  const brandId = slug(brand);
  const pointsOriginal = Math.round(price * RATE);
  const disc = opts.disc ?? 0;
  const pointsCost = opts.points ?? Math.round(pointsOriginal * (1 - disc / 100));
  items.push({
    id,
    name,
    title: name,
    subtitle: `${price.toLocaleString('en-US')} Baht`,
    brand,
    brandId,
    image: img(brandId, id),
    icon: opts.icon ?? 'inventory_2',
    pointsCost,
    pointsOriginal: disc > 0 ? pointsOriginal : undefined,
    priceThb: price,
    discountPct: disc > 0 ? disc : undefined,
    pointPlusMoney: opts.ppm ?? true,
    inStock: opts.inStock ?? true,
    stockLevel: opts.left != null && opts.left <= 6 ? 'low' : 'normal',
    stockLeft: opts.left,
    category: opts.cat,
    offerType: 'Product',
    cta: 'Redeem',
    section: opts.section ?? 'X Store',
    flash: opts.flash ?? false,
    memberLevel: opts.level ?? 'All',
    channel: 'X Store',
    validUntil: opts.until ?? '2026-12-31',
    tags: opts.tags ?? [],
    redemptions: opts.pop ?? 300,
    dateAdded: opts.added ?? '2026-10-10',
  });
  return id;
}

/* Apple */
product('iPhone 18 Pro Max 256GB Burgundy', 'Apple', 52900, { disc: 1, points: 652786, cat: 'Mobile & Gadgets', icon: 'smartphone', section: 'Wealth Wonders', level: 'Wealth', tags: ['iphone', 'phone', 'apple', 'mobile', 'gift', 'luxury'], pop: 410, added: '2026-10-28' });
product('Whoop Life (12 Months Membership)', 'Whoop', 23990, { disc: 20, points: 239900, left: 4, cat: 'Health & Wellness', icon: 'monitor_heart', section: 'Wealth Wonders', level: 'Wealth', tags: ['fitness', 'wearable', 'health', 'tracker', 'gym', 'sport'], pop: 120, added: '2026-10-25' });
product('iPhone 18 Pro Max 2TB – Black', 'Apple', 100900, { disc: 4, points: 1200710, cat: 'Mobile & Gadgets', icon: 'smartphone', section: 'Wealth Wonders', level: 'Wealth', tags: ['iphone', 'phone', 'apple', 'mobile', 'luxury'], pop: 95, added: '2026-10-28' });
const AIRPODS5_CASE = product('AirPods 5 with Wireless Charging Case', 'Apple', 5490, { disc: 10, points: 61763, left: 20, cat: 'Mobile & Gadgets', icon: 'headphones', section: 'Flash Deal', flash: true, until: '2026-11-03', tags: ['airpods', 'earbuds', 'headphones', 'apple', 'music', 'audio', 'gift'], pop: 2840, added: '2026-10-29' });
const MACBOOK_NEO = product('MacBook Neo (A18 Pro) 512GB Touch ID – Silver', 'Apple', 27900, { disc: 12, points: 306900, left: 2, cat: 'Mobile & Gadgets', icon: 'laptop_mac', section: 'Flash Deal', flash: true, until: '2026-11-03', tags: ['macbook', 'laptop', 'apple', 'computer', 'work', 'student'], pop: 960, added: '2026-10-29' });
product('AirPods 5', 'Apple', 4790, { disc: 10, points: 53888, left: 20, cat: 'Mobile & Gadgets', icon: 'headphones', section: 'Flash Deal', flash: true, until: '2026-11-03', tags: ['airpods', 'earbuds', 'headphones', 'apple', 'music', 'audio', 'gift'], pop: 2310, added: '2026-10-29' });
product('Apple Watch Series 12 GPS 42mm Light Gold Aluminium Case with Sand Sport Band', 'Apple', 14900, { disc: 1, points: 183866, cat: 'Mobile & Gadgets', icon: 'watch', section: 'Apple Top Picks', tags: ['apple watch', 'watch', 'apple', 'wearable', 'fitness', 'gift'], pop: 870, added: '2026-10-20' });
product('Apple Watch Series 12 GPS 42mm Jet Black Aluminium Case with Black Sport Band', 'Apple', 14900, { disc: 1, points: 183866, cat: 'Mobile & Gadgets', icon: 'watch', section: 'Apple Top Picks', tags: ['apple watch', 'watch', 'apple', 'wearable', 'fitness', 'gift'], pop: 790, added: '2026-10-20' });
product('iPad Air 11" M4 128GB Wi-Fi – Blue', 'Apple', 22900, { disc: 3, cat: 'Mobile & Gadgets', icon: 'tablet_mac', section: 'Apple Top Picks', tags: ['ipad', 'tablet', 'apple', 'student', 'gift'], pop: 640, added: '2026-10-15' });
product('Apple Pencil Pro', 'Apple', 4790, { disc: 5, cat: 'Mobile & Gadgets', icon: 'stylus_note', section: 'Apple Top Picks', tags: ['ipad', 'apple', 'pencil', 'student'], pop: 330, added: '2026-10-15' });
product('MagSafe Charger 2m', 'Apple', 1790, { disc: 5, cat: 'Mobile & Gadgets', icon: 'charger', section: 'Apple Top Picks', tags: ['apple', 'charger', 'iphone', 'accessory'], pop: 510, added: '2026-10-12' });

/* Xiaomi / gadgets */
const REDMI_BUDS = product('Xiaomi Redmi Buds 6 Play White Bluetooth Earbuds', 'Xiaomi', 359, { disc: 20, points: 3590, left: 17, cat: 'Mobile & Gadgets', icon: 'earbuds', section: 'Trending Now', tags: ['earbuds', 'headphones', 'xiaomi', 'music', 'audio', 'budget', 'gift'], pop: 3120, added: '2026-10-22' });
product('Xiaomi Band 11 Active Black (779)', 'Xiaomi', 1149, { disc: 20, points: 11490, left: 18, cat: 'Mobile & Gadgets', icon: 'watch', section: 'Trending Now', tags: ['fitness', 'band', 'wearable', 'xiaomi', 'tracker', 'gym', 'sport', 'gift'], pop: 1980, added: '2026-10-22' });
product('Xiaomi Electric Shaver S200 (Silver)', 'Xiaomi', 1099, { disc: 40, points: 8243, left: 1, cat: 'Health & Wellness', icon: 'content_cut', section: 'Trending Now', tags: ['shaver', 'grooming', 'xiaomi', 'men', 'gift'], pop: 760, added: '2026-10-18' });
product('iWALK LinkPod Pro 5000 PCL – Purple', 'iWALK', 1350, { disc: 28, points: 12150, left: 6, cat: 'Mobile & Gadgets', icon: 'battery_charging_full', section: 'Mobile & Gadgets', tags: ['powerbank', 'charger', 'iphone', 'accessory', 'travel'], pop: 540, added: '2026-10-10' });
product('Remax Powerbank 10,000 mAh Model RPP-', 'Remax', 299, { cat: 'Mobile & Gadgets', icon: 'battery_charging_full', section: 'Mobile & Gadgets', tags: ['powerbank', 'charger', 'accessory', 'budget', 'travel'], pop: 1420, added: '2026-09-28' });
product('Remax Powerbank 5,000mAh 2 in 1 Magnetic', 'Remax', 499, { disc: 1, points: 6158, cat: 'Mobile & Gadgets', icon: 'battery_charging_full', section: 'Mobile & Gadgets', tags: ['powerbank', 'charger', 'magsafe', 'accessory', 'travel'], pop: 880, added: '2026-09-28' });
product('Garmin Venu 4 45mm – Slate', 'Garmin', 16990, { disc: 20, left: 5, cat: 'Mobile & Gadgets', icon: 'watch', section: 'Whoop · Garmin', tags: ['garmin', 'watch', 'fitness', 'running', 'sport', 'wearable', 'gym'], pop: 310, added: '2026-10-05' });
product('Garmin Forerunner 265 – Whitestone', 'Garmin', 15990, { disc: 20, cat: 'Mobile & Gadgets', icon: 'directions_run', section: 'Whoop · Garmin', tags: ['garmin', 'watch', 'running', 'sport', 'fitness', 'wearable'], pop: 280, added: '2026-10-05' });
product('Garmin Lily 2 Active – Lunar Gold', 'Garmin', 11990, { disc: 20, cat: 'Mobile & Gadgets', icon: 'watch', section: 'Whoop · Garmin', tags: ['garmin', 'watch', 'fitness', 'wearable', 'gift', 'women'], pop: 240, added: '2026-10-05' });

/* Samsung */
product('Samsung 75" Micro RGB R95H 4K Vision AI TV', 'Samsung', 174990, { disc: 9, points: 1987887, cat: 'Home Appliances', icon: 'tv', section: 'Samsung Lover', tags: ['tv', 'samsung', 'television', 'home', 'luxury'], pop: 40, added: '2026-10-08' });
product('Samsung 65" Micro RGB R85H 4K Vision AI TV', 'Samsung', 64990, { disc: 10, points: 729838, cat: 'Home Appliances', icon: 'tv', section: 'Samsung Lover', tags: ['tv', 'samsung', 'television', 'home'], pop: 85, added: '2026-10-08' });
product('Samsung 55" Mini LED M77H 4K Vision AI TV', 'Samsung', 18990, { disc: 5, points: 223323, cat: 'Home Appliances', icon: 'tv', section: 'Samsung Lover', tags: ['tv', 'samsung', 'television', 'home'], pop: 220, added: '2026-10-08' });
product('Samsung Galaxy Buds3 Pro – Silver', 'Samsung', 8990, { disc: 15, cat: 'Mobile & Gadgets', icon: 'earbuds', section: 'Samsung Lover', tags: ['earbuds', 'headphones', 'samsung', 'music', 'audio'], pop: 410, added: '2026-10-08' });

/* Home appliances & kitchen */
product('Dyson Purifier Cool Gen1 TP10', 'Dyson', 19900, { disc: 24, left: 7, cat: 'Home Appliances', icon: 'air', section: 'Top Select | Air Purifier', tags: ['air purifier', 'dyson', 'home', 'pm2.5', 'clean air', 'family'], pop: 530, added: '2026-10-26' });
product('Xiaomi Smart Air Purifier 4 Pro', 'Xiaomi', 7490, { disc: 30, left: 12, cat: 'Home Appliances', icon: 'air', section: 'Top Select | Air Purifier', tags: ['air purifier', 'xiaomi', 'home', 'pm2.5', 'clean air', 'family', 'budget'], pop: 1240, added: '2026-10-26' });
product('Philips Air Purifier 2000i Series', 'Philips', 12990, { disc: 24, cat: 'Home Appliances', icon: 'air', section: 'Top Select | Air Purifier', tags: ['air purifier', 'philips', 'home', 'pm2.5', 'clean air'], pop: 360, added: '2026-10-26' });
product('Philips Hair Dryer 2100W Model BHD350/10', 'Philips', 1390, { disc: 40, points: 10425, left: 17, cat: 'Home Appliances', icon: 'heat', section: 'Flash Deal', flash: true, until: '2026-11-03', tags: ['hair dryer', 'philips', 'beauty', 'hair', 'gift'], pop: 1650, added: '2026-10-30' });
product('SUMO Air Blower, Model B328 (New Version)', 'SUMO', 1990, { disc: 14, points: 21154, cat: 'Home Appliances', icon: 'wind_power', section: 'New Arrival', tags: ['tools', 'garden', 'diy', 'home'], pop: 150, added: '2026-10-30' });
product('Sumo 1" Submersible Water Pump, Model S250', 'SUMO', 2150, { disc: 7, points: 24983, cat: 'Home Appliances', icon: 'water_pump', section: 'New Arrival', tags: ['tools', 'pump', 'diy', 'home'], pop: 90, added: '2026-10-30' });
product('Seagull Soybean Milk Maker SSM-1000', 'Seagull', 1390, { disc: 5, points: 16347, cat: 'Kitchen', icon: 'blender', section: 'Kitchen & Home', tags: ['kitchen', 'soy milk', 'healthy', 'home', 'cooking'], pop: 420, added: '2026-10-14' });
product('Seagull Induction Cooker SIH-004', 'Seagull', 1690, { disc: 5, points: 19875, cat: 'Kitchen', icon: 'cooking', section: 'Kitchen & Home', tags: ['kitchen', 'cooker', 'home', 'cooking'], pop: 380, added: '2026-10-14' });
product('Seagull Ivory Pearl Non-Stick Induction Frying Pan 28cm', 'Seagull', 850, { disc: 10, points: 9546, cat: 'Kitchen', icon: 'skillet', section: 'Kitchen & Home', tags: ['kitchen', 'pan', 'home', 'cooking', 'budget'], pop: 690, added: '2026-10-14' });
product('Tefal Easy Fry Max Air Fryer 5L', 'Tefal', 3990, { disc: 25, left: 9, cat: 'Kitchen', icon: 'oven', section: 'Kitchen & Home', tags: ['kitchen', 'air fryer', 'home', 'cooking', 'healthy', 'family'], pop: 1870, added: '2026-10-19' });
product('Nespresso Vertuo Pop Coffee Machine', 'Nespresso', 5990, { disc: 15, cat: 'Kitchen', icon: 'coffee_maker', section: 'Kitchen & Home', tags: ['coffee', 'kitchen', 'coffee machine', 'home', 'gift', 'cafe'], pop: 720, added: '2026-10-19' });

/* Beauty & health */
product('TOM FORD Noir De Noir EDP 100 ml', 'TOM FORD', 16000, { disc: 20, points: 160000, left: 5, cat: 'Beauty', icon: 'spa', section: 'Beauty Top Select', tags: ['perfume', 'fragrance', 'tom ford', 'luxury', 'gift', 'beauty'], pop: 210, added: '2026-10-30' });
product('TOM FORD Soleil Neige EDP 100ml', 'TOM FORD', 9900, { disc: 40, points: 74250, left: 4, cat: 'Beauty', icon: 'spa', section: 'Beauty Top Select', tags: ['perfume', 'fragrance', 'tom ford', 'luxury', 'gift', 'beauty'], pop: 190, added: '2026-10-30' });
const SKII_ESSENCE = product('SK-II Facial Treatment Essence 230ml', 'SK-II', 8800, { disc: 40, points: 66000, left: 3, cat: 'Beauty', icon: 'water_drop', section: 'Beauty Top Select', tags: ['skincare', 'essence', 'sk-ii', 'beauty', 'luxury', 'gift', 'women'], pop: 980, added: '2026-10-24' });
product('SK-II Genoptics Infinitaura Essence 75ml', 'SK-II', 13600, { disc: 50, points: 85000, left: 4, cat: 'Beauty', icon: 'water_drop', section: 'Beauty Top Select', tags: ['skincare', 'essence', 'sk-ii', 'beauty', 'luxury', 'brightening'], pop: 350, added: '2026-10-24' });
product('LA MER The Renewal Oil 30ml', 'LA MER', 11800, { disc: 40, points: 88500, left: 4, cat: 'Beauty', icon: 'water_drop', section: 'Beauty Top Select', tags: ['skincare', 'la mer', 'beauty', 'luxury', 'gift', 'oil'], pop: 270, added: '2026-10-24' });
product('COACH EDT 90ML', 'COACH', 5250, { cat: 'Beauty', icon: 'spa', section: 'Beauty Top Select', tags: ['perfume', 'fragrance', 'coach', 'gift', 'beauty'], pop: 160, added: '2026-10-11' });
product('LA PRAIRIE Cellular Swiss UV Protection Veil SPF50 50ML', 'LA PRAIRIE', 9400, { cat: 'Beauty', icon: 'wb_sunny', section: 'Beauty Top Select', tags: ['skincare', 'sunscreen', 'la prairie', 'beauty', 'luxury'], pop: 95, added: '2026-10-11' });
product('LA PRAIRIE Swiss Pristine Serum 30ML', 'LA PRAIRIE', 14000, { cat: 'Beauty', icon: 'water_drop', section: 'Beauty Top Select', tags: ['skincare', 'serum', 'la prairie', 'beauty', 'luxury'], pop: 70, added: '2026-10-11' });
product('Bewell Set Extra Thick Yoga Mat 10mm + Strap – Pink', 'Bewell', 880, { disc: 33, points: 7331, cat: 'Health & Wellness', icon: 'self_improvement', section: 'Health & Beauty', tags: ['yoga', 'fitness', 'gym', 'sport', 'health', 'budget', 'women'], pop: 1130, added: '2026-10-21' });
product('Bewell Set Extra Thick Yoga Mat 10mm + Strap – Grey', 'Bewell', 880, { disc: 33, points: 7331, cat: 'Health & Wellness', icon: 'self_improvement', section: 'Health & Beauty', tags: ['yoga', 'fitness', 'gym', 'sport', 'health', 'budget'], pop: 840, added: '2026-10-21' });
product('Bewell Set Extra Thick Yoga Mat 10mm + Strap – Green', 'Bewell', 880, { disc: 33, points: 7331, cat: 'Health & Wellness', icon: 'self_improvement', section: 'Health & Beauty', tags: ['yoga', 'fitness', 'gym', 'sport', 'health', 'budget'], pop: 610, added: '2026-10-21' });
product('Dyson Supersonic Hair Dryer – Ceramic Pink', 'Dyson', 15900, { disc: 10, left: 3, cat: 'Beauty', icon: 'heat', section: 'Beauty Top Select', tags: ['hair dryer', 'dyson', 'beauty', 'hair', 'luxury', 'gift', 'women'], pop: 450, added: '2026-10-23' });
const EUCERIN = product('Eucerin Spotless Brightening Serum 30ml', 'Eucerin', 1590, { disc: 30, cat: 'Beauty', icon: 'water_drop', section: 'Health & Beauty', tags: ['skincare', 'serum', 'beauty', 'brightening', 'budget', 'pharmacy'], pop: 1320, added: '2026-10-16' });
product('Blackmores Bio C 1000mg 150 Tablets', 'Blackmores', 990, { disc: 20, cat: 'Health & Wellness', icon: 'medication', section: 'Health & Beauty', tags: ['vitamin', 'health', 'supplement', 'pharmacy', 'budget', 'family'], pop: 1540, added: '2026-10-16' });

/* Kid & Mom */
product('LEGO Classic Creative Brick Box 11028', 'LEGO', 1290, { disc: 15, cat: 'Kid & Mom', icon: 'toys', section: 'Kid & Mom', tags: ['kids', 'toys', 'lego', 'family', 'gift', 'children'], pop: 760, added: '2026-10-09' });
product('Pampers Premium Care Pants L 44pcs ×3', 'Pampers', 1650, { disc: 12, cat: 'Kid & Mom', icon: 'child_care', section: 'Kid & Mom', tags: ['baby', 'kids', 'diapers', 'family', 'mom'], pop: 1890, added: '2026-10-09' });
product('Philips Avent Natural Bottle Set', 'Philips', 1190, { disc: 20, cat: 'Kid & Mom', icon: 'baby_changing_station', section: 'Kid & Mom', tags: ['baby', 'kids', 'family', 'mom', 'philips'], pop: 420, added: '2026-10-09' });

/* Entertainment / lifestyle */
product('Nintendo Switch 2 Console', 'Nintendo', 16990, { disc: 3, left: 8, cat: 'Entertainment', icon: 'sports_esports', section: 'Trending Now', tags: ['gaming', 'nintendo', 'switch', 'console', 'kids', 'gift', 'entertainment'], pop: 1210, added: '2026-10-27' });
product('Sony WH-1000XM6 Wireless Headphones – Black', 'Sony', 13990, { disc: 12, left: 6, cat: 'Mobile & Gadgets', icon: 'headphones', section: 'Trending Now', tags: ['headphones', 'sony', 'music', 'audio', 'travel', 'gift', 'noise cancelling'], pop: 690, added: '2026-10-27' });
product('JBL Flip 7 Portable Speaker – Blue', 'JBL', 4290, { disc: 18, cat: 'Mobile & Gadgets', icon: 'speaker', section: 'Mobile & Gadgets', tags: ['speaker', 'jbl', 'music', 'audio', 'party', 'gift', 'travel'], pop: 530, added: '2026-10-17' });

/* ------------------------------------------------------------------ */
/* e-Coupons (points only)                                             */
/* ------------------------------------------------------------------ */
function coupon(name, brand, value, opts = {}) {
  const id = nextId();
  const brandId = slug(brand);
  const pointsOriginal = Math.round(value * RATE);
  const disc = opts.disc ?? 0;
  const pointsCost = opts.points ?? Math.round(pointsOriginal * (1 - disc / 100));
  items.push({
    id,
    name,
    title: name,
    subtitle: `${value.toLocaleString('en-US')} Baht`,
    brand,
    brandId,
    image: img(brandId, id),
    icon: opts.icon ?? 'confirmation_number',
    pointsCost,
    pointsOriginal: disc > 0 ? pointsOriginal : undefined,
    priceThb: value,
    discountPct: disc > 0 ? disc : undefined,
    pointPlusMoney: false,
    inStock: opts.inStock ?? true,
    stockLevel: opts.left != null && opts.left <= 10 ? 'low' : 'normal',
    stockLeft: opts.left,
    category: opts.cat,
    offerType: 'eCoupon',
    cta: 'Redeem',
    section: 'e-Coupon',
    flash: opts.flash ?? false,
    memberLevel: 'All',
    channel: 'e-Coupon',
    validUntil: opts.until ?? '2026-12-31',
    tags: opts.tags ?? [],
    redemptions: opts.pop ?? 500,
    dateAdded: opts.added ?? '2026-10-12',
  });
  return id;
}

const STARBUCKS_100 = coupon('Starbucks e-Coupon THB 100', 'Starbucks', 100, { disc: 8, points: 1149, cat: 'Food & Beverage', icon: 'coffee', tags: ['coffee', 'starbucks', 'cafe', 'กาแฟ', 'drink', 'latte', 'gift', 'treat'], pop: 9800, added: '2026-10-01' });
coupon('Starbucks e-Coupon THB 300', 'Starbucks', 300, { disc: 8, points: 3450, cat: 'Food & Beverage', icon: 'coffee', tags: ['coffee', 'starbucks', 'cafe', 'กาแฟ', 'drink', 'gift', 'treat'], pop: 3200, added: '2026-10-01' });
const LINEMAN_100 = coupon('LINE MAN Food e-Coupon THB 100', 'LINE MAN', 100, { disc: 8, points: 1149, cat: 'Food & Beverage', icon: 'delivery_dining', tags: ['food delivery', 'line man', 'food', 'dinner', 'lunch', 'delivery', 'อาหาร'], pop: 8700, added: '2026-10-03' });
const KOI_100 = coupon('KOI Thé e-Coupon THB 100', 'KOI Thé', 100, { disc: 10, points: 1125, left: 95, cat: 'Food & Beverage', icon: 'local_cafe', tags: ['bubble tea', 'tea', 'koi', 'drink', 'milk tea', 'ชานม', 'treat'], pop: 4100, added: '2026-10-20' });
coupon('Tops e-Coupon THB 500 [MVCF]', 'Tops', 500, { disc: 8, points: 5750, left: 35, cat: 'Grocery', icon: 'shopping_basket', tags: ['grocery', 'tops', 'supermarket', 'food', 'household', 'family'], pop: 2100, added: '2026-10-20' });
coupon('Central e-Coupon THB 1,000', 'Central', 1000, { disc: 8, points: 11500, left: 35, cat: 'Shopping', icon: 'storefront', tags: ['central', 'department store', 'fashion', 'shopping', 'gift', 'beauty'], pop: 1900, added: '2026-10-20' });
coupon("Lotus's e-Coupon THB 500", "Lotus's", 500, { disc: 4, cat: 'Grocery', icon: 'shopping_cart', tags: ['grocery', 'lotus', 'supermarket', 'food', 'household', 'family'], pop: 1700, added: '2026-10-06' });
coupon('Grab Food e-Voucher THB 150', 'Grab', 150, { disc: 6, cat: 'Food & Beverage', icon: 'delivery_dining', tags: ['food delivery', 'grab', 'food', 'dinner', 'lunch', 'delivery'], pop: 3900, added: '2026-10-06' });
const LETS_RELAX = coupon("Let's Relax Thai Massage (120 นาที)", "Let's Relax", 1200, { disc: 40, points: 9000, left: 8, cat: 'Health & Wellness', icon: 'spa', flash: true, until: '2026-11-03', tags: ['massage', 'spa', 'relax', 'wellness', 'gift', 'treat', 'นวด', 'weekend'], pop: 1260, added: '2026-10-30' });
coupon("Let's Relax Cash Voucher 1000THB", "Let's Relax", 1000, { disc: 8, points: 11500, left: 10, cat: 'Health & Wellness', icon: 'spa', flash: true, until: '2026-11-03', tags: ['massage', 'spa', 'relax', 'wellness', 'gift', 'นวด'], pop: 540, added: '2026-10-30' });
const MAJOR_TICKET = coupon('Major Cineplex Movie Ticket e-Coupon', 'Major Cineplex', 240, { disc: 10, cat: 'Entertainment', icon: 'theaters', tags: ['movie', 'cinema', 'film', 'หนัง', 'weekend', 'date', 'entertainment', 'family'], pop: 2600, added: '2026-10-08' });
const AMAZON_100 = coupon('Café Amazon e-Coupon THB 100', 'Café Amazon', 100, { disc: 12, cat: 'Food & Beverage', icon: 'coffee', tags: ['coffee', 'cafe amazon', 'cafe', 'กาแฟ', 'drink', 'budget'], pop: 5200, added: '2026-10-08' });
coupon('Shopee e-Voucher THB 200', 'Shopee', 200, { disc: 4, cat: 'Shopping', icon: 'shopping_bag', tags: ['shopee', 'online shopping', 'ecommerce', 'shopping'], pop: 4400, added: '2026-10-02' });
coupon('Lazada e-Voucher THB 200', 'Lazada', 200, { disc: 4, cat: 'Shopping', icon: 'shopping_bag', tags: ['lazada', 'online shopping', 'ecommerce', 'shopping'], pop: 3100, added: '2026-10-02' });
const SEPHORA_500 = coupon('Sephora e-Coupon THB 500', 'Sephora', 500, { disc: 6, cat: 'Beauty', icon: 'spa', tags: ['beauty', 'sephora', 'makeup', 'skincare', 'gift', 'women', 'เครื่องสำอาง'], pop: 1500, added: '2026-10-13' });
coupon('Watsons e-Coupon THB 100', 'Watsons', 100, { disc: 5, cat: 'Beauty', icon: 'medication', tags: ['beauty', 'pharmacy', 'watsons', 'skincare', 'health', 'budget'], pop: 2600, added: '2026-10-13' });
coupon('Watsons e-Coupon THB 300', 'Watsons', 300, { disc: 5, cat: 'Beauty', icon: 'medication', tags: ['beauty', 'pharmacy', 'watsons', 'skincare', 'health', 'budget'], pop: 2050, added: '2026-10-13' });
coupon("Swensen's e-Coupon THB 100", "Swensen's", 100, { disc: 8, cat: 'Food & Beverage', icon: 'icecream', tags: ['ice cream', 'dessert', 'sweet', 'kids', 'family', 'treat'], pop: 1800, added: '2026-10-13' });
coupon('After You e-Coupon THB 200', 'After You', 200, { disc: 8, cat: 'Food & Beverage', icon: 'cake', tags: ['dessert', 'toast', 'sweet', 'cafe', 'date', 'treat', 'gift'], pop: 1350, added: '2026-10-13' });
coupon('PTT Station Fuel e-Voucher THB 500', 'PTT Station', 500, { disc: 2, cat: 'Gas & Auto', icon: 'local_gas_station', tags: ['fuel', 'petrol', 'gas', 'car', 'ptt', 'drive'], pop: 2900, added: '2026-10-04' });
coupon('MK Restaurants e-Coupon THB 300', 'MK Restaurants', 300, { disc: 8, cat: 'Food & Beverage', icon: 'soup_kitchen', tags: ['dinner', 'suki', 'family', 'food', 'restaurant', 'mk'], pop: 2200, added: '2026-10-04' });
coupon('Bar B Q Plaza e-Coupon THB 300', 'Bar B Q Plaza', 300, { disc: 8, cat: 'Food & Beverage', icon: 'outdoor_grill', tags: ['dinner', 'bbq', 'family', 'food', 'restaurant', 'friends'], pop: 1900, added: '2026-10-04' });
coupon('Starbucks e-Coupon THB 500', 'Starbucks', 500, { disc: 8, cat: 'Food & Beverage', icon: 'coffee', tags: ['coffee', 'starbucks', 'cafe', 'กาแฟ', 'gift'], pop: 1200, added: '2026-10-01' });
coupon('Starbucks Tall Drink e-Coupon', 'Starbucks', 145, { disc: 15, cat: 'Food & Beverage', icon: 'coffee', tags: ['coffee', 'starbucks', 'cafe', 'กาแฟ', 'drink', 'latte', 'treat'], pop: 6100, added: '2026-10-25', inStock: false });

/* ------------------------------------------------------------------ */
/* Eat Around (dining · Point+Money)                                    */
/* ------------------------------------------------------------------ */
function dining(name, brand, cuisine, price, rating, booked, opts = {}) {
  const id = nextId();
  const brandId = slug(brand);
  items.push({
    id,
    name,
    title: name,
    subtitle: cuisine,
    brand,
    brandId,
    image: img(brandId, id),
    icon: opts.icon ?? 'restaurant',
    pointsCost: Math.round(price * RATE),
    priceThb: price,
    pointPlusMoney: true,
    inStock: true,
    stockLevel: 'normal',
    category: 'Dining',
    offerType: 'Dining',
    cta: 'Book',
    section: 'Eat Around',
    rating,
    booked,
    award: opts.award,
    memberLevel: 'All',
    channel: 'Eat Around',
    validUntil: '2026-12-31',
    tags: ['dinner', 'restaurant', 'eat around', 'food', 'date', 'weekend', 'friends', ...(opts.tags ?? [])],
    redemptions: Math.round(booked / 40),
    dateAdded: opts.added ?? '2026-10-15',
  });
  return id;
}
const COPPER_DINNER = dining('Copper Beyond Buffet – Dinner', 'Copper', 'Internation Buffet', 2599, 4.8, 124400, { award: 'Red Table Award', tags: ['buffet', 'copper', 'international', 'celebration', 'birthday', 'family', 'luxury'] });
dining('Copper Beyond Buffet – Lunch', 'Copper', 'Internation Buffet', 1999, 4.8, 220800, { award: 'Red Table Award', tags: ['buffet', 'copper', 'international', 'celebration', 'lunch', 'family'] });
const NAMA = dining('NAMA Japanese & Seafood Buffet', 'NAMA', 'Japanese Buffet', 1499, 4.6, 19500, { award: 'Red Table Award', icon: 'set_meal', tags: ['buffet', 'japanese', 'seafood', 'sushi', 'ญี่ปุ่น', 'family'] });
dining('Sühring – Tasting Menu for Two', 'Sühring', 'German Fine Dining', 9800, 4.9, 3100, { award: 'Michelin 2 Stars', icon: 'dinner_dining', tags: ['fine dining', 'michelin', 'anniversary', 'celebration', 'luxury', 'romantic'] });
dining('Sorn – Southern Thai Tasting', 'Sorn', 'Thai Fine Dining', 6900, 4.9, 4200, { award: 'Michelin 3 Stars', icon: 'dinner_dining', tags: ['fine dining', 'michelin', 'thai', 'anniversary', 'celebration', 'luxury', 'romantic'] });
dining('Shabushi by Oishi – Buffet', 'Shabushi', 'Japanese Shabu Buffet', 499, 4.3, 310000, { icon: 'soup_kitchen', tags: ['buffet', 'shabu', 'japanese', 'budget', 'friends', 'family'] });
dining('Sizzler – Steak & Salad Bar Set', 'Sizzler', 'Western', 599, 4.4, 180000, { icon: 'lunch_dining', tags: ['steak', 'salad', 'western', 'family', 'budget', 'kids'] });
dining('Baan Ying – Thai Set for 2', 'Baan Ying', 'Thai Home Cooking', 890, 4.5, 42000, { tags: ['thai', 'family', 'budget', 'lunch', 'dinner'] });
dining('Hotel Okura Yamazato – Kaiseki Lunch', 'Yamazato', 'Japanese Kaiseki', 3200, 4.8, 8600, { award: 'Michelin Plate', icon: 'set_meal', tags: ['japanese', 'kaiseki', 'luxury', 'celebration', 'anniversary', 'ญี่ปุ่น'] });
dining('Audrey Café – Afternoon Tea for Two', 'Audrey Café', 'Café & Dessert', 790, 4.4, 56000, { icon: 'bakery_dining', tags: ['afternoon tea', 'dessert', 'cafe', 'date', 'friends', 'sweet', 'women'] });

/* ------------------------------------------------------------------ */
/* Shops (scan & pay with points · points back)                         */
/* ------------------------------------------------------------------ */
function shop(name, brand, cat, opts = {}) {
  const id = nextId();
  const brandId = slug(brand);
  const back = opts.back ?? 0;
  const rate = opts.rate ?? RATE;
  const label = back ? `${name} (Get ${opts.upTo ? 'up to ' : ''}${back}% points back)` : name;
  items.push({
    id,
    name: label,
    title: label,
    subtitle: opts.subtitle ?? (rate < RATE ? `${rate} = 1 Baht` : `${RATE} = 1 Baht`),
    brand,
    brandId,
    image: img(brandId, id),
    icon: opts.icon ?? 'storefront',
    pointsCost: 0,
    pointPlusMoney: true,
    inStock: true,
    stockLevel: 'normal',
    category: cat,
    offerType: 'Shop',
    cta: 'Scan',
    section: back || rate < RATE ? 'Special Deal' : 'Shops',
    shopRate: rate,
    pointsBackPct: back || undefined,
    discountPct: rate < RATE ? Math.round((1 - rate / RATE) * 100) : undefined,
    memberLevel: 'All',
    channel: 'Scan & Pay',
    validUntil: opts.until ?? '2026-12-31',
    tags: opts.tags ?? [],
    redemptions: opts.pop ?? 400,
    dateAdded: opts.added ?? '2026-09-20',
  });
  return id;
}

const LINEMAN_SHOP = shop('LINE MAN Food Delivery', 'LINE MAN', 'Food & Beverage', { rate: 9, icon: 'delivery_dining', tags: ['food delivery', 'line man', 'food', 'dinner', 'lunch', 'delivery'], pop: 12400, added: '2026-10-25', until: '2026-11-30' });
shop('ShopeeFood', 'ShopeeFood', 'Food & Beverage', { back: 50, icon: 'delivery_dining', tags: ['food delivery', 'shopee', 'food', 'dinner', 'lunch', 'delivery'], pop: 9800, added: '2026-10-25', until: '2026-11-30' });
shop('The Mall Lifestore', 'The Mall Lifestore', 'Shopping', { back: 70, upTo: true, icon: 'local_mall', tags: ['department store', 'the mall', 'fashion', 'shopping', 'gourmet market'], pop: 3100, added: '2026-10-15', until: '2026-12-31' });
const CAFE_AMAZON_SHOP = shop('Café Amazon', 'Café Amazon', 'Food & Beverage', { back: 30, icon: 'coffee', tags: ['coffee', 'cafe amazon', 'cafe', 'กาแฟ', 'drink', 'budget'], pop: 15600, added: '2026-10-20', until: '2026-11-30' });
shop('Emporium', 'Emporium', 'Shopping', { back: 70, upTo: true, icon: 'local_mall', tags: ['department store', 'emporium', 'fashion', 'luxury', 'shopping'], pop: 1800, added: '2026-10-15' });
shop('EmQuartier', 'EmQuartier', 'Shopping', { back: 70, upTo: true, icon: 'local_mall', tags: ['department store', 'emquartier', 'fashion', 'luxury', 'shopping'], pop: 2100, added: '2026-10-15' });
shop('EmSphere', 'EmSphere', 'Shopping', { back: 70, upTo: true, icon: 'local_mall', tags: ['department store', 'emsphere', 'fashion', 'shopping', 'entertainment'], pop: 1400, added: '2026-10-15' });
shop('TikTok', 'TikTok', 'Shopping', { back: 25, icon: 'play_circle', tags: ['tiktok', 'online shopping', 'ecommerce', 'shopping'], pop: 5200, added: '2026-10-22', until: '2026-11-30' });
shop('Ari Football & Ari Running', 'Ari', 'Fashion', { icon: 'sports_soccer', tags: ['sport', 'running', 'football', 'shoes', 'sneakers', 'fitness', 'gym'], pop: 900, added: '2026-10-29' });
shop('Bottomless', 'Bottomless', 'Food & Beverage', { icon: 'local_cafe', tags: ['coffee', 'cafe', 'กาแฟ', 'specialty coffee'], pop: 700, added: '2026-10-18' });
shop('CJ MORE shop', 'CJ MORE', 'Grocery', { icon: 'shopping_cart', tags: ['grocery', 'convenience', 'household', 'budget'], pop: 4300, added: '2026-10-01' });
const HM_SHOP = shop('H&M', 'H&M', 'Fashion', { icon: 'checkroom', tags: ['fashion', 'clothes', 'h&m', 'outfit', 'wardrobe'], pop: 3600, added: '2026-10-28' });
shop('JASPAL', 'JASPAL', 'Fashion', { icon: 'checkroom', tags: ['fashion', 'clothes', 'jaspal', 'outfit', 'women'], pop: 1100, added: '2026-10-28' });
shop('Pomelo', 'Pomelo', 'Fashion', { icon: 'checkroom', tags: ['fashion', 'clothes', 'pomelo', 'outfit', 'women'], pop: 1300, added: '2026-10-28' });
shop('King Power Duty Free', 'King Power', 'Travel', { icon: 'flight_takeoff', tags: ['duty free', 'travel', 'airport', 'luxury', 'perfume', 'shopping'], pop: 1500, added: '2026-10-28' });
shop('Hua Seng Heng', 'Hua Seng Heng', 'Jewelry & Watches', { icon: 'diamond', tags: ['gold', 'jewelry', 'investment', 'gift', 'ทอง'], pop: 800, added: '2026-10-27' });
shop('MTS GOLD', 'MTS GOLD', 'Jewelry & Watches', { icon: 'diamond', tags: ['gold', 'jewelry', 'investment', 'ทอง'], pop: 600, added: '2026-10-27' });
shop('AURORA', 'AURORA', 'Jewelry & Watches', { icon: 'diamond', tags: ['gold', 'jewelry', 'gift', 'ทอง'], pop: 500, added: '2026-10-27' });
shop('NGG', 'NGG', 'Jewelry & Watches', { icon: 'diamond', tags: ['jewelry', 'diamond', 'gift', 'luxury', 'anniversary'], pop: 300, added: '2026-10-27' });
shop('MONOMAX', 'MONOMAX', 'Entertainment', { icon: 'movie', tags: ['streaming', 'movie', 'series', 'entertainment', 'หนัง'], pop: 2400, added: '2026-10-19' });
shop('Thai Airways (สายการบินไทย)', 'Thai Airways', 'Travel', { icon: 'flight', tags: ['flight', 'travel', 'airline', 'thai airways', 'japan', 'holiday'], pop: 1900, added: '2026-10-19' });
shop('Drive Car Rental', 'Drive Car Rental', 'Travel', { icon: 'directions_car', tags: ['car rental', 'travel', 'drive', 'holiday', 'road trip'], pop: 400, added: '2026-10-19' });
shop('Miracle Lounge', 'Miracle Lounge', 'Travel', { icon: 'airline_seat_recline_extra', tags: ['airport lounge', 'travel', 'airport', 'flight', 'holiday'], pop: 1100, added: '2026-10-19' });
shop('The Coral Executive Lounge', 'The Coral', 'Travel', { icon: 'airline_seat_recline_extra', tags: ['airport lounge', 'travel', 'airport', 'flight', 'holiday'], pop: 900, added: '2026-10-19' });
shop('Shopee', 'Shopee', 'Shopping', { icon: 'shopping_bag', tags: ['shopee', 'online shopping', 'ecommerce', 'shopping'], pop: 18000, added: '2026-09-10' });
shop('Lazada', 'Lazada', 'Shopping', { icon: 'shopping_bag', tags: ['lazada', 'online shopping', 'ecommerce', 'shopping'], pop: 11000, added: '2026-09-10' });
shop('Gourmet Market', 'Gourmet Market', 'Grocery', { back: 70, upTo: true, icon: 'shopping_basket', tags: ['grocery', 'supermarket', 'gourmet', 'food', 'family', 'premium'], pop: 2800, added: '2026-10-15' });
shop('Watsons', 'Watsons', 'Health & Beauty', { icon: 'medication', tags: ['beauty', 'pharmacy', 'watsons', 'skincare', 'health'], pop: 6200, added: '2026-09-15' });
shop('Boots', 'Boots', 'Health & Beauty', { icon: 'medication', tags: ['beauty', 'pharmacy', 'boots', 'skincare', 'health'], pop: 3900, added: '2026-09-15' });
const SEPHORA_SHOP = shop('Sephora', 'Sephora', 'Health & Beauty', { back: 20, icon: 'spa', tags: ['beauty', 'sephora', 'makeup', 'skincare', 'เครื่องสำอาง', 'women'], pop: 2700, added: '2026-10-24', until: '2026-11-30' });
shop('PTT Station', 'PTT Station', 'Gas & Auto', { icon: 'local_gas_station', tags: ['fuel', 'petrol', 'gas', 'car', 'ptt'], pop: 9400, added: '2026-09-05' });
shop('Bangchak', 'Bangchak', 'Gas & Auto', { icon: 'local_gas_station', tags: ['fuel', 'petrol', 'gas', 'car', 'bangchak'], pop: 5100, added: '2026-09-05' });
shop('B-Quik', 'B-Quik', 'Gas & Auto', { icon: 'tire_repair', tags: ['car', 'tyre', 'service', 'auto'], pop: 700, added: '2026-09-05' });
shop("Lotus's", "Lotus's", 'Grocery', { icon: 'shopping_cart', tags: ['grocery', 'lotus', 'supermarket', 'food', 'household', 'family'], pop: 8800, added: '2026-09-05' });
shop('Big C', 'Big C', 'Grocery', { icon: 'shopping_cart', tags: ['grocery', 'big c', 'supermarket', 'food', 'household', 'family'], pop: 6900, added: '2026-09-05' });
const MAJOR_SHOP = shop('Major Cineplex', 'Major Cineplex', 'Entertainment', { back: 15, icon: 'theaters', tags: ['movie', 'cinema', 'film', 'หนัง', 'weekend', 'date', 'entertainment'], pop: 4600, added: '2026-10-19', until: '2026-11-30' });
shop('SF Cinema', 'SF Cinema', 'Entertainment', { icon: 'movie', tags: ['movie', 'cinema', 'film', 'หนัง', 'weekend', 'entertainment'], pop: 2300, added: '2026-09-19' });
shop('Starbucks', 'Starbucks', 'Food & Beverage', { icon: 'coffee', tags: ['coffee', 'starbucks', 'cafe', 'กาแฟ', 'drink'], pop: 14200, added: '2026-09-01' });
shop('Grab', 'Grab', 'Food & Beverage', { icon: 'local_taxi', tags: ['food delivery', 'grab', 'ride', 'taxi', 'food', 'transport'], pop: 10500, added: '2026-09-01' });
shop('SE-ED Book Center', 'SE-ED', 'Education', { icon: 'menu_book', tags: ['books', 'education', 'student', 'stationery', 'kids'], pop: 900, added: '2026-09-22' });
shop('B2S', 'B2S', 'Education', { icon: 'menu_book', tags: ['books', 'education', 'student', 'stationery', 'kids'], pop: 1200, added: '2026-09-22' });
shop('Agoda', 'Agoda', 'Travel', { icon: 'hotel', tags: ['hotel', 'travel', 'holiday', 'booking', 'japan', 'staycation'], pop: 3300, added: '2026-09-22' });
shop('Sizzler', 'Sizzler', 'Food & Beverage', { icon: 'lunch_dining', tags: ['steak', 'salad', 'family', 'dinner', 'restaurant'], pop: 2800, added: '2026-09-22' });
shop('MK Restaurants', 'MK Restaurants', 'Food & Beverage', { icon: 'soup_kitchen', tags: ['dinner', 'suki', 'family', 'restaurant', 'mk'], pop: 4100, added: '2026-09-22' });
shop('Uniqlo', 'Uniqlo', 'Fashion', { icon: 'checkroom', tags: ['fashion', 'clothes', 'uniqlo', 'outfit', 'basics'], pop: 3800, added: '2026-09-22' });
shop('Nike', 'Nike', 'Fashion', { icon: 'directions_run', tags: ['sport', 'running', 'shoes', 'sneakers', 'fitness', 'fashion', 'gym'], pop: 2600, added: '2026-09-22' });
shop('Decathlon', 'Decathlon', 'Fashion', { icon: 'fitness_center', tags: ['sport', 'running', 'fitness', 'gym', 'outdoor', 'yoga'], pop: 2200, added: '2026-09-22' });
shop('Bangkok Hospital', 'Bangkok Hospital', 'Health & Beauty', { icon: 'local_hospital', tags: ['health', 'hospital', 'checkup', 'wellness', 'family'], pop: 500, added: '2026-09-22' });

/* ------------------------------------------------------------------ */
/* Missions                                                             */
/* ------------------------------------------------------------------ */
function mission(title, subtitle, reward, target, unit, opts = {}) {
  const id = nextId();
  const brand = opts.brand ?? 'POINTX';
  const brandId = slug(brand);
  items.push({
    id,
    name: title,
    title,
    subtitle,
    brand,
    brandId,
    image: img(brandId, id),
    icon: opts.icon ?? 'emoji_events',
    pointsCost: 0,
    pointPlusMoney: false,
    inStock: true,
    stockLevel: 'normal',
    category: opts.cat ?? 'Mission',
    offerType: 'Mission',
    cta: 'Join',
    section: 'My Missions',
    rewardPoints: reward,
    target,
    targetUnit: unit,
    memberLevel: opts.level ?? 'All',
    channel: 'Mission',
    validUntil: opts.until ?? '2026-11-30',
    tags: ['mission', 'earn', 'bonus', ...(opts.tags ?? [])],
    redemptions: opts.pop ?? 800,
    dateAdded: opts.added ?? '2026-10-01',
  });
  return id;
}
const M_FIRST_SCAN = mission('First Scan & Pay', 'Pay with POINTX at any shop once', 200, 1, 'scans', { icon: 'qr_code_scanner', cat: 'Food & Beverage', tags: ['new member', 'scan', 'first'], pop: 6400, added: '2026-10-01' });
const M_SCAN3 = mission('Scan & Pay 3 times this month', 'Any 3 scan & pay payments', 300, 3, 'scans', { icon: 'qr_code_scanner', cat: 'Food & Beverage', tags: ['scan', 'everyday'], pop: 4100 });
const M_FIRST_REDEEM = mission('First X Store redemption', 'Redeem any item or e-Coupon in X Store', 500, 1, 'redemptions', { icon: 'shopping_bag', cat: 'Shopping', tags: ['new member', 'x store', 'first'], pop: 5200 });
const M_TRANSFER = mission('Transfer partner points', 'Bring points from any partner into POINTX', 200, 1, 'transfers', { icon: 'swap_horiz', cat: 'Transfer', tags: ['new member', 'transfer', 'partner'], pop: 3300 });
const M_EAT = mission('Eat Around explorer', 'Book 3 restaurants via Eat Around', 1000, 3, 'bookings', { icon: 'restaurant', cat: 'Dining', tags: ['dining', 'restaurant', 'eat around'], pop: 1200 });
const M_CARD_BILL = mission('Pay your SCB card bill with points', 'Use POINTX for your credit card bill', 2000, 1, 'redemptions', { icon: 'credit_card', cat: 'Cashback', level: 'Cardholder', tags: ['cashback', 'credit card', 'bill'], pop: 2100 });
const M_XTRAVEL = mission('XTravel first booking', 'Book a hotel or flight with points', 3000, 1, 'bookings', { icon: 'flight_takeoff', cat: 'Travel', tags: ['travel', 'hotel', 'flight', 'xtravel'], pop: 900 });
const M_CARD_SPEND = mission('Spend ฿5,000 on your SCB card', 'Any SCB credit card spend this month', 1500, 5000, 'baht', { icon: 'credit_card', cat: 'Cashback', level: 'Cardholder', tags: ['credit card', 'spend'], pop: 2800 });
const M_RATE = mission('Rate 3 items in Trending Now', 'Tap ✓ or ✕ on three cards', 50, 3, 'redemptions', { icon: 'thumb_up', cat: 'Shopping', tags: ['new member', 'feedback', 'trending'], pop: 2900, added: '2026-10-28' });
mission('Coffee lover: 5 café scans', 'Scan & pay 5 times at any café', 250, 5, 'scans', { icon: 'coffee', cat: 'Food & Beverage', brand: 'Café Amazon', tags: ['coffee', 'cafe', 'scan'], pop: 1700 });
const M_SEPHORA = mission('Beauty haul: scan ฿2,000 at Sephora', 'Pay with POINTX at Sephora this month', 600, 2000, 'baht', { icon: 'spa', cat: 'Beauty', brand: 'Sephora', tags: ['beauty', 'sephora', 'scan'], pop: 800 });
mission('Weekend movie: scan at Major Cineplex', 'Pay with POINTX at any Major Cineplex', 150, 1, 'scans', { icon: 'theaters', cat: 'Entertainment', brand: 'Major Cineplex', tags: ['movie', 'cinema', 'weekend'], pop: 1300 });

/* ------------------------------------------------------------------ */
/* Partner points transfer                                              */
/* ------------------------------------------------------------------ */
function transfer(partner, from, to, opts = {}) {
  const id = nextId();
  const brandId = slug(partner);
  items.push({
    id,
    name: partner,
    title: partner,
    subtitle: from && to ? `${from.toLocaleString('en-US')} → ${to.toLocaleString('en-US')}` : 'Rate shown at transfer',
    brand: partner,
    brandId,
    image: img(brandId, id),
    icon: opts.icon ?? 'swap_horiz',
    pointsCost: 0,
    pointPlusMoney: false,
    inStock: true,
    stockLevel: 'normal',
    category: 'Transfer',
    offerType: 'Transfer',
    cta: 'Transfer',
    section: 'Partner Points Transfer to POINTX',
    transferFrom: from || undefined,
    transferTo: to || undefined,
    memberLevel: 'All',
    channel: 'Partner transfer',
    validUntil: '2026-12-31',
    tags: ['transfer', 'partner points', ...(opts.tags ?? [])],
    redemptions: opts.pop ?? 600,
    dateAdded: opts.added ?? '2026-08-01',
  });
  return id;
}
const T_AIS = transfer('AIS Points', 50, 200, { icon: 'cell_tower', tags: ['ais', 'mobile', 'telco'], pop: 7200 });
transfer('AirAsia Points', 0, 0, { icon: 'flight', tags: ['airasia', 'airline', 'travel'], pop: 1500 });
transfer('Amaze', 1250, 80, { icon: 'business_center', tags: ['amaze', 'bank'], pop: 600 });
transfer('Bangchak', 100, 110, { icon: 'local_gas_station', tags: ['bangchak', 'fuel', 'car'], pop: 2400 });
const T_MCARD = transfer('M Card', 110, 100, { icon: 'local_mall', tags: ['m card', 'the mall', 'shopping'], pop: 3900 });
transfer('MAX CARD', 400, 250, { icon: 'local_gas_station', tags: ['max card', 'ptt', 'fuel'], pop: 4100 });
transfer("My Lotus's Coin", 10, 80, { icon: 'shopping_cart', tags: ['lotus', 'grocery'], pop: 2900 });
transfer('NT Privilege', 10, 120, { icon: 'router', tags: ['nt', 'telco', 'internet'], pop: 500 });
transfer('ONESIAM Coin', 800, 700, { icon: 'local_mall', tags: ['onesiam', 'siam paragon', 'shopping', 'luxury'], pop: 1100 });
const T_THE1 = transfer('The 1', 0, 0, { icon: 'looks_one', tags: ['the 1', 'central', 'shopping'], pop: 5600 });
transfer('blueplus+', 300, 380, { icon: 'local_gas_station', tags: ['blueplus', 'ptt', 'fuel', 'cafe amazon'], pop: 1800 });

/* ------------------------------------------------------------------ */
/* Travel (XTravel + airlines)                                           */
/* ------------------------------------------------------------------ */
function travel(name, brand, price, opts = {}) {
  const id = nextId();
  const brandId = slug(brand);
  items.push({
    id,
    name,
    title: name,
    subtitle: opts.subtitle,
    brand,
    brandId,
    image: img(brandId, id),
    icon: opts.icon ?? 'hotel',
    pointsCost: price ? Math.round(price * RATE) : 0,
    priceThb: price || undefined,
    pointPlusMoney: true,
    inStock: true,
    stockLevel: 'normal',
    category: 'Travel',
    offerType: 'Travel',
    cta: 'Book',
    section: opts.section ?? 'XTravel',
    rewardPoints: opts.back,
    memberLevel: 'All',
    channel: opts.channel ?? 'XTravel',
    validUntil: opts.until ?? '2026-12-31',
    tags: ['travel', 'holiday', ...(opts.tags ?? [])],
    redemptions: opts.pop ?? 300,
    dateAdded: opts.added ?? '2026-10-10',
  });
  return id;
}
const TRAVEL_PHUKET = travel('Phuket · 2 nights pool villa', 'XTravel', 8900, { subtitle: 'Stay free first night · up to 30,000 POINTX back', icon: 'beach_access', back: 30000, tags: ['phuket', 'thailand', 'beach', 'hotel', 'weekend', 'couple', 'family'], pop: 1900 });
const TRAVEL_JAPAN = travel('Tokyo · 4 nights Shinjuku hotel', 'XTravel', 24500, { subtitle: 'Popular · up to 30,000 POINTX back', icon: 'temple_buddhist', back: 30000, tags: ['japan', 'tokyo', 'hotel', 'ญี่ปุ่น', 'city break', 'shopping'], pop: 2600 });
travel('Hong Kong · 3 nights Kowloon', 'XTravel', 15900, { subtitle: 'Hot pick · up to 30,000 POINTX back', icon: 'location_city', back: 30000, tags: ['hong kong', 'hotel', 'city break', 'shopping', 'food'], pop: 1200 });
travel('Chiang Mai · 3 nights boutique stay', 'XTravel', 5400, { subtitle: 'Cool season · up to 30,000 POINTX back', icon: 'landscape', back: 30000, tags: ['chiang mai', 'thailand', 'hotel', 'weekend', 'nature', 'family'], pop: 1400 });
travel('Bangkok staycation · 1 night riverside', 'XTravel', 4200, { subtitle: 'Free cancellation', icon: 'hotel', back: 30000, tags: ['bangkok', 'staycation', 'hotel', 'weekend', 'couple', 'anniversary'], pop: 2100 });
travel('AirAsia Points', 'AirAsia', 0, { subtitle: 'Min. redemption 1000 points/miles', icon: 'flight', section: 'Airlines', channel: 'Airline miles', tags: ['airline', 'miles', 'flight', 'airasia'], pop: 900 });
const ROP = travel('Royal Orchid Plus', 'Thai Airways', 0, { subtitle: 'Min. redemption 1000 points/miles', icon: 'flight', section: 'Airlines', channel: 'Airline miles', tags: ['airline', 'miles', 'flight', 'thai airways', 'japan'], pop: 1300 });
travel('FlyerBonus', 'Bangkok Airways', 0, { subtitle: 'Min. redemption 1000 points/miles', icon: 'flight', section: 'Airlines', channel: 'Airline miles', tags: ['airline', 'miles', 'flight', 'bangkok airways', 'samui'], pop: 500 });

/* ------------------------------------------------------------------ */
/* Donations                                                            */
/* ------------------------------------------------------------------ */
function donation(name, brand, value, opts = {}) {
  const id = nextId();
  const brandId = slug(brand);
  items.push({
    id,
    name,
    title: name,
    subtitle: `Donate ${value} Baht`,
    brand,
    brandId,
    image: img(brandId, id),
    icon: opts.icon ?? 'volunteer_activism',
    pointsCost: Math.round(value * RATE),
    priceThb: value,
    pointPlusMoney: false,
    inStock: true,
    stockLevel: 'normal',
    category: 'Donations',
    offerType: 'Donation',
    cta: 'Donate',
    section: 'Donations',
    memberLevel: 'All',
    channel: 'X Store',
    validUntil: '2026-12-31',
    tags: ['donation', 'charity', 'give', ...(opts.tags ?? [])],
    redemptions: opts.pop ?? 400,
    dateAdded: '2026-09-01',
  });
  return id;
}
donation('Thai Red Cross Society', 'Thai Red Cross', 100, { pop: 2200, tags: ['red cross', 'health'] });
donation('Siriraj Foundation', 'Siriraj Foundation', 100, { icon: 'local_hospital', pop: 1900, tags: ['hospital', 'health'] });
donation('UNICEF Thailand', 'UNICEF', 100, { icon: 'child_care', pop: 1500, tags: ['children', 'kids'] });
donation('Foundation for the Blind in Thailand', 'Foundation for the Blind', 100, { icon: 'visibility_off', pop: 800 });

/* ------------------------------------------------------------------ */
/* Write outputs                                                        */
/* ------------------------------------------------------------------ */
const outJson = resolve(__dirname, '../src/mock-data/catalogue.json');
const outIds = resolve(__dirname, '../src/mock-data/catalogueIds.ts');
const outCsv = resolve(__dirname, '../feed/pointx_catalogue_dy_feed.csv');
mkdirSync(dirname(outCsv), { recursive: true });

writeFileSync(outJson, JSON.stringify(items, null, 2));

// Stable ids for the items the scripted stories reference.
const ids = {
  AIRPODS5_CASE,
  MACBOOK_NEO,
  REDMI_BUDS,
  SKII_ESSENCE,
  EUCERIN,
  STARBUCKS_100,
  LINEMAN_100,
  KOI_100,
  LETS_RELAX,
  MAJOR_TICKET,
  AMAZON_100,
  SEPHORA_500,
  COPPER_DINNER,
  NAMA,
  LINEMAN_SHOP,
  CAFE_AMAZON_SHOP,
  HM_SHOP,
  SEPHORA_SHOP,
  MAJOR_SHOP,
  M_FIRST_SCAN,
  M_SCAN3,
  M_FIRST_REDEEM,
  M_TRANSFER,
  M_EAT,
  M_CARD_BILL,
  M_XTRAVEL,
  M_CARD_SPEND,
  M_RATE,
  M_SEPHORA,
  T_AIS,
  T_MCARD,
  T_THE1,
  TRAVEL_PHUKET,
  TRAVEL_JAPAN,
  ROP,
};
writeFileSync(outIds, `/* Generated by scripts/build-catalogue.mjs — do not edit. */\nexport const ID = ${JSON.stringify(ids, null, 2)} as const;\n`);

const cols = ['sku', 'name', 'brand', 'image_url', 'price_points', 'price_points_original', 'price_thb', 'discount_pct', 'point_plus_money', 'in_stock', 'stock_left', 'categories', 'offer_type', 'cta_label', 'app_section', 'flash_deal', 'shop_rate', 'points_back_pct', 'rating', 'booked', 'reward_points', 'transfer_from', 'transfer_to', 'member_level', 'channel', 'valid_until', 'keywords', 'redemptions_30d', 'date_added'];
const esc = (v) => (v == null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const rows = items.map((o) =>
  [o.id, o.name, o.brand, o.image, o.pointsCost, o.pointsOriginal, o.priceThb, o.discountPct, o.pointPlusMoney, o.inStock, o.stockLeft, `Offers|${o.category}|${o.offerType}`, o.offerType, o.cta, o.section, o.flash, o.shopRate, o.pointsBackPct, o.rating, o.booked, o.rewardPoints, o.transferFrom, o.transferTo, o.memberLevel, o.channel, o.validUntil, o.tags.join('|'), o.redemptions, o.dateAdded].map(esc).join(','),
);
writeFileSync(outCsv, [cols.join(','), ...rows].join('\n'));

const byType = items.reduce((m, o) => ((m[o.offerType] = (m[o.offerType] ?? 0) + 1), m), {});
console.log(`Wrote ${items.length} items → ${outJson}`);
console.log(byType);
console.log(`Today for the demo is ${TODAY}.`);
