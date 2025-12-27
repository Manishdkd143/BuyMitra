import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";


const Login = () => {
    const navigate = useNavigate();
  const { login,user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!loading ) {
      if (user?.role === "distributor") {
      
          navigate("/distributor/dashboard");
    
  } else if (user?.role === "retailer") {
    setTimeout(() => {
      navigate("/retailer/dashboard");
    }, 500);
  }
    }
  }, [ loading, navigate,user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Both fields are required");
      setLoading(false);
      return;
    }

    const result = await login(formData, loginUser);
      if(result.success&&result.data){
          setLoading(false)
      }
    if (!result.success){
      setError(result?.message||"Invalid credentials!")
       toast.error(result?.message);
      }
      setLoading(false);
  };
    const handleNavigate = (path) => {
    navigate(`${path}`)
  };
  return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
//       <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
//         <h2 className="text-2xl font-bold text-center mb-6">
//           Login to Wholesale Panel
//         </h2>

//         {error && (
//           <p className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded">
//             {error}
//           </p>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-5">
//           {/* Email */}
//           <div>
//             <label className="block mb-1 text-sm font-medium text-gray-700">
//               Email
//             </label>
//             <input
//               type="email"
//               name="email"
//               className="w-full p-3 rounded border text-black border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
//               placeholder="Enter email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {/* Password */}
//           <div className="relative">
//   <label className="block mb-1 text-sm font-medium text-gray-700">
//     Password
//   </label>
//   <input
//     type={showPassword ? "text" : "password"}
//     name="password"
//     className="w-full p-3 rounded text-black border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none pr-12"
//     placeholder="Enter password"
//     value={formData.password}
//     onChange={handleChange}
//     required
//   />

//   {/* Eye Icon */}
//   <button
//     type="button"
//     onClick={() => setShowPassword(!showPassword)}
//     className="absolute right-3 top-[47px] text-gray-500  -translate-y-1/2 text-black-200 hover:text-gray-800 cursor-pointer"
//   >
//     {showPassword ? (
//               // Eye Off Icon - Password is visible
//               <svg 
//                 className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" 
//                 fill="none" 
//                 viewBox="0 0 24 24" 
//                 stroke="currentColor"
//               >
//                 <path 
//                   strokeLinecap="round" 
//                   strokeLinejoin="round" 
//                   strokeWidth={2} 
//                   d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" 
//                 />
//               </svg>
//             ) : (
//               // Eye Icon - Password is hidden
//               <svg 
//                 className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" 
//                 fill="none" 
//                 viewBox="0 0 24 24" 
//                 stroke="currentColor"
//               >
//                 <path 
//                   strokeLinecap="round" 
//                   strokeLinejoin="round" 
//                   strokeWidth={2} 
//                   d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
//                 />
//                 <path 
//                   strokeLinecap="round" 
//                   strokeLinejoin="round" 
//                   strokeWidth={2} 
//                   d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
//                 />
//               </svg>
//             )}
//   </button>
// </div>

//           {/* Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-primary-600 text-white py-3 rounded-lg bg-black font-semibold hover:bg-primary-700 transition disabled:opacity-50"
//           >
//             {loading ? "Processing..." : "Login"}
//           </button>
//         </form>
//      <div className="flex items-center justify-between">
// <p className="mt-4 text-center text-sm text-gray-600">
//           Forgot password?{" "}
//           <span className="text-primary-600 cursor-pointer hover:underline">
//             Reset
//           </span>
//         </p>
//           <div className="mt-4 space-x-2">
//       <button
//         onClick={() => navigate("/register")}
//         className="text-center text-sm text-gray-600 cursor-pointer"
//       >
//         Register
//       </button>
//       <button
//         onClick={() => navigate("/register-admin")}
//         className="text-center text-sm text-gray-600 cursor-pointer"
//       >
//         Register Admin
//       </button>
//     </div>
//      </div>
        
//       </div>
//     </div>
 <div className="min-h-screen py-8 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl shadow-2xl">
        
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-6 tracking-wide">
          Login to Wholesale Panel
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-900/30 p-3 rounded-lg border border-red-500/30">
            {error}
          </div>
        )}

        <div className="space-y-5">
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
              Email
            </label>
          </div>

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
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-300 hover:text-white transition"
            >
              {/* {showPassword ? (
                // Eye Off Icon - Password is visible
                <svg 
                  className="h-5 w-5 text-gray-300 hover:text-white transition-colors" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" 
                  />
                </svg>
              ) : (
                // Eye Icon - Password is hidden
                <svg 
                  className="h-5 w-5 text-gray-300 hover:text-white transition-colors" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                  />
                </svg>
              )} */}
               {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
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
              "Login"
            )}
          </button>
        </div>

        {/* Footer Links */}
        <div className="mt-6 space-y-3">
          {/* Forgot Password */}
          <p className="text-center text-sm text-gray-300">
            Forgot password?{" "}
            <span 
              className="text-blue-400 cursor-pointer hover:underline font-semibold"
              onClick={() => handleNavigate("/auth/forgotpassword")}
            >
              Reset
            </span>
          </p>

          {/* Register Links */}
          <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-600">
            <button
              onClick={() => handleNavigate("/auth/register")}
              className="text-sm text-gray-300 hover:text-blue-400 transition font-medium"
            >
              Register
            </button>
            <span className="text-gray-500">|</span>
            <button
              onClick={() => handleNavigate("/auth/admin/register")}
              className="text-sm text-gray-300 hover:text-blue-400 transition font-medium"
            >
              Register Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

