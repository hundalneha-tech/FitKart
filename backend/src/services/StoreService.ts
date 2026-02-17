// backend/src/services/StoreService.ts

import { EncryptionService } from '../utils/encryption';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface Product {
  id: string;
  title: string;
  description: string;
  image?: string;
  price_coins: number;
  category: string;
  stock: number;
  rating?: number;
  reviews_count?: number;
  shopify_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProductDetail extends Product {
  detailed_description?: string;
  specifications?: Record<string, string>;
  similar_products?: Product[];
}

export interface StoreStats {
  total_products: number;
  total_categories: number;
  low_stock_count: number;
  average_price: number;
  most_popular_category: string;
}

/**
 * Store Service
 * Manages reward product catalog and fulfillment
 *
 * NOTE: In production, products would sync with Shopify.
 * For MVP, we use mock data.
 */
export class StoreService {
  private products: Map<string, Product>;
  private categories: Set<string>;

  constructor() {
    this.products = this.initializeProducts();
    this.categories = this.extractCategories();
  }

  /**
   * Get all products
   */
  async getProducts(
    categoryFilter?: string,
    limit: number = 50,
    offset: number = 0,
    sortBy: 'price' | 'rating' | 'newest' = 'newest'
  ): Promise<{
    products: Product[];
    total: number;
    categories: string[];
  }> {
    let products = Array.from(this.products.values());

    // Filter by category
    if (categoryFilter) {
      products = products.filter((p) =>
        p.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'price':
        products.sort((a, b) => a.price_coins - b.price_coins);
        break;
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        products.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        break;
    }

    // Paginate
    const paginated = products.slice(offset, offset + limit);

    return {
      products: paginated,
      total: products.length,
      categories: Array.from(this.categories),
    };
  }

  /**
   * Get product details
   */
  async getProductDetail(productId: string): Promise<ProductDetail> {
    const product = this.products.get(productId);

    if (!product) {
      throw new NotFoundError('Product');
    }

    // Get similar products (same category)
    const similar = Array.from(this.products.values())
      .filter((p) => p.category === product.category && p.id !== productId)
      .slice(0, 3);

    return {
      ...product,
      detailed_description: `Detailed information about ${product.title}. This product is designed to help you reach your fitness goals and earn rewards.`,
      specifications: {
        Material: 'High Quality',
        Warranty: '1 Year',
        Shipping: 'Standard Free',
      },
      similar_products: similar,
    };
  }

  /**
   * Search products
   */
  async searchProducts(
    query: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    products: Product[];
    total: number;
    query: string;
  }> {
    if (query.length < 2) {
      throw new ValidationError('Search query must be at least 2 characters');
    }

    const lowerQuery = query.toLowerCase();

    const matching = Array.from(this.products.values()).filter(
      (p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    );

    // Sort by relevance (title matches are higher priority)
    matching.sort((a, b) => {
      const aInTitle = a.title.toLowerCase().includes(lowerQuery) ? 1 : 0;
      const bInTitle = b.title.toLowerCase().includes(lowerQuery) ? 1 : 0;
      return bInTitle - aInTitle;
    });

    const paginated = matching.slice(offset, offset + limit);

    return {
      products: paginated,
      total: matching.length,
      query,
    };
  }

  /**
   * Get store statistics
   */
  async getStoreStats(): Promise<StoreStats> {
    const products = Array.from(this.products.values());

    const lowStockCount = products.filter((p) => p.stock < 5).length;
    const totalPrice = products.reduce((sum, p) => sum + p.price_coins, 0);
    const averagePrice =
      totalPrice > 0 ? Math.round(totalPrice / products.length) : 0;

    // Find most popular category
    const categoryCounts = new Map<string, number>();
    products.forEach((p) => {
      categoryCounts.set(p.category, (categoryCounts.get(p.category) || 0) + 1);
    });

    let mostPopular = 'Fitness';
    let maxCount = 0;
    for (const [category, count] of categoryCounts) {
      if (count > maxCount) {
        maxCount = count;
        mostPopular = category;
      }
    }

    return {
      total_products: products.length,
      total_categories: this.categories.size,
      low_stock_count: lowStockCount,
      average_price: averagePrice,
      most_popular_category: mostPopular,
    };
  }

  /**
   * Sync products with Shopify (admin)
   */
  async syncWithShopify(): Promise<{
    synced_count: number;
    updated_count: number;
    new_count: number;
    errors?: string[];
  }> {
    // In production, this would:
    // 1. Fetch products from Shopify API
    // 2. Update/create products in database
    // 3. Sync pricing and inventory

    // Mock sync result
    return {
      synced_count: 150,
      updated_count: 25,
      new_count: 10,
      errors: [],
    };
  }

  /**
   * Update product (admin)
   */
  async updateProduct(
    productId: string,
    updates: Partial<Product>
  ): Promise<Product> {
    const product = this.products.get(productId);

    if (!product) {
      throw new NotFoundError('Product');
    }

    // Validate updates
    if (updates.price_coins !== undefined && updates.price_coins < 0) {
      throw new ValidationError('Price cannot be negative');
    }

    if (updates.stock !== undefined && updates.stock < 0) {
      throw new ValidationError('Stock cannot be negative');
    }

    // Update product
    const updated: Product = {
      ...product,
      ...updates,
      updated_at: new Date(),
    };

    this.products.set(productId, updated);

    return updated;
  }

  /**
   * Create product (admin)
   */
  async createProduct(
    title: string,
    description: string,
    priceCoins: number,
    category: string,
    stock: number,
    image?: string
  ): Promise<Product> {
    if (!title || title.length < 3) {
      throw new ValidationError('Title must be at least 3 characters');
    }

    if (priceCoins < 0) {
      throw new ValidationError('Price cannot be negative');
    }

    if (stock < 0) {
      throw new ValidationError('Stock cannot be negative');
    }

    const product: Product = {
      id: EncryptionService.generateUUID(),
      title,
      description,
      image,
      price_coins: priceCoins,
      category,
      stock,
      rating: 4.5 + Math.random(),
      reviews_count: Math.floor(Math.random() * 100),
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.products.set(product.id, product);
    this.categories.add(category);

    return product;
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 5): Promise<Product[]> {
    const all = Array.from(this.products.values());

    // Featured = highest rating or newest
    all.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return all.slice(0, limit);
  }

  /**
   * Initialize mock products
   */
  private initializeProducts(): Map<string, Product> {
    const products = new Map<string, Product>();

    const mockProducts = [
      {
        title: 'Wireless Earbuds Pro',
        description: 'High-quality wireless earbuds with noise cancellation',
        price_coins: 5000,
        category: 'Electronics',
        stock: 50,
        image: 'https://via.placeholder.com/300?text=Earbuds',
      },
      {
        title: 'Fitness Tracking Watch',
        description: 'Advanced fitness watch with health monitoring',
        price_coins: 8000,
        category: 'Wearables',
        stock: 30,
        image: 'https://via.placeholder.com/300?text=Watch',
      },
      {
        title: 'Running Shoes Pro',
        description: 'Professional grade running shoes for athletes',
        price_coins: 3500,
        category: 'Fitness',
        stock: 100,
        image: 'https://via.placeholder.com/300?text=Shoes',
      },
      {
        title: 'Yoga Mat Premium',
        description: 'Non-slip yoga mat with carrying strap',
        price_coins: 1500,
        category: 'Fitness',
        stock: 80,
        image: 'https://via.placeholder.com/300?text=YogaMat',
      },
      {
        title: 'Water Bottle Smart',
        description: 'Smart water bottle that tracks hydration',
        price_coins: 2000,
        category: 'Accessories',
        stock: 120,
        image: 'https://via.placeholder.com/300?text=WaterBottle',
      },
      {
        title: 'Bluetooth Speaker',
        description: 'Portable bluetooth speaker with 360° sound',
        price_coins: 4000,
        category: 'Electronics',
        stock: 40,
        image: 'https://via.placeholder.com/300?text=Speaker',
      },
      {
        title: 'Fitness Tracker Band',
        description: 'Replacement band for fitness trackers',
        price_coins: 800,
        category: 'Accessories',
        stock: 200,
        image: 'https://via.placeholder.com/300?text=Band',
      },
      {
        title: 'Protein Powder Vanilla',
        description: 'Premium protein powder with natural ingredients',
        price_coins: 1200,
        category: 'Nutrition',
        stock: 60,
        image: 'https://via.placeholder.com/300?text=Protein',
      },
    ];

    mockProducts.forEach((prod, index) => {
      const id = `prod-${String(index + 1).padStart(3, '0')}`;
      products.set(id, {
        id,
        ...prod,
        rating: 4.0 + Math.random(),
        reviews_count: Math.floor(Math.random() * 200),
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updated_at: new Date(),
      });
    });

    return products;
  }

  /**
   * Extract unique categories
   */
  private extractCategories(): Set<string> {
    const categories = new Set<string>();

    for (const product of this.products.values()) {
      categories.add(product.category);
    }

    return categories;
  }
}
