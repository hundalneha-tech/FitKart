import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useOrders } from '@/hooks/useApi';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Search, AlertCircle } from 'lucide-react';

interface OrderFilters {
  search: string;
  status: string;
}

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: 'all',
  });

  const { data: ordersData, isLoading, error } = useOrders({ page, limit: 20 });

  // Mock data for demo (replace with actual API data)
  const mockOrders = [
    { id: 'ORD-001', user: 'john@example.com', items: 3, total: 2500, status: 'completed', date: '2026-02-17' },
    { id: 'ORD-002', user: 'jane@example.com', items: 1, total: 500, status: 'pending', date: '2026-02-17' },
    { id: 'ORD-003', user: 'admin@fitkart.club', items: 5, total: 5000, status: 'completed', date: '2026-02-16' },
    { id: 'ORD-004', user: 'user@example.com', items: 2, total: 1200, status: 'cancelled', date: '2026-02-16' },
    { id: 'ORD-005', user: 'test@example.com', items: 4, total: 3500, status: 'completed', date: '2026-02-15' },
    { id: 'ORD-006', user: 'alice@example.com', items: 2, total: 1800, status: 'pending', date: '2026-02-15' },
    { id: 'ORD-007', user: 'bob@example.com', items: 3, total: 2200, status: 'completed', date: '2026-02-14' },
    { id: 'ORD-008', user: 'charlie@example.com', items: 1, total: 600, status: 'completed', date: '2026-02-14' },
    { id: 'ORD-009', user: 'david@example.com', items: 6, total: 6500, status: 'pending', date: '2026-02-13' },
    { id: 'ORD-010', user: 'emma@example.com', items: 2, total: 1400, status: 'completed', date: '2026-02-13' },
  ];

  // Filter orders
  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order => {
      const matchesSearch =
        order.user.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.id.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'all' || order.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [filters]);

  // Paginate orders
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(start, end);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900 text-green-200';
      case 'pending':
        return 'bg-yellow-900 text-yellow-200';
      case 'cancelled':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Orders Management</h1>
          <p className="text-gray-400">Track and manage customer orders</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by order ID or email..."
              value={filters.search}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, search: e.target.value }));
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, status: e.target.value }));
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Total Orders</p>
            <p className="text-2xl font-bold text-white">{filteredOrders.length}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">
              {filteredOrders.filter(o => o.status === 'pending').length}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-400">
              {filteredOrders.filter(o => o.status === 'completed').length}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Cancelled</p>
            <p className="text-2xl font-bold text-red-400">
              {filteredOrders.filter(o => o.status === 'cancelled').length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading orders...</div>
          ) : error ? (
            <div className="p-8 flex items-center justify-center gap-3 bg-red-900/20 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <span>Failed to load orders. Please try again.</span>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No orders found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Order ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Items</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order, idx) => (
                    <tr
                      key={order.id}
                      className={`border-b border-gray-700 transition ${
                        idx % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800'
                      } hover:bg-gray-700`}
                    >
                      <td className="px-6 py-4 text-sm text-blue-400 font-medium">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{order.user}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{order.items}</td>
                      <td className="px-6 py-4 text-sm text-white font-medium">
                        ₹{order.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{order.date}</td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-400 hover:text-blue-300 transition">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-400">
            Page {page} of {totalPages || 1} • Showing {paginatedOrders.length} of {filteredOrders.length} orders
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
