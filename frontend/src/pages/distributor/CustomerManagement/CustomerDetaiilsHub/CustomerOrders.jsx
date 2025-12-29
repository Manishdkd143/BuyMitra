import React, { useState,useEffect } from 'react'
import { getCustomerOrders } from '../../../../services/distributor/customer.service';
import { Package } from 'lucide-react';

const CustomerOrders = ({props}) => {
  // const [orders, setOrders] = useState({})
  const [loading, setLoading] = useState(false)
  // useEffect(() => {
  //   const loadOrders = async () => {
  //     try {
  //       console.log("cid",props.customerId)
  //       const res=await getCustomerOrders(props.customerId)
  //       console.log("orders",res.data)
  //       setOrders(res.data.orders)
  //     } catch (err) {
  //       console.error("Customer load failed", err.message);
  //     }
  //   };
  
  //   loadOrders();
  // }, []);
   const orders = [
    {
      id: "o1",
      orderNumber: "ORD-1023",
      date: "2025-09-12T10:20:00Z",
      items: 3,
      total: 2400,
      paid: 1000,
      due: 1400,
      status: "pending"
    },
    {
      id: "o2",
      orderNumber: "ORD-1015",
      date: "2025-08-28T14:30:00Z",
      items: 5,
      total: 4200,
      paid: 4200,
      due: 0,
      status: "completed"
    },
    {
      id: "o3",
      orderNumber: "ORD-0998",
      date: "2025-08-10T09:15:00Z",
      items: 2,
      total: 1800,
      paid: 1800,
      due: 0,
      status: "completed"
    }
  ];
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
   const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Orders</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {orders.length?orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{order?.orderNumber}</p>
                        <p className="text-sm text-gray-500">{formatShortDate(order?.date)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Items</p>
                      <p className="text-sm font-medium text-gray-900">{order?.items} items</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                      <p className="text-sm font-medium text-gray-900">₹{order?.total.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Paid</p>
                      <p className="text-sm font-medium text-green-600">₹{order?.paid.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Due</p>
                      <p className="text-sm font-medium text-orange-600">₹{order?.due.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              )):
              <div>NO order found!</div>
              }
            </div>
          </div>
  )
}

export default CustomerOrders
