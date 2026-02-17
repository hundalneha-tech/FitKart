import { useState } from 'react';
import Layout from '@/components/Layout';
import { useSettings, useUpdateSettings } from '@/hooks/useApi';
import { Save, AlertCircle, CheckCircle, Settings, Bell, CreditCard, Shield } from 'lucide-react';

interface SettingsForm {
  appName: string;
  appVersion: string;
  maxUsersPerDay: number;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  paymentGateway: string;
  maxOrderAmount: number;
  minStepsForReward: number;
  coinsPerThousandSteps: number;
  rateLimit: number;
  rateLimitWindow: number;
  enableTwoFactor: boolean;
  sessionTimeout: number;
}

export default function SettingsPage() {
  const { data: settingsData, isLoading: isLoadingSettings, error: settingsError } = useSettings();
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateSettings();

  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<SettingsForm>({
    appName: 'FitKart',
    appVersion: '1.0.0',
    maxUsersPerDay: 1000,
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: true,
    paymentGateway: 'stripe',
    maxOrderAmount: 100000,
    minStepsForReward: 1000,
    coinsPerThousandSteps: 50,
    rateLimit: 100,
    rateLimitWindow: 60,
    enableTwoFactor: true,
    sessionTimeout: 3600,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : isNaN(Number(value)) ? value : Number(value),
    }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
    });
  };

  if (isLoadingSettings) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Configure system and platform settings</p>
        </div>

        {/* Status Messages */}
        {saved && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-700/50 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300">Settings saved successfully!</span>
          </div>
        )}

        {settingsError && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">Failed to load settings. Using defaults.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* App Configuration Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">App Configuration</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">App Name</label>
                  <input
                    type="text"
                    name="appName"
                    value={form.appName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
                  <input
                    type="text"
                    name="appVersion"
                    value={form.appVersion}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Users Per Day</label>
                  <input
                    type="number"
                    name="maxUsersPerDay"
                    value={form.maxUsersPerDay}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout (seconds)</label>
                  <input
                    type="number"
                    name="sessionTimeout"
                    value={form.sessionTimeout}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  name="maintenanceMode"
                  checked={form.maintenanceMode}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 cursor-pointer"
                />
                <label htmlFor="maintenanceMode" className="text-sm text-gray-300 cursor-pointer">
                  Enable Maintenance Mode (application will be unavailable)
                </label>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-white">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={form.emailNotifications}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 cursor-pointer"
                />
                <label htmlFor="emailNotifications" className="text-sm text-gray-300 cursor-pointer">
                  Enable Email Notifications
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  name="smsNotifications"
                  checked={form.smsNotifications}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 cursor-pointer"
                />
                <label htmlFor="smsNotifications" className="text-sm text-gray-300 cursor-pointer">
                  Enable SMS Notifications
                </label>
              </div>
            </div>
          </div>

          {/* Payment Settings Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Payment Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Gateway</label>
                  <select
                    name="paymentGateway"
                    value={form.paymentGateway}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="stripe">Stripe</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Order Amount (₹)</label>
                  <input
                    type="number"
                    name="maxOrderAmount"
                    value={form.maxOrderAmount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rewards Settings Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">🎁</span>
              <h2 className="text-xl font-bold text-white">Rewards Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Min Steps for Reward</label>
                  <input
                    type="number"
                    name="minStepsForReward"
                    value={form.minStepsForReward}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Steps required to earn coins</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Coins per 1000 Steps</label>
                  <input
                    type="number"
                    name="coinsPerThousandSteps"
                    value={form.coinsPerThousandSteps}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Coins awarded per 1000 steps</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings Section */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Security Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rate Limit (requests)</label>
                  <input
                    type="number"
                    name="rateLimit"
                    value={form.rateLimit}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rate Limit Window (seconds)</label>
                  <input
                    type="number"
                    name="rateLimitWindow"
                    value={form.rateLimitWindow}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="enableTwoFactor"
                  name="enableTwoFactor"
                  checked={form.enableTwoFactor}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 cursor-pointer"
                />
                <label htmlFor="enableTwoFactor" className="text-sm text-gray-300 cursor-pointer">
                  Enable Two-Factor Authentication
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 sticky bottom-0 bg-gray-900 p-4 -mx-4 -mb-6 rounded-b-lg border-t border-gray-700">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              <Save className="w-5 h-5" />
              {isUpdating ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              type="button"
              onClick={() => setForm({
                appName: 'FitKart',
                appVersion: '1.0.0',
                maxUsersPerDay: 1000,
                maintenanceMode: false,
                emailNotifications: true,
                smsNotifications: true,
                paymentGateway: 'stripe',
                maxOrderAmount: 100000,
                minStepsForReward: 1000,
                coinsPerThousandSteps: 50,
                rateLimit: 100,
                rateLimitWindow: 60,
                enableTwoFactor: true,
                sessionTimeout: 3600,
              })}
              className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition font-medium"
            >
              Reset to Defaults
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
