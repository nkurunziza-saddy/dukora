"use client";

import { KeyIcon, ShieldIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      // TODO: Show error
      return;
    }
    // TODO: Implement password change
    console.log("Changing password...");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Security Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account security and password
        </p>
      </div>

      <Separator />

      {/* Password Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password for better security
          </CardDescription>
        </CardHeader>
        <CardPanel className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Current Password</FieldLabel>
              <Input
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                type="password"
                value={currentPassword}
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>New Password</FieldLabel>
              <Input
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                type="password"
                value={newPassword}
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field>
              <FieldLabel>Confirm New Password</FieldLabel>
              <Input
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                type="password"
                value={confirmPassword}
              />
            </Field>
          </FieldGroup>

          <Button onClick={handlePasswordChange}>Change Password</Button>
        </CardPanel>
      </Card>

      {/* Account Security Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldIcon className="h-5 w-5" />
            Account Security
          </CardTitle>
          <CardDescription>Your account security information</CardDescription>
        </CardHeader>
        <CardPanel className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Last Password Change:</span>
              <span className="text-sm text-muted-foreground">30 days ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">
                Two-Factor Authentication:
              </span>
              <span className="text-sm text-muted-foreground">Not enabled</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Active Sessions:</span>
              <span className="text-sm text-muted-foreground">2 devices</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              View Active Sessions
            </Button>
            <Button size="sm" variant="outline">
              Enable 2FA
            </Button>
          </div>
        </CardPanel>
      </Card>
    </div>
  );
}
