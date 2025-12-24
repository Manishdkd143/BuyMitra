import { AlertCircle } from "lucide-react";

const LowStockAlert = ({ products }) => {
  return (
    <div className="bg-white rounded-xl shadow border h-fit">
      <div className="px-6 py-4 border-b flex items-center gap-2">
        <AlertCircle className="text-red-600" />
        <h2 className="font-bold text-lg">Low Stock</h2>
      </div>

      <div className="p-6 space-y-3">
        {products?.length ? products.map((p) => (
          <div
            key={p._id}
            className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
          >
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-gray-500">{p.brand}</p>
            </div>
            <span className="text-red-600 font-bold">
              {p.stock}
            </span>
          </div>
        )) : (
          <p className="text-gray-500 text-center">All stocks healthy 🎉</p>
        )}
      </div>
    </div>
  );
};

export default LowStockAlert;
