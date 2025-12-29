import React, { useEffect, useState } from "react";
import { 
  Search, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Phone,
  Calendar
} from "lucide-react";
import { getDistributorPendingOrders } from "../../../services/distributor/orders.service";



const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalOrders: 0,
    totalPages: 1,
  });

  const fetchOrders = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const response = await getDistributorPendingOrders({ page, limit: 10, search });
      
      if (response.success) {
        setOrders(response.data.pendingOrders);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(1, searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      fetchOrders(newPage, searchQuery);
    }
  };

  const handleRefresh = () => {
    fetchOrders(meta.currentPage, searchQuery);
  };

  // Calculate stats
  const stats = {
    totalPending: meta.totalOrders,
    totalValue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    totalDue: orders.reduce((sum, order) => sum + order.dueAmount, 0),
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0,
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      processing: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      shipped: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      confirmed: "bg-green-500/10 text-green-400 border-green-500/30",
    };
    return colors[status] || "bg-gray-500/10 text-gray-400 border-gray-500/30";
  };

  const getPaymentColor = (status) => {
    const colors = {
      paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      pending: "bg-red-500/10 text-red-400 border-red-500/30",
      partial: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    };
    return colors[status] || "bg-gray-500/10 text-gray-400 border-gray-500/30";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Clock className="w-8 h-8 text-amber-400" />
              Pending Orders
            </h1>
            <p className="text-slate-400 mt-1">Track and manage orders in progress</p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-linear-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-amber-400/80 text-sm font-medium mb-1">Total Pending</p>
                <p className="text-3xl font-bold text-white">{stats.totalPending}</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-400/80 text-sm font-medium mb-1">Total Value</p>
                <p className="text-3xl font-bold text-white">₹{stats.totalValue.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-red-400/80 text-sm font-medium mb-1">Total Due</p>
                <p className="text-3xl font-bold text-white">₹{stats.totalDue.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-400/80 text-sm font-medium mb-1">Avg Order</p>
                <p className="text-3xl font-bold text-white">₹{Math.round(stats.avgOrderValue).toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name or order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Clock className="w-16 h-16 text-slate-700 mb-4" />
              <p className="text-slate-400 text-lg font-medium">No pending orders found</p>
              <p className="text-slate-500 text-sm mt-1">All orders are completed or cancelled</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Order Details</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Due</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-lg flex items-center justify-center">
                              <span className="text-amber-400 font-bold text-sm">#{order.orderNumber.slice(-3)}</span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{order.orderNumber}</p>
                              <p className="text-slate-500 text-xs">Order ID: {order._id.slice(-8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{order.customerName}</p>
                            <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                              <Phone className="w-3 h-3" />
                              {order.customerPhone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.orderDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-semibold">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                          <p className="text-slate-500 text-xs">Paid: ₹{order.paidAmount.toLocaleString('en-IN')}</p>
                        </td>
                        <td className="px-6 py-4">
                          {order.dueAmount > 0 ? (
                            <div>
                              <p className="text-red-400 font-semibold">₹{order.dueAmount.toLocaleString('en-IN')}</p>
                              <p className="text-slate-500 text-xs">{((order.dueAmount / order.totalAmount) * 100).toFixed(0)}% pending</p>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-sm">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                              Fully Paid
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentColor(order.paymentStatus)}`}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors group-hover:bg-slate-700">
                            <Eye className="w-4 h-4 text-slate-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-slate-800">
                {orders.map((order) => (
                  <div key={order._id} className="p-4 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-lg flex items-center justify-center">
                          <span className="text-amber-400 font-bold">#{order.orderNumber.slice(-3)}</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">{order.orderNumber}</p>
                          <p className="text-slate-400 text-sm">{order.customerName}</p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-slate-700 rounded-lg">
                        <Eye className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Amount</p>
                        <p className="text-white font-semibold">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Due</p>
                        <p className="text-red-400 font-semibold">₹{order.dueAmount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPaymentColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-800/30 border-t border-slate-800">
                <div className="text-sm text-slate-400">
                  Showing <span className="font-medium text-white">{orders.length}</span> of{" "}
                  <span className="font-medium text-white">{meta.totalOrders}</span> pending orders
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(meta.currentPage - 1)}
                    disabled={meta.currentPage === 1}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-400" />
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(meta.totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === meta.totalPages ||
                        (pageNum >= meta.currentPage - 1 && pageNum <= meta.currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                              pageNum === meta.currentPage
                                ? "bg-amber-500 text-white"
                                : "text-slate-400 hover:bg-slate-700"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === meta.currentPage - 2 ||
                        pageNum === meta.currentPage + 2
                      ) {
                        return (
                          <span key={pageNum} className="text-slate-600 px-2">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(meta.currentPage + 1)}
                    disabled={meta.currentPage === meta.totalPages}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingOrders;