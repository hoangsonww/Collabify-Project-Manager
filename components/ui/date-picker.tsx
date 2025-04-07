"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Locale } from "date-fns";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  className?: string;
  locale?: Locale;
}

export function DatePicker({
  value,
  onChange,
  className,
  locale,
}: DatePickerProps) {
  // Local state for controlling popover open state.
  const [open, setOpen] = React.useState(false);

  // Debug: log when open state changes.
  React.useEffect(() => {
    console.log("Popover open state changed:", open);
  }, [open]);

  // Format the date using date-fns; if a locale is provided and it's Vietnamese, capitalize the first letter.
  const formattedDate = value
    ? format(value, "PPP", { locale })
    : "Pick a date";
  const displayDate =
    locale && (locale as any).code === "vi"
      ? formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
      : formattedDate;

  return (
    <Popover
      open={open}
      onOpenChange={(newState) => {
        console.log("Popover onOpenChange called with:", newState);
        setOpen(newState);
      }}
    >
      <PopoverTrigger asChild className="cursor-pointer">
        {/* Added a wrapping div for additional logging */}
        <div onClick={() => console.log("PopoverTrigger wrapper clicked")}>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left cursor-pointer",
              !value && "text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? displayDate : "Pick a date"}
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="w-auto p-0 z-50 bg-black text-white rounded-md"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            console.log("Calendar date selected:", d);
            if (d) {
              onChange(d);
              console.log("Date changed. Closing popover.");
              setOpen(false);
            }
          }}
          // Removed initialFocus to prevent focus issues on Safari
          className="bg-black text-white rounded-md"
        />
      </PopoverContent>
    </Popover>
  );
}
