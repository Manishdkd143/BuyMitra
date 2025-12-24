import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser,getDistributors } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
const Register = () => {

  const [distributors, setDistributors] = useState([]);
    const navigate = useNavigate();
  const { login } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    role: "retailer",
    password: "",
    confirmPassword: "",
    city: "",
    pincode: "",
    distributorId: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
 useEffect(() => {
    if (!loading ) navigate("/dashboard");
  }, [ loading, navigate]);



  // Fetch distributors on component mount
  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const res = await getDistributors();
        // Your API returns data directly (not wrapped in response.data)
        setDistributors(res.data);
      } catch (error) {
        console.error("Error fetching distributors:", error);
        setError("Failed to load distributors");
      }
    };

    fetchDistributors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     if (file.size > 5 * 1024 * 1024) {
  //       setError("Image size should be less than 5MB");
  //       return;
  //     }
  //     setProfileImage(file);
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setImagePreview(reader.result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // const handleSubmit = async(e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");
  //   setSuccess("");

  //   const { name, email, phone, gender, password, confirmPassword, city, pincode } = formData;

  //   if (!name || !email || !phone || !gender || !password || !confirmPassword || !city || !pincode) {
  //     setError("All required fields must be filled");
  //     setLoading(false);
  //     return;
  //   }

  //   if (password !== confirmPassword) {
  //     setError("Passwords do not match");
  //     setLoading(false);
  //     return;
  //   }

  //   if (password.length < 6) {
  //     setError("Password must be at least 6 characters");
  //     setLoading(false);
  //     return;
  //   }

  //   // Simulate API call
  //       try {
  //     const res = await registerUser(formData);
  //     console.log("frontend",res);
      
  //     if (res?.data) {
  //       setSuccess("Registration successful! Logging in...");
  //       await login({ email, password }, loginUser);
  //       navigate("/dashboard");
  //     } else {
  //       setError("Registration failed!");
  //     }
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Registration error");
  //   } finally {
  //     setLoading(false);
  //   }
  //   // setTimeout(() => {
  //   //   setSuccess("Registration successful! Redirecting to dashboard...");
  //   //   console.log("Form Data:", formData);
  //   //   console.log("Profile Image:", profileImage);
      
  //   //   setLoading(false);
      
  //   //   // Simulate redirect after 2 seconds
  //   //   setTimeout(() => {
  //   //     setSuccess("Demo: Would redirect to dashboard now");
  //   //   }, 2000);
  //   // }, 1500);
  // };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");

  const { name, email, phone, gender, password, confirmPassword, city, pincode } = formData;

  if (!name || !email || !phone || !gender || !password || !confirmPassword || !city || !pincode) {
    setError("All required fields must be filled");
    setLoading(false);
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match");
    setLoading(false);
    return;
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters");
    setLoading(false);
    return;
  }

  try {
    // Convert to FormData
   const formDataToSend = new FormData();
Object.keys(formData).forEach((key) => {
  formDataToSend.append(key, formData[key]);
});

// if (formData.profilePic) {
//   formDataToSend.append("profilePic", formData.profilePic);
// }
console.log("formData",formData);

const res=await registerUser(formDataToSend);
  console.log("res",res);
  
    if (res?.success) {
      setSuccess("Registration successful! Logging in...");
      await login({ email, password }, loginUser);
      navigate("/dashboard");
    } else {
      setError(res?.message || "Registration failed!");
    }
  } catch (err) {
    setError(err.response?.data?.message || "Registration error");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen py-8 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
  <div className="w-full max-w-2xl backdrop-blur-xl bg-white/10 border border-white/20 p-6 sm:p-8 rounded-2xl shadow-2xl my-4">
    
    <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-6 tracking-wide">
      Create Account
    </h2>

    {error && (
      <div className="mb-4 text-sm text-red-300 bg-red-900/30 p-3 rounded-lg border border-red-500/30">
        {error}
      </div>
    )}

    {success && (
      <div className="mb-4 text-sm text-green-300 bg-green-900/30 p-3 rounded-lg border border-green-500/30">
        {success}
      </div>
    )}

    {/* ================= FORM START ================= */}
    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">

      {/* Profile Image Upload - Optional */}
     <div className="flex flex-col items-center mb-4">
  <div className="relative">
    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 border-2 border-blue-400 flex items-center justify-center">
      {imagePreview ? (
        <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      )}
    </div>

    <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition">
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>

      <input
        type="file"
        name="profilePic"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            setFormData({ ...formData, profilePic: file });
            setImagePreview(URL.createObjectURL(file));
          }
        }}
      />
    </label>
  </div>

  <p className="text-xs text-gray-400 mt-2">Profile Photo (Optional)</p>
