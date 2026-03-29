'use client';

import { useState, useEffect } from 'react';
import { ProjectTable, Project } from '@/components/projects/ProjectTable';
import { AddProjectModal } from '@/components/projects/AddProjectModal';
export default function CoLeaderDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('co_leader');

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.user.role);
      }
    } catch (err) {
      console.error(err);
    }
  };

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
    fetchSession();
    fetchProjects();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Project Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Update and manage project statuses for the team.
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <AddProjectModal onSuccess={fetchProjects} userRole={userRole} />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ProjectTable initialData={projects} userRole={userRole} />
      )}
    </div>
  );
}
