import React from 'react';
import '../styles/App.css';

interface HumidityCardProps {
  humidity: number;
}

const HumidityCard: React.FC<HumidityCardProps> = ({ humidity }) => {
  const getHumidityStatus = (hum: number): string => {
    if (hum === 0) return 'No Data';
    if (hum <= 40) return 'Dry';
    if (hum <= 70) return 'Normal';
    return 'Wet';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Humidity</h3>
      </div>
      <div className="card temperature-card glass-card">
        <div className="value-display humidity-normal">
          {humidity.toFixed(1)} %
        </div>
        <div className="status-indicator">
          <span className="status-label">Status:</span>
          <span className="status-text blue">
            {getHumidityStatus(humidity)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HumidityCard;