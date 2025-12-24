import { useState } from "react";
import { PlusCircle, Upload, Trash2 } from "lucide-react";
import { createProduct } from "../../../services/distributor/products.service";
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom";
const AddProduct = () => {
  const [form, setForm] = useState({
  name: "",
  description:undefined,
  price: "",
  wholesalePrice: "",
  stock: "",
  category: "",
  brand: "",
  unit: "piece",
  unitsPerBase: "", 
  gst: 18,
  status: "active",
});
const navigate=useNavigate();
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
const handleInput = (e) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: name === "name" ? value.toLowerCase() : value,
  }));
};


  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreview(previews);
  };

  const removeImage = (index) => {
    const newPreview = [...preview];
    const newImages = [...images];
    newPreview.splice(index, 1);
    newImages.splice(index, 1);
    setPreview(newPreview);
    setImages(newImages);
  };

 const handleSubmit = async (e) => {
  console.log("form",form)
 e.preventDefault()
  if (!images.length) {
    toast.error("At least one image required");
    return;
  }
  if (form.unit !== "piece" && !form.unitsPerBase) {
    toast.error("unitsPerBase required for selected unit");
    return;
  }
  setLoading(true);

  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (value !== "") formData.append(key, value);
  });
  console.log(formData)

  images.forEach((img) => formData.append("images", img));

  try {
    await createProduct(formData);
    toast.success("Product added successfully");
    setTimeout(() => {
      navigate("/distributor/products/manage/all")
    }, 800);
  } catch (err) {
    toast.error("Failed to add product", err?.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black p-6 text-white">
      <div className="max-w-5xl mx-auto bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 border border-white/20 backdrop-blur-xl p-8 rounded-xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <PlusCircle className="w-8 h-8 text-blue-400" />
            Add New Product
          </h1>

          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer"
          >
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* IMAGE UPLOAD */}
          <div>
            <p className="text-lg font-semibold mb-2">Product Images *</p>

            <label className="bg-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 flex items-center gap-2 w-max">
              <Upload size={18} />
              Upload Images
              <input type="file" hidden multiple onChange={handleImageUpload} />
            </label>

            {/* Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {preview.map((src, i) => (
                <div key={i} className="relative">
                  <img
                    src={src}
                    className="w-full h-32 object-cover rounded-lg border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-red-500 p-1 rounded-full"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCT DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <label>Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleInput}
                className="form-input"
                placeholder="product name"
              />
            </div>


            <div>
              <label>Price *</label>
              <input
                name="price"
                value={form.price}
                onChange={handleInput}
                className="form-input"
                placeholder="₹"
              />
            </div>

            <div>
              <label>Wholesale Price *</label>
              <input
                name="wholesalePrice"
                value={form.wholesalePrice}
                onChange={handleInput}
                className="form-input"
                placeholder="Wholesale ₹"
              />
            </div>

            <div>
              <label>Discount (%)</label>
              <input
                name="discount"
                value={form.discount}
                onChange={handleInput}
                className="form-input"
              />
            </div>

           <div>
  <label>
    Stock *
    <span className="text-xs text-gray-400 ml-1">
      (in {form.unit})
    </span>
  </label>
  <input
    type="number"
    name="stock"
    value={form.stock}
    onChange={handleInput}
    className="form-input"
    min="0"
  />
</div>

            <div>
              <label>Category *</label>
              <input
                name="category"
                value={form.category}
                onChange={handleInput}
                className="form-input"
              />
            </div>

            <div>
              <label>Brand</label>
              <input
                name="brand"
                value={form.brand}
                onChange={handleInput}
                className="form-input"
              />
            </div>

            <div>
              <label>GST (%)</label>
              <input
                name="gst"
                value={form.gst}
                onChange={handleInput}
                className="form-input"
              />
            </div>
         
  <div>
  <label>Product Unit *</label>
  <select
    name="unit"
    value={form.unit}
    onChange={handleInput}
    className="form-input"
  >
    <option value="piece">Piece</option>
    <option value="kg">Kilogram (kg)</option>
    <option value="litre">Litre</option>
    <option value="packet">Packet</option>
  </select>
</div>

{/* SHOW WEIGHT ONLY IF UNIT IS NOT PIECE */}
{form.unit !== "piece" && (
  <div>
    <label>
      Units Per {form.unit} *
      <span className="text-xs text-gray-400 ml-1">
        (1 {form.unit} = ? pieces)
      </span>
    </label>

    <input
      type="number"
      name="unitsPerBase"
      value={form.unitsPerBase}
      onChange={handleInput}
      placeholder={`Eg: 1 ${form.unit} = 50 pieces`}
      className="form-input"
      min="1"
      required
    />
  </div>
)}


            <div>
              <label>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleInput}
                className="form-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

          </div>

          <div>
            <label>Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInput}
              className="form-input h-28"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold mt-4"
          >
            {loading ? "Saving..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
