// MarkerDefs.jsx
import React from "react";

function MarkerDefs({ darkmode }) {
    const strokeColor = darkmode ? "#9CA3AF" : "#333";

    return (
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
            <defs>
                {/* Crow's Foot (MANY) - much bigger size */}
                <marker
                    id="many"
                    viewBox="0 0 30 30"
                    refX="30"
                    refY="15"
                    markerWidth="18"
                    markerHeight="18"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    {/* Crow's foot with three lines - much bigger */}
                    <path d="M 30 15 L 15 7" stroke={strokeColor} strokeWidth="3" fill="none" />
                    <path d="M 30 15 L 15 15" stroke={strokeColor} strokeWidth="3" fill="none" />
                    <path d="M 30 15 L 15 23" stroke={strokeColor} strokeWidth="3" fill="none" />
                </marker>

                {/* ONE end marker - much bigger size */}
                <marker
                    id="one"
                    viewBox="0 0 30 30"
                    refX="30"
                    refY="15"
                    markerWidth="15"
                    markerHeight="15"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <path d="M 30 8 L 30 22" stroke={strokeColor} strokeWidth="3.5" fill="none" />
                </marker>

                {/* ZERO marker for optional relationships - much bigger size */}
                <marker
                    id="zero"
                    viewBox="0 0 30 30"
                    refX="30"
                    refY="15"
                    markerWidth="15"
                    markerHeight="15"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <circle cx="22" cy="15" r="5" stroke={strokeColor} strokeWidth="3" fill="none" />
                </marker>
            </defs>
        </svg>
    );
}

export default MarkerDefs;
