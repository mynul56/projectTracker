import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'leader') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const projects = await request.json();
    if (!Array.isArray(projects)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upsertPromises = projects.map((p) => {
      return prisma.project.upsert({
        where: { project_id: p.project_id },
        update: {
          project_name: p.project_name,
          profile: p.profile,
          client_status: p.client_status || 'Active',
          last_update: p.last_update || 'Bulk Updated',
          last_seen_info: p.last_seen_info || 'Unknown',
          notes: p.notes,
          deadline: p.deadline ? new Date(p.deadline) : thirtyDaysFromNow,
        },
        create: {
          project_name: p.project_name,
          project_id: p.project_id,
          profile: p.profile,
          client_status: p.client_status || 'Active',
          last_update: p.last_update || 'Bulk Uploaded',
          last_seen_info: p.last_seen_info || 'Unknown',
          notes: p.notes,
          deadline: p.deadline ? new Date(p.deadline) : thirtyDaysFromNow,
        },
      });
    });

    const results = await Promise.all(upsertPromises);
    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: 'Failed to process bulk upload' }, { status: 500 });
  }
}
