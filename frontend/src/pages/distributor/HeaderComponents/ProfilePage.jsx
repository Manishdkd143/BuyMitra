// components/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { User, MapPin, Mail, Phone, Shield, Calendar, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../../services/user/userProfile.service';

const ProfilePage = () => {
  // In real app: fetch from your API (e.g. /api/users/me)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate=useNavigate()
  useEffect(() => {
    // Simulate API call - replace with real fetch/axios
    const fetchUser = async () => {
      try {
        setLoading(true);
        // Example response from your backend
        // const mockUser = {
        //   name: "Rahul Sharma",
        //   email: "rahul.sharma@example.com",
        //   phone: "9876543210",
        //   role: "distributor", // or customer / admin
        //   isVerified: true,
        //   status: "active",
        //   distributorId: null, // only meaningful for customers
        //   address: {
        //     city: "Lucknow",
        //     state: "Uttar Pradesh",
        //     pincode: 226010,
        //     country: "India"
        //   },
        //   profilePic: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Rahul",
        //   gender: "male",
        //   createdAt: "2024-08-15T10:30:00.000Z"
        // };
        const res=await getUserProfile();
        setUser(res.data)
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-blue-400">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">
        Unable to load profile
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Profile Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
          {/* Header / Cover */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/30 relative">
            <div className="absolute -bottom-16 left-6 sm:left-10">
              <div className="relative">
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-slate-900 object-cover bg-slate-800 shadow-xl"
                />
                <button className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full hover:bg-blue-500 transition-colors shadow-lg">
                  <Edit2 size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="pt-20 sm:pt-24 px-6 sm:px-10 pb-10">
            {/* Name & Role */}
            <div className="text-center sm:text-left mb-8">
              <h1 className="text-3xl font-bold text-white">{user.name}</h1>
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                <span className="px-4 py-1 bg-blue-600/30 text-blue-300 rounded-full text-sm font-medium capitalize">
                  {user.role}
                </span>

                {user.isVerified && (
                  <div className="flex items-center gap-1.5 text-green-400 text-sm">
                    <Shield size={16} />
                    <span>Verified</span>
                  </div>
                )}

                {user.status !== 'active' && (
                  <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                    {user.status}
                  </span>
                )}
              </div>
            </div>

            {/* Grid of Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              {/* Email */}
              <InfoItem
                icon={<Mail size={20} />}
                label="Email"
                value={user.email}
              />

              {/* Phone */}
              {user.phone && (
                <InfoItem
                  icon={<Phone size={20} />}
                  label="Phone"
                  value={user.phone.replace(/(\d{5})(\d{5})/, "$1 $2")}
                />
              )}

              {/* Gender */}
              {user.gender && (
                <InfoItem
                  icon={<User size={20} />}
                  label="Gender"
                  value={user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                />
              )}

              {/* Joined Date */}
              <InfoItem
                icon={<Calendar size={20} />}
                label="Joined"
                value={new Date(user.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              />

              {/* Address */}
              {user.address?.city && (
                <div className="md:col-span-2">
                  <InfoItem
                    icon={<MapPin size={20} />}
                    label="Address"
                    value={
                      <span>
                        {user.address.city}, {user.address.state || ''}<br />
                        {user.address.pincode}, {user.address.country}
                      </span>
                    }
                    isMultiLine
                  />
                </div>
              )}
            </div>

            {/* Distributor Info (for customers) */}
            {user.role === 'customer' && user.distributorId && (
              <div className="mt-10 pt-8 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-slate-200 mb-3">
                  Assigned Distributor
                </h3>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-400">Distributor ID: {user.distributorId}</p>
                  {/* You can fetch and show distributor name here if you want */}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={()=>navigate("/distributor/account/edit-account")}   className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <Edit2 size={18} />
                Edit Profile
              </button>
              <button onClick={()=>navigate("/distributor/account/change-password")} className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value, isMultiLine = false }) => (
  <div className="flex items-start gap-4">
    <div className="mt-1 text-blue-400">{icon}</div>
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`${isMultiLine ? 'leading-relaxed' : ''} text-white font-medium mt-0.5`}>
        {value}
      </p>
    </div>
  </div>
);

export default ProfilePage;