import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  LogOut,
  IndianRupee,
  UserPlus,
  UserCheck,
  ListChecks,
  TrendingUp,
  BarChart3,
  X,
} from "lucide-react";
import DistributorHeader from "../../layouts/DistributorHeader"; // same header

import { useState } from "react";
const CustomerLayout = () => {
const [sidebarOpen, setSidebarOpen] = useState(false)
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition
     ${
       isActive
         ? "bg-indigo-600 text-white shadow-md"
         : "text-gray-300 hover:bg-gray-800 hover:text-white"
     }`;
       const sectionTitle =
  "px-4 pt-6 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider";

  return (
 
       <>
        <div className="flex min-h-screen bg-gray-800">
  {/* ================= HEADER ================= */}
    {/* ================= SIDEBAR Desktop Only ================= */}
    <aside className=" hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-64 
        bg-gray-900 text-white shadow-2xl shadow-black/40
        border-r border-gray-800">
           {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Distributor</h1>
              <p className="text-xs text-gray-400 mt-0.5">Control Panel</p>
            </div>
          </div>
        </div>
      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">

        {/* MAIN */}
        <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase">
          Main
        </p>

       <NavLink to="/distributor/dashboard" className={linkClass}> <LayoutDashboard className="w-5 h-5" /> 
       <span className="font-medium">Dashboard</span> 
       </NavLink>

        {/* PRODUCTS */}
        <p className="px-3 pt-4 pb-1 text-xs font-semibold text-gray-500 uppercase">
          Customer Management
        </p>

        <NavLink to="/distributor/orders/manage/all" className={linkClass}>
          <Users className="w-5 h-5" />
          <span>Customers</span>
        </NavLink>
        <NavLink to="/distributor/orders/manage/add" className={linkClass}>
          <UserPlus className="w-5 h-5" />
          <span>Add-Customer</span>
        </NavLink>
        <NavLink to="/distributor/products/manage/insights" className={linkClass}>
          <BarChart3 className="w-5 h-5" />
          <span>Customer-Insights</span>
        </NavLink>
     
  
      </nav>

    </aside>
  {/* ============================================= */}
      {/* 2. MOBILE SIDEBAR - SLIDE-IN */}
      {/* ============================================= */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
        
        <aside className={`
          absolute top-0 bottom-0 left-0 w-72 bg-gray-900 text-white flex flex-col shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Header with close */}
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold">Distributor</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Nav */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {[
              { to: "/distributor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { to: "/distributor/customers/manage/all", icon: Users, label: "Customers" },
              { to: "/distributor/customers/manage/add", icon: UserPlus, label: "Add-Customer" },
              { to: "/distributor/customers/manage/insights", icon: BarChart3, label: "Customer-insights" },
          
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

       
        </aside>
      </div>
    {/* ================= MAIN CONTENT ================= */}
    <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Sticky Header - Works on both mobile & desktop */}
              <DistributorHeader onMenuClick={()=>setSidebarOpen(true)}/>
        {/* Main Scrollable Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-2 bg-gray-700/50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
</div>
    </>

  );
};

export default CustomerLayout;
