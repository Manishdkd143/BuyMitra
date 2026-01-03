// components/EditProfilePage.jsx
import { useState, useEffect } from 'react';
import { Save, X, User, Mail, Phone, MapPin, Upload, Loader2 } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '../../../services/user/userProfile.service';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const EditProfilePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    address: {
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });
const navigate=useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
const [user, setUser] = useState({})
  useEffect(() => {
    // Simulate fetching current user data
    const fetchUser = async () => {
      try {
        // Replace with real API call: await axios.get('/api/users/me')
        // const mockUser = {
        //   name: "Rahul Sharma",
        //   email: "rahul.sharma@example.com",
        //   phone: "9876543210",
        //   gender: "male",
        //   address: {
        //     city: "Lucknow",
        //     state: "Uttar Pradesh",
        //     pincode: "226010",
        //     country: "India"
        //   },
        //   profilePic: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Rahul"
        // };
      const res=  await getUserProfile()
      console.log(res)
      
        setFormData({
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone || '',
          gender: res.data.gender || '',
          address: { ...user.address }
        });

      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };



  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (formData.address.city && !formData.address.city.trim()) {
      newErrors['address.city'] = "City is required if address is provided";
    }
    if (formData.address.pincode && !/^\d{6}$/.test(formData.address.pincode)) {
      newErrors['address.pincode'] = "Pincode must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // In real app:
      // await axios.patch('/api/users/me', formData);
      // if file selected → separate upload endpoint

     const res=await updateUserProfile(formData)
     if(res.data?.success){
      toast.success(res.data?.data.message)
       console.log("Updated profile data:", res.data?.data);
     }
     setTimeout(() => {
      navigate("/distributor/account",{replace:true})
     }, 500);
      
      // Show success toast / redirect
      alert("Profile updated successfully!");
      
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-slate-700">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Edit Profile</h1>
            <p className="mt-2 text-slate-400">Update your personal information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {/* Profile Picture */}
            {/* <div className="flex flex-col items-center sm:items-start gap-6"> */}
              {/* <div className="relative">
                <img
                  src={profilePicPreview || "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=guest"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 bg-slate-800"
                />
                <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-500 transition-colors shadow-lg">
                  <Upload size={18} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="text-sm text-slate-400">Click the camera icon to upload a new photo</p>
            </div> */}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-800/60 border border-slate-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-800/60 border border-slate-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-800/60 border border-slate-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                  placeholder="98765 43210"
                  maxLength={10}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-800/60 border border-slate-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="w-full bg-slate-800/60 border border-slate-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                    placeholder="e.g. Mumbai"
                  />
                  {errors['address.city'] && (
                    <p className="mt-1 text-sm text-red-400">{errors['address.city']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="w-full bg-slate-800/60 border border-slate-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                    placeholder="e.g. Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Pincode</label>
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleChange}
                    className="w-full bg-slate-800/60 border border-slate-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                    placeholder="e.g. 400001"
                    maxLength={6}
                  />
                  {errors['address.pincode'] && (
                    <p className="mt-1 text-sm text-red-400">{errors['address.pincode']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Country</label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="w-full bg-slate-800/60 border border-slate-600 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-700">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  flex-1 py-3 px-6 rounded-lg font-medium text-white
                  bg-gradient-to-r from-blue-600 to-indigo-600
                  hover:from-blue-500 hover:to-indigo-500
                  transition-all duration-300 flex items-center justify-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 py-3 px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;