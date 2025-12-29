import React, { useEffect, useState } from "react";
import { getDistributorOrders } from "../../../services/distributor/orders.service";
import { Calendar, ChevronLeft, ChevronRight, DollarSign, Package, ShoppingCart, User } from "lucide-react";
import useDebounce from "../../../hooks/useDebounce";
import { StatusBadge } from "./Components/StatusBadge";
import {FilterOrders} from "./Components/FilterOrders"
const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
const debouncedFilters=useDebounce(filters,300)
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
  });

  const fetchOrders = async (page = 1, appliedFilters = {}) => {
    try {
      setLoading(true);
      const res = await getDistributorOrders({
        page,
        limit: 10,
        ...appliedFilters,
      });

      setOrders(res.data.data.orders);
      setMeta(res.data.data.meta);
    } catch (err) {
      console.error("Order fetch failed", err);
    } finally {
      setLoading(false);
    }
  };


 useEffect(() => {
    fetchOrders(1, debouncedFilters);
  }, [debouncedFilters]);

  const handleReset = () => {
    setFilters({
      startDate: "",
      endDate: "",
      orderStatus: "",
      paymentStatus: "",
      customerName: "",
      orderNumber: "",
    });
  };

  const handleFilterChange = (newFilter) => {
    setFilters(newFilter)
  };


  const handlePageChange = (page) => {
    if (page >= 1 && page <= meta.totalPages) {
      fetchOrders(page, filters);
    }
  };
const activeFiltersCount=Object.values(filters).filter(v=>v!=="").length
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Orders Management</h1>
          <p className="text-gray-400 text-sm">View and manage all your orders</p>
        </div> */}

        {/* Filter Bar */}
        <FilterOrders onFilterChange={handleFilterChange} onReset={handleReset} activeFiltersCount={activeFiltersCount} filters={filters}/>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Orders</p>
                <p className="text-xl font-bold text-white">{meta.totalOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Revenue</p>
                <p className="text-xl font-bold text-white">₹{orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Pending</p>
                <p className="text-xl font-bold text-white">{orders.filter(o => o.orderStatus === 'pending').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <User className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Due Amount</p>
                <p className="text-xl font-bold text-white">₹{orders.reduce((sum, o) => sum + o.dueAmount, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-gray-800/40 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Due</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payment</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700/50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-400 text-sm">Loading orders...</p>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="w-12 h-12 text-gray-600" />
                        <p className="text-gray-400">No orders found</p>
                        <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-indigo-400 font-medium text-sm">{order.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white text-sm">{order.customerName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-400 text-sm">
                          {new Date(order.orderDate).toLocaleDateString("en-IN", { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white font-medium text-sm">₹{order.totalAmount.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        {order.dueAmount > 0 ? (
                          <span className="text-red-400 font-medium text-sm">₹{order.dueAmount.toLocaleString()}</span>
                        ) : (
                          <span className="text-green-400 font-medium text-sm">Paid</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.orderStatus} type="order" />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.paymentStatus} type="payment" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && orders.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800/30 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                Showing <span className="font-medium text-white">{orders.length}</span> of{" "}
                <span className="font-medium text-white">{meta.totalOrders}</span> orders
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  disabled={meta.currentPage === 1}
                  onClick={() => handlePageChange(meta.currentPage - 1)}
                  className="p-2 rounded hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
                
                <span className="text-sm text-gray-300 px-3">
                  Page {meta.currentPage} of {meta.totalPages}
                </span>
                
                <button
                  disabled={meta.currentPage === meta.totalPages}
                  onClick={() => handlePageChange(meta.currentPage + 1)}
                  className="p-2 rounded hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersList;
