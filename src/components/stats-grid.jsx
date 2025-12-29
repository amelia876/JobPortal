import { Calendar, UserPlus, Activity, Users, Heart, DollarSign } from "lucide-react"
import { Card } from "@/components/ui/card"

const stats = [
  {
    icon: Calendar,
    value: "40",
    label: "Appointments",
    subtext: "Yesterday 32 Appointments",
  },
  {
    icon: UserPlus,
    value: "21",
    label: "New Admit",
    subtext: "Yesterday 18 Admits",
  },
  {
    icon: Activity,
    value: "14",
    label: "Operations",
    subtext: "Yesterday 9 Operations",
  },
  {
    icon: Users,
    value: "15",
    label: "Doctors",
    subtext: "Today Available",
  },
  {
    icon: Heart,
    value: "36",
    label: "Nurses",
    subtext: "Today Available",
  },
  {
    icon: DollarSign,
    value: "$52,140",
    label: "Earnings",
    subtext: "Yesterday's $42,876",
  },
]

export function StatsGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4 flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
            <p className="text-xs text-gray-400">{stat.subtext}</p>
          </div>
          <div className="bg-emerald-500 rounded-full p-3">
            <stat.icon className="h-5 w-5 text-white" />
          </div>
        </Card>
      ))}
    </div>
  );
}
