import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCompanyProfile } from "../../services/distributor/profile.service";
import { 
  Mail, Phone, MapPin, CheckCircle, AlertCircle, FileText, 
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CompanyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadProfile = async () => {
    try {
      const res = await getCompanyProfile();
      setProfile(res.data);
    } catch (err) {
      console.error("PROFILE ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-14 w-14 rounded-full border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-300 mt-4 text-lg">Loading Profile...</p>
        </div>
      </div>
    );
  }

  const fullAddress = profile.businessAddress
    ? `${profile.businessAddress.city}, ${profile.businessAddress.state}, ${profile.businessAddress.pincode}, ${profile.businessAddress.country}`
    : "No address provided";

  return (
   <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black p-6">
  <div className="max-w-5xl mx-auto">

    {/* HEADER */}
    <div className="flex items-center justify-between mb-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white
                   bg-white/10 border border-white/20 px-4 py-2 rounded-lg"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h1 className="text-4xl font-extrabold text-white">
        Company Profile
      </h1>

      <button
        onClick={() => navigate("/distributor/profile/edit")}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white
                   font-semibold rounded-lg shadow-md"
      >
        Edit Profile
      </button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* LEFT CARD – COMPANY BASIC */}
      <div className="lg:col-span-1 backdrop-blur-xl bg-white/10
                      border border-white/20 p-6 rounded-xl shadow-xl">
        <div className="flex flex-col items-center">

          <img
            src={`https://ui-avatars.com/api/?name=${profile.businessName}`}
            alt="Company Logo"
            className="w-28 h-28 rounded-full border border-white/20 shadow-lg"
          />

          <h2 className="text-xl font-semibold text-white mt-4">
            {profile.businessName}
          </h2>

          {profile.approval?.isApproved ? (
            <span className="mt-2 px-3 py-1 bg-green-600/30 text-green-400
                             text-sm rounded-full flex items-center gap-1">
              <CheckCircle className="w-4" />
              Approved Company
            </span>
          ) : (
            <span className="mt-2 px-3 py-1 bg-yellow-600/30 text-yellow-400
                             text-sm rounded-full flex items-center gap-1">
              <AlertCircle className="w-4" />
              Pending Approval
            </span>
          )}
        </div>

        {/* CONTACT INFO */}
        <div className="mt-6 space-y-4 text-gray-300">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-green-400" />
            {profile.businessPhone}
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-400" />
            {profile.businessEmail}
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-red-400" />
            {fullAddress}
          </div>
        </div>
      </div>

      {/* RIGHT – COMPANY DETAILS */}
      <div className="lg:col-span-2 backdrop-blur-xl bg-white/10
                      border border-white/20 p-6 rounded-xl shadow-xl">

        <h2 className="text-2xl font-semibold text-white mb-6">
          Business Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Info label="Business Name" value={profile.businessName} />
          <Info label="GST Number" value={profile.gstNumber} />
          <Info label="Account Status" value={profile.status} />
          <Info label="Company Status" value={profile.isActive ? "Active" : "Inactive"} />
        </div>

        {/* APPROVAL DETAILS */}
        {profile.approval?.isApproved && (
          <div className="mt-8 bg-white/5 p-5 rounded-lg border border-white/10">
            <h3 className="text-xl text-white font-semibold mb-3">
              Approval Information
            </h3>

            <p className="text-gray-300">
              <span className="text-gray-400">Approved By:</span>{" "}
              {profile.approval.approvedBy?.name || "Admin"}
            </p>

            <p className="text-gray-300 mt-1">
              <span className="text-gray-400">Approved At:</span>{" "}
              {new Date(profile.approval.approvedAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* DOCUMENTS */}
        <div className="mt-8 bg-white/5 p-5 rounded-lg border border-white/10">
          <h3 className="text-xl text-white font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Company Documents
          </h3>

          {profile.documents?.length ? (
            profile.documents.map((doc, index) => (
              <div
                key={index}
                className="flex justify-between items-center
                           text-gray-300 bg-white/10 p-3 rounded-lg mb-2"
              >
                <span>{doc.docType}</span>
                <a
                  href={doc.docUrl}
                  target="_blank"
                  className="text-blue-400 hover:underline"
                >
                  View
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No documents uploaded</p>
          )}
        </div>

      </div>
    </div>
  </div>
</div>

  );
};
const Info = ({ label, value }) => (
  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
    <p className="text-gray-400 text-sm">{label}</p>
    <p className="text-white text-lg font-semibold">
      {value || "—"}
    </p>
  </div>
);


export default CompanyProfile;
