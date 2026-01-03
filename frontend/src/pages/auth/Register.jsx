import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // adjust path
import { registerUser,getDistributors, loginUser } from '../../services/authService';// your api services

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    role: 'customer',           // ← Changed from retailer → matches your schema
    password: '',
    confirmPassword: '',
    city: '',
    pincode: '',
    distributorId: '',
    profilePic: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [distributors, setDistributors] = useState([]);

  // Fetch distributors
  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const res = await getDistributors();
        setDistributors(res.data || res || []); // handle both response structures
      } catch (err) {
        console.error('Failed to load distributors:', err);
        setError('Failed to load distributors list');
      }
    };
    fetchDistributors();

    // Cleanup preview URL
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setFormData((prev) => ({ ...prev, profilePic: file }));

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { name, email, phone, gender, password, confirmPassword, city, pincode } = formData;

    // Basic validation
    if (!name || !email || !phone || !gender || !password || !confirmPassword || !city || !pincode) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError('Phone number must be 10 digits');
      setLoading(false);
      return;
    }

    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      setError('Pincode must be 6 digits');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Append all text fields
      Object.keys(formData).forEach((key) => {
        if (key !== 'profilePic' && key !== 'confirmPassword') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append file if exists
      if (formData.profilePic) {
        formDataToSend.append('profilePic', formData.profilePic);
      }

      const res = await registerUser(formDataToSend);

      if (res?.success || res?.data?.success) {
        setSuccess('Registration successful! Logging you in...');
        // await login({ email, password },loginUser);
        navigate('/login');
      } else {
        throw new Error(res?.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 flex items-center justify-center bg-gradient-to-br from-gray-950 via-slate-900 to-black px-4">
      <div className="w-full max-w-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 mb-4">
            <UserPlus className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="mt-2 text-gray-400">Join our network today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/40 border border-red-600/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/40 border border-green-600/50 rounded-lg text-green-300 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-800 border-2 border-blue-500/40 shadow-lg">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <UserPlus size={40} />
                  </div>
                )}
              </div>

              <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2.5 cursor-pointer hover:bg-blue-700 transition-all shadow-lg group-hover:scale-110">
                <input
                  type="file"
                  name="profilePic"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            </div>
            <p className="mt-3 text-sm text-gray-400">Profile Photo (optional, max 5MB)</p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label="Full Name *" name="name" type="text" value={formData.name} onChange={handleChange} />
            <InputField label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} />
            <InputField label="Phone *" name="phone" type="tel" value={formData.phone} onChange={handleChange} maxLength={10} />
            
            <div className="relative">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3.5 bg-gray-800/60 border border-gray-600 text-white rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none appearance-none"
              >
                <option value="">Gender *</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <InputField label="City *" name="city" type="text" value={formData.city} onChange={handleChange} />
            <InputField label="Pincode *" name="pincode" type="text" value={formData.pincode} onChange={handleChange} maxLength={6} />
          </div>

          {/* Distributor (only for customer/retailer) */}
          <div className="relative">
            <select
              name="distributorId"
              value={formData.distributorId}
              onChange={handleChange}
              className="w-full p-3.5 bg-gray-800/60 border border-gray-600 text-white rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none appearance-none"
            >
              <option value="">Select Distributor (optional)</option>
              {distributors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.businessName || d.name} {d.city ? `(${d.city})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <PasswordField
              label="Password *"
              name="password"
              value={formData.password}
              show={showPassword}
              toggleShow={() => setShowPassword(!showPassword)}
              onChange={handleChange}
            />
            <PasswordField
              label="Confirm Password *"
              name="confirmPassword"
              value={formData.confirmPassword}
              show={showConfirmPassword}
              toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3.5 px-6 rounded-xl font-medium text-white
              bg-gradient-to-r from-blue-600 to-indigo-600
              hover:from-blue-500 hover:to-indigo-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/40
              transition-all duration-300 shadow-lg shadow-blue-900/30
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

// Reusable components
const InputField = ({ label, name, type = 'text', value, onChange, maxLength }) => (
  <div className="relative">
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      placeholder=" "
      className="peer w-full p-3.5 bg-gray-800/60 border border-gray-600 text-white rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all placeholder-transparent"
    />
    <label className="absolute left-3 -top-2.5 px-1 text-xs text-blue-300 bg-gray-900 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-300 peer-focus:bg-gray-900 transition-all">
      {label}
    </label>
  </div>
);

const PasswordField = ({ label, name, value, show, toggleShow, onChange }) => (
  <div className="relative">
    <input
      type={show ? 'text' : 'password'}
      name={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      className="peer w-full p-3.5 bg-gray-800/60 border border-gray-600 text-white rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none pr-12 transition-all placeholder-transparent"
    />
    <label className="absolute left-3 -top-2.5 px-1 text-xs text-blue-300 bg-gray-900 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-300 peer-focus:bg-gray-900 transition-all">
      {label}
    </label>
    <button
      type="button"
      onClick={toggleShow}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
    >
      {show ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
);

export default Register;