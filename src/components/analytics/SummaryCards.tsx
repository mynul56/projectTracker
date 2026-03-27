import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, AlertCircle, CheckCircle2, Clock, Hourglass, HelpCircle } from 'lucide-react';

interface StatsProps {
  total: number;
  active: number;
  inactive: number;
  overdue: number;
  recent: number;
  followUp: number;
}

export function SummaryCards({ stats }: { stats: StatsProps }) {
  const cards = [
    { title: 'Total Projects', value: stats.total, icon: Briefcase, color: 'text-blue-600' },
    { title: 'Active Projects', value: stats.active, icon: CheckCircle2, color: 'text-green-600' },
    { title: 'Inactive Projects', value: stats.inactive, icon: AlertCircle, color: 'text-yellow-600' },
    { title: 'Overdue Projects', value: stats.overdue, icon: Clock, color: 'text-red-600' },
    { title: 'Recently Updated', value: stats.recent, icon: Hourglass, color: 'text-purple-600' },
    { title: 'Follow-Up Needed', value: stats.followUp, icon: HelpCircle, color: 'text-orange-600' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
