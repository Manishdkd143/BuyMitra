import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DistributorHeader from "./DistributorHeader";

const DistributorLayout = () => {
  const { logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">

      {/* ✅ HEADER (TOP BAR) */}
      <DistributorHeader />

      {/* ✅ BODY (SIDEBAR + CONTENT) */}
      <div className="flex flex-1">

        {/* SIDEBAR */}
        <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl ">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Distributor</h1>
                <p className="text-xs text-gray-400">Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-5 ">
            <NavLink to="/distributor/dashboard" className={linkClass}>
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </NavLink>

            <NavLink
              to="/distributor/products/manage/all"
              className={linkClass}
            >
              <Package className="w-5 h-5" />
              Product Management
            </NavLink>

            <NavLink to="/distributor/orders" className={linkClass}>
              <ShoppingCart className="w-5 h-5" />
              Order Management
            </NavLink>

            <NavLink to="/distributor/customers/manage" className={linkClass}>
              <Users className="w-5 h-5" />
              Customer Management
            </NavLink>

            <NavLink to="/distributor/profile" className={linkClass}>
              <FileText className="w-5 h-5" />
              Profile
            </NavLink>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1  p-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DistributorLayout;