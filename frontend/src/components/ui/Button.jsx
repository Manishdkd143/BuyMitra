const Button = ({ title, loading, ...props }) => {
  return (
    <button
      disabled={loading}
      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
      {...props}
    >
      {loading ? "Processing..." : title}
    </button>
  );
};

export default Button;
