import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/authService";

const ResetPassword = () => {
  const { token } = useParams(); 
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await resetPassword(token,{newPassword,confirmPassword})

      setMessage(response.data.message);
      navigate("/auth/login");
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 shadow-md rounded-md">
        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>

        <input
          type="password"
          placeholder="New Password"
          className="border p-2 w-full mb-4"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="border p-2 w-full mb-4"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md w-full">
          Update Password
        </button>

        {message && <p className="mt-4 text-center text-green-600">{message}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;
