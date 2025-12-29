// Status Badge Component
export const StatusBadge = ({ status, type }) => {
  const getStyles = () => {
    if (type === "order") {
      const styles = {
        pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        delivered: "bg-green-500/10 text-green-400 border-green-500/20",
      };
      return styles[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
    } else {
      const styles = {
        paid: "bg-green-500/10 text-green-400 border-green-500/20",
        pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        partial: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      };
      return styles[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};