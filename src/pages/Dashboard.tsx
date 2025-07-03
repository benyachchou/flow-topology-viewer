
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useOnosData } from '../hooks/useOnosData';
import { AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { metrics, devices, hosts, flows, topology, isLoading, error, refetch } = useOnosData(5000);
  const [throughputHistory, setThroughputHistory] = useState<Array<{time: string, value: number}>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Update throughput history for the chart
      const now = new Date();
      const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const throughputValue = parseFloat(metrics.throughput.replace(' Gbps', '')) || 0;
      
      setThroughputHistory(prev => {
        const newHistory = [...prev, { time: timeStr, value: throughputValue }];
        return newHistory.slice(-6); // Keep only last 6 points
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [metrics.throughput]);

  // Calculate device types for pie chart
  const deviceTypes = [
    { name: 'Switches', value: devices.filter((d: any) => d.type === 'SWITCH').length, color: '#3b82f6' },
    { name: 'Routers', value: devices.filter((d: any) => d.type === 'ROUTER').length, color: '#8b5cf6' },
    { name: 'Hosts', value: hosts.length, color: '#10b981' }
  ].filter(type => type.value > 0);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="animate-spin h-6 w-6 text-blue-500" />
            <span className="text-white">Connexion à ONOS...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard ONOS</h1>
          <p className="text-slate-400">Surveillance temps réel du réseau SDN</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {metrics.isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-500 text-sm">Connecté</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-red-500 text-sm">Déconnecté</span>
              </>
            )}
          </div>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <div className="text-right">
            <p className="text-sm text-slate-400">Dernière mise à jour</p>
            <p className="text-white font-mono">{currentTime.toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {error && (
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-400">Erreur de connexion: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Dispositifs</CardTitle>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              {metrics.isConnected ? 'Actifs' : 'Hors ligne'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.devices}</div>
            <p className="text-xs text-slate-400">Switches et routeurs</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Hôtes</CardTitle>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              Connectés
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.hosts}</div>
            <p className="text-xs text-slate-400">Terminaux réseau</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Flux OpenFlow</CardTitle>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
              v1.3
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.flows}</div>
            <p className="text-xs text-slate-400">Règles installées</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Débit</CardTitle>
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
              Temps réel
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.throughput}</div>
            <p className="text-xs text-slate-400">Trafic réseau</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Débit réseau (temps réel)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={throughputHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Répartition des dispositifs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              {deviceTypes.length > 0 ? (
                <PieChart>
                  <Pie
                    data={deviceTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {deviceTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-slate-400">Aucune donnée disponible</span>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* État du contrôleur */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">État du contrôleur ONOS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${metrics.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <div>
                <p className="text-sm font-medium text-white">Connexion</p>
                <p className="text-xs text-slate-400">{metrics.isConnected ? 'Stable' : 'Déconnecté'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-white">Topologie</p>
                <p className="text-xs text-slate-400">{topology ? 'Chargée' : 'Non disponible'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-white">Flux actifs</p>
                <p className="text-xs text-slate-400">{metrics.flows} règles</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