</div>



      {/* Two Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="relative">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder=" "
            className="peer w-full p-3 bg-transparent border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-blue-400 outline-none placeholder-transparent"
          />
          <label className="absolute left-3 -top-2.5 text-xs text-blue-300 bg-gray-800 px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-300 peer-focus:bg-gray-800 transition-all">
            Full Name *
          </label>
        </div>

        {/* Email */}
        <div className="relative">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder=" "
            className="peer w-full p-3 bg-transparent border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-blue-400 outline-none placeholder-transparent"
          />
          <label className="absolute left-3 -top-2.5 text-xs text-blue-300 bg-gray-800 px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-300 peer-focus:bg-gray-800 transition-all">
            Email *
          </label>
        </div>

        {/* Phone */}
        <div className="relative">
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder=" "
            maxLength="10"
            className="peer w-full p-3 bg-transparent border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-blue-400 outline-none placeholder-transparent"
          />
          <label className="absolute left-3 -top-2.5 text-xs text-blue-300 bg-gray-800 px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-300 peer-focus:bg-gray-800 transition-all">
            Phone *
          </label>
        </div>

        {/* Gender */}
        <div className="relative">
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-blue-400 outline-none appearance-none"
          >
            <option value="">Select Gender *</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* City */}
        <div className="relative">
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder=" "
            className="peer w-full p-3 bg-transparent border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-blue-400 outline-none placeholder-transparent"
          />
          <label className="absolute left-3 -top-2.5 text-xs text-blue-300 bg-gray-800 px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-300 peer-focus:bg-gray-800 transition-all">
            City *
          </label>
        </div>

        {/* Pincode */}
        <div className="relative">
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder=" "
            maxLength="6"
            className="peer w-full p-3 bg-transparent border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-blue-400 outline-none placeholder-transparent"
          />
          <label className="absolute left-3 -top-2.5 text-xs text-blue-300 bg-gray-800 px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-300 peer-focus:bg-gray-800 transition-all">
            Pincode *
          </label>
        </div>
      </div>

      {/* Role */}
      <div className="relative">
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-3 bg-gray-800 border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option value="retailer">Retailer</option>
        </select>
      </div>

      {/* Distributor Selection */}
      {formData.role === "retailer" && (
        <div className="relative">
          <select
            name="distributorId"
            value={formData.distributorId}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="">Select Distributor (Optional)</option>
            {distributors.map((d) => (
              <option key={d._id} value={d._id}>{d.businessName}</option>
            ))}
          </select>
        </div>
      )}

      {/* Password Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder=" "
            className="peer w-full p-3 bg-transparent border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-blue-400 outline-none pr-12 placeholder-transparent"
          />
          <label className="absolute left-3 -top-2.5 text-xs text-blue-300 bg-gray-800 px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-300 peer-focus:bg-gray-800 transition-all">
            Password *
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-300 hover:text-white transition"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder=" "
            className="peer w-full p-3 bg-transparent border border-gray-500 text-white rounded-lg focus:ring-2 focus:ring-blue-400 outline-none pr-12 placeholder-transparent"
          />
          <label className="absolute left-3 -top-2.5 text-xs text-blue-300 bg-gray-800 px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-300 peer-focus:bg-gray-800 transition-all">
            Confirm Password *
          </label>
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-gray-300 hover:text-white transition"
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"         // 🔥 IMPORTANT change
        disabled={loading}
        className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          "Register"
        )}
      </button>

    </form>
    {/* ================= FORM END ================= */}

    <p className="mt-6 text-center text-gray-300 text-sm">
      Already have an account?{" "}
      <span
        className="text-blue-400 cursor-pointer hover:underline font-semibold"
        onClick={() => navigate("/auth/login")}
      >
        Login here
      </span>
    </p>
  </div>
</div>

  );
};

export default Register;