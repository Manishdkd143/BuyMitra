import { useState } from "react";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { bulkUploadProducts } from "../../../services/distributor/products.service";

const BulkUploadProducts = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (
      !selected.name.endsWith(".xlsx") &&
      !selected.name.endsWith(".xls")
    ) {
      toast.error("Only Excel files allowed (.xls, .xlsx)");
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await bulkUploadProducts(formData);
      if(response.status===200){

        toast.success("Products uploaded successfully");
      }
      setFile(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Bulk upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black p-6 text-white">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-2">
          Bulk Upload Products
        </h1>
        <p className="text-gray-400 mb-6">
          Upload products using Excel (.xls / .xlsx)
        </p>

        {/* Upload Box */}
        <div className="border border-dashed border-white/20 rounded-xl p-8 bg-white/5">
          <div className="flex flex-col items-center justify-center text-center gap-4">

            <FileSpreadsheet size={48} className="text-green-400" />

            <p className="text-gray-300">
              Select Excel file with product & inventory data
            </p>

            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
              id="excelUpload"
            />

            <label
              htmlFor="excelUpload"
              className="cursor-pointer px-5 py-2 rounded-lg
                         bg-gray-700 hover:bg-gray-600"
            >
              Choose File
            </label>

            {file && (
              <p className="text-sm text-blue-400">
                Selected: {file.name}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-6 gap-4">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg
                       bg-blue-600 hover:bg-blue-700
                       disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload Products
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-10 bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="font-semibold mb-2">Excel Rules</h3>
          <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
            <li>SKU must be unique</li>
            <li>Category auto-creates if not exists</li>
            <li>Price & stock must be numbers</li>
            <li>Status should be <b>active</b> or <b>inactive</b></li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default BulkUploadProducts;

