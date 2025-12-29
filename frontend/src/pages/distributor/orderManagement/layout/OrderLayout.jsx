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
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import DistributorHeader from "../../../../layouts/DistributorHeader";


const OrderLayout = () => {
  const { logout } = useAuth();

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
    <div className="flex flex-col min-h-screen bg-[#0B0F1A]">
      {/* ================= HEADER ================= */}
      <DistributorHeader />

      {/* ================= BODY ================= */}
      <div className="flex flex-1">
        {/* =============== SIDEBAR ================= */}
        <aside className="w-64 bg-[#0B0F1A] border-r border-gray-800 text-white flex flex-col">
          {/* NAVIGATION */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {/* DASHBOARD */}
            <p className={sectionTitle}>Main</p>
            <NavLink to="/distributor/dashboard" className={linkClass}>
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </NavLink>

            {/* ===== CUSTOMER MANAGEMENT ===== */}
            <p className={sectionTitle}>Order Management</p>

            <NavLink to="/distributor/orders/manage/all" className={linkClass}>
              <UserPlus className="w-5 h-5" />
              <span className="font-medium">Order List</span>
            </NavLink>

            <NavLink to="/distributor/orders/manage/pending" className={linkClass}>
              <Users className="w-5 h-5" />
              <span className="font-medium">Pending Orders</span>
            </NavLink>

            <NavLink to="/distributor/orders/manage/completed" className={linkClass}>
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Completed Orders</span>
            </NavLink>
            <NavLink to="/distributor/orders/manage/cancelled" className={linkClass}>
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Cancelled Orders</span>
            </NavLink>
          </nav>

          {/* LOGOUT */}
          <div className="p-3 border-t border-gray-800">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                         text-gray-400 hover:bg-red-500/10 hover:text-red-400 
                         transition-all duration-200 font-medium border border-transparent
                         hover:border-red-500/20"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* =============== MAIN CONTENT ================= */}
        <main className="flex-1 bg-[#0B0F1A] overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrderLayout;
