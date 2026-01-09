import { useState, useEffect, useRef } from 'react'
import { fetchSensorData, toggleSensor } from './services/api'
import { historyService } from './services/historyService'
import type { SensorData, HistoryRecord, HistoryStats } from './types'
import TemperatureCard from './components/TemperatureCard'
import HumidityCard from './components/HumidityCard'
import SensorToggle from './components/SensorToggle'
import StatusIndicator from './components/StatusIndicator'
import HistoryPanel from './components/HistoryPanel'
import './styles/App.css'

function App() {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: 0,
    humidity: 0,
    sensorEnabled: true
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [ipAddress, setIpAddress] = useState<string>('192.168.137.250')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')
  const [isUsingDummyData, setIsUsingDummyData] = useState<boolean>(false)
  const [lastSuccessTime, setLastSuccessTime] = useState<Date | null>(null)
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([])
  const [historyStats, setHistoryStats] = useState<HistoryStats | null>(null)
  const [nextSaveTime, setNextSaveTime] = useState<Date | null>(null)
  const [showHistoryPanel, setShowHistoryPanel] = useState<boolean>(false)
  
  const retryCount = useRef(0)
  const maxRetries = 3
  
  // ⭐⭐ REF UNTUK STATE YANG DIPAKAI DI INTERVAL ⭐⭐
  const sensorEnabledRef = useRef(sensorData.sensorEnabled)
  const loadingRef = useRef(loading)

  // Update ref saat state berubah
  useEffect(() => {
    sensorEnabledRef.current = sensorData.sensorEnabled
  }, [sensorData.sensorEnabled])

  useEffect(() => {
    loadingRef.current = loading
  }, [loading])

  const fetchData = async (): Promise<void> => {
  console.log('=== FETCH START ===', new Date().toLocaleTimeString())

  try {
    setLoading(true)

    const res = await fetch('https://whythisroomsohot.vercel.app/api/data')
    const data = await res.json()

    console.log('✅ Data:', data)

    setSensorData({
      temperature: data.temperature ?? 0,
      humidity: data.humidity ?? 0,
      sensorEnabled: true
    })

    setConnectionStatus('connected')
    setLastSuccessTime(new Date())

  } catch (err) {
    console.log('❌ Error, using dummy data')

    setSensorData({
      temperature: 26.0,
      humidity: 65.0,
      sensorEnabled: true
    })

    setConnectionStatus('connected')

  } finally {
    setLoading(false)
    console.log('=== FETCH END ===')
  }
}


  const updateHistoryData = (): void => {
    const records = historyService.getAllRecords()
    const stats = historyService.getStats()
    setHistoryRecords(records)
    setHistoryStats(stats)
  }

  const handleToggleSensor = async (): Promise<void> => {
    try {
      const newState = !sensorData.sensorEnabled
      await toggleSensor(newState, ipAddress)
      setSensorData(prev => ({ ...prev, sensorEnabled: newState }))
      if (newState) {
        // Jika sensor diaktifkan, langsung fetch data baru
        setTimeout(fetchData, 1000)
      }
    } catch (err) {
      console.error('Toggle error:', err)
    }
  }

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setIpAddress(e.target.value)
  }

  const handleIpSubmit = (): void => {
    retryCount.current = 0
    setError(null)
    fetchData()
  }

  const handleManualRetry = (): void => {
    retryCount.current = 0
    setError(null)
    fetchData()
  }

  const clearError = (): void => {
    setError(null)
    setConnectionStatus('connected')
  }

  const handleDownloadCSV = (): void => {
    historyService.downloadCSV()
  }

  const handleDownloadJSON = (): void => {
    historyService.downloadJSON()
  }

  const handleClearHistory = (): void => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua history?')) {
      historyService.clearHistory()
      updateHistoryData()
    }
  }

 useEffect(() => {
  fetchData()
  updateHistoryData()
  
  const interval = setInterval(() => {
    console.log('🔄 Auto-refresh')
    fetchData()
  }, 5000)
  
  return () => clearInterval(interval)
}, []) // ⭐⭐ EMPTY DEPENDENCY ARRAY KARENA PAKAI REF ⭐⭐

  // Format waktu untuk countdown
  const formatTimeRemaining = (): string => {
    if (!nextSaveTime) return '--:--';
    
    const now = new Date();
    const diff = nextSaveTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Sekarang';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  return (
    <div className="app-container">
      <header className="header glass-effect">
        <h1>Want to know how crazy hot my room?!</h1>
        <p>Making this use ESP32, DHT11, and React JS</p>
        {isUsingDummyData && (
          <div className="dummy-warning">
            ⚠️ Menggunakan data simulasi. 
            {error ? ' Tidak dapat terhubung ke ESP32.' : ' Sambungkan ke ESP32 untuk data real.'}
          </div>
        )}
      </header>

      {error && (
        <div className="error">
          <div className="error-header">
            <h4>❌ {error}</h4>
            <button className="close-error" onClick={clearError}>×</button>
          </div>
          <ol>
            <li>ESP32 sudah menyala dan terhubung ke WiFi</li>
            <li>IP address benar (lihat di Serial Monitor ESP32)</li>
            <li>Komputer dan ESP32 dalam jaringan WiFi yang sama</li>
            <li>Firewall tidak memblokir koneksi</li>
          </ol>
          <div className="error-actions">
            <button onClick={handleManualRetry}>Coba Koneksi Lagi</button>
            <button onClick={() => {
              setIsUsingDummyData(true)
              clearError()
            }}>
              Gunakan Data Simulasi
            </button>
          </div>
        </div>
      )}

      <div className="dashboard">
        <TemperatureCard temperature={sensorData.temperature} />
        <HumidityCard humidity={sensorData.humidity} />
        
        <SensorToggle 
          isEnabled={sensorData.sensorEnabled}
          onToggle={handleToggleSensor}
        />
        
        <StatusIndicator 
          isEnabled={sensorData.sensorEnabled}
          isLoading={loading}
        />

        {/* History Stats Card */}
        <div className="card glass-card history-stats-card">
          <div className="card-header">
            <h3>History & Statistics</h3>
          </div>
          <div className="card-body">
            {historyStats ? (
              <>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">Total Records</div>
                    <div className="stat-value">{historyStats.totalRecords}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Avg Temp</div>
                    <div className="stat-value">{historyStats.avgTemperature.toFixed(1)}°C</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Avg Humidity</div>
                    <div className="stat-value">{historyStats.avgHumidity.toFixed(1)}%</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Next Save</div>
                    <div className="stat-value countdown">{formatTimeRemaining()}</div>
                  </div>
                </div>
                
                <div className="history-actions">
                  <button 
                    className="history-btn view-btn"
                    onClick={() => setShowHistoryPanel(true)}
                  >
                     View History
                  </button>
                  <button 
                    className="history-btn export-csv"
                    onClick={handleDownloadCSV}
                  >
                    📥 Download CSV
                  </button>
                  <button 
                    className="history-btn export-json"
                    onClick={handleDownloadJSON}
                  >
                    📥 Download JSON
                  </button>
                  <button 
                    className="history-btn clear-btn"
                    onClick={handleClearHistory}
                  >
                     Clear History
                  </button>
                </div>
                
                <div className="range-info">
                  <div className="range-item">
                    <span>Temperature Range:</span>
                    <span className="range-value">
                      {historyStats.minTemperature.toFixed(1)}°C - {historyStats.maxTemperature.toFixed(1)}°C
                    </span>
                  </div>
                  <div className="range-item">
                    <span>Humidity Range:</span>
                    <span className="range-value">
                      {historyStats.minHumidity.toFixed(1)}% - {historyStats.maxHumidity.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-history">
                <p>No history data yet. History will be saved every 30 minutes.</p>
              </div>
            )}
          </div>
        </div>

        {/* {Configuration Card} */}
        {/* <div className="card glass-card">
          <div className="card-header">
            <h3>Connection Configuration</h3>
          </div>
          <div className="card-body">
            <div className="config-item">
              <label htmlFor="ip-input">
                IP Address ESP32:
                <span className={`connection-dot ${connectionStatus}`}></span>
              </label>
              <input
                id="ip-input"
                type="text"
                value={ipAddress}
                onChange={handleIpChange}
                placeholder="Contoh: 192.168.1.123"
                className="ip-input"
              />
              <small className="ip-hint">
                {connectionStatus === 'connected' ? 
                  '✅ Connected' : 
                  connectionStatus === 'connecting' ? 
                  '🔄 Try to connect...' : 
                  '❌ Failed to be connect & check the IP'}
              </small>
            </div>
            
            
            <div className="action-buttons">
              <button 
                className="refresh-btn"
                onClick={handleIpSubmit}
                disabled={loading}
              >
                {loading ? '🔄 Loading...' : 'Try Connect'}
              </button>
              
              <button 
                className="toggle-mode-btn"
                onClick={() => setIsUsingDummyData(!isUsingDummyData)}
              >
                {isUsingDummyData ? 'Switch to Real Data' : 'Switch to Simulation'}
              </button>
            </div>
          </div>
        </div> */}
      </div>

      {/* History Panel Modal */}
      {showHistoryPanel && (
        <HistoryPanel
          records={historyRecords}
          onClose={() => setShowHistoryPanel(false)}
          onDownloadCSV={handleDownloadCSV}
          onDownloadJSON={handleDownloadJSON}
          onClearHistory={handleClearHistory}
        />
      )}

      {loading && <div className="loading">Mengambil data sensor...</div>}

      <footer className="glass-effect">
        <div className="footer-content">
          <p>© OMG my room just so hot | 
            <span className={isUsingDummyData ? 'mode-dummy' : 'mode-real'}>
              {isUsingDummyData ? ' Simulation ' : ' Real-time Data'}
            </span>
          </p>
          <p>Target: {ipAddress}:80 | 
            Status: <span className={`status ${connectionStatus}`}>
              {connectionStatus === 'connected' ? ' Connected' : 
               connectionStatus === 'connecting' ? ' Connecting' : '❌ Disconnected'}
            </span>
          </p>
          {lastSuccessTime && historyStats && (
            <p>History: {historyStats.totalRecords} records | Last update: {lastSuccessTime.toLocaleTimeString()}</p>
          )}
        </div>
      </footer>
    </div>
  )
}

export default App