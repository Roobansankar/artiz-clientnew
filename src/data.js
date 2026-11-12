const img = (name) => `/images/${name}`

const SWATCH = {
  Brown: '#7b5a3c', Black: '#1f1b16', Gray: '#9a9a9a', Yellow: '#e8b93a',
  'Off White': '#efe9dc', White: '#ffffff', Gold: '#c9a24a', Red: '#b33a32',
}

export const products = [
  { id: 1, title: 'Wooden rocking chair', price: 225, compare: 300, img: img('product5.png'), hover: img('product11.png'), colors: ['Brown', 'Black', 'Gray'], cat: 'Seating' },
  { id: 2, title: 'Vrawer bedside table', price: 140, img: img('product11.png'), hover: img('product4.png'), colors: ['Brown', 'Gray', 'Black'], cat: 'Storage' },
  { id: 3, title: 'Round Sculptural Table', price: 170, compare: 230, img: img('product4.png'), hover: img('product6.png'), colors: ['Black', 'Yellow', 'Gray'], cat: 'Tables' },
  { id: 4, title: 'Luxury Modular Sofa', price: 460, img: img('product6.png'), hover: img('product2.png'), colors: ['Yellow', 'Off White', 'Gray'], cat: 'Sofas' },
  { id: 5, title: 'Ceramic table lamp', price: 40, compare: 70, img: img('product2.png'), hover: img('product13.png'), colors: ['Off White', 'Gray', 'Gold'], cat: 'Lighting' },
  { id: 6, title: 'Arquette Shoe Cabinet', price: 280, img: img('product13.png'), hover: img('product18.png'), colors: ['White', 'Gray', 'Black'], cat: 'Storage' },
  { id: 7, title: 'Leather Recliner Chair', price: 220, img: img('product18.png'), hover: img('product7.png'), colors: ['Red', 'White', 'Black'], cat: 'Seating' },
  { id: 8, title: 'Living Room Sofa', price: 280, compare: 320, img: img('product7.png'), hover: img('product12.png'), colors: ['Gray', 'Black', 'White'], cat: 'Sofas' },
  { id: 9, title: 'Fabric Lounge Chair', price: 40, compare: 55, img: img('product12.png'), hover: img('product15.png'), colors: ['Gray', 'White', 'Black'], cat: 'Outdoor' },
  { id: 10, title: 'Nickel Floor Lamp', price: 65, img: img('product15.png'), hover: img('product17.png'), colors: ['White', 'Black', 'Yellow'], cat: 'Lighting' },
  { id: 11, title: 'Comfort Sofa Set', price: 220, compare: 350, img: img('product17.png'), hover: img('product13.png'), colors: ['Yellow', 'White', 'Black'], cat: 'Outdoor' },
  { id: 12, title: 'Green Pillow Covers', price: 60, img: img('product1.png'), hover: img('product2.png'), colors: ['White', 'Black', 'Yellow'], cat: 'Seating' },
].map((p) => ({ ...p, swatches: p.colors.map((c) => ({ name: c, hex: SWATCH[c] })) }))

export const money = (n) => `$${n.toFixed(2)}`

export const heroSlides = [
  { img: img('slider1.png'), pre: 'Transform Your', accent: 'Living', post: 'Space', desc: 'Discover stylish sofas, chairs, and tables designed to bring comfort,' },
  { img: img('slider2.png'), pre: 'Comfort Meets Modern', accent: 'Design', post: '', desc: 'Explore our carefully selected furniture collection, featuring comfortable sofas' },
  { img: img('slider3.png'), pre: 'Create a', accent: 'Home', post: 'You’ll Love', desc: 'Upgrade your space with beautifully crafted sofas, chairs,' },
]

export const curated = [
  { title: 'Keep Spaces Neat & Calm', img: img('collection1.png') },
  { title: 'Smart Dining', img: img('collection2.png') },
  { title: 'Add Color & Order', img: img('collection3.png') },
  { title: 'Warm Wood Storage', img: img('collection4.png') },
  { title: 'Furniture', img: img('collection5.png') },
  { title: 'Armchairs', img: img('collection1.png') },
]

export const categories = [
  { title: 'Furniture', img: img('product18.png') },
  { title: 'Armchairs', img: img('product16.png') },
  { title: 'Beds', img: img('product7.png') },
  { title: 'Chairs', img: img('product5.png') },
  { title: 'Lighting', img: img('product2.png') },
  { title: 'Sofas', img: img('product9.png') },
  { title: 'Tables', img: img('product13.png') },
  { title: 'Smart Dining', img: img('product11.png') },
  { title: 'Chairs', img: img('product3.png') },
  { title: 'Lighting', img: img('product15.png') },
]

export const featuredSlides = [
  { img: img('banner11.png'), sub: 'FEATURED COLLECTIONS', title: 'Handcrafted Statement Pieces', desc: 'Artisan details for rooms with real character.', tag: 'Curve' },
  { img: img('banner12.png'), sub: 'Designed for Today', title: 'Modern Living Collection', desc: 'Discover the latest furniture trends with stylish sofas,', tag: 'Atelier' },
  { img: img('banner13.png'), sub: 'New Collection 2026', title: 'Latest in Modern Furniture', desc: 'Explore fresh designs, refined details,', tag: 'Compact' },
  { img: img('banner14.png'), sub: 'Modern. Comfortable. Timeless', title: 'Style Your Space Beautifully', desc: 'From luxurious sofas to statement chairs', tag: 'Warm' },
]

