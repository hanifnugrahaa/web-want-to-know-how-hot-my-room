import React from 'react';
import '../styles/App.css';

interface TemperatureCardProps {
  temperature: number;
}

const TemperatureCard: React.FC<TemperatureCardProps> = ({ temperature }) => {
  const getTemperatureColor = (temp: number): string => {
    if (temp === 0) return 'gray';
    if (temp <= 30) return 'green';
    if (temp <= 33) return 'yellow';
    return 'red';
  };

  const temperatureColor = getTemperatureColor(temperature);

  const getTemperatureStatus = (temp: number): string => {
    if (temp === 0) return 'No Data';
    if (temp <= 30) return 'Chill';
    if (temp <= 33) return 'Hot';
    return 'OMG BURNNN SO HOT';
  };

  const getTemperatureColorClass = (temp: number): string => {
  if (temp === 0) return 'text-gradient';
  if (temp <= 30) return 'temperature-low';
  if (temp <= 33) return 'temperature-medium';
  return 'temperature-high';
};

  return (
    <div className="card" style={{ borderColor: temperatureColor }}>
      <div className="card-header">
        <h3>Temperature</h3>
      </div>
      <div className="card temperature-card glass-card">
        <div className={`value-display ${getTemperatureColorClass(temperature)}`}>
          {temperature.toFixed(1)} °C
        </div>
        <div className="status-indicator">
          <span className="status-label">Status:</span>
          <span className="status-text" style={{ color: temperatureColor }}>
            {getTemperatureStatus(temperature)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TemperatureCard;