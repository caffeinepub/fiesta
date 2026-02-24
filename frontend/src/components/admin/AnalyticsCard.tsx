import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface AnalyticsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description?: string;
}

export default function AnalyticsCard({ icon, label, value, description }: AnalyticsCardProps) {
  return (
    <Card className="shadow-soft hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-navy">{value}</div>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
