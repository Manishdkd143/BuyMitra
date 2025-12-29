import { Filter, Search } from "lucide-react";

export const OrderFilterBar = ({ onFilterToggle }) => {
  return (
    <div className="sticky top-0 z-10 bg-[#0B0F1A]/80 backdrop-blur border-b border-gray-800 px-6 py-4">
      <div className="flex items-center gap-4">
      
        {/* FILTER */}
        <button
          onClick={onFilterToggle}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-300"
        >
          <Filter size={16} />
          Filters
        </button>

        {/* MORE */}
        <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400">
          ⋮
        </button>
      </div>
    </div>
  );
};
