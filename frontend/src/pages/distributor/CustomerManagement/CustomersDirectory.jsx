
import { useEffect, useState } from "react";
import useDebounce from '../../../hooks/useDebounce';
import { getCustomersDirectory } from "../../../services/distributor/customer.service";
import { useNavigate } from "react-router-dom";

const CustomerDirectory = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
 
const debouncedSearch=useDebounce(search,300)
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
  });
const navigate=useNavigate();
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getCustomersDirectory({
        page,
        search: debouncedSearch,
      }).then(res=>res.data);

      setCustomers(res.data.customers);
      setMeta(res.data.meta);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCustomers(1);
  }, [debouncedSearch]);

  const handleNavigate=(path)=>{
    setTimeout(() => {
      navigate(path)
    }, 500);
  }
  return (
    <div className="bg-slate-900 p-6 rounded-xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Customer Directory</h1>
          <p className="text-sm text-gray-400">
            Total customers: {meta?.totalCustomers}
          </p>
        </div>

        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name / phone / email"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="text-left py-3">Customer</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-400">
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-400" >
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <CustomerRow key={customer._id} customer={customer} onView={()=>handleNavigate(`/distributor/customers/manage/c/${customer._id}`)}/>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <Pagination
        currentPage={meta.currentPage}
        totalPages={meta.totalPages}
        onPageChange={fetchCustomers}
      />
    </div>
  );
};



const CustomerRow = ({ customer,onView }) => {
  
  return (
    <tr className="border-b border-gray-800 hover:bg-slate-800/50">
      {/* CUSTOMER */}
      <td className="py-3 flex items-center gap-3">
        <img
          src={customer.profilePic}
          alt={customer.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{customer.name}</p>
          <p className="text-xs text-gray-400">
            ID: {customer._id.slice(-6)}
          </p>
        </div>
      </td>

      {/* PHONE */}
      <td>{customer.phone}</td>

      {/* EMAIL */}
      <td>{customer.email || "-"}</td>

      {/* STATUS */}
      <td>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            customer.status === "active"
              ? "bg-green-600/20 text-green-400"
              : customer.status === "suspended"
              ? "bg-red-600/20 text-red-400"
              : "bg-yellow-600/20 text-yellow-400"
          }`}
        >
          {customer.status}
        </span>
      </td>

      {/* DATE */}
      <td className="text-gray-400">
        {new Date(customer.createdAt).toLocaleDateString()}
      </td>
      <td>
        <div className="">
         <button className="hover:text-blue-600 hover:underline cursor-pointer" onClick={onView}>View</button>
        </div>
      </td>
    </tr>
  );
};

const SearchInput = ({ value, onChange, placeholder }) => {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-600"
    />
  );
};
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-end gap-2 mt-6">
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`px-3 py-1 rounded text-sm ${
            currentPage === i + 1
              ? "bg-blue-600 text-white"
              : "bg-slate-700 text-gray-300 hover:bg-slate-600"
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
};


export default CustomerDirectory;

