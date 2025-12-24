const Input = ({ label, type = "text", error, ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        type={type}
        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600"
        {...props}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
};

export default Input;
