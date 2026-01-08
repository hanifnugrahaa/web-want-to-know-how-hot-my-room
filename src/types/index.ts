export interface SensorData {
  temperature: number;
  humidity: number;
  sensorEnabled: boolean;
  status?: string;
  message?: string;
  isDummy?: boolean;
  timestamp?: string;
}

export interface ApiResponse {
  status: string;
  sensorEnabled?: boolean;
  message?: string;
}

export interface HistoryRecord {
  id: string;
  temperature: number;
  humidity: number;
  sensorEnabled: boolean;
  timestamp: string;
  isDummy: boolean;
}

export interface HistoryStats {
  avgTemperature: number;
  avgHumidity: number;
  minTemperature: number;
  maxTemperature: number;
  minHumidity: number;
  maxHumidity: number;
  totalRecords: number;
  lastUpdated: string;
}