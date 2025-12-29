import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", general: 80, opd: 60 },
  { month: "Feb", general: 0, opd: 0 },
  { month: "Mar", general: 150, opd: 100 },
  { month: "Apr", general: 70, opd: 50 },
  { month: "May", general: 120, opd: 90 },
  { month: "Jun", general: 50, opd: 40 },
  { month: "Jul", general: 0, opd: 0 },
  { month: "Aug", general: 180, opd: 140 },
  { month: "Sep", general: 0, opd: 0 },
  { month: "Oct", general: 150, opd: 120 },
  { month: "Nov", general: 70, opd: 50 },
  { month: "Dec", general: 60, opd: 40 },
]

export function HospitalSurvey() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Hospital Survey</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
            <span className="text-gray-600">General Patient</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-sm" />
            <span className="text-gray-600">OPD</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            ticks={[0, 50, 100, 150, 200]} />
          <Bar dataKey="general" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
          <Bar dataKey="opd" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
