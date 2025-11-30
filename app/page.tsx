import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  BarChart3,
  ShoppingCart,
  Settings,
  Users,
  FileText
} from "lucide-react";

export default function Home() {
  const features = [
    {
      title: "Inventory Management",
      description: "Track and manage your warehouse inventory in real-time",
      icon: Package,
    },
    {
      title: "Order Processing",
      description: "Handle orders efficiently from placement to fulfillment",
      icon: ShoppingCart,
    },
    {
      title: "Reporting & Analytics",
      description: "Get insights with detailed reports and analytics",
      icon: BarChart3,
    },
    {
      title: "User Management",
      description: "Manage staff roles and permissions",
      icon: Users,
    },
    {
      title: "Documentation",
      description: "Access to comprehensive system documentation",
      icon: FileText,
    },
    {
      title: "System Settings",
      description: "Customize system preferences and configurations",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="py-16 md:py-24 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              Warehouse Management System
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Streamline your warehouse operations with our comprehensive management platform.
              Real-time inventory tracking, order processing, and analytics to optimize your workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8 py-6 text-lg">
                <Link href="/auth/login">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Link href="/dashboard">View Demo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to efficiently manage your warehouse operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-2 bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 text-center">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to optimize your warehouse?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of businesses using our platform to streamline their operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="px-8 py-6 text-lg">
                <Link href="/auth/register">Start Free Trial</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
