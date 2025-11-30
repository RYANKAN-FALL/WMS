"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SalesPoint = {
  name: string;
  jumlah: number;
};

type SalesChartProps = {
  data?: SalesPoint[];
};

const fallbackData: SalesPoint[] = [
  { name: "Senin", jumlah: 12 },
  { name: "Selasa", jumlah: 18 },
  { name: "Rabu", jumlah: 9 },
  { name: "Kamis", jumlah: 22 },
  { name: "Jumat", jumlah: 15 },
  { name: "Sabtu", jumlah: 20 },
  { name: "Minggu", jumlah: 17 },
];

const SalesChart = ({ data }: SalesChartProps) => {
  const chartData = (data && data.length > 0 ? data : fallbackData).map((entry) => ({
    ...entry,
    jumlah: Number.isNaN(entry.jumlah) ? 0 : entry.jumlah,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Penjualan 7 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 24,
                left: 12,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip 
                formatter={(value) => [`Rp${Number(value).toLocaleString("id-ID")}`, "Total"]}
                labelFormatter={(label) => `Hari: ${label}`}
              />
              <Legend />
              <Bar dataKey="jumlah" fill="#2563eb" name="Nilai Penjualan" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
