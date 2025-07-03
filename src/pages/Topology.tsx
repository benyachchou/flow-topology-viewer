
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOnosData } from '../hooks/useOnosData';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function Topology() {
  const { devices, hosts, topology, isLoading, error, refetch } = useOnosData(5000);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleDeviceClick = (device: any) => {
    setSelectedDevice(device);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="animate-spin h-6 w-6 text-blue-500" />
            <span className="text-white">Chargement de la topologie...</span>
          </div>
        </div>
      </div>
    );
  }

  // Generate positions for devices and hosts for visualization
  const getDevicePosition = (index: number, total: number) => {
    const angle = (2 * Math.PI * index) / total;
    const radius = 120;
    const centerX = 300;
    const centerY = 200;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
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
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-400">Erreur: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visualisation de la topologie */}
        <Card className="lg:col-span-3 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Vue de la topologie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 bg-slate-900 rounded-lg overflow-hidden">
              <svg className="w-full h-full">
                {/* Draw connections between devices */}
                {devices && devices.length > 1 && devices.map((device: any, index: number) => {
                  if (index === devices.length - 1) return null;
                  const pos1 = getDevicePosition(index, devices.length);
                  const pos2 = getDevicePosition(index + 1, devices.length);
                  return (
                    <line
                      key={`link-${index}`}
                      x1={pos1.x}
                      y1={pos1.y}
                      x2={pos2.x}
                      y2={pos2.y}
                      stroke="#64748b"
                      strokeWidth="2"
                      className="opacity-70"
                    />
                  );
                })}

                {/* Switches/Devices */}
                {devices && devices.map((device: any, index: number) => {
                  const position = getDevicePosition(index, devices.length);
                  return (
                    <g key={device.id} onClick={() => handleDeviceClick(device)} className="cursor-pointer">
                      <rect
                        x={position.x - 20}
                        y={position.y - 15}
                        width="40"
                        height="30"
                        fill={device.available ? '#3b82f6' : '#ef4444'}
                        rx="4"
                        className="hover:opacity-80 transition-opacity"
                      />
                      <text
                        x={position.x}
                        y={position.y + 25}
                        textAnchor="middle"
                        fill="#e2e8f0"
                        fontSize="10"
                      >
                        Switch-{index + 1}
                      </text>
                    </g>
                  );
                })}

                {/* Hosts */}
                {hosts && hosts.map((host: any, index: number) => {
                  const deviceIndex = index % (devices?.length || 1);
                  const devicePos = getDevicePosition(deviceIndex, devices?.length || 1);
                  const hostX = devicePos.x + (index % 2 === 0 ? -60 : 60);
                  const hostY = devicePos.y + (index % 2 === 0 ? -40 : 40);
                  
                  return (
                    <g key={host.id} onClick={() => handleDeviceClick(host)} className="cursor-pointer">
                      {/* Connection line to device */}
                      <line
                        x1={devicePos.x}
                        y1={devicePos.y}
                        x2={hostX}
                        y2={hostY}
                        stroke="#10b981"
                        strokeWidth="1"
                        className="opacity-50"
                      />
                      <circle
                        cx={hostX}
                        cy={hostY}
                        r="8"
                        fill="#10b981"
                        className="hover:opacity-80 transition-opacity"
                      />
                      <text
                        x={hostX}
                        y={hostY + 20}
                        textAnchor="middle"
                        fill="#e2e8f0"
                        fontSize="8"
                      >
                        {host.ipAddresses?.[0] || `Host-${index + 1}`}
                      </text>
                    </g>
                  );
                })}
              </svg>
              
              {(!devices || devices.length === 0) && (!hosts || hosts.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-slate-400">Aucune topologie disponible</span>
                </div>
              )}
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
                    {selectedDevice.type === 'SWITCH' ? 'Switch' : selectedDevice.ipAddresses?.[0] || 'Device'}
                  </h3>
                  <Badge variant={selectedDevice.available !== false ? 'default' : 'destructive'}>
                    {selectedDevice.available !== false ? 'Actif' : 'Inactif'}
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
                  
                  {selectedDevice.ipAddresses && (
                    <div>
                      <span className="text-slate-400">IP:</span>
                      <p className="text-white">{selectedDevice.ipAddresses.join(', ')}</p>
                    </div>
                  )}
                  
                  {selectedDevice.locations && (
                    <div>
                      <span className="text-slate-400">Localisation:</span>
                      <p className="text-white font-mono text-xs">{selectedDevice.locations.join(', ')}</p>
                    </div>
                  )}

                  {selectedDevice.mfr && (
                    <div>
                      <span className="text-slate-400">Fabricant:</span>
                      <p className="text-white">{selectedDevice.mfr}</p>
                    </div>
                  )}

                  {selectedDevice.role && (
                    <div>
                      <span className="text-slate-400">Rôle:</span>
                      <p className="text-white">{selectedDevice.role}</p>
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
            <div className="text-2xl font-bold text-white">{devices?.length || 0}</div>
            <p className="text-xs text-slate-400">
              {devices?.filter((d: any) => d.available).length || 0} actifs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">Hôtes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{hosts?.length || 0}</div>
            <p className="text-xs text-slate-400">Terminaux connectés</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">Clusters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{topology?.clusters || 1}</div>
            <p className="text-xs text-slate-400">Groupes de topologie</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
