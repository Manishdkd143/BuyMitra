import { useState,useEffect } from "react";
import { Boxes, AlertTriangle, Layers, ShoppingCart, TrendingUp, Package, Download, Filter, TrendingDown, Archive } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { getDistributorDashboard } from "../../services/distributor/dashboard.service";
import toast from "react-hot-toast";
import LowStockByCategory from "./components/LowStockByCategory";
import CategorySummary from "./components/CategorySummary";
import InventoryTable from "./components/InventoryTable";
const DistributorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const res = await getDistributorDashboard()
      console.log("Dashboard data",res.data);
      setData(res.data);
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (

      <div className="p-6 space-y-6 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* HEADER */}
      <div className={`bg-linear-to-r  from-indigo-600 to-blue-600 p-6 rounded-xl text-white shadow-lg`}>
        <h1 className="text-3xl font-bold">Inventory Reports</h1>
        <p className="text-blue-100 mt-1">
          Stock overview, low inventory & category insights
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Products"
          value={data?.totalProducts}
          icon={<Boxes/>}
          color="from-blue-500 to-blue-600"
          path="/distributor/products/manage/all"
        />
        <StatCard
          title="Low Stock Categories"
          value={data.lowCategoryProducts?.length}
          icon={<AlertTriangle/>}
          color="from-red-500 to-red-600"
          path="/distributor/products/manage/low-stock"
        />
        <StatCard
          title="Categories"
          value={data.categorySummary?.length}
          icon={<Layers />}
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockByCategory data={data.lowCategoryProducts}  />
        <CategorySummary data={data.categorySummary} />
      </div>

      {/* INVENTORY TABLE */}
      <InventoryTable data={data.inventoryList} />
    </div>
  );
};

const StatCard = ({ title, value, icon, color,path }) => {
   const navigate=useNavigate()
   const handleNavigate=(path)=>{
  setTimeout(() => {
     navigate(path)
  }, 800);
}
  return(

  <div className={`bg-linear-to-br ${color} p-6 rounded-xl  text-white shadow-lg transform transition hover:scale-105`}>
    <div className="flex items-center justify-between" onClick={()=>handleNavigate(path)}>
      <div>
        <p className="text-sm opacity-90 mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className=" bg-opacity-20 p-3 rounded-lg">
        {icon}
      </div>
    </div>
  </div>

);
}



export default DistributorDashboard;
