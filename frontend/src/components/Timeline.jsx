export default function Timeline({ timeline }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>

      <div className="space-y-4">
        {timeline.map((item, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              {index !== timeline.length - 1 && (
                <div className="w-1 bg-gray-300 h-full"></div>
              )}
            </div>

            <div>
              <h3 className="font-semibold">{item.status}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="text-xs text-gray-400">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
