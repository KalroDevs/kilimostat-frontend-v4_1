import React, { useRef, useEffect } from 'react';

const ChartCard = ({ title, chartId, type, data, onExport }) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && window.Chart) {
      const ctx = canvasRef.current.getContext('2d');
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      chartInstanceRef.current = new window.Chart(ctx, {
        type: type,
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: true
        }
      });
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, type]);

  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <div className="chart-container">
        <canvas ref={canvasRef} id={chartId}></canvas>
      </div>
      <button 
        className="btn-outline" 
        style={{ marginTop: '16px', width: '100%' }} 
        onClick={() => onExport(chartId)}
      >
        <i className="fas fa-download"></i> Export Data (CSV)
      </button>
    </div>
  );
};

export default ChartCard;