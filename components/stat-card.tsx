import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Icons;
  color: "blue" | "green" | "red" | "purple" | "yellow" | "indigo";
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const iconColorClasses = {
    blue: "text-blue-500 bg-blue-100",
    green: "text-green-500 bg-green-100",
    red: "text-red-500 bg-red-100",
    purple: "text-purple-500 bg-purple-100",
    yellow: "text-yellow-500 bg-yellow-100",
    indigo: "text-indigo-500 bg-indigo-100",
  };

  const Icon = Icons[icon];
  const numericValue =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^0-9.-]/g, "")) || 0;
  const displayValue =
    typeof value === "number" ? value.toLocaleString("id-ID") : value;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="text-2xl font-bold mt-1">{displayValue}</div>
        </div>
        <div className={`p-3 rounded-full ${iconColorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden mt-2">
          <div className={`h-full ${color === 'blue' ? 'bg-blue-500' :
              color === 'green' ? 'bg-green-500' :
              color === 'red' ? 'bg-red-500' :
              color === 'purple' ? 'bg-purple-500' :
              color === 'yellow' ? 'bg-yellow-500' :
              'bg-indigo-500'}`}
              style={{
                width: `${Math.min(100, Math.max(0, numericValue % 100))}%`
              }}>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
