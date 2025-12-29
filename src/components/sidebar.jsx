"use client"

import {
  LayoutDashboard,
  Calendar,
  Users,
  DoorOpen,
  CreditCard,
  FileText,
  Building,
  Shield,
  CalendarDays,
  MessageSquare,
  Stethoscope,
  Heart,
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Calendar, label: "Appointments" },
  { icon: Stethoscope, label: "Doctors" },
  { icon: Users, label: "Patients" },
  { icon: DoorOpen, label: "Room Allotments" },
  { icon: CreditCard, label: "Payments" },
  { icon: FileText, label: "Expenses Report" },
  { icon: Building, label: "Departments" },
  { icon: Shield, label: "Insurance Company" },
  { icon: CalendarDays, label: "Events" },
  { icon: MessageSquare, label: "Chat" },
]

export function Sidebar() {
  return (
    <aside className="w-64 bg-emerald-500 text-white flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Heart className="h-8 w-8 fill-white" />
          <span className="text-xl font-bold">MEDILINE</span>
        </div>

        <div className="bg-white/10 rounded-2xl px-4 py-3 mb-6">
          <p className="text-sm font-medium">Hospital</p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                item.active ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10"
              )}>
              <item.icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {!item.active && index < 5 && <span className="text-white/60">›</span>}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
