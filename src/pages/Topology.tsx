
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Simulation de données de topologie
const mockTopology = {
  devices: [
    { id: 'of:0000000000000001', type: 'switch', name: 'Switch-1', status: 'ACTIVE', x: 200, y: 150 },
    { id: 'of:0000000000000002', type: 'switch', name: 'Switch-2', status: 'ACTIVE', x: 400, y: 150 },
    { id: 'of:0000000000000003', type: 'switch', name: 'Switch-3', status: 'ACTIVE', x: 300, y: 300 },
  ],
  hosts: [
    { id: 'host-1', mac: '00:00:00:00:00:01', ip: '10.0.0.1', location: 'of:0000000000000001/1', x: 100, y: 50 },
    { id: 'host-2', mac: '00:00:00:00:00:02', ip: '10.0.0.2', location: 'of:0000000000000002/1', x: 500, y: 50 },
    { id: 'host-3', mac: '00:00:00:00:00:03', ip: '10.0.0.3', location: 'of:0000000000000003/1', x: 300, y: 400 },
  ],
  links: [
    { src: 'of:0000000000000001', dst: 'of:0000000000000002', type: 'DIRECT' },
    { src: 'of:0000000000000001', dst: 'of:0000000000000003', type: 'DIRECT' },
    { src: 'of:0000000000000002', dst: 'of:0000000000000003', type: 'DIRECT' },
  ]
};

export default function Topology() {
  const [topology, setTopology] = useState(mockTopology);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulation de mise à jour de la topologie
      console.log('Mise à jour de la topologie...');
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Topologie Réseau</h1>
          <p className="text-slate-400">Visualisation temps réel de l'architecture réseau</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {autoRefresh ? "Auto-rafraîchissement ON" : "Auto-rafraîchissement OFF"}
          </Button>
          <Button variant="outline" onClick={() => setTopology(mockTopology)}>
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visualisation de la topologie */}
        <Card className="lg:col-span-3 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Vue de la topologie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 bg-slate-900 rounded-lg overflow-hidden">
              <svg className="w-full h-full">
                {/* Liens */}
                {topology.links.map((link, index) => {
                  const srcDevice = topology.devices.find(d => d.id === link.src);
                  const dstDevice = topology.devices.find(d => d.id === link.dst);
                  if (!srcDevice || !dstDevice) return null;
                  
                  return (
                    <line
                      key={index}
                      x1={srcDevice.x}
                      y1={srcDevice.y}
                      x2={dstDevice.x}
                      y2={dstDevice.y}
                      stroke="#64748b"
                      strokeWidth="2"
                      className="opacity-70"
                    />
                  );
                })}

                {/* Switches */}
                {topology.devices.map((device) => (
                  <g key={device.id} onClick={() => handleDeviceClick(device)} className="cursor-pointer">
                    <rect
                      x={device.x - 20}
                      y={device.y - 15}
                      width="40"
                      height="30"
                      fill={device.status === 'ACTIVE' ? '#3b82f6' : '#ef4444'}
                      rx="4"
                      className="hover:opacity-80 transition-opacity"
                    />
                    <text
                      x={device.x}
                      y={device.y + 25}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="12"
                    >
                      {device.name}
                    </text>
                  </g>
                ))}

                {/* Hôtes */}
                {topology.hosts.map((host) => (
                  <g key={host.id} onClick={() => handleDeviceClick(host)} className="cursor-pointer">
                    <circle
                      cx={host.x}
                      cy={host.y}
                      r="12"
                      fill="#10b981"
                      className="hover:opacity-80 transition-opacity"
                    />
                    <text
                      x={host.x}
                      y={host.y + 25}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="10"
                    >
                      {host.ip}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Détails du dispositif sélectionné */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Détails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDevice ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white">
                    {selectedDevice.name || selectedDevice.ip}
                  </h3>
                  <Badge variant={selectedDevice.status === 'ACTIVE' ? 'default' : 'destructive'}>
                    {selectedDevice.status || 'Connected'}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-400">ID:</span>
                    <p className="text-white font-mono text-xs break-all">
                      {selectedDevice.id}
                    </p>
                  </div>
                  
                  {selectedDevice.type && (
                    <div>
                      <span className="text-slate-400">Type:</span>
                      <p className="text-white">{selectedDevice.type}</p>
                    </div>
                  )}
                  
                  {selectedDevice.mac && (
                    <div>
                      <span className="text-slate-400">MAC:</span>
                      <p className="text-white font-mono">{selectedDevice.mac}</p>
                    </div>
                  )}
                  
                  {selectedDevice.ip && (
                    <div>
                      <span className="text-slate-400">IP:</span>
                      <p className="text-white">{selectedDevice.ip}</p>
                    </div>
                  )}
                  
                  {selectedDevice.location && (
                    <div>
                      <span className="text-slate-400">Localisation:</span>
                      <p className="text-white font-mono text-xs">{selectedDevice.location}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-center">
                Cliquez sur un dispositif pour voir les détails
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistiques de la topologie */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">Switches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{topology.devices.length}</div>
            <p className="text-xs text-slate-400">
              {topology.devices.filter(d => d.status === 'ACTIVE').length} actifs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">Hôtes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{topology.hosts.length}</div>
            <p className="text-xs text-slate-400">Terminaux connectés</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">Liens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{topology.links.length}</div>
            <p className="text-xs text-slate-400">Connexions directes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
