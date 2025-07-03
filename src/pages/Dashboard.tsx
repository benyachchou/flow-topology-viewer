
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const mockMetrics = {
  devices: 12,
  hosts: 24,
  flows: 156,
  throughput: '2.4 Gbps'
};

const throughputData = [
  { time: '00:00', value: 1.2 },
  { time: '01:00', value: 2.1 },
  { time: '02:00', value: 1.8 },
  { time: '03:00', value: 2.4 },
  { time: '04:00', value: 3.1 },
  { time: '05:00', value: 2.8 }
];

const deviceTypes = [
  { name: 'Switches', value: 8, color: '#3b82f6' },
  { name: 'Routers', value: 4, color: '#8b5cf6' },
  { name: 'Hosts', value: 24, color: '#10b981' }
];

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [metrics, setMetrics] = useState(mockMetrics);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulation de mise à jour des métriques
      setMetrics(prev => ({
        ...prev,
        flows: prev.flows + Math.floor(Math.random() * 10) - 5,
        throughput: `${(2.0 + Math.random() * 2).toFixed(1)} Gbps`
      }));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard ONOS</h1>
          <p className="text-slate-400">Surveillance temps réel du réseau SDN</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Dernière mise à jour</p>
          <p className="text-white font-mono">{currentTime.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Dispositifs</CardTitle>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              Actifs
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
            <CardTitle className="text-white">Débit réseau (6h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={throughputData}>
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
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-white">Connexion</p>
                <p className="text-xs text-slate-400">Stable</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-white">Version</p>
                <p className="text-xs text-slate-400">2.7.0</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-white">Applications</p>
                <p className="text-xs text-slate-400">12 actives</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
