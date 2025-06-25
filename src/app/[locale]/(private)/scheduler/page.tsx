"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Bell,
  Plus,
  MessageSquare,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";

// Mock data
const events = [
  {
    id: 1,
    title: "Quarterly Inventory Review",
    date: new Date("2024-01-22"),
    type: "meeting",
    description: "Review Q4 inventory performance and plan for Q1",
  },
  {
    id: 2,
    title: "Supplier Meeting - AudioTech",
    date: new Date("2024-01-23"),
    type: "supplier",
    description: "Discuss new product launches and pricing",
  },
  {
    id: 3,
    title: "Stock Reorder Deadline",
    date: new Date("2024-01-25"),
    type: "deadline",
    description: "Last day to place orders for February delivery",
  },
  {
    id: 4,
    title: "Warehouse Audit - WH-North",
    date: new Date("2024-01-28"),
    type: "audit",
    description: "Monthly physical inventory count",
  },
];

const announcements = [
  {
    id: 1,
    title: "New Inventory Management Features",
    content:
      "We've released new AI-powered forecasting tools to help optimize your inventory levels.",
    priority: "info",
    timestamp: new Date("2024-01-20T10:00:00"),
    read: false,
  },
  {
    id: 2,
    title: "Warehouse WH-South Maintenance",
    content:
      "Scheduled maintenance on January 25th from 2-4 PM. Some operations may be affected.",
    priority: "warning",
    timestamp: new Date("2024-01-19T14:30:00"),
    read: false,
  },
  {
    id: 3,
    title: "Monthly Performance Report Available",
    content:
      "December performance report is now ready in the Analytics section.",
    priority: "info",
    timestamp: new Date("2024-01-18T09:15:00"),
    read: true,
  },
  {
    id: 4,
    title: "Low Stock Alert System Update",
    content:
      "Improved alert thresholds and notification delivery for better inventory management.",
    priority: "success",
    timestamp: new Date("2024-01-17T16:45:00"),
    read: true,
  },
];

const notificationSettings = {
  email: true,
  sms: false,
  lowStock: true,
  orders: true,
  reports: false,
  system: true,
};

export default function SchedulerNotifications() {
  const t = useTranslations("scheduler");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(notificationSettings);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "",
    date: "",
  });

  const selectedDateEvents = events.filter(
    (event) =>
      selectedDate && event.date.toDateString() === selectedDate.toDateString()
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "warning":
        return "destructive";
      case "success":
        return "default";
      case "info":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "default";
      case "supplier":
        return "secondary";
      case "deadline":
        return "destructive";
      case "audit":
        return "outline";
      default:
        return "secondary";
    }
  };

  const toggleNotification = (key: string) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleCreateEvent = () => {
    console.log("Creating event:", newEvent);
    setIsEventModalOpen(false);
    setNewEvent({ title: "", description: "", type: "", date: "" });
  };

  const markAsRead = (announcementId: number) => {
    // In a real app, this would update the backend
    console.log(`Marking announcement ${announcementId} as read`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
        </div>

        <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("addEvent")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("createNewEvent")}</DialogTitle>
              <DialogDescription>
                {t("addNewEventDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">{t("eventTitle")}</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder={t("enterEventTitle")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">{t("eventType")}</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value) =>
                    setNewEvent({ ...newEvent, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">{t("meeting")}</SelectItem>
                    <SelectItem value="supplier">{t("supplier")}</SelectItem>
                    <SelectItem value="deadline">{t("deadline")}</SelectItem>
                    <SelectItem value="audit">{t("audit")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">{t("date")}</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">{t("descriptionLabel")}</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  placeholder={t("enterEventDescription")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateEvent}>{t("createEvent")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {t("calendar")}
            </CardTitle>
            <CardDescription>{t("selectDateToViewEvents")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />

            {/* Events for selected date */}
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">
                {t("eventsFor", {
                  date: selectedDate?.toLocaleDateString() ?? "",
                })}
              </h4>
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <div key={event.id} className="p-2 border rounded-lg text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={getEventTypeColor(event.type)}
                        className="text-xs"
                      >
                        {t(event.type)}
                      </Badge>
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {event.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("noEventsScheduled")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t("announcements")}
            </CardTitle>
            <CardDescription>
              {t("latestUpdatesAndNotifications")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-3 border rounded-lg ${
                  announcement.read ? "bg-muted/30" : "bg-background"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={getPriorityColor(announcement.priority)}
                        className="text-xs"
                      >
                        {t(announcement.priority)}
                      </Badge>
                      {!announcement.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <h5 className="font-medium text-sm">
                      {announcement.title}
                    </h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {announcement.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {!announcement.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(announcement.id)}
                      className="text-xs"
                    >
                      {t("markRead")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("notificationSettings")}
            </CardTitle>
            <CardDescription>{t("configureAlerts")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Delivery Methods */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">{t("deliveryMethods")}</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{t("emailNotifications")}</span>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={() => toggleNotification("email")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{t("smsNotifications")}</span>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={() => toggleNotification("sms")}
                  />
                </div>
              </div>
            </div>

            {/* Notification Types */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">{t("notificationTypes")}</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{t("lowStockAlerts")}</span>
                  </div>
                  <Switch
                    checked={notifications.lowStock}
                    onCheckedChange={() => toggleNotification("lowStock")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{t("orderUpdates")}</span>
                  </div>
                  <Switch
                    checked={notifications.orders}
                    onCheckedChange={() => toggleNotification("orders")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{t("reportGeneration")}</span>
                  </div>
                  <Switch
                    checked={notifications.reports}
                    onCheckedChange={() => toggleNotification("reports")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{t("systemUpdates")}</span>
                  </div>
                  <Switch
                    checked={notifications.system}
                    onCheckedChange={() => toggleNotification("system")}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
