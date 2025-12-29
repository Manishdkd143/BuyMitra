import { useEffect, useState } from "react";
import { getDistributorOrderById,updateOrderStatus } from "../../../services/distributor/orders.service"; 
import StatusBadge from "../../../components/StatusBadge";
import Timeline from "../../../components/Timeline";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  
  const fetchOrder = async () => {
      try {
          const res = await getDistributorOrderById(orderId);
          console.log("order",res)
      setOrder(res.data.data.order);
      setTimeline(res.data.data.timeline);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load order");
    } finally {
        setLoading(false);
    }
};
useEffect(() => {
  fetchOrder();
}, [orderId]);
  const handleUpdateStatus = async () => {
    try {
      const data = { status: newStatus };
      if (newStatus === "shipped") data.trackingNumber = trackingNumber;

      const res = await updateOrderStatus(orderId, data);
    console.log("orderStatus",res);
    
      toast.success("Order status updated!");
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!order) return <p className="p-6">Order Not Found</p>;

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
        <StatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      <Timeline timeline={timeline} />

      {/* Customer Details */}
      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-2">Customer Details</h2>
        <p><b>Name:</b> {order.userId?.name}</p>
        <p><b>Email:</b> {order.userId?.email}</p>
        <p><b>Phone:</b> {order.userId?.phone}</p>
        <p><b>Address:</b> {order.userId?.address}</p>
      </div>

      {/* Product List */}
      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-3">Products</h2>

        {order.products.map((item) => (
          <div
            key={item.productId._id}
            className="flex justify-between border-b py-2"
          >
            <div>
              <p className="font-semibold">{item.productId.name}</p>
              <p className="text-sm text-gray-600">Qty: {item.qty}</p>
            </div>

            <p className="font-semibold">₹{item.totalPrice}</p>
          </div>
        ))}

        <div className="text-right mt-3 text-lg font-bold">
          Total: ₹{order.totalAmount}
        </div>
      </div>

      {/* Status Update UI */}
      <div className="bg-white p-5 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Update Order Status</h2>

        <select
          className="border p-2 rounded w-full mb-4"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
        >
          <option value="">Select Status</option>
          <option value="confirmed">Confirm Order</option>
          <option value="shipped">Mark as Shipped</option>
          <option value="delivered">Mark as Delivered</option>
          <option value="cancelled">Cancel Order</option>
        </select>

        {newStatus === "shipped" && (
          <input
            className="border p-2 rounded w-full mb-4"
            placeholder="Tracking Number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
        )}

        <button
          onClick={handleUpdateStatus}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Status
        </button>
      </div>
    </div>
  );
}
