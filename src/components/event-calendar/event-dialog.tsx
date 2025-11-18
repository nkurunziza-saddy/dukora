"use client";

import { format, isBefore } from "date-fns";
import { Calendar1, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type CalendarEvent,
  COLOR_OPTIONS,
  type EventColor,
} from "@/components/event-calendar";
import {
  DefaultEndHour,
  DefaultStartHour,
  EndHour,
  StartHour,
} from "@/components/event-calendar/constants";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CalendarEventInput } from "./types";

interface EventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEventInput) => void;
  onDelete: (eventId: string) => void;
}

export function EventDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EventDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState(`${DefaultStartHour}:00`);
  const [endTime, setEndTime] = useState(`${DefaultEndHour}:00`);
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [color, setColor] = useState<EventColor>("sky");
  const [error, setError] = useState<string | null>(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const formatTimeForInput = useCallback((date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = Math.floor(date.getMinutes() / 15) * 15;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  }, []);

  const resetForm = useCallback(() => {
    setTitle("");
    setCategory("");
    setStartDate(new Date());
    setEndDate(new Date());
    setStartTime(`${DefaultStartHour}:00`);
    setEndTime(`${DefaultEndHour}:00`);
    setAllDay(false);
    setLocation("");
    setColor("sky");
    setError(null);
  }, []);

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setCategory(event.category || "");

      const start = new Date(event.start);
      const end = new Date(event.end);

      setStartDate(start);
      setEndDate(end);
      setStartTime(formatTimeForInput(start));
      setEndTime(formatTimeForInput(end));
      setAllDay(event.all_day || false);
      setLocation(event.location || "");
      setColor((event.color as EventColor) || "sky");
      setError(null);
    } else {
      resetForm();
    }
  }, [event, formatTimeForInput, resetForm]);

  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = StartHour; hour <= EndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0");
        const formattedMinute = minute.toString().padStart(2, "0");
        const value = `${formattedHour}:${formattedMinute}`;
        const date = new Date(2000, 0, 1, hour, minute);
        const label = format(date, "h:mm a");
        options.push({ value, label });
      }
    }
    return options;
  }, []);
  const t = useTranslations("schedule");

  const handleSave = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!allDay) {
      const [startHours = 0, startMinutes = 0] = startTime
        .split(":")
        .map(Number);
      const [endHours = 0, endMinutes = 0] = endTime.split(":").map(Number);

      if (
        startHours < StartHour ||
        startHours > EndHour ||
        endHours < StartHour ||
        endHours > EndHour
      ) {
        setError(
          `Selected time must be between ${StartHour}:00 and ${EndHour}:00`,
        );
        return;
      }

      start.setHours(startHours, startMinutes, 0);
      end.setHours(endHours, endMinutes, 0);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    if (isBefore(end, start)) {
      setError("End date cannot be before start date");
      return;
    }

    const eventTitle = title.trim() ? title : "(no title)";

    onSave({
      id: event?.id || "",
      title: eventTitle,
      category: category.trim() || "(no category)",
      start,
      end,
      all_day: allDay,
      location,
      color,
    });
  };

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogPopup className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {event?.id ? t("editEvent") : t("createEvent")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {event?.id ? t("editEventDetails") : t("createEventDetails")}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-destructive/15 text-destructive rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <div className="grid gap-4 py-4">
          <div className="*:not-first:mt-1.5">
            <Label htmlFor="title">{t("title")}</Label>
            <Input
              id="title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
          </div>

          <div className="*:not-first:mt-1.5">
            <Label htmlFor="category">{t("category")}</Label>
            <Textarea
              id="category"
              onChange={(e) => setCategory(e.target.value)}
              rows={3}
              value={category}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 *:not-first:mt-1.5">
              <Label htmlFor="start-date">{t("startDate")}</Label>
              <Popover onOpenChange={setStartDateOpen} open={startDateOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      className={cn(
                        "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                        !startDate && "text-muted-foreground",
                      )}
                      id="start-date"
                      variant={"outline"}
                    />
                  }
                >
                  <span
                    className={cn(
                      "truncate",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </span>
                  <Calendar1
                    aria-hidden="true"
                    className="text-muted-foreground/80 shrink-0"
                    size={16}
                  />
                </PopoverTrigger>
                <PopoverPopup align="start" className="w-auto p-2">
                  <Calendar
                    defaultMonth={startDate}
                    mode="single"
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        if (isBefore(endDate, date)) {
                          setEndDate(date);
                        }
                        setError(null);
                        setStartDateOpen(false);
                      }
                    }}
                    selected={startDate}
                  />
                </PopoverPopup>
              </Popover>
            </div>

            {!allDay && (
              <div className="min-w-28 *:not-first:mt-1.5">
                <Label htmlFor="start-time">{t("startTime")}</Label>
                <Select onValueChange={setStartTime} value={startTime}>
                  <SelectTrigger id="start-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1 *:not-first:mt-1.5">
              <Label htmlFor="end-date">{t("endDate")}</Label>
              <Popover onOpenChange={setEndDateOpen} open={endDateOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      className={cn(
                        "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                        !endDate && "text-muted-foreground",
                      )}
                      id="end-date"
                      variant={"outline"}
                    />
                  }
                >
                  <span
                    className={cn(
                      "truncate",
                      !endDate && "text-muted-foreground",
                    )}
                  >
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </span>
                  <Calendar1
                    aria-hidden="true"
                    className="text-muted-foreground/80 shrink-0"
                    size={16}
                  />
                </PopoverTrigger>
                <PopoverPopup align="start" className="w-auto p-2">
                  <Calendar
                    defaultMonth={endDate}
                    disabled={{ before: startDate }}
                    mode="single"
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date);
                        setError(null);
                        setEndDateOpen(false);
                      }
                    }}
                    selected={endDate}
                  />
                </PopoverPopup>
              </Popover>
            </div>

            {!allDay && (
              <div className="min-w-28 *:not-first:mt-1.5">
                <Label htmlFor="end-time">{t("endTime")}</Label>
                <Select onValueChange={setEndTime} value={endTime}>
                  <SelectTrigger id="end-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={allDay}
              id="all-day"
              onCheckedChange={(checked) => setAllDay(checked === true)}
            />
            <Label htmlFor="all-day">{t("allDay")}</Label>
          </div>

          <div className="*:not-first:mt-1.5">
            <Label htmlFor="location">{t("location")}</Label>
            <Input
              id="location"
              onChange={(e) => setLocation(e.target.value)}
              value={location}
            />
          </div>
          <fieldset className="space-y-4">
            <legend className="text-foreground text-sm leading-none font-medium">
              {t("etiquette")}
            </legend>
            <RadioGroup
              className="flex gap-1.5"
              defaultValue={COLOR_OPTIONS[0]?.value}
              onValueChange={(value: unknown) => setColor(value as EventColor)}
              value={color}
            >
              {COLOR_OPTIONS.map((colorOption) => (
                <RadioGroupItem
                  aria-label={colorOption.label}
                  className={cn(
                    "size-6 shadow-none",
                    colorOption.bgClass,
                    colorOption.borderClass,
                  )}
                  id={`color-${colorOption.value}`}
                  key={colorOption.value}
                  value={colorOption.value}
                />
              ))}
            </RadioGroup>
          </fieldset>
        </div>
        <DialogFooter className="flex-row sm:justify-between">
          {event?.id && (
            <Button
              aria-label="Delete event"
              onClick={handleDelete}
              size="icon"
              variant="outline"
            >
              <Trash2 aria-hidden="true" size={16} />
            </Button>
          )}
          <div className="flex flex-1 justify-end gap-2">
            <Button onClick={onClose} variant="outline">
              {t("cancel")}
            </Button>
            <Button onClick={handleSave}>{t("save")}</Button>
          </div>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