export const lookbook = [
  { img: img('banner15.png'), sub: 'Modern Furniture', title: 'Elevate Modern Furniture for Everyday Living', desc: 'Discover beautiful furniture designed to bring comfort, elegance, and timeless style into your home.', spots: [{ x: 36, y: 68, p: 1 }, { x: 55, y: 80, p: 5 }] },
  { img: img('banner16.png'), sub: 'Crafted for Modern', title: 'Discover Timeless Comfort For Home Spaces', desc: 'Explore stylish and comfortable furniture made to make your everyday living more beautiful.', spots: [{ x: 30, y: 65, p: 4 }, { x: 70, y: 75, p: 3 }] },
  { img: img('banner17.png'), sub: 'Modern Furniture', title: 'Elevate Modern Furniture for Everyday Living', desc: 'Discover beautiful furniture designed to bring comfort, elegance, and timeless style into your home.', spots: [{ x: 45, y: 62, p: 8 }, { x: 72, y: 78, p: 10 }] },
]

export const roomStories = [
  { img: img('banner8.png'), spots: [{ x: 40, y: 60, p: 4 }, { x: 70, y: 40, p: 5 }] },
  { img: img('banner9.png'), spots: [{ x: 50, y: 62, p: 1 }, { x: 25, y: 45, p: 10 }] },
  { img: img('banner10.png'), spots: [{ x: 45, y: 65, p: 3 }, { x: 72, y: 50, p: 7 }] },
]

export const marqueeWords = ['Sofa', 'Armchair', 'Dining Table', 'Coffee Table', 'Side Table', 'Dining Chair', 'Wardrobe', 'Bookshelf', 'TV Stand', 'Cabinet', 'Console Table', 'Desk', 'Bench', 'Chest of Drawers']

export const faqs = [
  { q: 'How do I place an order?', a: 'Simply select your desired product, add it to your cart, proceed to checkout, enter your details, and confirm your order.' },
  { q: 'What are your delivery times and charges?', a: 'Delivery times and charges depend on your location and the product you order. Delivery is usually completed within 2–5 business days. Delivery charges may vary based on your location and order size.' },
  { q: "What's your return policy?", a: 'We accept returns for eligible products within the specified return period, provided items are unused, undamaged, and returned with original packaging.' },
  { q: 'Do you offer assembly or installation?', a: 'Yes, we offer professional assembly and installation services for selected furniture products, ensuring safe, proper, and hassle-free setup at home.' },
  { q: 'How do I care for different fabrics and finishes?', a: 'Yes, we offer professional assembly and installation services for selected furniture products, ensuring safe, proper, and hassle-free setup at home.' },
  { q: 'Can I get fabric samples before buying?', a: 'Yes, fabric samples are available for selected products. Contact us to request samples and choose the perfect color, texture, and finish.' },
]

export const posts = [
  { img: img('blog6.png'), title: 'How Modern Furniture Designs Can Transform Your Living Space Into a Stylish Home' },
  { img: img('blog5.png'), title: 'Luxury Furniture Ideas to Create an Our Elegant Living Space' },
  { img: img('blog4.png'), title: 'How Quality Furniture Can Elevate Your Home’s Overall Appearance' },
  { img: img('blog3.png'), title: 'Smart Furniture Ideas for Creating Comfortable and Functional Spaces' },
].map((p) => ({ ...p, date: 'August 22, 2026' }))

export const promos = [
  { icon: img('text-icon1.png'), title: 'Customer Service', text: 'WhatsApp us anytime for help.' },
  { icon: img('text-icon2.png'), title: 'Free Shipping', text: 'Fast, tracked delivery nationwide.' },
  { icon: img('text-icon3.png'), title: 'Free Returns', text: 'Easy returns within 30 days.' },
  { icon: img('text-icon4.png'), title: 'Secure Payment', text: 'Visa, Mastercard, Amex, PayPal.' },
]

export const tabs = ['All', 'Seating', 'Sofas', 'Tables', 'Storage', 'Lighting', 'Outdoor']

// PLACEHOLDER reviews for layout only — replace with real customer reviews (with their permission) before going live.
export const reviews = [
  { name: 'Priya Ramesh', place: 'Chennai, Tamil Nadu', project: 'Living room makeover', rating: 5, img: img('banner8.png'), text: 'Replace this with a real customer quote about their living room project, the team, and how the space feels now.' },
  { name: 'Karthik Subramanian', place: 'Coimbatore, Tamil Nadu', project: 'Bedroom interior', rating: 5, img: img('banner9.png'), text: 'Replace this with a real customer quote about the design process, the quality of the furniture, and the final result.' },
  { name: 'Lakshmi Narayanan', place: 'Madurai, Tamil Nadu', project: 'Dining & kitchen', rating: 5, img: img('banner10.png'), text: 'Replace this with a real customer quote about delivery, installation, and how the studio handled their requirements.' },
  { name: 'Arun Kumar', place: 'Tiruchirappalli, Tamil Nadu', project: 'Full home interior', rating: 4, img: img('banner19.png'), text: 'Replace this with a real customer quote describing their full-home project from first consultation to handover.' },
]
