import React from 'react';
import '../styles/App.css';

interface StatusIndicatorProps {
  isEnabled: boolean;
  isLoading: boolean;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isEnabled, isLoading }) => {
  return (
    <div className="status-container">
      <div className="status-title">System Status</div>
      <div className="status-items">
        <div className="status-item">
          <span className="status-label">Sensor:</span>
          <div className={`led ${isEnabled ? 'led-on' : 'led-off'}`}></div>
          <span className="status-text">
            {isEnabled ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Connection:</span>
          <div className={`led ${isLoading ? 'led-loading' : 'led-on'}`}></div>
          <span className="status-text">
            {isLoading ? 'Fetching data...' : 'Connected'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusIndicator;