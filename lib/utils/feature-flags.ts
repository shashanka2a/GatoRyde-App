/**
 * Feature flags system for Rydify
 * 
 * This module provides a centralized way to manage feature flags
 * that control various aspects of the application behavior.
 */

export interface FeatureFlags {
  OFF_PLATFORM_PAYMENTS: boolean
  TWILIO_PROXY_ENABLED: boolean
}

export class FeatureFlagManager {
  private static flags: FeatureFlags = {
    OFF_PLATFORM_PAYMENTS: process.env.OFF_PLATFORM_PAYMENTS === 'true' || true, // Default true
    TWILIO_PROXY_ENABLED: process.env.TWILIO_PROXY_ENABLED === 'true' || false, // Default false
  }

  /**
   * Get the current value of a feature flag
   */
  static isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag]
  }

  /**
   * Get all feature flags
   */
  static getAll(): FeatureFlags {
    return { ...this.flags }
  }

  /**
   * Set a feature flag (for testing purposes)
   */
  static setFlag(flag: keyof FeatureFlags, value: boolean): void {
    this.flags[flag] = value
  }

  /**
   * Reset all flags to their default values
   */
  static reset(): void {
    this.flags = {
      OFF_PLATFORM_PAYMENTS: process.env.OFF_PLATFORM_PAYMENTS === 'true' || true,
      TWILIO_PROXY_ENABLED: process.env.TWILIO_PROXY_ENABLED === 'true' || false,
    }
  }

  /**
   * Check if off-platform payments are enabled
   */
  static isOffPlatformPaymentsEnabled(): boolean {
    return this.isEnabled('OFF_PLATFORM_PAYMENTS')
  }

  /**
   * Check if Twilio proxy is enabled for contact methods
   */
  static isTwilioProxyEnabled(): boolean {
    return this.isEnabled('TWILIO_PROXY_ENABLED')
  }
}