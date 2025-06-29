import React, { FC } from "react";
import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subText?: string;
}

const StatCard: FC<StatProps> = ({ title, value, icon: Icon, subText }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subText && <p className="text-xs text-muted-foreground">{subText}</p>}
      </CardContent>
    </Card>
  );
};

export default StatCard;
