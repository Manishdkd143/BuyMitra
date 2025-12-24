import { NavLink, Outlet } from "react-router-dom";
import {
  Boxes,
  PackagePlus,
  AlertTriangle,
  Archive,
  Upload,
  ArrowLeft
} from "lucide-react";

const ProductManagementLayout = () => {

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-800 box-border">

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col shadow-xl z-50">


        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Products</h1>
              <p className="text-xs text-gray-400">Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-5">

          <NavLink to="/distributor/dashboard" className={linkClass}>
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </NavLink>

          <NavLink to="/distributor/products/manage/all" className={linkClass}>
            <Boxes className="w-5 h-5" />
            <span className="font-medium">All Products</span>
          </NavLink>

          <NavLink to="/distributor/products/manage/add" className={linkClass}>
            <PackagePlus className="w-5 h-5" />
            <span className="font-medium">Add Product</span>
          </NavLink>

          <NavLink to="/distributor/products/manage/low-stock" className={linkClass}>
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Low Stock</span>
          </NavLink>

          <NavLink to="/distributor/products/manage/out-stock" className={linkClass}>
            <Archive className="w-5 h-5" />
            <span className="font-medium">Out of Stock</span>
          </NavLink>

          <NavLink to="/distributor/products/manage/bulk-upload" className={linkClass}>
            <Upload className="w-5 h-5" />
            <span className="font-medium">Bulk Upload</span>
          </NavLink>
          
        </nav>
      </aside>

      {/* MAIN CONTENT */}
     <main className="ml-64 flex-1 min-h-screen overflow-y-auto 
                 bg-linear-to-br from-gray-900 via-gray-800 to-black border-l-2">
        <Outlet />
      </main>

    </div>
  );
};
export default ProductManagementLayout;
