
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOnosData } from '../hooks/useOnosData';
import { RefreshCw, AlertCircle, Activity, Wifi, Network } from 'lucide-react';

export default function Topology() {
  const { devices, hosts, links, topology, metrics, isLoading, error, refetch } = useOnosData(3000);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleDeviceClick = (device: any) => {
    console.log('Selected device:', device);
    setSelectedDevice(device);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="animate-spin h-6 w-6 text-blue-500" />
            <span className="text-white">Connexion au contrôleur ONOS...</span>
          </div>
        </div>
      </div>
    );
  }

  // Generate positions for devices and hosts for visualization
  const getDevicePosition = (index: number, total: number) => {
    if (total === 0) return { x: 300, y: 200 };
    const angle = (2 * Math.PI * index) / total;
    const radius = Math.min(120, 80 + total * 10);
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
          <h1 className="text-3xl font-bold text-white">Topologie Réseau - Temps Réel</h1>
          <p className="text-slate-400">
            Architecture réseau Mininet via contrôleur ONOS
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${metrics.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-slate-400">
                {metrics.isConnected ? 'Connecté' : 'Déconnecté'}
              </span>
            </div>
            <span className="text-sm text-slate-500">
              Actualisation: 3s
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? "Auto ON" : "Auto OFF"}
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
              <Button variant="outline" size="sm" onClick={refetch} className="ml-4">
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visualisation de la topologie */}
        <Card className="lg:col-span-3 bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <Network className="h-5 w-5 mr-2" />
                Topologie Réseau - {devices?.length || 0} Switches, {hosts?.length || 0} Hôtes
              </CardTitle>
              <Badge variant={metrics.isConnected ? "default" : "destructive"}>
                {metrics.isConnected ? "EN LIGNE" : "HORS LIGNE"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 bg-slate-900 rounded-lg overflow-hidden">
              <svg className="w-full h-full">
                {/* Draw links between devices */}
                {links && links.map((link: any, index: number) => {
                  // Try to find source and destination devices
                  const srcDevice = devices?.find((d: any) => link.src?.device === d.id);
                  const dstDevice = devices?.find((d: any) => link.dst?.device === d.id);
                  
                  if (srcDevice && dstDevice) {
                    const srcIndex = devices.findIndex((d: any) => d.id === srcDevice.id);
                    const dstIndex = devices.findIndex((d: any) => d.id === dstDevice.id);
                    const srcPos = getDevicePosition(srcIndex, devices.length);
                    const dstPos = getDevicePosition(dstIndex, devices.length);
                    
                    return (
                      <line
                        key={`link-${index}`}
                        x1={srcPos.x}
                        y1={srcPos.y}
                        x2={dstPos.x}
                        y2={dstPos.y}
                        stroke="#3b82f6"
                        strokeWidth="2"
                        className="opacity-70"
                      />
                    );
                  }
                  return null;
                })}

                {/* Draw connections between adjacent devices if no links data */}
                {(!links || links.length === 0) && devices && devices.length > 1 && devices.map((device: any, index: number) => {
                  if (index === devices.length - 1) return null;
                  const pos1 = getDevicePosition(index, devices.length);
                  const pos2 = getDevicePosition(index + 1, devices.length);
                  return (
                    <line
                      key={`default-link-${index}`}
                      x1={pos1.x}
                      y1={pos1.y}
                      x2={pos2.x}
                      y2={pos2.y}
                      stroke="#64748b"
                      strokeWidth="2"
                      className="opacity-50"
                    />
                  );
                })}

                {/* Switches/Devices */}
                {devices && devices.map((device: any, index: number) => {
                  const position = getDevicePosition(index, devices.length);
                  const isActive = device.available !== false;
                  
                  return (
                    <g key={device.id} onClick={() => handleDeviceClick(device)} className="cursor-pointer">
                      <rect
                        x={position.x - 25}
                        y={position.y - 18}
                        width="50"
                        height="36"
                        fill={isActive ? '#3b82f6' : '#ef4444'}
                        rx="6"
                        className="hover:opacity-80 transition-opacity"
                        stroke={selectedDevice?.id === device.id ? '#fbbf24' : 'none'}
                        strokeWidth="3"
                      />
                      <text
                        x={position.x}
                        y={position.y + 2}
                        textAnchor="middle"
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        SW
                      </text>
                      <text
                        x={position.x}
                        y={position.y + 30}
                        textAnchor="middle"
                        fill="#e2e8f0"
                        fontSize="9"
                      >
                        {device.id?.split(':').pop()?.substring(0, 8) || `SW-${index + 1}`}
                      </text>
                    </g>
                  );
                })}

                {/* Hosts */}
                {hosts && hosts.map((host: any, index: number) => {
                  // Try to find the device this host is connected to
                  let hostX = 100 + (index % 4) * 150;
                  let hostY = 350;
                  
                  // If we have location info, position near the connected device
                  if (host.locations && host.locations.length > 0) {
                    const location = host.locations[0];
                    const deviceId = location.split('/')[0];
                    const deviceIndex = devices?.findIndex((d: any) => d.id === deviceId);
                    
                    if (deviceIndex !== -1) {
                      const devicePos = getDevicePosition(deviceIndex, devices?.length || 1);
                      const angle = (index * 60) * (Math.PI / 180);
                      hostX = devicePos.x + 70 * Math.cos(angle);
                      hostY = devicePos.y + 70 * Math.sin(angle);
                      
                      // Draw connection line to device
                      return (
                        <g key={host.id}>
                          <line
                            x1={devicePos.x}
                            y1={devicePos.y}
                            x2={hostX}
                            y2={hostY}
                            stroke="#10b981"
                            strokeWidth="1.5"
                            className="opacity-60"
                          />
                          <circle
                            cx={hostX}
                            cy={hostY}
                            r="12"
                            fill="#10b981"
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                            onClick={() => handleDeviceClick(host)}
                            stroke={selectedDevice?.id === host.id ? '#fbbf24' : 'none'}
                            strokeWidth="2"
                          />
                          <text
                            x={hostX}
                            y={hostY + 2}
                            textAnchor="middle"
                            fill="white"
                            fontSize="8"
                            fontWeight="bold"
                          >
                            H
                          </text>
                          <text
                            x={hostX}
                            y={hostY - 20}
                            textAnchor="middle"
                            fill="#e2e8f0"
                            fontSize="8"
                          >
                            {host.ipAddresses?.[0] || host.mac?.substring(0, 8)}
                          </text>
                        </g>
                      );
                    }
                  }
                  
                  return (
                    <g key={host.id}>
                      <circle
                        cx={hostX}
                        cy={hostY}
                        r="12"
                        fill="#10b981"
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                        onClick={() => handleDeviceClick(host)}
                        stroke={selectedDevice?.id === host.id ? '#fbbf24' : 'none'}
                        strokeWidth="2"
                      />
                      <text
                        x={hostX}
                        y={hostY + 2}
                        textAnchor="middle"
                        fill="white"
                        fontSize="8"
                        fontWeight="bold"
                      >
                        H
                      </text>
                      <text
                        x={hostX}
                        y={hostY - 20}
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
              
              {(!devices || devices.length === 0) && (!hosts || hosts.length === 0) && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Wifi className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                    <span className="text-slate-400">En attente de données réseau...</span>
                    <p className="text-sm text-slate-500 mt-1">Vérifiez que Mininet et ONOS sont démarrés</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Détails du dispositif sélectionné */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Détails du Dispositif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDevice ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white">
                    {selectedDevice.type === 'SWITCH' ? 'Switch' : 
                     selectedDevice.ipAddresses?.[0] ? 'Hôte' : 'Dispositif'}
                  </h3>
                  <Badge variant={selectedDevice.available !== false ? 'default' : 'destructive'}>
                    {selectedDevice.available !== false ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-slate-400">ID:</span>
                    <p className="text-white font-mono text-xs break-all mt-1">
                      {selectedDevice.id}
                    </p>
                  </div>
                  
                  {selectedDevice.type && (
                    <div>
                      <span className="text-slate-400">Type:</span>
                      <p className="text-white">{selectedDevice.type}</p>
                    </div>
                  )}

                  {selectedDevice.role && (
                    <div>
                      <span className="text-slate-400">Rôle:</span>
                      <p className="text-white">{selectedDevice.role}</p>
                    </div>
                  )}
                  
                  {selectedDevice.mac && (
                    <div>
                      <span className="text-slate-400">MAC:</span>
                      <p className="text-white font-mono">{selectedDevice.mac}</p>
                    </div>
                  )}
                  
                  {selectedDevice.ipAddresses && selectedDevice.ipAddresses.length > 0 && (
                    <div>
                      <span className="text-slate-400">Adresses IP:</span>
                      <div className="space-y-1">
                        {selectedDevice.ipAddresses.map((ip: string, idx: number) => (
                          <p key={idx} className="text-white font-mono text-sm">{ip}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedDevice.locations && selectedDevice.locations.length > 0 && (
                    <div>
                      <span className="text-slate-400">Localisation:</span>
                      <div className="space-y-1">
                        {selectedDevice.locations.map((loc: string, idx: number) => (
                          <p key={idx} className="text-white font-mono text-xs">{loc}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDevice.mfr && (
                    <div>
                      <span className="text-slate-400">Fabricant:</span>
                      <p className="text-white">{selectedDevice.mfr}</p>
                    </div>
                  )}

                  {selectedDevice.hw && (
                    <div>
                      <span className="text-slate-400">Hardware:</span>
                      <p className="text-white">{selectedDevice.hw}</p>
                    </div>
                  )}

                  {selectedDevice.sw && (
                    <div>
                      <span className="text-slate-400">Software:</span>
                      <p className="text-white">{selectedDevice.sw}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Network className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">
                  Cliquez sur un dispositif pour voir les détails
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistiques de la topologie en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 flex items-center">
              <Network className="h-4 w-4 mr-2" />
              Switches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{devices?.length || 0}</div>
            <p className="text-xs text-slate-400">
              {devices?.filter((d: any) => d.available !== false).length || 0} actifs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 flex items-center">
              <Wifi className="h-4 w-4 mr-2" />
              Hôtes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{hosts?.length || 0}</div>
            <p className="text-xs text-slate-400">Terminaux connectés</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">Liens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{links?.length || 0}</div>
            <p className="text-xs text-slate-400">Connexions réseau</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">Flux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.flows || 0}</div>
            <p className="text-xs text-slate-400">Règles OpenFlow</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
