import { useState } from "react";
import { toast } from "react-toastify";
import { addCustomer } from "../../../services/distributor/customer.service";
import { Upload, User } from "lucide-react";

const AddCustomer = () => {
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
const handleFileChange=(e)=>{
    const file=e.target.files[0];
    if(file){
        setProfilePic(file)
        const reader=new FileReader();
        reader.onloadend=()=>{
            setPreviewUrl(reader.result)
        }
        reader.readAsDataURL(file)
    }
}
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
     
      Object.entries(form).forEach(([key, value]) => {
        if (value) payload.append(key, value);
      });

      if (profilePic) {
        payload.append("profilePic", profilePic);
      }

      await addCustomer(payload);
      toast.success("Customer added successfully");
 
      setForm({
        name: "",
        email: "",
        phone: "",
        gender: "",
        city: "",
        state: "",
        pincode: "",
      });
      setProfilePic(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Add New Customer</h2>
          
          <div className="space-y-8">
            {/* Profile Picture Upload */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-white/60" />
                  )}
                </div>
                <label htmlFor="profilePic" className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-1.5 rounded-full cursor-pointer transition-colors shadow-lg">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    id="profilePic"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Row 1: Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-white  text-start font-medium mb-1.5 text-sm">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-white  text-start font-medium mb-1.5 text-sm">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            {/* Row 2: Phone and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-white  text-start font-medium mb-1.5 text-sm">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-white   text-start font-medium mb-1.5 text-sm">Gender *</label>
                <div className="flex gap-3 items-center h-10">
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <label key={gender} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={form.gender === gender}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-600 bg-white/10 border-white/30 focus:ring-purple-500 focus:ring-2 cursor-pointer"
                      />
                      <span className="ml-1.5 text-white text-sm group-hover:text-purple-300 transition-colors">
                        {gender}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

           

            {/* Address Field */}
           {/* Row 3: City, State, Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="city" className="block text-white  text-start font-medium mb-1.5 text-sm">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-white  text-start font-medium mb-1.5 text-sm">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label htmlFor="pincode" className="block text-white  text-start font-medium mb-1.5 text-sm">
                  Pincode *
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                  placeholder="Enter pincode"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Add Customer'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;
