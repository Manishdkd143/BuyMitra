import { useState } from "react";
import { forgotPassword } from "../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        console.log("email",email);
        
      const response = await forgotPassword(email)
      console.log(response);
      
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 shadow-md rounded-md">
        <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="border p-2 w-full mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md w-full">
          Send Reset Link
        </button>

        {message && <p className="mt-4 text-center text-green-600">{message}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;