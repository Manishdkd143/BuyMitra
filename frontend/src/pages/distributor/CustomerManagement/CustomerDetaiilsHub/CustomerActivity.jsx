import React, { useState,useEffect } from 'react'
import { getCustomerActivity } from '../../../../services/distributor/customer.service';
import { Ban, Clock, CreditCard, Package } from 'lucide-react';


const CustomerActivity = (customerId) => {
  // const [activities, setActivities] = useState({})
  const [loading, setLoading] = useState(true)
//   const loadCustomerActivities=async()=>{
//  try {
//    const res=  await getCustomerActivity(customerId)
//    console.log("activities",res.data)
//    setActivities(res.data.activities)
//  } catch (error) {
//   console.error("Load activities failed!",error?.message)
//  }finally{
//   setLoading(false)
//  }
//   }
   const activities = [
    {
      id: "a1",
      type: "order",
      action: "order_placed",
      title: "Order Placed",
      description: "Order ORD-1023 placed for ₹2,400",
      amount: 2400,
      orderId: "693c...",
      orderNumber: "ORD-1023",
      status: "success",
      createdAt: "2025-09-12T10:20:00Z"
    },
    {
      id: "a2",
      type: "payment",
      action: "payment_received",
      title: "Payment Received",
      description: "₹1,000 received via COD",
      amount: 1000,
      status: "success",
      createdAt: "2025-09-13T12:00:00Z"
    },
    {
      id: "a3",
      type: "order",
      action: "order_completed",
      title: "Order Completed",
      description: "Order ORD-1015 marked as completed",
      amount: 4200,
      orderNumber: "ORD-1015",
      status: "success",
      createdAt: "2025-08-30T16:45:00Z"
    },
    {
      id: "a4",
      type: "payment",
      action: "payment_received",
      title: "Payment Received",
      description: "₹4,200 received via UPI",
      amount: 4200,
      status: "success",
      createdAt: "2025-08-30T16:45:00Z"
    },
    {
      id: "a5",
      type: "block",
      action: "customer_blocked",
      title: "Customer Temporarily Blocked",
      description: "Due to pending payment exceeding limit",
      status: "warning",
      createdAt: "2025-08-20T11:00:00Z"
    }
  ];
  const getActivityIcon = (type) => {
    switch(type) {
      case 'order':
        return <Package className="w-5 h-5" />;
      case 'payment':
        return <CreditCard className="w-5 h-5" />;
      case 'block':
        return <Ban className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  };
   const getActivityIconColor = (type) => {
    switch(type) {
      case 'order':
        return 'bg-blue-100 text-blue-600';
      case 'payment':
        return 'bg-green-100 text-green-600';
      case 'block':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  // useEffect(() => {
  //  loadCustomerActivities()
  // }, [])
  return (
     <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Activity Timeline</h2>
            
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4 relative">
                  {index < activities.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  
                  <div className={`flex shrink-0 w-10 h-10 rounded-full  items-center justify-center ${getActivityIconColor(activity.type)}`}>
                    {getActivityIcon(activity?.type)}
                  </div>

                  <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{activity?.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{activity?.description}</p>
                      </div>
                      {activity.amount && (
                        <span className="text-lg font-bold text-gray-900">
                          ₹{activity?.amount.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(activity?.createdAt)}
                      </span>
                      {activity.orderNumber && (
                        <span className="px-2 py-1 bg-white rounded border border-gray-300">
                          {activity?.orderNumber}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        activity?.status === 'success' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {activity?.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
  )
}

export default CustomerActivity
