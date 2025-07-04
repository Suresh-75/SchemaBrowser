const CircleLoader = ({ size = 40, strokeWidth = 4, color = "#3b82f6" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <div
      className="inline-flex items-center justify-center"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
        padding: "20px",
        // borderRadius: "8px",
        // boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="animate-spin"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
    </div>
  );
};

export default CircleLoader;
