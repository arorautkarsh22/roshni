/**
 * Category-based product image mapping for Roshni Creations
 * Provides relevant fallback images when product images are missing or invalid
 */

const categoryImages = {
  // Sarees
  'saree': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=650&fit=crop',
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&h=650&fit=crop',
    'https://images.unsplash.com/photo-1614886137796-6be5f1801a34?w=500&h=650&fit=crop',
  ],
  'sarees': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=650&fit=crop',
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&h=650&fit=crop',
    'https://images.unsplash.com/photo-1614886137796-6be5f1801a34?w=500&h=650&fit=crop',
  ],
  // Lehengas
  'lehenga': [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=650&fit=crop',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&h=650&fit=crop',
  ],
  'lehengas': [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=650&fit=crop',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&h=650&fit=crop',
  ],
  // Suits / Kurtas
  'suit': [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=650&fit=crop',
    'https://images.unsplash.com/photo-1583391733981-8b530aaf01b0?w=500&h=650&fit=crop',
  ],
  'suits': [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=650&fit=crop',
    'https://images.unsplash.com/photo-1583391733981-8b530aaf01b0?w=500&h=650&fit=crop',
  ],
  'kurta': [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=650&fit=crop',
    'https://images.unsplash.com/photo-1583391733981-8b530aaf01b0?w=500&h=650&fit=crop',
  ],
  'kurtas': [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=650&fit=crop',
    'https://images.unsplash.com/photo-1583391733981-8b530aaf01b0?w=500&h=650&fit=crop',
  ],
  // Jewelry / Accessories
  'jewelry': [
    'https://images.unsplash.com/photo-1515562141589-67f0d569b6c9?w=500&h=650&fit=crop',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=650&fit=crop',
  ],
  'accessories': [
    'https://images.unsplash.com/photo-1515562141589-67f0d569b6c9?w=500&h=650&fit=crop',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=650&fit=crop',
  ],
  // Dupattas / Stoles
  'dupatta': [
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&h=650&fit=crop',
  ],
  'dupattas': [
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&h=650&fit=crop',
  ],
};

// Default fashion images when category doesn't match
const defaultImages = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&h=650&fit=crop',
  'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&h=650&fit=crop',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=650&fit=crop',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=650&fit=crop',
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=650&fit=crop',
  'https://images.unsplash.com/photo-1515562141589-67f0d569b6c9?w=500&h=650&fit=crop',
];

/**
 * Known bad image patterns (random unsplash, stock photos not related to fashion)
 */
const badImagePatterns = [
  'source.unsplash.com/random',
  'picsum.photos',
  'placeimg.com',
  'placeholder.com',
  'loremflickr.com',
];

/**
 * Check if an image URL is likely a bad/random placeholder
 */
function isBadImage(url) {
  if (!url) return true;
  return badImagePatterns.some(pattern => url.toLowerCase().includes(pattern));
}

/**
 * Get appropriate product image based on category and product details
 * @param {Object} product - Product object with images, categoryName, name, id
 * @returns {string} - Image URL
 */
export function getProductImage(product) {
  // Check if product has valid images
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    if (!isBadImage(firstImage)) {
      return firstImage;
    }
  }

  // Check imageUrl field
  if (product.imageUrl && !isBadImage(product.imageUrl)) {
    return product.imageUrl;
  }

  // Use category-based image
  const category = (product.categoryName || '').toLowerCase().trim();
  const productName = (product.name || '').toLowerCase();

  // Try matching by category name
  for (const [key, images] of Object.entries(categoryImages)) {
    if (category.includes(key) || productName.includes(key)) {
      const index = (product.id || 0) % images.length;
      return images[index];
    }
  }

  // Fallback to default fashion image
  const index = (product.id || Math.floor(Math.random() * defaultImages.length)) % defaultImages.length;
  return defaultImages[index];
}

/**
 * Get all valid images for a product (for detail page thumbnails)
 * @param {Object} product - Product object
 * @returns {string[]} - Array of image URLs
 */
export function getProductImages(product) {
  // Filter out bad images
  if (product.images && product.images.length > 0) {
    const validImages = product.images.filter(img => !isBadImage(img));
    if (validImages.length > 0) return validImages;
  }

  // Return single fallback image
  return [getProductImage(product)];
}
