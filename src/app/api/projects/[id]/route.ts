import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  
  if (!session || (session.role !== 'co_leader' && session.role !== 'leader')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Create a copy of the data without internal fields
    const { id: _id, created_at, updated_at, ...data } = body;
    
    // Role-based field restrictions for co_leader
    if (session.role === 'co_leader') {
      const currentProject = await prisma.project.findUnique({ where: { id } });
      if (!currentProject) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      const restrictedFields = ['project_name', 'project_id', 'profile'] as const;
      const actualChange = restrictedFields.some(field => 
        data[field] !== undefined && data[field] !== currentProject[field]
      );

      if (actualChange) {
        return NextResponse.json({ 
          error: 'Forbidden: Co-Leaders cannot change administrative fields (Project Name, ID, or Profile)' 
        }, { status: 403 });
      }

      // Ensure restricted fields are not updated even if they were sent (but value was identical)
      restrictedFields.forEach(field => {
        delete data[field];
      });
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
    });
    return NextResponse.json(project);
  } catch (error: any) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: 'Bad Request', details: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  
  if (!session || session.role !== 'leader') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.project.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
