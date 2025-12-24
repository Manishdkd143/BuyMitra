import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, ArrowLeft, Package, Tag, TrendingUp, Share2, Heart } from "lucide-react";
import { getDistributorProductById } from "../../../services/distributor/products.service";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [stock, setStock] = useState(0); 
  const [activeImg, setActiveImg] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getDistributorProductById(productId);

        setProduct(res.data.product);
        setStock(res.data.stock || 0);

        const imgs =
          res.data.product.images?.length > 0
            ? res.data.product.images
            : res.data.product.thumbnail
            ? [res.data.product.thumbnail]
            : [];

        setActiveImg(imgs[0] || "");
      } catch (err) {
        toast.error("Product fetch error:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading product details...
      </div>
    );
  }

  /* ---------------- NOT FOUND ---------------- */
  if (notFound || !product) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-10 h-10 text-slate-600" />
          </div>
          <p className="text-slate-400 text-xl font-medium">
            Product Not Found
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- CALCULATIONS ---------------- */
  const price = Number(product.price) || 0;
  const gst = Number(product.gst) || 0;
  const wholesalePrice = Number(product.wholesalePrice) || null;

  const gstAmount = (price * gst) / 100;
  const totalPrice = price + gstAmount;


  const displayStock =
    product.unit === "piece"
      ? `${stock} pcs`
      : `${(stock / product.unitsPerBase).toFixed(2)} ${product.unit} (${stock} pcs)`;

  const imageGallery =
    product.images?.length > 0
      ? product.images
      : product.thumbnail
      ? [product.thumbnail]
      : [];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm text-slate-300">Back</span>
            </button>

            <div className="text-sm text-slate-500">
              Products /{" "}
              <span className="text-slate-300 font-medium">
                {product.name}
              </span>
            </div>
          </div>

          {(user?.role === "distributor" || user?.role === "admin") && (
            <button
              onClick={() =>
                navigate(`/distributor/products/manage/edit/${product._id}`)
              }
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
            >
              <Pencil className="w-4 h-4" />
              Edit Product
            </button>
          )}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* IMAGE */}
          <div className="space-y-4">
            <div className="aspect-square bg-slate-800/30 rounded-2xl border border-slate-700/50 flex items-center justify-center">
              {activeImg ? (
                <img src={activeImg} className="max-h-full object-contain" />
              ) : (
                <Package className="w-16 h-16 text-slate-600" />
              )}
            </div>

            {imageGallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {imageGallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(img)}
                    className={`border-2 rounded-xl ${
                      activeImg === img
                        ? "border-blue-500"
                        : "border-slate-700"
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white">{product.name}</h1>

            {product.brand && (
              <p className="text-blue-400 font-semibold">
                Brand: {product.brand}
              </p>
            )}

            {product.description && (
              <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <p className="text-slate-300">{product.description}</p>
              </div>
            )}

            {/* PRICE */}
            <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50 space-y-3">
              <div className="text-4xl font-bold text-white">
                ₹{price.toLocaleString("en-IN")}
              </div>

              {wholesalePrice && (
                <div className="text-blue-400">
                  Wholesale: ₹{wholesalePrice.toLocaleString("en-IN")}
                </div>
              )}

              <div className="text-sm text-slate-400">
                GST ({gst}%): ₹{gstAmount.toFixed(2)}
              </div>

              <div className="text-lg font-semibold text-emerald-400">
                Total: ₹{totalPrice.toLocaleString("en-IN")}
              </div>
            </div>

            {/* META */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Info label="SKU" value={product.sku} />
              <Info
                label="Category"
                value={product.category?.name || "General"}
              />
              <Info label="Stock" value={displayStock} />
              <Info label="Status" value={product.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

 const Info = ({ label, value }) => (
  <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="text-sm font-semibold text-white">{value}</p>
  </div>
);

export default ProductDetails;