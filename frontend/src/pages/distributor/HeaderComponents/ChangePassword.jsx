import React, { useState } from 'react'
import { Eye, EyeOff, Lock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { updatePassword } from '../../../services/authService'
const ChangePassword = () => {
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
                newPass:formData.newPassword,ConfirmPass:formData.confirmPassword})
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
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
  <div className="w-full max-w-md">
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-4">
          <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Change Password
        </h1>
        <p className="text-gray-600 text-sm">
          Please enter your current password and choose a new one
        </p>
      </div>

      {/* FORM */}
      <div className="space-y-5">

        {/* Old Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.old ? "text" : "password"}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyPress}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.oldPassword && touched.oldPassword
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("old")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPasswords.old ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.newPassword && touched.newPassword
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("new")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPasswords.new ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.confirmPassword && touched.confirmPassword
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirm")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPasswords.confirm ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          Update Password
        </button>

      </div>
    </div>
  </div>
</div>

  )
}

export default ChangePassword
