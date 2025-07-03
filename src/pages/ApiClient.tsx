
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const onosEndpoints = {
  'Device': [
    { name: 'Liste tous les dispositifs', method: 'GET', url: '/devices', description: 'Récupère la liste de tous les dispositifs d\'infrastructure' },
    { name: 'Détails d\'un dispositif', method: 'GET', url: '/devices/{deviceId}', description: 'Récupère les détails d\'un dispositif spécifique' },
    { name: 'Ports d\'un dispositif', method: 'GET', url: '/devices/{deviceId}/ports', description: 'Liste les ports d\'un dispositif spécifique' },
    { name: 'Créer un dispositif', method: 'POST', url: '/devices', description: 'Crée un nouveau dispositif dans l\'inventaire' },
    { name: 'Mettre à jour un dispositif', method: 'PUT', url: '/devices/{deviceId}', description: 'Met à jour un dispositif - attributs, disponibilité, maîtrise' },
    { name: 'Supprimer un dispositif', method: 'DELETE', url: '/devices/{deviceId}', description: 'Supprime un dispositif de l\'inventaire' },
  ],
  'Link': [
    { name: 'Liste tous les liens', method: 'GET', url: '/links', description: 'Récupère tous les liens d\'infrastructure' },
    { name: 'Détails d\'un lien', method: 'GET', url: '/links?device={deviceId}&port={portNumber}&direction={direction}', description: 'Détails d\'un lien spécifique' },
    { name: 'Créer un lien', method: 'POST', url: '/links', description: 'Crée un nouveau lien d\'infrastructure' },
    { name: 'Mettre à jour un lien', method: 'PUT', url: '/links/{linkId}', description: 'Met à jour un lien - attributs, type' },
    { name: 'Supprimer un lien', method: 'DELETE', url: '/links/{linkId}', description: 'Supprime un lien d\'infrastructure' },
  ],
  'Host': [
    { name: 'Liste tous les hôtes', method: 'GET', url: '/hosts', description: 'Récupère tous les hôtes terminaux' },
    { name: 'Détails d\'un hôte par ID', method: 'GET', url: '/hosts/{hostId}', description: 'Détails d\'un hôte spécifique par ID' },
    { name: 'Détails d\'un hôte par MAC/VLAN', method: 'GET', url: '/hosts/{mac}/{vlan}', description: 'Détails d\'un hôte par adresse MAC et VLAN' },
    { name: 'Créer un hôte', method: 'POST', url: '/hosts', description: 'Crée un nouveau hôte terminal' },
    { name: 'Mettre à jour un hôte', method: 'PUT', url: '/hosts/{hostId}', description: 'Met à jour un hôte - attributs, IP, localisation' },
    { name: 'Supprimer un hôte', method: 'DELETE', url: '/hosts/{hostId}', description: 'Supprime un hôte de l\'inventaire' },
  ],
  'Topology': [
    { name: 'Vue d\'ensemble de la topologie', method: 'GET', url: '/topology', description: 'Aperçu de la topologie actuelle' },
    { name: 'Clusters de topologie', method: 'GET', url: '/topology/clusters', description: 'Liste des clusters de topologie' },
    { name: 'Détails d\'un cluster', method: 'GET', url: '/topology/clusters/{clusterId}', description: 'Aperçu d\'un cluster spécifique' },
    { name: 'Dispositifs d\'un cluster', method: 'GET', url: '/topology/clusters/{clusterId}/devices', description: 'Dispositifs appartenant au cluster' },
    { name: 'Liens d\'un cluster', method: 'GET', url: '/topology/clusters/{clusterId}/links', description: 'Liens appartenant au cluster' },
    { name: 'Test broadcast', method: 'GET', url: '/topology/broadcast/{connectPoint}', description: 'Vérifier si le point permet le broadcast' },
    { name: 'Test infrastructure', method: 'GET', url: '/topology/infrastructure/{connectPoint}', description: 'Vérifier si le point appartient à l\'infrastructure' },
  ],
  'Flow': [
    { name: 'Tous les flux', method: 'GET', url: '/flows', description: 'Détails de tous les flux du système' },
    { name: 'Flux d\'un dispositif', method: 'GET', url: '/flows/{deviceId}', description: 'Liste des flux appliqués au dispositif' },
    { name: 'Détails d\'un flux', method: 'GET', url: '/flows/{deviceId}/{flowId}', description: 'Détails d\'un flux spécifique' },
    { name: 'Créer un flux', method: 'POST', url: '/flows/{deviceId}', description: 'Crée une règle de flux sur le dispositif' },
    { name: 'Créer des flux en lot', method: 'POST', url: '/flows/', description: 'Ajoute un lot de règles de flux' },
    { name: 'Supprimer un flux', method: 'DELETE', url: '/flows/{deviceId}/{flowId}', description: 'Supprime une règle de flux' },
    { name: 'Statistiques de lien', method: 'GET', url: '/statistics/flows/link/{linkId}', description: 'Statistiques agrégées pour tous les flux traversant un lien' },
  ],
  'Group': [
    { name: 'Tous les groupes', method: 'GET', url: '/groups', description: 'Détails de tous les groupes du système' },
    { name: 'Groupes d\'un dispositif', method: 'GET', url: '/groups/{deviceId}', description: 'Liste des groupes appliqués au dispositif' },
    { name: 'Détails d\'un groupe', method: 'GET', url: '/groups/{deviceId}/{groupKey}', description: 'Détails d\'un groupe spécifique' },
    { name: 'Créer un groupe', method: 'POST', url: '/groups/{deviceId}', description: 'Crée une entrée de groupe sur le dispositif' },
    { name: 'Supprimer un groupe', method: 'DELETE', url: '/groups/{deviceId}/{groupKey}', description: 'Supprime une entrée de groupe' },
  ],
  'Application': [
    { name: 'Toutes les applications', method: 'GET', url: '/applications', description: 'Liste de toutes les applications installées' },
    { name: 'Détails d\'une application', method: 'GET', url: '/applications/{app-name}', description: 'Informations sur l\'application nommée' },
    { name: 'Installer une application', method: 'POST', url: '/applications/', description: 'Installe une application via app.xml ou package ZIP' },
    { name: 'Désinstaller une application', method: 'DELETE', url: '/applications/{app-name}', description: 'Désinstalle l\'application nommée' },
    { name: 'Activer une application', method: 'POST', url: '/applications/{app-name}/active', description: 'Active l\'application nommée' },
    { name: 'Désactiver une application', method: 'DELETE', url: '/applications/{app-name}/active', description: 'Désactive l\'application nommée' },
    { name: 'IDs des applications', method: 'GET', url: '/applications/ids/', description: 'Liste de tous les applicationIds enregistrés' },
  ],
  'Configuration': [
    { name: 'Toutes les configurations', method: 'GET', url: '/configuration', description: 'Liste de tous les composants actifs et leurs valeurs de configuration' },
    { name: 'Configuration d\'un composant', method: 'GET', url: '/configuration/{component}', description: 'Valeurs de configuration pour un composant' },
    { name: 'Ajouter une configuration', method: 'POST', url: '/configuration/{component}', description: 'Ajoute des valeurs de configuration à un composant' },
    { name: 'Supprimer une configuration', method: 'DELETE', url: '/configuration/{component}', description: 'Supprime la configuration et restaure les valeurs par défaut' },
  ]
};

