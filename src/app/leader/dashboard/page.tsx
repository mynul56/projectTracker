'use client';

import { useState, useEffect } from 'react';
import { SummaryCards } from '@/components/analytics/SummaryCards';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import { ProjectTable } from '@/components/projects/ProjectTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function LeaderDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate stats
  const now = new Date();
  const activeProjects = projects.filter((p: any) => p.client_status === 'Active');
  const inactiveProjects = projects.filter((p: any) => p.client_status === 'Inactive');
  const overdueProjects = projects.filter((p: any) => new Date(p.deadline) < now);
  const followUpProjects = projects.filter((p: any) => p.client_status === 'Follow-Up');
  const recentProjects = projects.filter((p: any) => {
    const updated = new Date(p.updated_at);
    return (now.getTime() - updated.getTime()) < 24 * 60 * 60 * 1000; // 24 hours
  });

  const stats = {
    total: projects.length,
    active: activeProjects.length,
    inactive: inactiveProjects.length,
    overdue: overdueProjects.length,
    recent: recentProjects.length,
    followUp: followUpProjects.length,
  };

  // Prepare chart data
  const statusCounts = projects.reduce((acc: any, p: any) => {
    acc[p.client_status] = (acc[p.client_status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const profileCounts = projects.reduce((acc: any, p: any) => {
    acc[p.profile] = (acc[p.profile] || 0) + 1;
    return acc;
  }, {});
  const profileData = Object.entries(profileCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time analytics and project monitoring for the leadership team.
        </p>
      </div>

      <SummaryCards stats={stats} />

      <AnalyticsCharts statusData={statusData} profileData={profileData} />

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Overdue Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Client Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueProjects.length > 0 ? (
                  overdueProjects.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.project_name}</TableCell>
                      <TableCell className="text-red-600">{format(new Date(p.deadline), 'MMM d, yyyy')}</TableCell>
                      <TableCell><Badge variant="outline">{p.client_status}</Badge></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No overdue projects</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-400">Inactive Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Profile</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveProjects.length > 0 ? (
                  inactiveProjects.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.project_name}</TableCell>
                      <TableCell>{p.last_seen_info}</TableCell>
                      <TableCell>{p.profile}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No inactive clients</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Project Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Update Message</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Updated At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.slice(0, 5).map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.project_name}</TableCell>
                  <TableCell>{p.last_update}</TableCell>
                  <TableCell>{p.last_seen_info}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(p.updated_at), 'MMM d, h:mm a')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
