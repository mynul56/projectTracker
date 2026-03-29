'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface AddProjectModalProps {
  onSuccess: () => void;
  userRole?: string;
}

export function AddProjectModal({ onSuccess, userRole = 'co_leader' }: AddProjectModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    project_name: '',
    project_id: '',
    profile: '',
    deadline: '',
    client_status: 'Active',
    last_seen_info: '',
    notes: '',
    last_update: 'Newly created',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setOpen(false);
        onSuccess();
        setFormData({
            project_name: '',
            project_id: '',
            profile: '',
            deadline: '',
            client_status: 'Active',
            last_seen_info: '',
            notes: '',
            last_update: 'Newly created',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {userRole === 'leader' && (
        <DialogTrigger
          render={
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          }
        />
      )}
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p_name">Project Name</Label>
              <Input
                id="p_name"
                required
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p_id">Project ID</Label>
              <Input
                id="p_id"
                required
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile">Profile</Label>
              <Input
                id="profile"
                required
                value={formData.profile}
                onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Client Status</Label>
              <Select
                value={formData.client_status}
                onValueChange={(v) => setFormData({ ...formData, client_status: v ?? 'Active' })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Active', 'Inactive', 'Follow-Up', 'Cancelled', 'Completed'].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seen">Last Seen Info</Label>
              <Input
                id="seen"
                required
                placeholder="e.g. 17 hours ago"
                value={formData.last_seen_info}
                onChange={(e) => setFormData({ ...formData, last_seen_info: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">Create Project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
