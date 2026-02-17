// backend/src/utils/validators.ts

export class Validators {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isStrongPassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain lowercase letters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letters');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain numbers');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain special characters (!@#$%^&*)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static isValidOTP(otp: string): boolean {
    return /^\d{6}$/.test(otp.trim());
  }

  static isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  static isValidCountryCode(code: string): boolean {
    const countryCodeRegex = /^\+\d{1,3}$/;
    return countryCodeRegex.test(code);
  }

  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  static validatePagination(limit?: number, offset?: number) {
    const validLimit = Math.min(Math.max(limit || 20, 1), 100);
    const validOffset = Math.max(offset || 0, 0);
    return { limit: validLimit, offset: validOffset };
  }

  static validateDateRange(
    startDate?: string,
    endDate?: string
  ): { start: Date; end: Date } | null {
    if (!startDate || !endDate) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }

    if (start > end) {
      return null;
    }

    return { start, end };
  }

  static validateStepData(steps: number, distance?: number): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (steps < 0 || !Number.isInteger(steps)) {
      errors.push('Steps must be a positive integer');
    }

    if (distance !== undefined) {
      if (distance < 0) {
        errors.push('Distance must be non-negative');
      }

      // Distance/step ratio validation
      // Average step is ~0.7-0.8 meters
      const minDistance = steps * 0.6;
      const maxDistance = steps * 1.0;

      if (distance < minDistance || distance > maxDistance) {
        errors.push(
          `Distance (${distance}m) does not match step count (${steps})`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
