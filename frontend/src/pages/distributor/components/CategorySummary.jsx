import { Archive } from "lucide-react";

const CategorySummary = ({ data }) => (
  <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
    <div className="flex items-center gap-2 mb-4">
      <Archive className="w-5 h-5 text-purple-400" />
      <h2 className="text-xl font-bold text-white">Category Summary</h2>
    </div>
    <div className="space-y-3">
      {data.map((item, idx) => (
        <div key={item.categoryId} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-white">{item.categoryName}</span>
            <span className="text-gray-400 text-sm">{item.totalStockItems} total</span>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-300">{item.inStockItems} in stock</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-gray-300">{item.lowStockItems} low stock</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CategorySummary;
