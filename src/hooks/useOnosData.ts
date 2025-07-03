
import { useState, useEffect, useCallback } from 'react';
import { onosApi } from '../services/onosApi';

export interface ONOSMetrics {
  devices: number;
  hosts: number;
  flows: number;
  throughput: string;
  isConnected: boolean;
}

export function useOnosData(refreshInterval = 5000) {
  const [metrics, setMetrics] = useState<ONOSMetrics>({
    devices: 0,
    hosts: 0,
    flows: 0,
    throughput: '0 Gbps',
    isConnected: false
  });
  const [devices, setDevices] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [flows, setFlows] = useState([]);
  const [topology, setTopology] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch all data in parallel
      const [devicesData, hostsData, flowsData, topologyData] = await Promise.all([
        onosApi.getDevices().catch(() => ({ devices: [] })),
        onosApi.getHosts().catch(() => ({ hosts: [] })),
        onosApi.getFlows().catch(() => ({ flows: [] })),
        onosApi.getTopology().catch(() => null)
      ]);

      console.log('ONOS Data fetched:', { devicesData, hostsData, flowsData, topologyData });

      const devicesList = devicesData.devices || [];
      const hostsList = hostsData.hosts || [];
      const flowsList = flowsData.flows || [];

      setDevices(devicesList);
      setHosts(hostsList);
      setFlows(flowsList);
      setTopology(topologyData);

      // Calculate throughput (simplified - you may need to implement proper throughput calculation)
      const totalBytes = flowsList.reduce((sum: number, flow: any) => sum + (flow.bytes || 0), 0);
      const throughputGbps = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);

      setMetrics({
        devices: devicesList.length,
        hosts: hostsList.length,
        flows: flowsList.length,
        throughput: `${throughputGbps} Gbps`,
        isConnected: true
      });

      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching ONOS data:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setMetrics(prev => ({ ...prev, isConnected: false }));
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    metrics,
    devices,
    hosts,
    flows,
    topology,
    isLoading,
    error,
    refetch: fetchData
  };
}
