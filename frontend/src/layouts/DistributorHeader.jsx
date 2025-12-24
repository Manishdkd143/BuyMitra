import { Bell} from "lucide-react";
import { useAuth } from "../context/AuthContext";


const DistributorHeader = () => {
  const { user} = useAuth();


  return (
     <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
          BM
        </div>
        <div>
          <p className="font-semibold text-gray-900">Distributor Panel</p>
          <p className="text-xs text-gray-500">Product Management</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        <button className="relative text-gray-600 hover:text-gray-900">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.[0] || "U"}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-gray-900">
              {user?.name || "Distributor"}
            </p>
            <p className="text-xs text-gray-500">
              Distributor ID: #{user?._id?.slice(-4)}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DistributorHeader;
