import { HistoryRecord, HistoryStats } from '../types';

const HISTORY_KEY = 'sensor_history';
const SAVE_INTERVAL = 10 * 60 * 1000; // 30 menit dalam milidetik
const MAX_RECORDS = 1000; // Maksimal 1000 record untuk hindari storage penuh

class HistoryService {
  private lastSaveTime = 0;
  private records: HistoryRecord[] = [];

  constructor() {
    this.loadHistory();
  }

  // Load history dari localStorage
  private loadHistory(): void {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        this.records = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      this.records = [];
    }
  }

  // Save history ke localStorage
  private saveHistory(): void {
    try {
      // Simpan hanya MAX_RECORDS terbaru
      const recordsToSave = this.records.slice(-MAX_RECORDS);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(recordsToSave));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  // Tambah record baru jika sudah 30 menit sejak terakhir save
  addRecord(
    temperature: number, 
    humidity: number, 
    sensorEnabled: boolean,
    isDummy: boolean
  ): boolean {
    const now = Date.now();
    
    // Cek jika sudah 30 menit sejak save terakhir
    if (now - this.lastSaveTime >= SAVE_INTERVAL) {
      const record: HistoryRecord = {
        id: `record_${now}_${Math.random().toString(36).substr(2, 9)}`,
        temperature,
        humidity,
        sensorEnabled,
        timestamp: new Date(now).toISOString(),
        isDummy
      };

      this.records.push(record);
      this.lastSaveTime = now;
      this.saveHistory();
      
      console.log(`📝 History saved: ${temperature}°C, ${humidity}% at ${new Date(now).toLocaleTimeString()}`);
      return true;
    }
    
    return false;
  }

  // Dapatkan semua history
  getAllRecords(): HistoryRecord[] {
    return [...this.records].reverse(); // Return terbaru dulu
  }

  // Dapatkan history untuk hari ini
  getTodayRecords(): HistoryRecord[] {
    const today = new Date().toDateString();
    return this.records.filter(record => 
      new Date(record.timestamp).toDateString() === today
    ).reverse();
  }

  // Dapatkan history untuk periode tertentu
  getRecordsByDateRange(startDate: Date, endDate: Date): HistoryRecord[] {
    return this.records.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= startDate && recordDate <= endDate;
    }).reverse();
  }

  // Hapus semua history
  clearHistory(): void {
    this.records = [];
    this.lastSaveTime = 0;
    localStorage.removeItem(HISTORY_KEY);
  }

  // Dapatkan statistik
  getStats(): HistoryStats {
    if (this.records.length === 0) {
      return {
        avgTemperature: 0,
        avgHumidity: 0,
        minTemperature: 0,
        maxTemperature: 0,
        minHumidity: 0,
        maxHumidity: 0,
        totalRecords: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    const temperatures = this.records.map(r => r.temperature);
    const humidities = this.records.map(r => r.humidity);

    return {
      avgTemperature: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
      avgHumidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
      minTemperature: Math.min(...temperatures),
      maxTemperature: Math.max(...temperatures),
      minHumidity: Math.min(...humidities),
      maxHumidity: Math.max(...humidities),
      totalRecords: this.records.length,
      lastUpdated: new Date().toISOString()
    };
  }

  // Export ke CSV
  exportToCSV(): string {
    if (this.records.length === 0) {
      return 'No data available';
    }

    const headers = ['Timestamp', 'Temperature (°C)', 'Humidity (%)', 'Sensor Status', 'Data Type'];
    const rows = this.records.map(record => [
      new Date(record.timestamp).toLocaleString(),
      record.temperature.toFixed(2),
      record.humidity.toFixed(2),
      record.sensorEnabled ? 'Active' : 'Inactive',
      record.isDummy ? 'Simulation' : 'Real'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  // Export ke JSON
  exportToJSON(): string {
    return JSON.stringify({
      metadata: {
        exportedAt: new Date().toISOString(),
        totalRecords: this.records.length,
        dataRange: {
          start: this.records[0]?.timestamp,
          end: this.records[this.records.length - 1]?.timestamp
        }
      },
      records: this.records
    }, null, 2);
  }

  // Download file
  downloadFile(filename: string, content: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Download sebagai CSV
  downloadCSV(): void {
    const csv = this.exportToCSV();
    const filename = `sensor_history_${new Date().toISOString().split('T')[0]}.csv`;
    this.downloadFile(filename, csv, 'text/csv;charset=utf-8;');
  }

  // Download sebagai JSON
  downloadJSON(): void {
    const json = this.exportToJSON();
    const filename = `sensor_history_${new Date().toISOString().split('T')[0]}.json`;
    this.downloadFile(filename, json, 'application/json');
  }
}

export const historyService = new HistoryService();