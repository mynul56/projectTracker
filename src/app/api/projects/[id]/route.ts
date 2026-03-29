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
    const data = await request.json();
    
    // Role-based field restrictions for co_leader
    if (session.role === 'co_leader') {
      const restrictedFields = ['project_name', 'project_id', 'profile'];
      const attemptToChangeRestricted = Object.keys(data).some(key => restrictedFields.includes(key));
      if (attemptToChangeRestricted) {
        return NextResponse.json({ error: 'Forbidden: Co-Leaders cannot change administrative fields' }, { status: 403 });
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
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
