import { useEffect, useState } from "react";
import { getDistributorOrders } from "../../../services/distributor/orders.service";
import { useNavigate } from "react-router-dom";
import { Search, Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

const statusColors = {
  pending: "text-yellow-400 bg-yellow-900/30",
  confirmed: "text-blue-400 bg-blue-900/30",
  processing: "text-purple-400 bg-purple-900/30",
  shipped: "text-indigo-400 bg-indigo-900/30",
  delivered: "text-green-400 bg-green-900/30",
  cancelled: "text-red-400 bg-red-900/30",
};

const  DistributorOrders=()=> {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const loadOrders = async () => {
   const res=await getDistributorOrders({
  page: 1,
  limit: 10,
  search: "",
  status: "",
});

    setOrders(res.data.orders);
    setTotalPages(res.data.totalPages);
  };

  useEffect(() => {
    loadOrders();
  }, [page]);

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="max-w-6xl mx-auto">
  <div><button
    onClick={() => navigate(-1)}
    className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer"
  >
    <ArrowLeft size={20} />
    Back
  </button></div>
        <h1 className="text-3xl font-bold mb-6">All Orders</h1>

        {/* SEARCH BAR */}
        <div className="flex items-center bg-white/10 p-3 rounded-lg border border-white/20 mb-6">
          <Search className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search by retailer / order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadOrders()}
            className="bg-transparent outline-none w-full text-gray-300"
          />
        </div>

        {/* ORDERS LIST */}
        <div className="space-y-4">
        {Array.isArray(orders) && orders.length > 0 ? (
  orders.map((order) => (
    <div
      key={order._id}
      className="bg-white/10 p-5 rounded-xl border border-white/20 shadow hover:bg-white/20 cursor-pointer transition"
      onClick={() => navigate(`/distributor/orders/${order._id}`)}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg font-bold">{order.orderNumber}</p>

          <p className="text-gray-300 text-sm">
            Retailer: {order.userId?.name}
          </p>

          <p className="text-gray-400 text-sm">
            {order.userId?.phone} • ✉ {order.userId?.email}
          </p>

          <p className="text-gray-500 text-xs mt-1">
            {new Date(order.createdAt).toLocaleString()}
          </p>

          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${statusColors[order.status]}`}
          >
            {order.status.toUpperCase()}
          </span>
        </div>

        <div className="text-right">
          <p className="text-xl font-semibold">
            ₹{order.totalAmount.toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">
            {order.products.length} Items
          </p>
        </div>
      </div>
    </div>
  ))
) : (
  <div className="text-center text-gray-300 py-10 text-lg">
     No Orders Found
  </div>
)}

        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-blue-600 rounded disabled:bg-gray-700"
          >
            Previous
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-blue-600 rounded disabled:bg-gray-700"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
export default DistributorOrders