'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Eye,
  MessageSquare,
  FileText,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  MapPin,
  RefreshCw,
} from 'lucide-react';

interface AnalyticsData {
  stats: {
    totalVisits: number;
    uniqueSessions: number;
    totalChats: number;
    matchesShown: number;
    leasesGenerated: number;
    byDevice: Record<string, number>;
    byBrowser: Record<string, number>;
    byOS: Record<string, number>;
    byCity: Record<string, number>;
    visitsByHour: { hour: string; count: number }[];
  };
  recentVisits: Array<{
    id: string;
    session_id: string;
    page_path: string;
    browser: string;
    os: string;
    device_type: string;
    ip_address: string;
    visited_at: string;
    screen_width: number;
    screen_height: number;
  }>;
  recentChats: Array<{
    id: string;
    session_id: string;
    message_count: number;
    matches_shown: number;
    lease_generated: boolean;
    city_searched: string;
    started_at: string;
  }>;
}

export default function AnalyticsPage() {
  const [key, setKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState('7d');
  const [error, setError] = useState('');

  const fetchData = useCallback(async (secretKey?: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/analytics/data?key=${secretKey || key}&range=${range}`);
      if (response.status === 401) {
        setError('Invalid access key');
        setIsAuthenticated(false);
        return;
      }
      const result = await response.json();
      setData(result);
      setIsAuthenticated(true);
    } catch {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [key, range]);

  useEffect(() => {
    // Check if key is in URL
    const params = new URLSearchParams(window.location.search);
    const urlKey = params.get('key');
    if (urlKey) {
      setKey(urlKey);
      fetchData(urlKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [range, isAuthenticated, fetchData]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter access key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button onClick={() => fetchData()} className="w-full" disabled={loading}>
              {loading ? 'Loading...' : 'Access Dashboard'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground text-sm">Track user engagement and behavior</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="px-3 py-2 rounded-md border bg-background text-sm"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <Button variant="outline" size="icon" onClick={() => fetchData()}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            icon={<Eye className="h-5 w-5" />}
            label="Total Visits"
            value={data.stats.totalVisits}
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Unique Sessions"
            value={data.stats.uniqueSessions}
          />
          <StatCard
            icon={<MessageSquare className="h-5 w-5" />}
            label="Chat Sessions"
            value={data.stats.totalChats}
          />
          <StatCard
            icon={<MapPin className="h-5 w-5" />}
            label="Matches Shown"
            value={data.stats.matchesShown}
          />
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            label="Leases Generated"
            value={data.stats.leasesGenerated}
          />
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Device Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">By Device</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.stats.byDevice).map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device)}
                      <span className="text-sm capitalize">{device}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Browser Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">By Browser</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.stats.byBrowser).map(([browser, count]) => (
                  <div key={browser} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">{browser}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* OS Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">By Operating System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.stats.byOS).map(([os, count]) => (
                  <div key={os} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span className="text-sm">{os}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Visits Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium">Time</th>
                    <th className="text-left py-2 px-2 font-medium">Device</th>
                    <th className="text-left py-2 px-2 font-medium">Browser</th>
                    <th className="text-left py-2 px-2 font-medium">OS</th>
                    <th className="text-left py-2 px-2 font-medium">Screen</th>
                    <th className="text-left py-2 px-2 font-medium">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentVisits.slice(0, 20).map((visit) => (
                    <tr key={visit.id} className="border-b last:border-0">
                      <td className="py-2 px-2 text-muted-foreground">
                        {formatTime(visit.visited_at)}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1">
                          {getDeviceIcon(visit.device_type)}
                          <span className="capitalize">{visit.device_type}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2">{visit.browser}</td>
                      <td className="py-2 px-2">{visit.os}</td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {visit.screen_width}x{visit.screen_height}
                      </td>
                      <td className="py-2 px-2 font-mono text-xs">{visit.ip_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Chat Sessions Table */}
        {data.recentChats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Recent Chat Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium">Time</th>
                      <th className="text-left py-2 px-2 font-medium">Messages</th>
                      <th className="text-left py-2 px-2 font-medium">City</th>
                      <th className="text-left py-2 px-2 font-medium">Matches</th>
                      <th className="text-left py-2 px-2 font-medium">Lease</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentChats.map((chat) => (
                      <tr key={chat.id} className="border-b last:border-0">
                        <td className="py-2 px-2 text-muted-foreground">
                          {formatTime(chat.started_at)}
                        </td>
                        <td className="py-2 px-2">{chat.message_count}</td>
                        <td className="py-2 px-2">{chat.city_searched || '-'}</td>
                        <td className="py-2 px-2">{chat.matches_shown}</td>
                        <td className="py-2 px-2">
                          {chat.lease_generated ? (
                            <Badge variant="default">Yes</Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
