
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const predefinedRequests = [
  { name: 'Get Devices', method: 'GET', url: '/onos/v1/devices', description: 'Récupérer tous les dispositifs' },
  { name: 'Get Hosts', method: 'GET', url: '/onos/v1/hosts', description: 'Récupérer tous les hôtes' },
  { name: 'Get Flows', method: 'GET', url: '/onos/v1/flows', description: 'Récupérer tous les flux' },
  { name: 'Get Topology', method: 'GET', url: '/onos/v1/topology', description: 'Récupérer la topologie' },
  { name: 'Get Applications', method: 'GET', url: '/onos/v1/applications', description: 'Récupérer les applications' },
];

export default function ApiClient() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer your-token"\n}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleSendRequest = async () => {
    setLoading(true);
    
    // Simulation d'une requête API
    setTimeout(() => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
          'x-response-time': '45ms'
        },
        data: {
          devices: [
            { id: 'of:0000000000000001', type: 'SWITCH', available: true },
            { id: 'of:0000000000000002', type: 'SWITCH', available: true }
          ],
          timestamp: new Date().toISOString()
        }
      };

      setResponse(mockResponse);
      
      // Ajouter à l'historique
      const newHistoryItem = {
        id: Date.now(),
        method,
        url,
        timestamp: new Date().toISOString(),
        status: mockResponse.status
      };
      
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
      setLoading(false);
    }, 1000);
  };

  const loadPredefinedRequest = (request) => {
    setMethod(request.method);
    setUrl(request.url);
    if (request.method !== 'GET') {
      setBody('{\n  \n}');
    } else {
      setBody('');
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-500/20 text-green-400';
    if (status >= 400 && status < 500) return 'bg-yellow-500/20 text-yellow-400';
    if (status >= 500) return 'bg-red-500/20 text-red-400';
    return 'bg-blue-500/20 text-blue-400';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Client API ONOS</h1>
          <p className="text-slate-400">Interface similaire à Postman pour tester les API ONOS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interface de requête */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Nouvelle Requête</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Méthode et URL */}
              <div className="flex space-x-2">
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="w-24 bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="http://localhost:8181/onos/v1/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-slate-700 border-slate-600 text-white"
                />
                <Button 
                  onClick={handleSendRequest}
                  disabled={loading || !url}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>

              <Tabs defaultValue="headers" className="space-y-4">
                <TabsList className="bg-slate-700">
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="body" disabled={method === 'GET'}>Body</TabsTrigger>
                </TabsList>
                
                <TabsContent value="headers">
                  <Textarea
                    placeholder="Headers JSON"
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    className="min-h-32 bg-slate-700 border-slate-600 text-white font-mono text-sm"
                  />
                </TabsContent>
                
                <TabsContent value="body">
                  <Textarea
                    placeholder="Request body (JSON)"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="min-h-32 bg-slate-700 border-slate-600 text-white font-mono text-sm"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Réponse */}
          {response && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Réponse</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(response.status)}>
                      {response.status} {response.statusText}
                    </Badge>
                    <Badge variant="secondary">
                      {response.headers['x-response-time']}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="response">
                  <TabsList className="bg-slate-700">
                    <TabsTrigger value="response">Response</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="response" className="mt-4">
                    <pre className="bg-slate-900 p-4 rounded-lg text-sm text-green-400 overflow-x-auto">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </TabsContent>
                  
                  <TabsContent value="headers" className="mt-4">
                    <pre className="bg-slate-900 p-4 rounded-lg text-sm text-blue-400 overflow-x-auto">
                      {JSON.stringify(response.headers, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar avec requêtes prédéfinies et historique */}
        <div className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Requêtes Prédéfinies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {predefinedRequests.map((request, index) => (
                <div
                  key={index}
                  className="p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                  onClick={() => loadPredefinedRequest(request)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{request.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {request.method}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{request.description}</p>
                  <p className="text-xs text-blue-400 font-mono mt-1">{request.url}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Historique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {history.length === 0 ? (
                <p className="text-slate-400 text-sm">Aucune requête envoyée</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="p-2 bg-slate-700 rounded text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white">{item.method}</span>
                      <Badge className={getStatusColor(item.status)} variant="secondary">
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-1">{item.url}</p>
                    <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
