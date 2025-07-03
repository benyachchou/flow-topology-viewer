
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOnosData } from '../hooks/useOnosData';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function Devices() {
  const { devices, hosts, flows, isLoading, error, refetch } = useOnosData(3000);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('switches');

  const filteredData = (data: any[]) => {
    if (!searchTerm || !data) return data;
    return data.filter(item => 
      JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="animate-spin h-6 w-6 text-blue-500" />
            <span className="text-white">Chargement des dispositifs...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des Dispositifs</h1>
          <p className="text-slate-400">Switches, hôtes, flux OpenFlow et monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 bg-slate-800 border-slate-700 text-white"
          />
          <Button onClick={refetch} variant="outline">
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

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="switches" className="data-[state=active]:bg-blue-600">
            Switches ({devices?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="hosts" className="data-[state=active]:bg-blue-600">
            Hôtes ({hosts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="flows" className="data-[state=active]:bg-blue-600">
            Flux OpenFlow ({flows?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="switches" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Switches OpenFlow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-2 text-slate-300">ID</th>
                      <th className="text-left p-2 text-slate-300">Type</th>
                      <th className="text-left p-2 text-slate-300">Fabricant</th>
                      <th className="text-left p-2 text-slate-300">Version HW</th>
                      <th className="text-left p-2 text-slate-300">Version SW</th>
                      <th className="text-left p-2 text-slate-300">État</th>
                      <th className="text-left p-2 text-slate-300">Rôle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData(devices || []).map((device: any) => (
                      <tr key={device.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-2 font-mono text-xs text-blue-400">{device.id}</td>
                        <td className="p-2 text-white">{device.type || 'SWITCH'}</td>
                        <td className="p-2 text-slate-300">{device.mfr || 'N/A'}</td>
                        <td className="p-2 text-slate-300">{device.hw || 'N/A'}</td>
                        <td className="p-2 text-slate-300">{device.sw || 'N/A'}</td>
                        <td className="p-2">
                          <Badge variant={device.available ? 'default' : 'destructive'}>
                            {device.available ? 'ACTIF' : 'INACTIF'}
                          </Badge>
                        </td>
                        <td className="p-2 text-slate-300">{device.role || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!devices || devices.length === 0) && (
                  <div className="text-center py-8 text-slate-400">
                    Aucun dispositif trouvé
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hosts" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Hôtes Réseau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-2 text-slate-300">ID</th>
                      <th className="text-left p-2 text-slate-300">Adresse MAC</th>
                      <th className="text-left p-2 text-slate-300">Adresses IP</th>
                      <th className="text-left p-2 text-slate-300">Localisation</th>
                      <th className="text-left p-2 text-slate-300">VLAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData(hosts || []).map((host: any) => (
                      <tr key={host.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-2 text-green-400">{host.id}</td>
                        <td className="p-2 font-mono text-white">{host.mac}</td>
                        <td className="p-2 text-blue-400">
                          {host.ipAddresses?.join(', ') || 'N/A'}
                        </td>
                        <td className="p-2 font-mono text-xs text-slate-300">
                          {host.locations?.join(', ') || 'N/A'}
                        </td>
                        <td className="p-2 text-slate-300">{host.vlan || 'None'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!hosts || hosts.length === 0) && (
                  <div className="text-center py-8 text-slate-400">
                    Aucun hôte trouvé
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Flux OpenFlow 1.3</CardTitle>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                  Temps réel
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-2 text-slate-300">ID</th>
                      <th className="text-left p-2 text-slate-300">Dispositif</th>
                      <th className="text-left p-2 text-slate-300">Priorité</th>
                      <th className="text-left p-2 text-slate-300">Timeout</th>
                      <th className="text-left p-2 text-slate-300">Bytes</th>
                      <th className="text-left p-2 text-slate-300">Packets</th>
                      <th className="text-left p-2 text-slate-300">État</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData(flows || []).map((flow: any) => (
                      <tr key={`${flow.deviceId}-${flow.id}`} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-2 text-purple-400">{flow.id}</td>
                        <td className="p-2 font-mono text-xs text-blue-400">{flow.deviceId}</td>
                        <td className="p-2 text-white">{flow.priority || 0}</td>
                        <td className="p-2 text-slate-300">{flow.timeout || 0}</td>
                        <td className="p-2 text-green-400">{(flow.bytes || 0).toLocaleString()}</td>
                        <td className="p-2 text-green-400">{flow.packets || 0}</td>
                        <td className="p-2">
                          <Badge variant="default" className="bg-green-500/20 text-green-400">
                            ACTIF
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!flows || flows.length === 0) && (
                  <div className="text-center py-8 text-slate-400">
                    Aucun flux trouvé
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
