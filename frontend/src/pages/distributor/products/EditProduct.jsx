import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getDistributorProductById,
  updateProduct,
} from "../../../services/distributor/products.service";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
const [thumbnailPreview, setThumbnailPreview] = useState(null);
const [imagesPreview, setImagesPreview] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    wholesalePrice: "",
    gst: 18,
    unit: "piece",
    unitsPerBase: 1,
    stock: "",
    status: "active",
    brand: "",
    category: "",
    thumbnail: null,
    images: [],
  });

  /* ---------------- LOAD PRODUCT ---------------- */
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await getDistributorProductById(productId);
        const { product, stock } = res.data;

        setForm({
          name: product.name,
          description: product.description || "",
          price: product.price,
          wholesalePrice: product.wholesalePrice,
          gst: product.gst,
          unit: product.unit,
          unitsPerBase: product.unitsPerBase || 1,
          stock:
            product.unit === "piece"
              ? stock
              : stock / (product.unitsPerBase || 1), // Convert to base unit for display
          status: product.status,
          brand: product.brand || "",
          category: product.category?.name || "",
        });
      } catch {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  /* ---------------- HANDLE CHANGE ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      if (name === "unit") {
        return {
          ...prev,
          unit: value,
          unitsPerBase: value === "piece" ? 1 : prev.unitsPerBase,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };
const handleThumbnailChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setForm(prev => ({ ...prev, thumbnail: file }));
  setThumbnailPreview(URL.createObjectURL(file));
};

// Multiple images
const handleImagesChange = (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  setForm(prev => ({
    ...prev,
    images: [...(prev.images || []), ...files],
  }));

  setImagesPreview(prev => [
    ...prev,
    ...files.map(file => URL.createObjectURL(file)),
  ]);
};

// Remove selected image
const removeImage = (index) => {
  setForm(prev => ({
    ...prev,
    images: prev.images.filter((_, i) => i !== index),
  }));

  setImagesPreview(prev => prev.filter((_, i) => i !== index));
};
  /* ---------------- SUBMIT ---------------- */

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (
    form.unit !== "piece" &&
    (!form.unitsPerBase || Number(form.unitsPerBase) <= 0)
  ) {
    toast.error("Units per base required");
    return;
  }

  if (!form.stock || Number(form.stock) < 0) {
    toast.error("Valid stock required");
    return;
  }

  setSaving(true);
  try {
    const stockInPieces =
      form.unit === "piece"
        ? Number(form.stock)
        : Number(form.stock) * Number(form.unitsPerBase);

    // ✅ FormData (ONLY solution)
    const formData = new FormData();

    // text fields
    Object.entries({
      ...form,
      unitsPerBase: Number(form.unitsPerBase),
      stock: stockInPieces,
    }).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // image fields
    // if (form.thumbnail) {
    //   formData.append("thumbnail", form.thumbnail);
    // }

    // if (form.images?.length) {
    //   form.images.forEach((img) => {
    //     formData.append("images", img);
    //   });
    // }

    console.log("FormData payload:", [...formData.entries()]);

    const res=await updateProduct(productId, formData).then(res=>res.data);
   console.log("new Products",res.product);
   
    toast.success("Product updated successfully");
    setTimeout(() => {
      navigate("/distributor/products/manage/all");
    }, 500);
  } catch (err) {
    toast.error(err?.response?.data?.message || "Update failed");
  } finally {
    setSaving(false);
  }
};


  if (loading) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Update Product</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-xl border border-white/10"
      >
        <Input 
          label="Name" 
          name="name" 
          value={form.name} 
          onChange={handleChange}
          required 
        />

        {/* LOCKED */}
        <Input label="SKU" value="Locked" disabled />
        <Input label="Slug" value="Locked" disabled />

        <Input
          label="Price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={handleChange}
          required
        />
        <Input
          label="Wholesale Price"
          name="wholesalePrice"
          type="number"
          step="0.01"
          min="0"
          value={form.wholesalePrice}
          onChange={handleChange}
          required
        />
        <Input
          label="GST (%)"
          name="gst"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={form.gst}
          onChange={handleChange}
          required
        />

        {/* UNIT */}
        <div>
          <label className="text-sm text-gray-300 block mb-1">Unit</label>
          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
          >
            <option value="piece">Piece</option>
            <option value="kg">Kg</option>
            <option value="litre">Litre</option>
            <option value="packet">Packet</option>
          </select>
        </div>

        {/* unitsPerBase */}
        {form.unit !== "piece" && (
          <Input
            label={`Units per ${form.unit}`}
            name="unitsPerBase"
            type="number"
            step="0.01"
            min="0.01"
            value={form.unitsPerBase}
            onChange={handleChange}
            required
          />
        )}

        {/* STOCK */}
        <Input
          label={`Stock (${form.unit})`}
          name="stock"
          type="number"
          step="1"
          min="0"
          value={form.stock}
          onChange={handleChange}
          required
        />
        <Input 
          label="category" 
          name="category" 
          value={form.category} 
          onChange={handleChange}
          required 
        />

        <Input 
          label="Brand" 
          name="brand" 
          value={form.brand} 
          onChange={handleChange} 
        />

        <div>
          <label className="text-sm text-gray-300 block mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
{/* THUMBNAIL */}
<div className="md:col-span-2">
  <label className="text-sm text-gray-300 block mb-1">
    Thumbnail (optional)
  </label>

  {thumbnailPreview && (
    <img
      src={thumbnailPreview}
      alt="Thumbnail preview"
      className="w-32 h-32 object-cover rounded-lg mb-3 border border-white/20"
    />
  )}

  <input
    type="file"
    accept="image/*"
    onChange={handleThumbnailChange}
    className="block w-full text-sm text-gray-300
               file:mr-4 file:py-2 file:px-4
               file:rounded-lg file:border-0
               file:text-sm file:bg-gray-700
               file:text-white hover:file:bg-gray-600"
  />
</div>
{/* IMAGES */}
<div className="md:col-span-2">
  <label className="text-sm text-gray-300 block mb-2">
    Product Images (optional)
  </label>

  {imagesPreview.length > 0 && (
    <div className="flex flex-wrap gap-4 mb-3">
      {imagesPreview.map((img, idx) => (
        <div key={idx} className="relative">
          <img
            src={img}
            alt="preview"
            className="w-28 h-28 object-cover rounded-lg border border-white/20"
          />
          <button
            type="button"
            onClick={() => removeImage(idx)}
            className="absolute -top-2 -right-2 bg-red-600 text-white
                       w-6 h-6 rounded-full text-xs"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={handleImagesChange}
    className="block w-full text-sm text-gray-300
               file:mr-4 file:py-2 file:px-4
               file:rounded-lg file:border-0
               file:text-sm file:bg-gray-700
               file:text-white hover:file:bg-gray-600"
  />
</div>
        <div className="md:col-span-2">
          <label className="text-sm text-gray-300 block mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
          />
        </div>

        <div className="md:col-span-2 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saving} 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition"
          >
            {saving ? "Saving..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm text-gray-300 block mb-1">{label}</label>
    <input
      {...props}
      className="w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
);
export default EditProduct;
