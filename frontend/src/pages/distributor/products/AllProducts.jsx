import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  PlusCircle,
  Eye,
  Trash,
  AlertCircle,
  Package,
  TrendingUp,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  deleteProduct,
  getDistributorProducts,
} from "../../../services/distributor/products.service";
import useDebounce from "../../../hooks/useDebounce";

const AllProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  /* ---------------- LOAD PRODUCTS ---------------- */
  const loadProducts = async (page = 1, searchText = "") => {
    try {
      setLoading(true);
      const res = await getDistributorProducts({
        page,
        limit: 10,
        search: searchText,
      });
  console.log(res.data)
      setProducts(res.data.products || []);
      setMeta({
        currentPage: res.data.meta.page,
        totalPages: res.data.meta.totalPages,
        totalProducts: res.data.meta.total,
      });
    } catch (err) {
      console.error("Product fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1, "");
  }, []);

  useEffect(() => {
    loadProducts(1, debouncedSearch || "");
  }, [debouncedSearch]);

  /* ---------------- STOCK FORMAT ---------------- */
  const formatStock = useCallback((product,quantity) => {
    const stock = Number(quantity) || 0;
    const unitsPerBase = Number(product.unitsPerBase) || 1;

    if (product.unit === "piece") {
      return `${stock} pcs`;
    }

    if (unitsPerBase <= 0) {
      return `${stock} pcs`;
    }

    const baseQty = (stock / unitsPerBase).toFixed(2);
    return `${baseQty} ${product.unit} (${stock} pcs)`;
  }, []);

  /* ---------------- DELETE PRODUCT ---------------- */
  const removeProduct = useCallback(
    async (productId) => {
      if (!window.confirm("Are you sure you want to delete this product?"))
        return;

      try {
        await deleteProduct(productId);
        loadProducts(meta.currentPage, debouncedSearch);
      } catch (err) {
        console.error("Product deletion error:", err);
      }
    },
    [meta.currentPage, debouncedSearch]
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Product Inventory</h1>
            <div className="mt-3 text-slate-300">
              <span className="font-bold text-white">{meta.totalProducts}</span>{" "}
              Total Products
            </div>
          </div>

          <button
            onClick={() => navigate("/distributor/products/manage/add")}
            className="flex items-center h-1/2 gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2  rounded-xl font-semibold"
          >
            <PlusCircle className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* SEARCH */}
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

        {/* TABLE */}
        <div className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                {[
                  "Product",
                  "SKU",
                  "Category",
                  "Price",
                  "Stock",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-sm text-slate-300 text-center"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center text-slate-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center text-slate-400">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const stockQty = p.quantity || 0;
                  const lowStock = stockQty < 10;

                  return (
                    <tr
                      key={p.product._id}
                      className="hover:bg-slate-800/40 cursor-pointer"
                      onClick={() =>
                        navigate(`/distributor/products/manage/all/product/${p.product._id}`)
                      }
                    >
                      {/* PRODUCT */}
                      <td className="px-6 py-4 flex items-center gap-4">
                        <img
                          src={p.product.thumbnail}
                          alt={p.product.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-white">
                            {p.product.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {p.product.brand || "No brand"}
                          </p>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-6 py-4 text-center text-slate-300">
                        {p.product.sku}
                      </td>

                      {/* CATEGORY */}
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 text-xs bg-blue-500/10 text-blue-400 rounded-lg">
                          {p.product.category?.name || "General"}
                        </span>
                      </td>

                      {/* PRICE */}
                      <td className="px-6 py-4 text-center font-bold text-white">
                        ₹{p.product.price}
                      </td>

                      {/* STOCK */}
                      <td className="px-6 py-4 text-center font-semibold">
                        <span
                          className="text-emerald-400"
                        >
                          {formatStock(p.product,p.quantity)}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 text-xs rounded-lg ${
                            lowStock
                              ? "bg-red-500/10 text-red-400"
                              : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {lowStock ? "Low Stock" : "In Stock"}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeProduct(p.product._id);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {/* PAGINATION */}{" "}
          {meta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 p-2">
              {" "}
              <div className="text-sm text-slate-400">
                {" "}
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
                products{" "}
              </div>{" "}
              <div className="flex items-center gap-2">
                {" "}
                <button
                  disabled={meta.currentPage === 1}
                  onClick={() =>
                    loadProducts(meta.currentPage - 1, debouncedSearch || "")
                  }
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-lg font-medium text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {" "}
                  <ChevronLeft className="w-4 h-4" /> Previous{" "}
                </button>{" "}
                <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  {" "}
                  <span className="text-sm font-semibold text-white">
                    {" "}
                    {meta.currentPage}{" "}
                  </span>{" "}
                  <span className="text-slate-500 text-sm">/</span>{" "}
                  <span className="text-sm font-semibold text-slate-400">
                    {" "}
                    {meta.totalPages}{" "}
                  </span>{" "}
                </div>{" "}
                <button
                  disabled={meta.currentPage === meta.totalPages}
                  onClick={() =>
                    loadProducts(meta.currentPage + 1, debouncedSearch || "")
                  }
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-lg font-medium text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {" "}
                  Next <ChevronRight className="w-4 h-4" />{" "}
                </button>{" "}
              </div>{" "}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
