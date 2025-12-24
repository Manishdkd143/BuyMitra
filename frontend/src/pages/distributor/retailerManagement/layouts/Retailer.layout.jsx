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
} from "lucide-react";
import DistributorHeader from "../../../../layouts/DistributorHeader"; // same header
import { useAuth } from "../../../../context/AuthContext";

const RetailerLayout = () => {
  const { logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition
     ${
       isActive
         ? "bg-indigo-600 text-white shadow-md"
         : "text-gray-300 hover:bg-gray-800 hover:text-white"
     }`;
       const sectionTitle =
    "px-4 pt-5 pb-2 text-xs font-semibold text-gray-400 uppercase";

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* ================= HEADER ================= */}
      <DistributorHeader />

      {/* ================= BODY ================= */}
      <div className="flex flex-1">
        {/* =============== SIDEBAR ================= */}
          <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
          {/* LOGO
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold">
                BM
              </div>
              <div>
                <h1 className="text-lg font-bold">BuyMitra</h1>
                <p className="text-xs text-gray-400">Retailer Panel</p>
              </div>
            </div>
          </div> */}

          {/* NAVIGATION */}
          <nav className="flex-1 overflow-y-auto pb-4">
            {/* DASHBOARD */}
            <p className={sectionTitle}>Main</p>
            <NavLink to="/distributor/dashboard" className={linkClass}>
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>
 {/* ===== RETAILER MANAGEMENT (CORE) ===== */}
            <p className={sectionTitle}>Retailer Management</p>

            <NavLink to="/retailer/retailers/add" className={linkClass}>
              <UserPlus className="w-4 h-4" />
              Add Retailer
            </NavLink>

            <NavLink to="/distributor/retailers/manage/all" className={linkClass}>
              <Users className="w-4 h-4" />
              Retailer List
            </NavLink>

            <NavLink to="/retailer/retailers/pending" className={linkClass}>
              <UserCheck className="w-4 h-4" />
              Pending Approvals
            </NavLink>

            <NavLink to="/retailer/retailers/ledger" className={linkClass}>
              <IndianRupee className="w-4 h-4" />
              Retailer Ledger
            </NavLink>

            <NavLink to="/retailer/retailers/activity" className={linkClass}>
              <ListChecks className="w-4 h-4" />
              Retailer Activity
            </NavLink>

            {/* PAYMENTS */}
            <p className={sectionTitle}>Finance</p>
            <NavLink to="/retailer/payments" className={linkClass}>
              <IndianRupee className="w-4 h-4" />
              Payments
            </NavLink>
           

           

            {/* PROFILE */}
            <p className={sectionTitle}>Account</p>
            <NavLink to="/retailer/profile" className={linkClass}>
              <FileText className="w-4 h-4" />
              Business Profile
            </NavLink>
          </nav>

          {/* LOGOUT */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                         text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* =============== MAIN CONTENT ================= */}
        <main className="flex-1 bg-[#0B0F1A] overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RetailerLayout;
