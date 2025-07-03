
class ONOSApiService {
  private baseUrl: string;
  private auth: string;

  constructor() {
    this.updateConfig();
  }

  updateConfig() {
    const settings = localStorage.getItem('onosSettings');
    if (settings) {
      const { controllerIp, controllerPort } = JSON.parse(settings);
      this.baseUrl = `http://${controllerIp}:${controllerPort}/onos/v1`;
    } else {
      this.baseUrl = 'http://127.0.0.1:8181/onos/v1';
    }
    this.auth = 'Basic ' + btoa('onos:rocks');
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    this.updateConfig();
    
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': this.auth,
      'Accept': 'application/json',
      ...options.headers,
    };

    console.log(`Making ONOS API request to: ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
      });

      console.log(`ONOS API Response status: ${response.status} for ${endpoint}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`ONOS API Data received for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`ONOS API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Device APIs
  async getDevices() {
    return this.makeRequest('/devices');
  }

  async getDevice(deviceId: string) {
    return this.makeRequest(`/devices/${deviceId}`);
  }

  async getDevicePorts(deviceId: string) {
    return this.makeRequest(`/devices/${deviceId}/ports`);
  }

  // Host APIs
  async getHosts() {
    return this.makeRequest('/hosts');
  }

  async getHost(hostId: string) {
    return this.makeRequest(`/hosts/${hostId}`);
  }

  // Link APIs
  async getLinks() {
    return this.makeRequest('/links');
  }

  // Topology APIs
  async getTopology() {
    return this.makeRequest('/topology');
  }

  async getTopologyClusters() {
    return this.makeRequest('/topology/clusters');
  }

  // Flow APIs
  async getFlows(deviceId?: string) {
    const endpoint = deviceId ? `/flows/${deviceId}` : '/flows';
    return this.makeRequest(endpoint);
  }

  async getFlow(deviceId: string, flowId: string) {
    return this.makeRequest(`/flows/${deviceId}/${flowId}`);
  }

  // Application APIs
  async getApplications() {
    return this.makeRequest('/applications');
  }

  // Test connection
  async testConnection() {
    try {
      const result = await this.makeRequest('/devices');
      console.log('ONOS Connection test successful:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('ONOS Connection test failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export const onosApi = new ONOSApiService();
