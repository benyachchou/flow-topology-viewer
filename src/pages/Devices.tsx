
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockDevices = {
  switches: [
    { id: 'of:0000000000000001', name: 'Switch-1', manufacturer: 'Open vSwitch', hw: '2.13.3', sw: '2.13.3', status: 'ACTIVE', ports: 4 },
    { id: 'of:0000000000000002', name: 'Switch-2', manufacturer: 'Open vSwitch', hw: '2.13.3', sw: '2.13.3', status: 'ACTIVE', ports: 4 },
    { id: 'of:0000000000000003', name: 'Switch-3', manufacturer: 'Open vSwitch', hw: '2.13.3', sw: '2.13.3', status: 'ACTIVE', ports: 4 },
  ],
  hosts: [
    { id: 'host-1', mac: '00:00:00:00:00:01', ip: '10.0.0.1', location: 'of:0000000000000001/1', vlan: 'None' },
    { id: 'host-2', mac: '00:00:00:00:00:02', ip: '10.0.0.2', location: 'of:0000000000000002/1', vlan: 'None' },
    { id: 'host-3', mac: '00:00:00:00:00:03', ip: '10.0.0.3', location: 'of:0000000000000003/1', vlan: 'None' },
  ],
  flows: [
    { id: '1', deviceId: 'of:0000000000000001', priority: 40000, timeout: 0, bytes: 1024, packets: 12, actions: 'OUTPUT:CONTROLLER' },
    { id: '2', deviceId: 'of:0000000000000002', priority: 40000, timeout: 0, bytes: 2048, packets: 24, actions: 'OUTPUT:2' },
    { id: '3', deviceId: 'of:0000000000000003', priority: 35000, timeout: 10, bytes: 512, packets: 6, actions: 'DROP' },
  ]
};

export default function Devices() {
  const [devices, setDevices] = useState(mockDevices);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('switches');

  useEffect(() => {
    // Simulation de mise à jour temps réel
    const interval = setInterval(() => {
      setDevices(prev => ({
        ...prev,
        flows: prev.flows.map(flow => ({
          ...flow,
          bytes: flow.bytes + Math.floor(Math.random() * 100),
          packets: flow.packets + Math.floor(Math.random() * 5)
        }))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredData = (data) => {
    if (!searchTerm) return data;
    return data.filter(item => 
      JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

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
          <Button variant="outline">Actualiser</Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="switches" className="data-[state=active]:bg-blue-600">
            Switches ({devices.switches.length})
          </TabsTrigger>
          <TabsTrigger value="hosts" className="data-[state=active]:bg-blue-600">
            Hôtes ({devices.hosts.length})
          </TabsTrigger>
          <TabsTrigger value="flows" className="data-[state=active]:bg-blue-600">
            Flux OpenFlow ({devices.flows.length})
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
                      <th className="text-left p-2 text-slate-300">Nom</th>
                      <th className="text-left p-2 text-slate-300">Fabricant</th>
                      <th className="text-left p-2 text-slate-300">Version HW</th>
                      <th className="text-left p-2 text-slate-300">Version SW</th>
                      <th className="text-left p-2 text-slate-300">Ports</th>
                      <th className="text-left p-2 text-slate-300">État</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData(devices.switches).map((switch_) => (
                      <tr key={switch_.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-2 font-mono text-xs text-blue-400">{switch_.id}</td>
                        <td className="p-2 text-white">{switch_.name}</td>
                        <td className="p-2 text-slate-300">{switch_.manufacturer}</td>
                        <td className="p-2 text-slate-300">{switch_.hw}</td>
                        <td className="p-2 text-slate-300">{switch_.sw}</td>
                        <td className="p-2 text-slate-300">{switch_.ports}</td>
                        <td className="p-2">
                          <Badge variant={switch_.status === 'ACTIVE' ? 'default' : 'destructive'}>
                            {switch_.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      <th className="text-left p-2 text-slate-300">Adresse IP</th>
                      <th className="text-left p-2 text-slate-300">Localisation</th>
                      <th className="text-left p-2 text-slate-300">VLAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData(devices.hosts).map((host) => (
                      <tr key={host.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-2 text-green-400">{host.id}</td>
                        <td className="p-2 font-mono text-white">{host.mac}</td>
                        <td className="p-2 text-blue-400">{host.ip}</td>
                        <td className="p-2 font-mono text-xs text-slate-300">{host.location}</td>
                        <td className="p-2 text-slate-300">{host.vlan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      <th className="text-left p-2 text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData(devices.flows).map((flow) => (
                      <tr key={flow.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-2 text-purple-400">{flow.id}</td>
                        <td className="p-2 font-mono text-xs text-blue-400">{flow.deviceId}</td>
                        <td className="p-2 text-white">{flow.priority}</td>
                        <td className="p-2 text-slate-300">{flow.timeout}</td>
                        <td className="p-2 text-green-400">{flow.bytes.toLocaleString()}</td>
                        <td className="p-2 text-green-400">{flow.packets}</td>
                        <td className="p-2 font-mono text-xs text-slate-300">{flow.actions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
