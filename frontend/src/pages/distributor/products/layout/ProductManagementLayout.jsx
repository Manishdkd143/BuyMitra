import { NavLink, Outlet } from "react-router-dom";
import {
  Boxes,
  PackagePlus,
  AlertTriangle,
  Archive,
  Upload,
  ArrowLeft,
  LayoutDashboard
} from "lucide-react";
import DistributorHeader from "../../../../layouts/DistributorHeader";

const ProductManagementLayout = () => {

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;

  return (
  <div className="flex flex-col min-h-screen bg-[#0B0F1A]">
  {/* ================= HEADER ================= */}
  <DistributorHeader />

  {/* ================= BODY ================= */}
  <div className="flex flex-1">
    
    {/* ================= SIDEBAR ================= */}
    <aside className="w-64 bg-[#0B0F1A] border-r border-gray-800 text-white flex flex-col">
      
      {/* BRAND / PAGE TITLE
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <Boxes className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Products</h1>
            <p className="text-xs text-gray-400">Management</p>
          </div>
        </div>
      </div> */}

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
          Product Management
        </p>

        <NavLink to="/distributor/products/manage/all" className={linkClass}>
          <Boxes className="w-5 h-5" />
          <span>All Products</span>
        </NavLink>

        <NavLink to="/distributor/products/manage/add" className={linkClass}>
          <PackagePlus className="w-5 h-5" />
          <span>Add Product</span>
        </NavLink>

        <NavLink to="/distributor/products/manage/low-stock" className={linkClass}>
          <AlertTriangle className="w-5 h-5" />
          <span>Low Stock</span>
        </NavLink>

        <NavLink to="/distributor/products/manage/out-stock" className={linkClass}>
          <Archive className="w-5 h-5" />
          <span>Out of Stock</span>
        </NavLink>

        <NavLink to="/distributor/products/manage/bulk-upload" className={linkClass}>
          <Upload className="w-5 h-5" />
          <span>Bulk Upload</span>
        </NavLink>
      </nav>

      {/* LOGOUT */}
      {/* <div className="p-3 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                     text-gray-400 hover:bg-red-500/10 hover:text-red-400 
                     transition-all duration-200 font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div> */}
    </aside>

    {/* ================= MAIN CONTENT ================= */}
    <main className="flex-1 bg-[#0B0F1A] overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <Outlet />
      </div>
    </main>
  </div>
</div>

  );
};
export default ProductManagementLayout;
