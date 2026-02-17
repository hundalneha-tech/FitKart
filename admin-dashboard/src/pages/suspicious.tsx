import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useSuspiciousActivity } from '@/hooks/useApi';
import { AlertTriangle, AlertCircle, ChevronDown, Check, X, Search } from 'lucide-react';

interface SuspiciousEntry {
  id: string;
  user: string;
  activity: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  details: string;
  status: 'flagged' | 'reviewed' | 'cleared';
}

interface Filters {
  search: string;
  severity: string;
  status: string;
}

export default function SuspiciousActivityPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    severity: 'all',
    status: 'flagged',
  });
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: activitiesData, isLoading, error } = useSuspiciousActivity();

  // Mock data
  const mockActivities: SuspiciousEntry[] = [
    {
      id: 'SUS-001',
      user: 'user_123@example.com',
      activity: 'Unusual login from new device',
      severity: 'critical',
      timestamp: '2026-02-17 14:32:00',
      details: 'Multiple login attempts from different IPs in 5 minutes. IP: 192.168.1.100 (India)',
      status: 'flagged',
    },
    {
      id: 'SUS-002',
      user: 'john_doe@example.com',
      activity: 'Abnormal spending pattern',
      severity: 'high',
      timestamp: '2026-02-17 13:15:00',
      details: 'User spent 10x their average daily amount in 30 minutes on store',
      status: 'reviewed',
    },
    {
      id: 'SUS-003',
      user: 'test_bot@example.com',
      activity: 'Potential bot activity',
      severity: 'high',
      timestamp: '2026-02-17 12:45:00',
      details: '500+ API requests in 1 minute from single IP. Likely automated.',
      status: 'flagged',
    },
    {
      id: 'SUS-004',
      user: 'hacker123@example.com',
      activity: 'Brute force attack attempt',
      severity: 'critical',
      timestamp: '2026-02-17 11:20:00',
      details: '100+ failed login attempts in 10 minutes. IP blocked.',
      status: 'flagged',
    },
    {
      id: 'SUS-005',
      user: 'suspect@example.com',
      activity: 'Mass follower spamming',
      severity: 'medium',
      timestamp: '2026-02-17 10:05:00',
      details: 'Added 1000+ followers in 2 hours. Pattern matches spam behavior.',
      status: 'cleared',
    },
    {
      id: 'SUS-006',
      user: 'new_user_456@example.com',
      activity: 'High step count anomaly',
      severity: 'medium',
      timestamp: '2026-02-17 09:30:00',
      details: 'Reported 100,000 steps in 2 hours (5x normal maximum)',
      status: 'reviewed',
    },
    {
      id: 'SUS-007',
      user: 'trader@example.com',
      activity: 'Suspicious coin transfer',
      severity: 'low',
      timestamp: '2026-02-16 18:45:00',
      details: 'Large coin transfer to new account. May be legitimate.',
      status: 'cleared',
    },
    {
      id: 'SUS-008',
      user: 'seller@example.com',
      activity: 'Price manipulation detected',
      severity: 'high',
      timestamp: '2026-02-16 16:20:00',
      details: 'Product prices changed 50+ times in 1 hour',
      status: 'flagged',
    },
  ];

  // Filter activities
  const filteredActivities = useMemo(() => {
    return mockActivities.filter(activity => {
      const matchesSearch =
        activity.user.toLowerCase().includes(filters.search.toLowerCase()) ||
        activity.activity.toLowerCase().includes(filters.search.toLowerCase()) ||
        activity.id.toLowerCase().includes(filters.search.toLowerCase());
      const matchesSeverity = filters.severity === 'all' || activity.severity === filters.severity;
      const matchesStatus = filters.status === 'all' || activity.status === filters.status;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [filters]);

  // Paginate
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedActivities = filteredActivities.slice(start, end);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-900/20 border-red-700/50';
      case 'high':
        return 'text-orange-400 bg-orange-900/20 border-orange-700/50';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/50';
      case 'low':
        return 'text-blue-400 bg-blue-900/20 border-blue-700/50';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-700/50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical') return <AlertTriangle className="w-5 h-5 text-red-400" />;
    if (severity === 'high') return <AlertCircle className="w-5 h-5 text-orange-400" />;
    if (severity === 'medium') return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    return <AlertCircle className="w-5 h-5 text-blue-400" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'flagged':
        return 'bg-red-900/30 text-red-300 border-red-700/50';
      case 'reviewed':
        return 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50';
      case 'cleared':
        return 'bg-green-900/30 text-green-300 border-green-700/50';
      default:
        return 'bg-gray-900/30 text-gray-300 border-gray-700/50';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Suspicious Activity</h1>
          <p className="text-gray-400">Monitor and review flagged user activities</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search */}
          <div className="md:col-span-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search activity..."
              value={filters.search}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, search: e.target.value }));
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={filters.severity}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, severity: e.target.value }));
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

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
            <option value="flagged">Flagged</option>
            <option value="reviewed">Reviewed</option>
            <option value="cleared">Cleared</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-900/20 border border-red-700/50 p-4 rounded-lg">
            <p className="text-red-400 text-sm">Critical</p>
            <p className="text-2xl font-bold text-red-300">
              {mockActivities.filter(a => a.severity === 'critical').length}
            </p>
          </div>
          <div className="bg-orange-900/20 border border-orange-700/50 p-4 rounded-lg">
            <p className="text-orange-400 text-sm">High</p>
            <p className="text-2xl font-bold text-orange-300">
              {mockActivities.filter(a => a.severity === 'high').length}
            </p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg">
            <p className="text-yellow-400 text-sm">Medium</p>
            <p className="text-2xl font-bold text-yellow-300">
              {mockActivities.filter(a => a.severity === 'medium').length}
            </p>
          </div>
          <div className="bg-blue-900/20 border border-blue-700/50 p-4 rounded-lg">
            <p className="text-blue-400 text-sm">Low</p>
            <p className="text-2xl font-bold text-blue-300">
              {mockActivities.filter(a => a.severity === 'low').length}
            </p>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading activities...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">Failed to load activities</div>
          ) : paginatedActivities.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No suspicious activities found</div>
          ) : (
            paginatedActivities.map(activity => (
              <div
                key={activity.id}
                className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition"
              >
                {/* Activity Header */}
                <button
                  onClick={() => setExpanded(expanded === activity.id ? null : activity.id)}
                  className="w-full p-4 flex items-start gap-4 hover:bg-gray-700/50 transition"
                >
                  <div className="flex-shrink-0 pt-1">{getSeverityIcon(activity.severity)}</div>

                  <div className="flex-grow text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">{activity.activity}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(activity.severity)}`}>
                          {activity.severity.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadge(activity.status)}`}>
                          {activity.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">ID: {activity.id} • User: {activity.user}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>

                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition ${
                      expanded === activity.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expanded Details */}
                {expanded === activity.id && (
                  <div className="border-t border-gray-700 bg-gray-900/50 p-4">
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2">Details:</p>
                      <p className="text-sm text-gray-300 bg-gray-800 p-3 rounded border border-gray-700">
                        {activity.details}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {activity.status === 'flagged' && (
                        <>
                          <button className="flex items-center gap-2 px-4 py-2 bg-yellow-900/20 text-yellow-300 border border-yellow-700/50 rounded-lg hover:bg-yellow-900/30 transition">
                            <AlertTriangle className="w-4 h-4" />
                            Mark Reviewed
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 bg-red-900/20 text-red-300 border border-red-700/50 rounded-lg hover:bg-red-900/30 transition">
                            <X className="w-4 h-4" />
                            Block User
                          </button>
                        </>
                      )}
                      {(activity.status === 'reviewed' || activity.status === 'flagged') && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-900/20 text-green-300 border border-green-700/50 rounded-lg hover:bg-green-900/30 transition">
                          <Check className="w-4 h-4" />
                          Clear Alert
                        </button>
                      )}
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-900/20 text-blue-300 border border-blue-700/50 rounded-lg hover:bg-blue-900/30 transition">
                        👤 View User
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-400">
              Page {page} of {totalPages} • Showing {paginatedActivities.length} of {filteredActivities.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
