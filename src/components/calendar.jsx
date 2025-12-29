"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

const calendarDays = [
  { day: 24, currentMonth: false },
  { day: 25, currentMonth: false },
  { day: 26, currentMonth: false },
  { day: 27, currentMonth: false },
  { day: 28, currentMonth: false },
  { day: 29, currentMonth: false },
  { day: 30, currentMonth: false },
  { day: 1, currentMonth: true },
  { day: 2, currentMonth: true },
  { day: 3, currentMonth: true },
  { day: 4, currentMonth: true },
  { day: 5, currentMonth: true },
  { day: 6, currentMonth: true },
  { day: 7, currentMonth: true },
  { day: 8, currentMonth: true },
  { day: 9, currentMonth: true },
  { day: 10, currentMonth: true },
  { day: 11, currentMonth: true },
  { day: 12, currentMonth: true },
  { day: 13, currentMonth: true },
  { day: 14, currentMonth: true },
  { day: 15, currentMonth: true },
  { day: 16, currentMonth: true },
  { day: 17, currentMonth: true },
  { day: 18, currentMonth: true },
  { day: 19, currentMonth: true },
  { day: 20, currentMonth: true, active: true },
  { day: 21, currentMonth: true },
  { day: 22, currentMonth: true },
  { day: 23, currentMonth: true },
  { day: 24, currentMonth: true },
  { day: 25, currentMonth: true },
  { day: 26, currentMonth: true },
  { day: 27, currentMonth: true },
  { day: 28, currentMonth: true },
  { day: 29, currentMonth: true },
  { day: 30, currentMonth: true },
  { day: 31, currentMonth: true },
  { day: 1, currentMonth: false },
  { day: 2, currentMonth: false },
  { day: 3, currentMonth: false },
  { day: 4, currentMonth: false },
]

export function Calendar() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar</h3>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-emerald-500">December 2019</span>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((item, index) => (
          <button
            key={index}
            className={`
              aspect-square flex items-center justify-center text-sm rounded-lg
              ${!item.currentMonth ? "text-gray-300" : "text-gray-700"}
              ${item.active ? "bg-emerald-500 text-white font-semibold" : "hover:bg-gray-100"}
            `}>
            {item.day}
          </button>
        ))}
      </div>
    </Card>
  );
}
