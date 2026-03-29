'use client';

import { useState, useEffect } from 'react';
import { SummaryCards } from '@/components/analytics/SummaryCards';
import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';
import { ProjectTable, Project } from '@/components/projects/ProjectTable';
import { AddProjectModal } from '@/components/projects/AddProjectModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function LeaderDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
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
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Executive Overview</h1>
        <p className="text-muted-foreground text-sm">
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueProjects.length > 0 ? (
                    overdueProjects.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium whitespace-nowrap">{p.project_name}</TableCell>
                        <TableCell className="text-red-600 whitespace-nowrap">{format(new Date(p.deadline), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right"><Badge variant="outline" className="whitespace-nowrap">{p.client_status}</Badge></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">No overdue projects</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-400">Inactive Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead className="text-right">Profile</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveProjects.length > 0 ? (
                    inactiveProjects.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium whitespace-nowrap">{p.project_name}</TableCell>
                        <TableCell className="whitespace-nowrap">{p.last_seen_info}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">{p.profile}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">No inactive clients</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Project Management (Admin Panel)</CardTitle>
          <AddProjectModal onSuccess={fetchProjects} userRole="leader" />
        </CardHeader>
        <CardContent>
          <ProjectTable initialData={projects} userRole="leader" />
        </CardContent>
      </Card>
    </div>
  );
}
