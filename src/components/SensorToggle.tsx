import React from 'react';
import '../styles/App.css';

interface SensorToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  className?: string;
}

const SensorToggle: React.FC<SensorToggleProps> = ({ isEnabled, onToggle }) => {
  return (
    <div className="control-panel">
      <h3>Sensor Control (on/off)</h3>
      <div className="toggle-container">
        <span className="toggle-label">
          Sensor: {isEnabled ? 'ACTIVE' : 'NON-ACTIVE'}
        </span>
        <button 
          className={`toggle-btn ${isEnabled ? 'active' : 'inactive'}`}
          onClick={onToggle}
        >
          {isEnabled ? 'TURN OFF SENSOR' : 'TURN ON SENSOR'}
        </button>
      </div>
      <p className="toggle-info">
        {isEnabled 
          ? 'Sensor READ newest data' 
          : 'Sensor in Off Mode, data cannot be READ.'}
      </p>
    </div>
  );
};

export default SensorToggle;