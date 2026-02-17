// backend/src/controllers/StoreController.ts

import { Response } from 'express';
import { StoreService } from '../services/StoreService';
import { successResponse, validationErrorResponse } from '../utils/response';
import { AuthRequest } from './AuthController';

/**
 * Store Controller
 * Handles all reward store and product endpoints
 */
export class StoreController {
  private storeService: StoreService;

  constructor() {
    this.storeService = new StoreService();
  }

  /**
   * GET /store/products
   * Get all products with filtering and sorting (no auth required)
   */
  async getProducts(req: AuthRequest, res: Response): Promise<void> {
    const {
      category,
      limit = '50',
      offset = '0',
      sort_by = 'newest',
    } = req.query;

    const limitNum = parseInt(limit as string) || 50;
    const offsetNum = parseInt(offset as string) || 0;

    const result = await this.storeService.getProducts(
      category as string,
      limitNum,
      offsetNum,
      sort_by as 'price' | 'rating' | 'newest'
    );

    res.json(successResponse(result, 'Products retrieved', 'store/products'));
  }

  /**
   * GET /store/products/:id
   * Get product details (no auth required)
   */
  async getProductDetail(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'Product ID is required' }));
      return;
    }

    const product = await this.storeService.getProductDetail(id);
    res.json(successResponse(product, 'Product details retrieved', 'store/product'));
  }

  /**
   * GET /store/search
   * Search products (no auth required)
   */
  async searchProducts(req: AuthRequest, res: Response): Promise<void> {
    const { q, limit = '20', offset = '0' } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json(validationErrorResponse({ q: 'Search query is required' }));
      return;
    }

    const limitNum = parseInt(limit as string) || 20;
    const offsetNum = parseInt(offset as string) || 0;

    const result = await this.storeService.searchProducts(q, limitNum, offsetNum);
    res.json(successResponse(result, 'Search results retrieved', 'store/search'));
  }

  /**
   * GET /store/featured
   * Get featured products (no auth required)
   */
  async getFeaturedProducts(req: AuthRequest, res: Response): Promise<void> {
    const { limit = '5' } = req.query;

    const limitNum = parseInt(limit as string) || 5;
    const products = await this.storeService.getFeaturedProducts(limitNum);

    res.json(
      successResponse(products, 'Featured products retrieved', 'store/featured')
    );
  }

  /**
   * GET /store/stats
   * Get store statistics (no auth required)
   */
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    const stats = await this.storeService.getStoreStats();
    res.json(successResponse(stats, 'Store stats retrieved', 'store/stats'));
  }

  /**
   * POST /store/products
   * Create product (admin only)
   */
  async createProduct(req: AuthRequest, res: Response): Promise<void> {
    const {
      title,
      description,
      price_coins,
      category,
      stock,
      image,
    } = req.body;

    // Validate inputs
    const errors: Record<string, string> = {};

    if (!title) errors.title = 'Title is required';
    if (!description) errors.description = 'Description is required';
    if (!price_coins) errors.price_coins = 'Price is required';
    if (!category) errors.category = 'Category is required';
    if (stock === undefined) errors.stock = 'Stock is required';

    if (Object.keys(errors).length > 0) {
      res.status(400).json(validationErrorResponse(errors));
      return;
    }

    const product = await this.storeService.createProduct(
      title,
      description,
      price_coins,
      category,
      stock,
      image
    );

    res.status(201).json(
      successResponse(product, 'Product created successfully', 'store/product/create')
    );
  }

  /**
   * PUT /store/products/:id
   * Update product (admin only)
   */
  async updateProduct(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      res.status(400).json(validationErrorResponse({ id: 'Product ID is required' }));
      return;
    }

    const product = await this.storeService.updateProduct(id, updates);
    res.json(
      successResponse(product, 'Product updated successfully', 'store/product/update')
    );
  }

  /**
   * POST /store/sync-shopify
   * Sync with Shopify (admin only)
   */
  async syncShopify(req: AuthRequest, res: Response): Promise<void> {
    const result = await this.storeService.syncWithShopify();

    res.json(
      successResponse(result, 'Shopify sync completed', 'store/sync-shopify')
    );
  }
}
