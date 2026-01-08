import React from 'react'
import { HistoryRecord } from '../types'
import '../styles/App.css'

interface HistoryPanelProps {
  records: HistoryRecord[]
  onClose: () => void
  onDownloadCSV: () => void
  onDownloadJSON: () => void
  onClearHistory: () => void
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  records,
  onClose,
  onDownloadCSV,
  onDownloadJSON,
  onClearHistory
}) => {
  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString)
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Group records by date
  const groupedRecords = records.reduce((groups, record) => {
    const date = formatDate(record.timestamp)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(record)
    return groups
  }, {} as Record<string, HistoryRecord[]>)

  return (
    <div className="history-panel-overlay" onClick={onClose}>
      <div className="history-panel glass-card" onClick={e => e.stopPropagation()}>
        <div className="history-panel-header">
          <h2>📋 Sensor History</h2>
          <button className="close-panel" onClick={onClose}>×</button>
        </div>
        
        <div className="history-panel-toolbar">
          <div className="history-stats">
            <span>Total Records: <strong>{records.length}</strong></span>
            <span className="divider">|</span>
            <span>Auto-save: <strong>Every 30 minutes</strong></span>
          </div>
          <div className="history-actions">
            <button className="action-btn download-csv" onClick={onDownloadCSV}>
              📥 CSV
            </button>
            <button className="action-btn download-json" onClick={onDownloadJSON}>
              📥 JSON
            </button>
            <button className="action-btn clear-history" onClick={onClearHistory}>
              🗑️ Clear
            </button>
          </div>
        </div>
        
        <div className="history-content">
          {records.length === 0 ? (
            <div className="empty-history">
              <div className="empty-icon">📊</div>
              <h3>No History Data</h3>
              <p>History will be automatically saved every 30 minutes when sensor is active.</p>
            </div>
          ) : (
            <div className="history-list">
              {Object.entries(groupedRecords).map(([date, dayRecords]) => (
                <div key={date} className="history-day-group">
                  <div className="history-day-header">
                    <h4>{date}</h4>
                    <span className="day-count">{dayRecords.length} records</span>
                  </div>
                  
                  <div className="history-table">
                    <div className="history-table-header">
                      <div className="table-cell time">Time</div>
                      <div className="table-cell temp">Temperature</div>
                      <div className="table-cell hum">Humidity</div>
                      <div className="table-cell status">Status</div>
                      <div className="table-cell type">Type</div>
                    </div>
                    
                    {dayRecords.map(record => (
                      <div key={record.id} className="history-table-row">
                        <div className="table-cell time">
                          {new Date(record.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                        <div className="table-cell temp">
                          <span className={`temp-value ${record.temperature <= 30 ? 'temp-low' : record.temperature <= 33 ? 'temp-medium' : 'temp-high'}`}>
                            {record.temperature.toFixed(1)}°C
                          </span>
                        </div>
                        <div className="table-cell hum">
                          <span className="hum-value">
                            {record.humidity.toFixed(1)}%
                          </span>
                        </div>
                        <div className="table-cell status">
                          <span className={`status-badge ${record.sensorEnabled ? 'status-active' : 'status-inactive'}`}>
                            {record.sensorEnabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="table-cell type">
                          <span className={`type-badge ${record.isDummy ? 'type-dummy' : 'type-real'}`}>
                            {record.isDummy ? 'Simulation' : 'Real'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="history-panel-footer">
          <div className="footer-note">
            <span className="note-icon">💾</span>
            Data is automatically saved to your browser's local storage
          </div>
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default HistoryPanel