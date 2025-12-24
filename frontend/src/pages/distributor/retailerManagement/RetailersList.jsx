import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Users,
  IndianRupee,
  CheckCircle,
  XCircle,
} from "lucide-react";

const retailersMock = [
  {
    id: 1,
    shopName: "Gupta Kirana Store",
    ownerName: "Ramesh Gupta",
    phone: "98xxxxxx21",
    city: "Indore",
    creditLimit: 50000,
    outstanding: 8200,
    status: "active",
    lastOrder: "2 days ago",
  },
  {
    id: 2,
    shopName: "Sharma General",
    ownerName: "Amit Sharma",
    phone: "97xxxxxx11",
    city: "Bhopal",
    creditLimit: 30000,
    outstanding: 0,
    status: "blocked",
    lastOrder: "15 days ago",
  },
];

const RetailersList = () => {
  const [retailers, setRetailers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    // later replace with API
    setRetailers(retailersMock);
  }, []);

  return (
    <div className="p-6 text-gray-200">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Retailer List</h1>
            <p className="text-sm text-gray-400">
              Manage all your retailers and their credit status
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 text-indigo-400">
            <Users size={18} />
            <span className="font-medium">{retailers.length} Retailers</span>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col md:flex-row gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">

          {/* SEARCH */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by shop / owner / phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0F1A]
                         border border-white/10 focus:outline-none
                         focus:border-indigo-500"
            />
          </div>

          {/* STATUS FILTER */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0B0F1A] border border-white/10 rounded-xl
                         px-4 py-2.5 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
          <table className="min-w-full text-sm">
            <thead className="bg-white/10 text-gray-300">
              <tr>
                <th className="px-5 py-3 text-center">Shop</th>
                <th className="px-5 py-3 text-center">Owner</th>
                <th className="px-5 py-3 text-center">City</th>
                <th className="px-5 py-3 text-center">Credit</th>
                <th className="px-5 py-3 text-center">Outstanding</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Last Order</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {retailers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-400">
                    No retailers found
                  </td>
                </tr>
              ) : (
                retailers.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-white/10 hover:bg-white/10 transition"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium">{r.shopName}</div>
                      <div className="text-xs text-gray-400">{r.phone}</div>
                    </td>

                    <td className="px-5 py-4">{r.ownerName}</td>
                    <td className="px-5 py-4">{r.city}</td>

                    <td className="px-5 py-4">
                      ₹{r.creditLimit.toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      <div
                        className={`flex items-center gap-1 font-medium
                        ${r.outstanding > 0 ? "text-red-400" : "text-green-400"}`}
                      >
                        <IndianRupee size={14} />
                        {r.outstanding}
                      </div>
                    </td>

                    <td className="px-5 py-4 ">
                      {r.status === "active" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1
                                         text-xs rounded-full bg-green-500/20 text-green-400">
                          <CheckCircle size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1
                                         text-xs rounded-full bg-red-500/20 text-red-400">
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-gray-400">
                      {r.lastOrder}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button className="p-2 rounded-lg hover:bg-white/10">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default RetailersList;
