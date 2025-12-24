import { useEffect, useState } from "react";
import {
  Search,
  MoreVertical,
  Users,
  IndianRupee,
  ShieldOff,
  Eye,
  FileText,
} from "lucide-react";

const customersMock = [
  {
    id: "c1",
    name: "Rahul Sharma",
    phone: "98xxxxxx23",
    email: "rahul@gmail.com",
    totalOrders: 24,
    totalSpent: 12400,
    outstanding: 1200,
    lastOrder: "2 days ago",
    status: "active",
  },
  {
    id: "c2",
    name: "Amit Verma",
    phone: "97xxxxxx11",
    email: "amit@gmail.com",
    totalOrders: 8,
    totalSpent: 5600,
    outstanding: 0,
    lastOrder: "12 days ago",
    status: "blocked",
  },
];

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    setCustomers(customersMock);
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchStatus = status === "all" || c.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 text-gray-200">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Customers</h1>
            <p className="text-sm text-gray-400">
              Manage buyers who purchase from your shop
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl
                          bg-indigo-600/20 text-indigo-400">
            <Users size={18} />
            <span className="font-medium">
              {filteredCustomers.length} Customers
            </span>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col md:flex-row gap-4
                        bg-white/5 border border-white/10
                        rounded-2xl p-4">

          {/* SEARCH */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400"
                    size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl
                         bg-[#0B0F1A] border border-white/10
                         focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* STATUS */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#0B0F1A] border border-white/10
                       rounded-xl px-4 py-2.5"
          >
            <option value="all">All Customers</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-2xl
                        border border-white/10 bg-white/5">
          <table className="min-w-full text-sm">
            <thead className="bg-white/10 text-gray-300">
              <tr>
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-left">Orders</th>
                <th className="px-5 py-3 text-left">Total Spent</th>
                <th className="px-5 py-3 text-left">Outstanding</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Last Order</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-400">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id}
                      className="border-t border-white/10
                                 hover:bg-white/10 transition">
                    <td className="px-5 py-4">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-400">
                        {c.phone} • {c.email}
                      </div>
                    </td>

                    <td className="px-5 py-4">{c.totalOrders}</td>

                    <td className="px-5 py-4">
                      ₹{c.totalSpent.toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`font-medium ${
                          c.outstanding > 0
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        ₹{c.outstanding}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs
                        ${
                          c.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-400">
                      {c.lastOrder}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4 text-right relative">
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === c.id ? null : c.id)
                        }
                        className="p-2 rounded-lg hover:bg-white/10"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenu === c.id && (
                        <div className="absolute right-5 top-12 z-20
                                        w-44 rounded-xl bg-[#0B0F1A]
                                        border border-white/10 shadow-xl">
                          <ActionItem icon={<Eye size={14} />} text="View Profile" />
                          <ActionItem icon={<FileText size={14} />} text="View Orders" />
                          <ActionItem icon={<IndianRupee size={14} />} text="View Ledger" />
                          <div className="border-t border-white/10 my-1" />
                          <ActionItem
                            icon={<ShieldOff size={14} />}
                            text={c.status === "active" ? "Block Customer" : "Unblock Customer"}
                            danger
                          />
                        </div>
                      )}
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

export default CustomerList;

/* ================= ACTION ITEM ================= */
const ActionItem = ({ icon, text, danger }) => (
  <button
    className={`w-full flex items-center gap-2 px-4 py-2 text-sm
      ${danger
        ? "text-red-400 hover:bg-red-500/10"
        : "text-gray-300 hover:bg-white/10"
      }`}
  >
    {icon}
    {text}
  </button>
);