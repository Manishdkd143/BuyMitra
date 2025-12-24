import { useEffect, useState } from "react";
import { AlertTriangle, Search, PackageX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../../hooks/useDebounce";
import { getOutStockProducts } from "../../../services/distributor/products.service";
import toast from "react-hot-toast";

const OutStock = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });

  const loadOutOfStock = async (page = 1) => {
    try {
      setLoading(true);

      const res = await getOutStockProducts({
        page,
        limit: 10,
        search: debouncedSearch,
      }).then(res=>res.data);

      setProducts(res.products || []);
      setMeta({
        currentPage:res.meta.currentPage,
        totalPages:res.meta.totalPages,
        totalProducts:res.meta.totalProducts,
      });
    } catch (err) {
      toast.error("Out of stock fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOutOfStock(1);
  }, [debouncedSearch]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > meta.totalPages) return;
    loadOutOfStock(newPage);
  };

  return (
     <div className="bg-linear-to-br from-slate-950 via-slate-900 to-slate-950  rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <AlertTriangle className="text-red-400" />
        Out Stock Products
      </h2>
       <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by product name, SKU, or brand..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-800/30 border border-slate-700 text-white"
                  />
                </div>
              </div>
  <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-6">
  <div className="space-y-3">
<table className="w-full border-collapse">
  <thead className="bg-slate-800/80 sticky top-0 z-10">
    <tr>
      {[
        "Product",
        "SKU",
        "Category",
        "Available Stock",
        "Stock Status",
      ].map((h) => (
        <th
          key={h}
          className="px-6 py-4 text-sm font-medium text-slate-300 text-center"
        >
          {h}
        </th>
      ))}
    </tr>
  </thead>

  <tbody>
    {loading ? (
      <tr>
        <td colSpan="5" className="py-20 text-center text-slate-400">
          Loading products...
        </td>
      </tr>
    ) : products.length === 0 ? (
      <tr>
        <td colSpan="5" className="py-20 text-center text-slate-400">
          No products found
        </td>
      </tr>
    ) : (
      products.map((product) => {
        const stockQty = product.stock || 0;
        const OutStock = stockQty < 10;

        return (
          <tr
            key={product.productId}
            className="hover:bg-slate-800/40 transition cursor-pointer"
            onClick={() =>
              navigate(
                `/distributor/products/manage/all/product/${product.productId}`
              )
            }
          >
            {/* PRODUCT */}
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-700/50 border border-slate-600 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>

                <div>
                  <p className="font-semibold text-white">
                    {product.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {product.brand || "No brand"}
                  </p>
                </div>
              </div>
            </td>

            {/* SKU */}
            <td className="px-6 py-4 text-center text-slate-300 font-mono">
              {product.sku}
            </td>

            {/* CATEGORY */}
            <td className="px-6 py-4 text-center">
              <span className="px-3 py-1 text-xs bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                {product.categoryName || "General"}
              </span>
            </td>

            {/* AVAILABLE STOCK */}
            <td className="px-6 py-4 text-center text-xl font-bold">
              <span
                className={
                  OutStock ? "text-red-400" : "text-emerald-400"
                }
              >
                {stockQty}
              </span>
            </td>

            {/* STOCK STATUS */}
            <td className="px-6 py-4 text-center">
              <span
                className={`px-3 py-1 text-xs rounded-lg border ${
                  stockQty === 0
                    ? "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    : OutStock
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}
              >
                {stockQty === 0
                  ? "Out of Stock"
                  : OutStock
                  ? "Out Stock"
                  : "In Stock"}
              </span>
            </td>
          </tr>
        );
      })
    )}
  </tbody>
</table>
  </div>

  {/* PAGINATION */}
  {meta.totalPages > 1 && (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-slate-700">
      <div className="text-sm text-slate-400">
        Showing{" "}
        <span className="text-white font-semibold">
          {(meta.currentPage - 1) * 10 + 1}
        </span>{" "}
        to{" "}
        <span className="text-white font-semibold">
          {Math.min(meta.currentPage * 10, meta.totalProducts)}
        </span>{" "}
        of{" "}
        <span className="text-white font-semibold">
          {meta.totalProducts}
        </span>{" "}
        products
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={meta.currentPage === 1}
          onClick={() =>
          handlePageChange(meta.currentPage-1)
          }
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 
                     border border-slate-700/50 hover:border-slate-600 rounded-lg font-medium 
                     text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-alOuted 
                     transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <span className="text-sm font-semibold text-white">
            {meta.currentPage}
          </span>
          <span className="text-slate-500 text-sm">/</span>
          <span className="text-sm font-semibold text-slate-400">
            {meta.totalPages}
          </span>
        </div>

        <button
          disabled={meta.currentPage === meta.totalPages}
          onClick={() =>
            handlePageChange(meta.currentPage+1)
          }
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 
                     border border-slate-700/50 hover:border-slate-600 rounded-lg font-medium 
                     text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-alOuted 
                     transition-all duration-200"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )}
</div>
    </div>
  );
};

export default OutStock;
