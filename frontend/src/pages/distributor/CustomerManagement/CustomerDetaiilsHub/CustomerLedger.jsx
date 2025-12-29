import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import React from 'react'

const CustomerLedger = () => {
  const summary = {
    totalOrders: 8,
    totalSpent: 18500,
    totalPaid: 12000,
    balanceDue: 6500,
    lastOrderDate: "2025-09-12"
  };
   const ledger = [
    {
      id: "l1",
      type: "debit",
      description: "Order ORD-1023",
      amount: 2400,
      balance: 6500,
      date: "2025-09-12T10:20:00Z",
      orderNumber: "ORD-1023"
    },
    {
      id: "l2",
      type: "credit",
      description: "Payment received - COD",
      amount: 1000,
      balance: 4100,
      date: "2025-09-13T12:00:00Z"
    },
    {
      id: "l3",
      type: "credit",
      description: "Payment received - UPI",
      amount: 4200,
      balance: 3100,
      date: "2025-08-30T16:45:00Z"
    },
    {
      id: "l4",
      type: "debit",
      description: "Order ORD-1015",
      amount: 4200,
      balance: 7300,
      date: "2025-08-28T14:30:00Z",
      orderNumber: "ORD-1015"
    }
  ];
  

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
  return (
   <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Payment Ledger</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className="text-2xl font-bold text-orange-600">₹{summary?.balanceDue.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {ledger.length&&ledger.map((entry) => (
                <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        entry?.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {entry?.type === 'credit' ? (
                          <ArrowDownRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900">{entry?.description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-gray-500">{formatDate(entry.date)}</p>
                          {entry?.orderNumber && (
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded border border-gray-300">
                              {entry?.orderNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        entry?.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {entry?.type === 'credit' ? '+' : '-'}₹{entry?.amount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Balance: ₹{entry?.balance.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
     
  )
}

export default CustomerLedger
