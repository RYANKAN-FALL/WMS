import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface ReportCardProps {
  title: string;
  description: string;
  icon: keyof typeof Icons;
  href: string;
}

const ReportCard = ({ title, description, icon, href }: ReportCardProps) => {
  const Icon = Icons[icon];
  
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center space-x-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            Lihat Laporan
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ReportCard;