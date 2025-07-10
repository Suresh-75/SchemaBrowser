import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getStraightPath } from '@xyflow/react';

function CustomEdge({ sourceX, sourceY, targetX, targetY, label, style, labelStyle, labelBgStyle }) {
    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    // Calculate angle of the line
    const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
    const isUpsideDown = angle > Math.PI / 2 || angle < -Math.PI / 2;

    // Determine label offset based on angle
    const offset = 20;
    const labelOffset = {
        x: Math.sin(angle) * offset,
        y: -Math.cos(angle) * offset
    };

    return (
        <>
            <BaseEdge path={edgePath} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX + labelOffset.x}px, ${labelY + labelOffset.y}px)`,
                        fontSize: 12,
                        pointerEvents: 'all',
                    }}
                >
                    <div
                        style={{
                            ...labelStyle,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            ...labelBgStyle
                        }}
                    >
                        {label}
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}

export default CustomEdge;
