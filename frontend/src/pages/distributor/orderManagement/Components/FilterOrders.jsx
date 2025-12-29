import { Filter, Search } from "lucide-react";
import {useState } from "react";
export const FilterOrders= ({filters,onFilterChange ,activeFiltersCount,onReset}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const handleChange=(name,value)=>{
   setLocalFilters((prev)=>({...prev,[name]:value}))
  }
  const applyFilters=()=>{
    onFilterChange(localFilters);
    setShowFilters(false)
  }
   const handleReset = () => {
    const empty = {
      startDate: "",
      endDate: "",
      orderStatus: "",
      paymentStatus: "",
      customerName: "",
      orderNumber: "",
    };
    setLocalFilters(empty);
    onReset();
    setShowFilters(false);
  };
 return (
 <div className="relative">
  <div className="flex items-center gap-3 mb-4">
      {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by customer or order number..."
             value={localFilters.customerName||localFilters.orderNumber} 
             onChange={(e)=>{
              handleChange("customerName",e.target.value)
              handleChange("orderNumber",e.target.value)
              onFilterChange({...localFilters,customerName:e.target,orderNumber:e.target.value})
             }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
        </div>
          {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeFiltersCount > 0
              ? "bg-indigo-600 text-white"
              : "bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-800"
          }`}
        >
          <Filter size={16} />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
              {activeFiltersCount}
            </span>
          )}
        </button>
  </div>
    {/* Filter Dropdown */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {/* Date Range */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Start Date</label>
              <input
                type="date"
                value={localFilters.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">End Date</label>
              <input
                type="date"
                value={localFilters.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Order Status */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Order Status</label>
              <select
                value={localFilters.orderStatus}
                onChange={(e) => handleChange("orderStatus", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Payment Status</label>
              <select
                value={localFilters.paymentStatus}
                onChange={(e) => handleChange("paymentStatus", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
            <button
              onClick={handleReset}
              className="px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
 </div>
 )
}