export default function ApiClient() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json",\n  "Authorization": "Basic b25vczpyb2Nrcw=="\n}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [controllerConfig, setControllerConfig] = useState({ ip: '127.0.0.1', port: '8181' });
  const [selectedCategory, setSelectedCategory] = useState('Device');

  useEffect(() => {
    // Charger la configuration du contrôleur depuis les paramètres
    const savedSettings = localStorage.getItem('onosSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setControllerConfig({
        ip: settings.controllerIp || '127.0.0.1',
        port: settings.controllerPort || '8181'
      });
    }
  }, []);

  const buildFullUrl = (endpoint) => {
    return `http://${controllerConfig.ip}:${controllerConfig.port}/onos/v1${endpoint}`;
  };

  const handleSendRequest = async () => {
    setLoading(true);
    
    // Simulation d'une requête API réelle
    setTimeout(() => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
          'x-response-time': `${Math.floor(Math.random() * 100) + 20}ms`,
          'server': 'ONOS REST API'
        },
        data: generateMockData(url, method)
      };

      setResponse(mockResponse);
      
      // Ajouter à l'historique
      const newHistoryItem = {
        id: Date.now(),
        method,
        url: buildFullUrl(url),
        timestamp: new Date().toISOString(),
        status: mockResponse.status
      };
      
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
      setLoading(false);
    }, Math.random() * 1000 + 500);
  };

  const generateMockData = (endpoint, method) => {
    if (endpoint.includes('/devices')) {
      return {
        devices: [
          { id: 'of:0000000000000001', type: 'SWITCH', available: true, role: 'MASTER', mfr: 'Open vSwitch', hw: '2.13.3', sw: '2.13.3' },
          { id: 'of:0000000000000002', type: 'SWITCH', available: true, role: 'MASTER', mfr: 'Open vSwitch', hw: '2.13.3', sw: '2.13.3' }
        ]
      };
    } else if (endpoint.includes('/hosts')) {
      return {
        hosts: [
          { id: '00:00:00:00:00:01/None', mac: '00:00:00:00:00:01', vlan: 'None', ipAddresses: ['10.0.0.1'], locations: ['of:0000000000000001/1'] },
          { id: '00:00:00:00:00:02/None', mac: '00:00:00:00:00:02', vlan: 'None', ipAddresses: ['10.0.0.2'], locations: ['of:0000000000000002/1'] }
        ]
      };
    } else if (endpoint.includes('/flows')) {
      return {
        flows: [
          { id: '1', deviceId: 'of:0000000000000001', priority: 40000, timeout: 0, bytes: 1024, packets: 12, treatment: { instructions: [{ type: 'OUTPUT', port: 'CONTROLLER' }] } }
        ]
      };
    } else if (endpoint.includes('/topology')) {
      return {
        time: Date.now(),
        devices: 3,
        links: 3,
        clusters: 1
      };
    }
    return { message: `Réponse simulée pour ${method} ${endpoint}`, timestamp: new Date().toISOString() };
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
          <p className="text-slate-400">Interface complète pour tester toutes les API ONOS REST</p>
          <p className="text-sm text-slate-500 mt-1">
            Contrôleur: {controllerConfig.ip}:{controllerConfig.port}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interface de requête */}
        <div className="lg:col-span-3 space-y-6">
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
                <div className="flex-1 flex">
                  <span className="bg-slate-700 border border-slate-600 border-r-0 px-3 py-2 text-sm text-slate-400 rounded-l-md">
                    {controllerConfig.ip}:{controllerConfig.port}/onos/v1
                  </span>
                  <Input
                    placeholder="/devices"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="rounded-l-none bg-slate-700 border-slate-600 text-white"
                  />
                </div>
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
                    <pre className="bg-slate-900 p-4 rounded-lg text-sm text-green-400 overflow-x-auto max-h-96">
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

        {/* Sidebar avec endpoints ONOS */}
        <div className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Endpoints ONOS</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-2 bg-slate-700 mb-4">
                  <TabsTrigger value="Device" className="text-xs">Device</TabsTrigger>
                  <TabsTrigger value="Host" className="text-xs">Host</TabsTrigger>
                </TabsList>
                <TabsList className="grid w-full grid-cols-2 bg-slate-700 mb-4">
                  <TabsTrigger value="Flow" className="text-xs">Flow</TabsTrigger>
                  <TabsTrigger value="Topology" className="text-xs">Topo</TabsTrigger>
                </TabsList>
                
                {Object.entries(onosEndpoints).map(([category, endpoints]) => (
                  <TabsContent key={category} value={category} className="space-y-2 max-h-80 overflow-y-auto">
                    {endpoints.map((request, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                        onClick={() => loadPredefinedRequest(request)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium text-sm">{request.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {request.method}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mb-1">{request.description}</p>
                        <p className="text-xs text-blue-400 font-mono">{request.url}</p>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Historique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-60 overflow-y-auto">
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
                    <p className="text-xs text-slate-400 font-mono mt-1 truncate">{item.url}</p>
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
