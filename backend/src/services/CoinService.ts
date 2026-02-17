// backend/src/services/CoinService.ts

import { WalletRepository } from '../repositories/WalletRepository';
import { CoinTransactionRepository } from '../repositories/CoinTransactionRepository';
import { EncryptionService } from '../utils/encryption';
import { InsufficientCoinsError, NotFoundError } from '../utils/errors';

export interface CoinBalance {
  available_coins: number;
  frozen_coins: number;
  total_earned: number;
  total_spent: number;
}

/**
 * Coin Service
 * Manages user coin balance and coin transactions
 */
export class CoinService {
  private walletRepository: WalletRepository;
  private transactionRepository: CoinTransactionRepository;

  constructor() {
    this.walletRepository = new WalletRepository();
    this.transactionRepository = new CoinTransactionRepository();
  }

  /**
   * Get user's coin balance
   */
  async getBalance(userId: string): Promise<CoinBalance> {
    const wallet = await this.walletRepository.getByUserId(userId);

    if (!wallet) {
      throw new NotFoundError('Wallet');
    }

    return {
      available_coins: wallet.available_coins,
      frozen_coins: wallet.frozen_coins,
      total_earned: wallet.total_earned,
      total_spent: wallet.total_spent,
    };
  }

  /**
   * Get coin transaction history
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ transactions: any[]; total: number }> {
    const { data, total } = await this.transactionRepository.getTransactionHistory(
      userId,
      limit,
      offset
    );

    return {
      transactions: data.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        reference: {
          type: t.reference_type,
          id: t.reference_id,
          description: t.reference_description,
        },
        created_at: t.created_at,
      })),
      total,
    };
  }

  /**
   * Check if user has enough coins
   */
  async hasEnoughCoins(userId: string, amount: number): Promise<boolean> {
    return await this.walletRepository.hasEnoughCoins(userId, amount);
  }

  /**
   * Add coins to user's wallet (earned, bonus, etc.)
   */
  async addCoins(
    userId: string,
    amount: number,
    type: 'earned' | 'bonus' = 'earned',
    reference?: {
      type: string;
      id: string;
      description: string;
    }
  ): Promise<CoinBalance> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Update wallet
    await this.walletRepository.addCoins(userId, amount);

    // Record transaction
    await this.transactionRepository.recordTransaction({
      id: EncryptionService.generateUUID(),
      user_id: userId,
      type,
      amount,
      reference_type: reference?.type,
      reference_id: reference?.id,
      reference_description: reference?.description,
    });

    return this.getBalance(userId);
  }

  /**
   * Spend coins (with balance check)
   */
  async spendCoins(
    userId: string,
    amount: number,
    reference?: {
      type: string;
      id: string;
      description: string;
    }
  ): Promise<CoinBalance> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Check balance
    const hasEnough = await this.hasEnoughCoins(userId, amount);
    if (!hasEnough) {
      const balance = await this.getBalance(userId);
      throw new InsufficientCoinsError(amount, balance.available_coins);
    }

    // Update wallet
    await this.walletRepository.spendCoins(userId, amount);

    // Record transaction
    await this.transactionRepository.recordTransaction({
      id: EncryptionService.generateUUID(),
      user_id: userId,
      type: 'spent',
      amount,
      reference_type: reference?.type,
      reference_id: reference?.id,
      reference_description: reference?.description,
    });

    return this.getBalance(userId);
  }

  /**
   * Freeze coins (for pending orders)
   */
  async freezeCoins(
    userId: string,
    amount: number,
    reference?: {
      type: string;
      id: string;
      description: string;
    }
  ): Promise<CoinBalance> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Check balance
    const hasEnough = await this.hasEnoughCoins(userId, amount);
    if (!hasEnough) {
      const balance = await this.getBalance(userId);
      throw new InsufficientCoinsError(amount, balance.available_coins);
    }

    // Freeze coins
    await this.walletRepository.freezeCoins(userId, amount);

    // Record as pending transaction (not deducted yet)
    await this.transactionRepository.recordTransaction({
      id: EncryptionService.generateUUID(),
      user_id: userId,
      type: 'spent',
      amount,
      reference_type: reference?.type,
      reference_id: reference?.id,
      reference_description: `${reference?.description} (pending)`,
    });

    return this.getBalance(userId);
  }

  /**
   * Unfreeze coins (if order cancelled)
   */
  async unfreezeCoins(
    userId: string,
    amount: number,
    reference?: {
      type: string;
      id: string;
      description: string;
    }
  ): Promise<CoinBalance> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Unfreeze coins
    await this.walletRepository.unfreezeCoins(userId, amount);

    // Record refund
    await this.transactionRepository.recordTransaction({
      id: EncryptionService.generateUUID(),
      user_id: userId,
      type: 'refund',
      amount,
      reference_type: reference?.type,
      reference_id: reference?.id,
      reference_description: reference?.description,
    });

    return this.getBalance(userId);
  }

  /**
   * Award penalty coins (anti-cheat)
   */
  async penalizeCoins(
    userId: string,
    amount: number,
    reason: string
  ): Promise<CoinBalance> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Deduct penalty coins (might go negative)
    const wallet = await this.walletRepository.getByUserId(userId);
    if (!wallet) {
      throw new NotFoundError('Wallet');
    }

    // Calculate deduction
    const deductAmount = Math.min(amount, wallet.available_coins);

    if (deductAmount > 0) {
      await this.walletRepository.repository.update(
        { user_id: userId },
        {
          available_coins: () => `available_coins - ${deductAmount}`,
        } as any
      );
    }

    // Record transaction
    await this.transactionRepository.recordTransaction({
      id: EncryptionService.generateUUID(),
      user_id: userId,
      type: 'penalty',
      amount: deductAmount,
      reference_description: reason,
    });

    return this.getBalance(userId);
  }

  /**
   * Initialize wallet for new user
   */
  async initializeWallet(userId: string): Promise<CoinBalance> {
    const wallet = await this.walletRepository.create({
      id: EncryptionService.generateUUID(),
      user_id: userId,
      available_coins: 0,
      frozen_coins: 0,
      total_earned: 0,
      total_spent: 0,
    });

    return {
      available_coins: wallet.available_coins,
      frozen_coins: wallet.frozen_coins,
      total_earned: wallet.total_earned,
      total_spent: wallet.total_spent,
    };
  }
}
