import React, { useEffect, useState } from "react";
import {
  Search,
  CheckCircle,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Phone,
  Calendar
} from "lucide-react";
import { getDistributorDeliveredOrders } from "../../../services/distributor/orders.service";

const DeliveredOrders = () => {
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
      const res = await getDistributorDeliveredOrders({page:1,limit:10,search:searchQuery})

      if (res.success) {
        setOrders(res.data.deliveredOrders);
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error("Delivered orders fetch failed", err);
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

  const handlePageChange = (page) => {
    if (page >= 1 && page <= meta.totalPages) {
      fetchOrders(page, searchQuery);
    }
  };

  const handleRefresh = () => {
    fetchOrders(meta.currentPage, searchQuery);
  };

  // 📊 Stats
  const stats = {
    totalDelivered: meta.totalOrders,
    totalValue: orders.reduce((s, o) => s + o.totalAmount, 0),
    avgOrderValue:
      orders.length > 0
        ? orders.reduce((s, o) => s + o.totalAmount, 0) / orders.length
        : 0,
  };

  const getPaymentColor = (status) => {
    const colors = {
      paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      partial: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      pending: "bg-red-500/10 text-red-400 border-red-500/30",
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
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              Delivered Orders
            </h1>
            <p className="text-slate-400 mt-1">
              Successfully completed orders
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
            <p className="text-emerald-400 text-sm mb-1">Total Delivered</p>
            <p className="text-3xl font-bold text-white">
              {stats.totalDelivered}
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
            <p className="text-blue-400 text-sm mb-1">Total Value</p>
            <p className="text-3xl font-bold text-white">
              ₹{stats.totalValue.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
            <p className="text-purple-400 text-sm mb-1">Avg Order</p>
            <p className="text-3xl font-bold text-white">
              ₹{Math.round(stats.avgOrderValue).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer or order number..."
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              Loading delivered orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              No delivered orders found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs text-slate-400">
                        Order
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-slate-400">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-slate-400">
                        Delivered On
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-slate-400">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-slate-400">
                        Payment
                      </th>
                      <th className="px-6 py-4 text-left text-xs text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-800/30">
                        <td className="px-6 py-4 text-white font-medium">
                          {order.orderNumber}
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-white">{order.customerName}</p>
                          <p className="text-slate-400 text-xs flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {order.customerPhone}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-slate-400 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.deliveredAt).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-6 py-4 text-white font-semibold">
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentColor(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <button className="p-2 hover:bg-slate-700 rounded-lg">
                            <Eye className="w-4 h-4 text-slate-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center px-6 py-4 border-t border-slate-800">
                <p className="text-slate-400 text-sm">
                  Showing {orders.length} of {meta.totalOrders}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handlePageChange(meta.currentPage - 1)
                    }
                    disabled={meta.currentPage === 1}
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-400" />
                  </button>
                  <button
                    onClick={() =>
                      handlePageChange(meta.currentPage + 1)
                    }
                    disabled={meta.currentPage === meta.totalPages}
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

export default DeliveredOrders;
