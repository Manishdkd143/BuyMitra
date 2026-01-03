import { Bell, LogOut, User,Lock, Menu} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useState,useEffect, useRef } from "react";
import { getUserProfile } from "../../../services/user/userProfile.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const DistributorHeader = ({onMenuClick}) => {
  const { user,logout} = useAuth();
  const navigate=useNavigate();
  const [section, setSection] = useState("Dashboard")
const [profile, setProfile] = useState(null)
const  [open, setOpen] = useState(false);
const menuRef=useRef();
useEffect(() => {
  const path = location.pathname;
  if (path.includes("/products")) setSection("Product Management");
  else if (path.includes("/orders")) setSection("Order Management");
  else if (path.includes("/customers")) setSection("Customer Management");
  else setSection("Dashboard");
  const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
}, [location.pathname]);
  
  return (
     <header className="h-16 text-white  bg-linear-to-br from-slate-900 via-purple-700 to-slate-700 border-b border-gray-200 px-6 flex items-center justify-between  sticky top-0 z-40 
          bg-gray-800/90 backdrop-blur-md 
          shadow-sm">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-gray-300 hover:text-white" onClick={onMenuClick}>
            <Menu className="w-7 h-7" />
          </button>
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
          BM
        </div>
        <div>
          <p className="font-semibold text-gray-50">Distributor Panel</p>
          <p className="text-xs text-gray-50">{`${section}`}</p>
        </div>
      </div>

    {/* RIGHT */}
{/* Profile Pic */}
<div className="relative flex items-center gap-4">
  <button
    onClick={() => setOpen(!open)}
    className="w-10 h-10 rounded-full overflow-hidden border cursor-pointer transition  border-gray-700 hover:border-blue-500 "
  >
    <img
      src={user?.profilePic || "/default-avatar.png"}
      alt="Profile"
      className="w-full h-full object-cover"
    />
  </button>

  {open && (
    <div className="absolute right-0 top-9 mt-2 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
      {/* Actions */}
      <button
        onClick={() => {
          navigate("/distributor/account");
          setOpen(false);
        }}
        className="w-full px-4 py-2 text-sm flex items-center gap-3 text-gray-300 hover:bg-gray-800 rounded-t-lg"
      >
        <User size={16} />
        Profile
      </button>

      <button
        onClick={() => {
          navigate("/distributor/account/change-password");
          setOpen(false);
        }}
        className="w-full px-3 py-2 text-sm flex items-center gap-1 text-gray-300 hover:bg-gray-800"
      >
        <Lock size={16} />
        Change Password
      </button>

      <button
        onClick={logout}
        className="w-full px-4 py-2 text-sm flex items-center gap-3 text-gray-300 hover:bg-gray-800 rounded-b-lg"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  )}
          <div className="leading-tight">
            <p className="text-sm font-medium text-gray-50">
              {user?.name || "Distributor"}
            </p>
            <p className="text-xs text-gray-50">
              Distributor ID: #{user?._id?.slice(-4)}
            </p>
          </div>
          </div>
    </header>
  );
};

export default DistributorHeader;
