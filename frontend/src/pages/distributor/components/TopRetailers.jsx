  const TopRetailers = ({ retailers }) => {
  const colors = [
    "from-yellow-400 to-orange-500",
    "from-gray-300 to-gray-400",
    "from-orange-400 to-red-500",
    "from-blue-400 to-indigo-500"
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="bg-linear-to-r from-emerald-500 to-teal-500 p-5 text-white">
        <div className="flex items-center gap-2">
          <TrendingUp size={22} />
          <h2 className="text-xl font-bold">Top Retailers</h2>
        </div>
        <p className="text-emerald-100 text-sm mt-1">Best performing partners</p>
      </div>

      <div className="p-5 space-y-3">
        {retailers?.length ? retailers.map((r, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-emerald-200 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-emerald-50 group">
            <div className={`w-12 h-12 bg-gradient-to-br ${colors[i]} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {i + 1}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{r.name}</p>
              <p className="text-sm text-gray-500">{r.orders} orders completed</p>
            </div>
            <div className="text-right">
              <TrendingUp size={20} className="text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-emerald-600 font-semibold">Top {i + 1}</p>
            </div>
          </div>
        )) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default TopRetailers;