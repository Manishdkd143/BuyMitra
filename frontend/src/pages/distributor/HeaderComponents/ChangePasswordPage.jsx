import React, { useState } from 'react'
import { Eye, EyeOff, Lock, CheckCircle2, XCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { updatePassword } from '../../../services/authService'
import toast from 'react-hot-toast';

const ChangePasswordPage = () => {
    const [formData, setFormData] = useState({
        oldPassword:'',
        newPassword:'',
        confirmPassword:''
    })
    const [touched, setTouched] = useState({})
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState(null)
    const [showPasswords, setShowPasswords] = useState({
        old:false,new:false,confirm:false});

   const getPasswordStrength=(password)=>{
 let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
   }
   const passwordStrength=getPasswordStrength(formData.newPassword);
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

        const validateField=(name,value)=>{
            switch(name){
               case 'oldPassword':
                if(!value) return "Old password is required!"
                return ''
               case 'newPassword':
                if (!value) return 'New password is required';
                if(value.length<8) return 'Password must be at least 8 characters';
                if(!/[a-z]/.test(value)) return 'Password must contain lowercase letter'
                if(!/[A-Z]/.test(value)) return 'Password must contain uppercase letter';
                if(!/\d/.test(value)) return 'Password must contain a number';
                if(!/[^a-zA-Z0-9]/.test(value)) return 'Password must contain a special character';
                if(value===formData.oldPassword) return 'New password must be different from previous password';
                return ''
              case 'confirmPassword':
                if(!value) return 'Please confirm your password';
                if(value!==formData.newPassword) return 'Password do not match'
                return ''
             default:
                return ''
            }
        }
        const handleBlur=(e)=>{
            const {name,value}=e.target;
            setTouched(prev=>({...prev,[name]:value}));
            const error=validateField(name,value);
            setErrors(prev=>({...prev,[name]:error}))
        }
        const togglePasswordVisibility=(field)=>{
            setShowPasswords(prev=>({...prev,[field]:!prev[field]}))
        }
    const handleChange=(e)=>{
        const {name,value}=e.target
        setFormData((prev)=>({...prev,[name]:value}));
     if(touched[name]){
      const error=validateField(name,value);
      setErrors(prev=>({...prev,[name]:error}))
     }
     if(name==='newPassword'&&touched.confirmPassword){
        const confirmError=validateField('confirmPassword',formData.confirmPassword);
        setErrors(prev=>({...prev,confirmPassword:confirmError}))
     }
    }
    const handleSubmit=async(e)=>{
        e.preventDefault();
        const newErrors={};
        Object.keys(formData).forEach((key)=>{
         const error=validateField(key,formData[key])
         if(error) newErrors[key]=error
        })
        setErrors(newErrors);
        setTouched({oldPassword:true,newPassword:true,confirmPassword:true});
        if(Object.keys(newErrors).length>0){
            return;
        }
        setIsSubmitting(true);
        setSubmitStatus(null)
         try {
          const res=  await updatePassword({oldPass:formData.oldPassword,
                newPass:formData.newPassword,confirmPass:formData.confirmPassword})
                if(res.data.success){
                  toast.success(res.data?.data?.message)
                }
                setSubmitStatus('success');
                setFormData({oldPassword:'',newPassword:'',confirmPassword:''})
                setTouched({})
         } catch (error) {
            setSubmitStatus('error')
            setErrors(prev=>({...prev,submit:'Failed to change-password.Please try again.'}))
         }finally{
       setIsSubmitting(false)
         }
    }   
    const handleKeyPress=(e)=>{
        if(e.key==="Enter"){
            handleSubmit()
        }
    }

  return (
<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/40 p-6 sm:p-8 md:p-10 transition-all">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 mb-5 border border-blue-500/30">
              <ShieldCheck className="w-8 h-8 text-blue-400" strokeWidth={1.8} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent mb-2">
              Change Password
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Keep your account secure — choose a strong password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} onKeyDown={handleKeyPress} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.old ? 'text' : 'password'}
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full bg-slate-800/60 border ${
                    touched.oldPassword && errors.oldPassword
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-slate-600 focus:border-blue-500'
                  } text-white rounded-lg px-4 py-3.5 pr-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none placeholder-slate-500`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('old')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {touched.oldPassword && errors.oldPassword && (
                <p className="mt-1.5 text-sm text-red-400">{errors.oldPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full bg-slate-800/60 border ${
                    touched.newPassword && errors.newPassword
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-slate-600 focus:border-blue-500'
                  } text-white rounded-lg px-4 py-3.5 pr-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none placeholder-slate-500`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {touched.newPassword && errors.newPassword && (
                <p className="mt-1.5 text-sm text-red-400">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full bg-slate-800/60 border ${
                    touched.confirmPassword && errors.confirmPassword
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-slate-600 focus:border-blue-500'
                  } text-white rounded-lg px-4 py-3.5 pr-12 transition-all duration-200 focus:ring-2 focus:ring-blue-500/30 focus:outline-none placeholder-slate-500`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-3.5 px-4 mt-2 rounded-lg font-medium text-white
                bg-gradient-to-r from-blue-600 to-indigo-600
                hover:from-blue-500 hover:to-indigo-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/40
                transition-all duration-300 shadow-lg shadow-blue-900/30
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              `}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>

  )
}

export default ChangePasswordPage
