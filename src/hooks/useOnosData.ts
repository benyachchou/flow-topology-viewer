
import { useState, useEffect, useCallback } from 'react';
import { onosApi } from '../services/onosApi';

export interface ONOSMetrics {
  devices: number;
  hosts: number;
  flows: number;
  links: number;
  throughput: string;
  isConnected: boolean;
}

export function useOnosData(refreshInterval = 5000) {
  const [metrics, setMetrics] = useState<ONOSMetrics>({
    devices: 0,
    hosts: 0,
    flows: 0,
    links: 0,
    throughput: '0 Mbps',
    isConnected: false
  });
  const [devices, setDevices] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [flows, setFlows] = useState([]);
  const [links, setLinks] = useState([]);
  const [topology, setTopology] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    console.log('Fetching ONOS data...');
    try {
      setError(null);
      
      // Test connection first
      const connectionTest = await onosApi.testConnection();
      if (!connectionTest.success) {
        throw new Error(`Connexion échouée: ${connectionTest.error}`);
      }

      // Fetch all data in parallel
      const [devicesData, hostsData, flowsData, linksData, topologyData] = await Promise.all([
        onosApi.getDevices().catch((err) => {
          console.warn('Failed to fetch devices:', err);
          return { devices: [] };
        }),
        onosApi.getHosts().catch((err) => {
          console.warn('Failed to fetch hosts:', err);
          return { hosts: [] };
        }),
        onosApi.getFlows().catch((err) => {
          console.warn('Failed to fetch flows:', err);
          return { flows: [] };
        }),
        onosApi.getLinks().catch((err) => {
          console.warn('Failed to fetch links:', err);
          return { links: [] };
        }),
        onosApi.getTopology().catch((err) => {
          console.warn('Failed to fetch topology:', err);
          return null;
        })
      ]);

      console.log('ONOS Data fetched successfully:', { 
        devices: devicesData.devices?.length || 0,
        hosts: hostsData.hosts?.length || 0,
        flows: flowsData.flows?.length || 0,
        links: linksData.links?.length || 0,
        topology: topologyData
      });

      const devicesList = Array.isArray(devicesData.devices) ? devicesData.devices : [];
      const hostsList = Array.isArray(hostsData.hosts) ? hostsData.hosts : [];
      const flowsList = Array.isArray(flowsData.flows) ? flowsData.flows : [];
      const linksList = Array.isArray(linksData.links) ? linksData.links : [];

      setDevices(devicesList);
      setHosts(hostsList);
      setFlows(flowsList);
      setLinks(linksList);
      setTopology(topologyData);

      // Calculate basic throughput estimation from flows
      const totalBytes = flowsList.reduce((sum: number, flow: any) => {
        return sum + (flow.bytes || flow.byteCount || 0);
      }, 0);
      
      // Convert to Mbps (simplified calculation)
      const throughputMbps = Math.round((totalBytes * 8) / (1024 * 1024));

      setMetrics({
        devices: devicesList.length,
        hosts: hostsList.length,
        flows: flowsList.length,
        links: linksList.length,
        throughput: `${throughputMbps} Mbps`,
        isConnected: true
      });

      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching ONOS data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion avec le contrôleur ONOS';
      setError(errorMessage);
      setMetrics(prev => ({ ...prev, isConnected: false }));
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('Setting up ONOS data fetching...');
    fetchData();
    
    const interval = setInterval(() => {
      console.log('Auto-refreshing ONOS data...');
      fetchData();
    }, refreshInterval);
    
    return () => {
      console.log('Cleaning up ONOS data fetching interval');
      clearInterval(interval);
    };
  }, [fetchData, refreshInterval]);

  return {
    metrics,
    devices,
    hosts,
    flows,
    links,
    topology,
    isLoading,
    error,
    refetch: fetchData
  };
}
