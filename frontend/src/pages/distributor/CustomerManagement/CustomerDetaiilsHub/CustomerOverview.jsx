import React,{useEffect,useState} from 'react'
import {  getCustomerOverview } from '../../../../services/distributor/customer.service';
import { AlertCircle, CheckCircle, Clock, Mail, MapPin, Phone, ShoppingBag, TrendingUp, User } from 'lucide-react';
import { useParams } from 'react-router-dom';
import CustomerOrders from './CustomerOrders';
import CustomerActivity from './CustomerActivity';
import CustomerLedger from './CustomerLedger';
const CustomerOverview = () => {
  const params=useParams()
  const customerId=params.customerId;
  const [activeTab, setActiveTab] = useState("overview");
  const [customer, setCustomer] = useState(null)
  const [summary, setSummary] = useState(null)
useEffect(() => {
  const loadAll = async () => {
    try {
      const res=await getCustomerOverview(customerId)
      console.log("overview",res.data)
      setCustomer(res.data.customerDetails);
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Customer load failed", err.message);
    }
  };

  loadAll();
}, []);

  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  return (
   <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{customer?.name}</h1>
                <p className="text-sm text-gray-500">Customer ID: {customer?._id.slice(-6)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600 capitalize">{customer?.status}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8 border-b border-gray-200">
            {['overview', 'orders', 'activity', 'ledger'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 text-sm font-medium capitalize transition-colors relative cursor-pointer ${
                  activeTab === tab
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
       <div className="max-w-7xl mx-auto px-6 py-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{summary?.totalOrders}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">₹{summary?.totalSpent.toLocaleString('en-IN')}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Paid</p>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">₹{summary?.totalPaid.toLocaleString('en-IN')}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Balance Due</p>
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-600">₹{summary?.balanceDue.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="text-base font-medium text-gray-900">{customer?.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="text-base font-medium text-gray-900">{customer?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    {customer?.address?<p className='text-base font-medium text-gray-900'>{`${customer.address?.city},${customer.address?.state},${customer.address?.pincode}`}</p>:""}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Customer Since</p>
                    <p className="text-base font-medium text-gray-900">{formatShortDate(customer?.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Orders tab */}
        {
          activeTab==="orders"&&(
            <CustomerOrders props={customerId}/>
          )
        }
        {/* Activity tab */}
        {
          activeTab==="activity"&&(
            <CustomerActivity />
          )
        }
        {/* Ledger tab */}
        {activeTab==="ledger"&&(
          <CustomerLedger/>
        )}
        </div>
      </div>
      
  )
}

export default CustomerOverview
