'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { useAnalytics, useSystemHealth } from '@/hooks/useApi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, TrendingUp, Users } from 'lucide-react';

const StatCard = ({ title, value, icon, trend }: any) => (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
          </p>
        )}
      </div>
      <div className="text-4xl">{icon}</div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: health, isLoading: healthLoading } = useSystemHealth();

  const isHealthy = health?.data?.status === 'healthy';

  const mockChartData = [
    { name: 'Jan', users: 400, revenue: 2400 },
    { name: 'Feb', users: 600, revenue: 2210 },
    { name: 'Mar', users: 800, revenue: 2290 },
    { name: 'Apr', users: 1200, revenue: 2000 },
    { name: 'May', users: 1500, revenue: 2181 },
    { name: 'Jun', users: 2000, revenue: 2500 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* System Status */}
        <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border ${
          isHealthy
            ? 'bg-green-900/20 border-green-700 text-green-400'
            : 'bg-red-900/20 border-red-700 text-red-400'
        }`}>
          {isHealthy ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <p className="font-medium">
            {isHealthy ? 'All systems operational' : 'System issues detected'}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={analytics?.data?.totalUsers || '0'}
            icon="👥"
            trend={12}
          />
          <StatCard
            title="Active Users Today"
            value={analytics?.data?.activeToday || '0'}
            icon="🟢"
            trend={8}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${analytics?.data?.totalRevenue || '0'}`}
            icon="💰"
            trend={15}
          />
          <StatCard
            title="Pending Orders"
            value={analytics?.data?.pendingOrders || '0'}
            icon="📦"
            trend={-5}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users Chart */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Users Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Chart */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#10B981"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-gray-300 text-sm">
                → View All Users
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-gray-300 text-sm">
                → Review Orders
              </button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded text-gray-300 text-sm">
                → Manage Products
              </button>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">System Info</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Version: 1.0.0</p>
              <p>Backend: Running</p>
              <p>Database: Connected</p>
              <p>Cache: Operational</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>✓ 42 new users today</p>
              <p>✓ 156 orders processed</p>
              <p>✓ 0 system errors</p>
              <p>✓ 99.9% uptime</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
