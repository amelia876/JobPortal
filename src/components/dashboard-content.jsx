import { Bell, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { StatsGrid } from "@/components/stats-grid"
import { HospitalSurvey } from "@/components/hospital-survey"
import { Calendar } from "@/components/calendar"

export function DashboardContent() {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search" className="pl-10 bg-slate-50 border-none" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-sm">
              ENG <ChevronDown className="ml-1 h-4 w-4" />
            </Button>

            <div className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-emerald-500 rounded-full" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/female-doctor.jpg" />
                <AvatarFallback>DM</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">Dr. Monica</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <div className="grid gap-6">
            {/* Today Available Section */}
            <div className="grid lg:grid-cols-[400px_1fr] gap-6">
              <Card className="p-6">
                <div className="text-center">
                  <h3 className="text-emerald-500 font-semibold mb-1">Today Available</h3>
                  <p className="text-gray-500 text-sm mb-6">From: Fortis Hospital</p>

                  <div className="flex items-center justify-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24 mb-3">
                        <AvatarImage src="/female-doctor-professional.jpg" />
                        <AvatarFallback>DL</AvatarFallback>
                      </Avatar>
                      <h4 className="font-semibold text-gray-900">Dr. Daxy Leon</h4>
                      <p className="text-sm text-gray-600">Orthopedist</p>
                      <p className="text-xs text-gray-500">MBBS, MS - 400PM</p>
                    </div>

                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              <StatsGrid />
            </div>

            {/* Chart and Calendar */}
            <div className="grid lg:grid-cols-[1fr_350px] gap-6">
              <HospitalSurvey />
              <Calendar />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
