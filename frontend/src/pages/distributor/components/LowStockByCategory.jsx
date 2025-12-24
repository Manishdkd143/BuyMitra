import { AlertTriangle, TrendingDown } from "lucide-react";

const LowStockByCategory = ({ data}) => (
  <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
    <div className="flex items-center gap-2 mb-4">
      <TrendingDown className="w-5 h-5 text-red-400" />
      <h2 className="text-xl font-bold text-white">Low Stock by Category</h2>
    </div>
    <div className="space-y-4">
      {data.map((item, idx) => (
        <div key={item.categoryId} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-white">{item.categoryName?item.categoryName.charAt(0).toUpperCase()+item.categoryName.slice(1):""}</span>
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              {item?.products.length||0} items
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {item.products.length>0?item.products.map(product=>product.productName?product.productName.split(" ")[0]:product.productName).filter(Boolean).join(", "):""}
          </div>
        </div>
      ))}
    </div>
  </div>
);
export default LowStockByCategory;