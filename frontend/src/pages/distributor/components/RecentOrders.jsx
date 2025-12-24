 const RecentOrders = ({ orders }) => {
  const statusColor = (status) => {
    if (status === "pending") return "from-yellow-400 to-orange-400";
    if (status === "processing") return "from-blue-400 to-cyan-400";
    if (status === "delivered") return "from-green-400 to-emerald-400";
    return "from-gray-400 to-gray-500";
  };

  const statusText = (status) => {
    if (status === "pending") return "text-yellow-700";
    if (status === "processing") return "text-blue-700";
    if (status === "delivered") return "text-green-700";
    return "text-gray-700";
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-5 text-white">
        <div className="flex items-center gap-2">
          <ShoppingCart size={22} />
          <h2 className="text-xl font-bold">Recent Orders</h2>
        </div>
        <p className="text-blue-100 text-sm mt-1">Latest order activity</p>
      </div>

      <div className="p-5 space-y-3">
        {orders?.length ? orders.map((o, idx) => (
          <div
            key={o.id}
            className="flex justify-between items-center p-4 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-blue-50 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
                {idx + 1}
              </div>
              <div>
                <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{o.id}</p>
                <p className="text-sm text-gray-500">{o.retailer}</p>
              </div>
            </div>
            <span className={`px-4 py-2 bg-gradient-to-r ${statusColor(o.status)} text-white rounded-full text-xs font-bold shadow-md uppercase tracking-wide`}>
              {o.status}
            </span>
          </div>
        )) : (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No recent orders</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default RecentOrders;