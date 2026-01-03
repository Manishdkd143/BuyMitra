import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  uploadDistributorDocuments,
  updateDistributorProfile,
  deleteDistributorDocument,
  uploadUserProfilePic,
  getCompanyProfile,
} from "../../services/distributor/profile.service";
import { toast } from "react-toastify";
import { Upload, Trash2, FileText } from "lucide-react";

const EditBusinessProfile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profilePic, setProfilePic] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [form, setForm] = useState({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    gstNumber: "",
    city: "",
    state: "",
    pincode: "",
  });

  // ----------------------------
  // Load Company Profile
  // ----------------------------
  const loadProfile = async () => {
    try {
      const res = await getCompanyProfile();
      const data = res.data;
      console.log("profile data",data);
      setProfilePic(data?.profilePic || null);
      setDocuments(data.documents || []);

      setForm({
        businessName: data.businessName || "",
        businessEmail: data.businessEmail || "",
        businessPhone: data.businessPhone || "",
        gstNumber: data.gstNumber || "",
        city: data.businessAddress?.city || "",
        state: data.businessAddress?.state || "",
        pincode: data.businessAddress?.pincode || "",
      });
    } catch (err) {
      console.error("PROFILE LOAD ERROR:", err);
      toast.error("Failed to load company profile!");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadProfile();
  }, []);

  // ----------------------------
  // Form Input Handler
  // ----------------------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ----------------------------
  // Submit Updated Company Details
  // ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateDistributorProfile(form);
      toast.success("Company profile updated!");
      navigate("/distributor/profile");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed!");
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------
  // Upload Company Profile Picture
  // ----------------------------
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("profilePic", file);
    try {
      const res = await uploadUserProfilePic(data);
      setProfilePic(res.data.profilePic);
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error("Failed to upload profile picture!");
    }
  };

  // ----------------------------
  // Upload Company Documents
  // ----------------------------
  const handleDocumentsUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const data = new FormData();
    files.forEach((f) => data.append("documents", f));

    try {
      const res = await uploadDistributorDocuments(data);
      setDocuments(res.data.documents);
      toast.success("Documents uploaded!");
    } catch (err) {
      toast.error("Failed to upload documents!");
    }
  };

  // ----------------------------
  // Delete Document
  // ----------------------------
  const handleDeleteDocument = async (docId) => {
    try {
      await deleteDistributorDocument(docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      toast.success("Document deleted!");
    } catch {
      toast.error("Failed to delete document!");
    }
  };

  // ----------------------------
  // Loading State
  // ----------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        Loading company profile...
      </div>
    );
  }

  // ----------------------------
  // MAIN UI
  // ----------------------------
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black p-6 text-white">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-xl shadow-2xl">

        <h1 className="text-3xl font-bold mb-8">Edit Company Profile</h1>

        {/* PROFILE PICTURE */}
        <div className="mb-10">
          <p className="text-lg font-semibold mb-3">Company Profile Picture</p>

          <div className="flex items-center gap-6">
           <img
            src={`https://ui-avatars.com/api/?name=${form.businessName}`}
            alt="Company Logo"
            className="w-28 h-28 rounded-full border border-white/20 shadow-lg"
          />

            <label className="bg-blue-600 px-5 py-2 rounded-lg cursor-pointer hover:bg-blue-700 flex items-center gap-2">
              <Upload size={18} />
              Upload
              <input type="file" hidden onChange={handleProfilePicUpload} />
            </label>
          </div>
        </div>

        {/* COMPANY DOCUMENTS */}
        <div className="mb-10">
          <p className="text-lg font-semibold mb-3">Company Documents</p>

          <label className="bg-purple-600 px-5 py-2 rounded-lg cursor-pointer hover:bg-purple-700 flex items-center gap-2">
            <Upload size={18} />
            Upload Documents
            <input type="file" hidden multiple onChange={handleDocumentsUpload} />
          </label>

          <div className="mt-4 space-y-3">
            {documents.length ? (
              documents.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white/5 border border-white/20 p-4 rounded-lg flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-blue-300" />
                    <p className="text-gray-200">{doc.name || "Document"}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <a
                      href={doc.url}
                      target="_blank"
                      className="text-blue-400 underline"
                    >
                      View
                    </a>

                    <button
                      onClick={() => handleDeleteDocument(doc._id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No documents uploaded.</p>
            )}
          </div>
        </div>

        {/* EDIT FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Business Name" name="businessName" value={form.businessName} onChange={handleChange} />
          <Input label="Business Email" name="businessEmail" value={form.businessEmail} onChange={handleChange} />
          <Input label="Business Phone" name="businessPhone" value={form.businessPhone} onChange={handleChange} />
          <Input label="GST Number" name="gstNumber" value={form.gstNumber} onChange={handleChange} />

          <h2 className="text-xl font-semibold mt-8">Business Address</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input name="city" placeholder="City" value={form.city} onChange={handleChange} />
            <Input name="state" placeholder="State" value={form.state} onChange={handleChange} />
            <Input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} />
          </div>

          <button className="w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-700 font-semibold">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBusinessProfile;

/* ---------- Small Input Helper ---------- */
const Input = ({ label, ...props }) => (
  <div>
    {label && <label className="text-sm text-gray-300">{label}</label>}
    <input
      {...props}
      className="w-full mt-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2
                 focus:ring-2 focus:ring-blue-500 outline-none text-gray-200"
    />
  </div>
);
