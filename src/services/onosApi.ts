class ONOSApiService {
  private baseUrl: string;
  private auth: string;

  constructor() {
    this.updateConfig();
  }

  updateConfig() {
    const settings = localStorage.getItem('onosSettings');
    if (settings) {
      const { controllerIp, controllerPort, username, password } = JSON.parse(settings);
      this.baseUrl = `http://${controllerIp}:${controllerPort}/onos/v1`;
      this.auth = 'Basic ' + btoa(`${username || 'onos'}:${password || 'rocks'}`);
    } else {
      this.baseUrl = 'http://127.0.0.1:8181/onos/v1';
      this.auth = 'Basic ' + btoa('onos:rocks');
    }
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`ONOS API Response status: ${response.status} for ${endpoint}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`ONOS API Data received for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`ONOS API Error for ${endpoint}:`, error);
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        throw new Error('Timeout: Le contrôleur ONOS ne répond pas');
      } else if (error.message === 'Failed to fetch') {
        throw new Error('Erreur CORS: Impossible de se connecter au contrôleur. Vérifiez que ONOS autorise les requêtes CORS ou utilisez un proxy.');
      }
      
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

  // Test connection with better error handling
  async testConnection() {
    try {
      const result = await this.makeRequest('/devices');
      console.log('ONOS Connection test successful:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('ONOS Connection test failed:', error);
      return { 
        success: false, 
        error: error.message,
        suggestions: [
          'Vérifiez que ONOS est démarré sur 192.168.94.129:8181',
          'Configurez CORS dans ONOS ou utilisez un proxy',
          'Testez depuis une extension comme CORS Unblock',
          'Utilisez une approche backend pour contourner CORS'
        ]
      };
    }
  }

  // Add method to check if we can reach the controller
  async ping() {
    try {
      const response = await fetch(`${this.baseUrl.replace('/onos/v1', '')}/onos/ui/`, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const onosApi = new ONOSApiService();
