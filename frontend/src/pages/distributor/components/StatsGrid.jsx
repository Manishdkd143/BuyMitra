import { Users, ShoppingCart, Package, DollarSign } from "lucide-react";
import StatCard from "./StatCard";

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatCard
        label="Retailers"
        value={stats.totalRetailers}
        icon={<Users />}
        color="from-blue-500 to-blue-600"
      />
      <StatCard
        label="Active Orders"
        value={stats.activeOrders}
        icon={<ShoppingCart />}
        color="from-emerald-500 to-emerald-600"
      />
      <StatCard
        label="Products"
        value={stats.totalProducts}
        icon={<Package />}
        color="from-purple-500 to-purple-600"
      />
      <StatCard
        label="Monthly Revenue"
        value={`₹${stats.monthlyRevenue}`}
        icon={<DollarSign />}
        color="from-orange-500 to-orange-600"
      />
    </div>
  );
};

export default StatsGrid;
