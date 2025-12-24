import { Package } from "lucide-react";

const InventoryTable = ({ data }) => (
  <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
    <div className="p-6 border-b border-gray-700">
      <h2 className="text-xl font-bold text-white">Inventory Details</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Product</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Stock</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Reorder Level</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-750 transition">
              <td className="px-6 py-4 text-white">{item.name}</td>
              <td className="px-6 py-4 text-gray-300">{item.category}</td>
              <td className="px-6 py-4 text-white font-semibold">{item.stock}</td>
              <td className="px-6 py-4 text-gray-300">{item.reorderLevel}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  item.status === 'Good' ? 'bg-green-600 text-white' :
                  item.status === 'Low' ? 'bg-yellow-600 text-white' :
                  'bg-red-600 text-white'
                }`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
export default InventoryTable;