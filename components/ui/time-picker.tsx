"use client";

import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CustomTimePickerProps {
  value: string; // expected in "HH:mm" format
  onChange: (value: string) => void;
  className?: string;
}

export function CustomTimePicker({
  value,
  onChange,
  className,
}: CustomTimePickerProps) {
  // Split the value into hour and minute, defaulting to "00:00" if value is falsy.
  const [initialHour, initialMinute] = value ? value.split(":") : ["00", "00"];

  // Maintain local state so the user can type freely.
  const [localHour, setLocalHour] = React.useState(initialHour);
  const [localMinute, setLocalMinute] = React.useState(initialMinute);

  // Update local state when the parent value changes.
  React.useEffect(() => {
    const [h, m] = value.split(":");
    setLocalHour(h);
    setLocalMinute(m);
  }, [value]);

  // Update local state on input change.
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalHour(e.target.value);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMinute(e.target.value);
  };

  // On blur, validate and pad the value, then notify the parent.
  const handleHourBlur = () => {
    let num = parseInt(localHour, 10);
    if (isNaN(num)) num = 0;
    // Clamp to valid hours (0-23).
    num = Math.max(0, Math.min(num, 23));
    const paddedHour = num.toString().padStart(2, "0");
    setLocalHour(paddedHour);
    // Ensure minute is padded too.
    const paddedMinute = localMinute.padStart(2, "0");
    onChange(`${paddedHour}:${paddedMinute}`);
  };

  const handleMinuteBlur = () => {
    let num = parseInt(localMinute, 10);
    if (isNaN(num)) num = 0;
    // Clamp to valid minutes (0-59).
    num = Math.max(0, Math.min(num, 59));
    const paddedMinute = num.toString().padStart(2, "0");
    setLocalMinute(paddedMinute);
    // Ensure hour is padded too.
    const paddedHour = localHour.padStart(2, "0");
    onChange(`${paddedHour}:${paddedMinute}`);
  };

  return (
    <div className="flex flex-col">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "w-full bg-black text-white border border-white cursor-pointer",
              className,
            )}
          >
            {value || "Select time"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4 bg-black text-white rounded-md">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={localHour}
              onChange={handleHourChange}
              onBlur={handleHourBlur}
              maxLength={2}
              className="bg-black text-white border border-white rounded p-2 w-16 text-center"
              placeholder="HH"
            />
            <span>:</span>
            <input
              type="text"
              value={localMinute}
              onChange={handleMinuteChange}
              onBlur={handleMinuteBlur}
              maxLength={2}
              className="bg-black text-white border border-white rounded p-2 w-16 text-center"
              placeholder="MM"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
