const statusColors = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-700 border-blue-300",
  shipped: "bg-purple-100 text-purple-700 border-purple-300",
  delivered: "bg-green-100 text-green-700 border-green-300",
  cancelled: "bg-red-100 text-red-700 border-red-300",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`px-3 py-1 text-sm rounded-full border ${statusColors[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}
