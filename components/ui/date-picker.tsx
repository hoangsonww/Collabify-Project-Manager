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
  // Format the date using date-fns; if a locale is provided and it is Vietnamese, capitalize the first letter.
  const formattedDate = value
    ? format(value, "PPP", { locale })
    : "Pick a date";
  const displayDate =
    locale && locale.code === "vi" // assuming the Vietnamese locale has a code property set to "vi"
      ? formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
      : formattedDate;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? displayDate : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-black text-white rounded-2xl">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            if (d) onChange(d);
          }}
          initialFocus
          className="w-auto bg-black text-white rounded-2xl"
          locale={locale} // Pass the locale down if Calendar supports it
        />
      </PopoverContent>
    </Popover>
  );
}
