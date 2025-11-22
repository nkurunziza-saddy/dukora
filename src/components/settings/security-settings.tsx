"use client";

import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSecurityInfo, useUserSessions } from "@/lib/hooks/use-queries";
import {
  changePassword,
  revokeAllOtherSessions,
  revokeSession,
  setPassword,
} from "@/server/actions/security-actions";

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOthers, setRevokeOthers] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showSessionsDialog, setShowSessionsDialog] = useState(false);

  const {
    data: securityInfo,
    isLoading: isSecurityInfoLoading,
    refetch: refetchSecurityInfo,
  } = useSecurityInfo();

  const {
    data: sessions,
    isLoading: isSessionsLoading,
    refetch: refetchSessions,
  } = useUserSessions(showSessionsDialog);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsChangingPassword(true);
    const result = await changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: revokeOthers,
    });

    if (result.data) {
      toast.success("Password changed successfully", {
        description: revokeOthers
          ? "All other sessions have been logged out"
          : undefined,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setRevokeOthers(false);
      refetchSecurityInfo();
    } else if (result.error) {
      if (result.error === "INVALID_CREDENTIALS") {
        toast.error("Current password is incorrect");
      } else {
        toast.error("Failed to change password");
      }
    }
    setIsChangingPassword(false);
  };

  const handleAddPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsChangingPassword(true);
    const result = await setPassword(newPassword);

    if (result.data) {
      toast.success("Password added successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      refetchSecurityInfo();
    } else if (result.error) {
      toast.error("Failed to add password");
    }
    setIsChangingPassword(false);
  };

  const handleRevokeSession = async (sessionToken: string) => {
    const result = await revokeSession(sessionToken);
    if (result.data) {
      toast.success("Session revoked successfully");
      refetchSessions();
      refetchSecurityInfo();
    } else {
      toast.error("Failed to revoke session");
    }
  };

  const handleRevokeAllOthers = async () => {
    const result = await revokeAllOtherSessions({});
    if (result.data) {
      toast.success("All other sessions have been revoked");
      refetchSessions();
      refetchSecurityInfo();
    } else {
      toast.error("Failed to revoke sessions");
    }
  };

  const handleViewSessions = () => {
    setShowSessionsDialog(true);
  };

  const formatLastPasswordChange = () => {
    if (!securityInfo?.lastPasswordChange) {
      return "Never";
    }
    return format(new Date(securityInfo.lastPasswordChange), "PPP");
  };

  return (
    <div className="space-y-4">
      {securityInfo?.hasPassword ? (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your account password for better security
            </CardDescription>
          </CardHeader>
          <CardPanel className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Current Password</FieldLabel>
                <Input
                  disabled={isChangingPassword || !securityInfo?.hasPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  type="password"
                  value={currentPassword}
                />
              </Field>

              <Field>
                <FieldLabel>New Password</FieldLabel>
                <Input
                  disabled={isChangingPassword || !securityInfo?.hasPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  type="password"
                  value={newPassword}
                />
              </Field>

              <Field>
                <FieldLabel>Confirm New Password</FieldLabel>
                <Input
                  disabled={isChangingPassword || !securityInfo?.hasPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  type="password"
                  value={confirmPassword}
                />
              </Field>

              <Field>
                <FieldLabel>
                  <Checkbox
                    checked={revokeOthers}
                    disabled={isChangingPassword || !securityInfo?.hasPassword}
                    onCheckedChange={(checked) =>
                      setRevokeOthers(checked as boolean)
                    }
                  />
                  Revoke all other sessions
                </FieldLabel>
              </Field>
            </FieldGroup>

            <div className="flex justify-end pt-6 border-t">
              <Button
                className="min-w-[120px]"
                disabled={isChangingPassword || !securityInfo?.hasPassword}
                onClick={handlePasswordChange}
              >
                {isChangingPassword ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </CardPanel>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Add Password</CardTitle>
            <CardDescription>
              Add a password for your account for better security
            </CardDescription>
          </CardHeader>
          <CardPanel className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>New Password</FieldLabel>
                <Input
                  disabled={isChangingPassword || securityInfo?.hasPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  type="password"
                  value={newPassword}
                />
              </Field>

              <Field>
                <FieldLabel>Confirm New Password</FieldLabel>
                <Input
                  disabled={isChangingPassword || securityInfo?.hasPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  type="password"
                  value={confirmPassword}
                />
              </Field>
            </FieldGroup>

            <div className="flex justify-end pt-6 border-t">
              <Button
                className="min-w-[120px]"
                disabled={isChangingPassword || securityInfo?.hasPassword}
                onClick={handleAddPassword}
              >
                {isChangingPassword ? "Adding..." : "Add Password"}
              </Button>
            </div>
          </CardPanel>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Account Security
          </CardTitle>
          <CardDescription>Your account security information</CardDescription>
        </CardHeader>
        <CardPanel className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Last Password Change:</span>
              <span className="text-sm text-muted-foreground">
                {isSecurityInfoLoading
                  ? "Loading..."
                  : formatLastPasswordChange()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Active Sessions:</span>
              <span className="text-sm text-muted-foreground">
                {isSecurityInfoLoading
                  ? "Loading..."
                  : `${securityInfo?.activeSessionCount || 0} ${
                      securityInfo?.activeSessionCount === 1
                        ? "device"
                        : "devices"
                    }`}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleViewSessions} size="sm" variant="outline">
              View Active Sessions
            </Button>
            {(securityInfo?.activeSessionCount || 0) > 1 && (
              <Button
                onClick={handleRevokeAllOthers}
                size="sm"
                variant="outline"
              >
                Revoke All Other Sessions
              </Button>
            )}
          </div>
        </CardPanel>
      </Card>

      <Dialog onOpenChange={setShowSessionsDialog} open={showSessionsDialog}>
        <DialogPopup className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Active Sessions</DialogTitle>
            <DialogDescription>
              Manage your active sessions across different devices
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {isSessionsLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading sessions...
              </p>
            ) : !sessions || sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active sessions
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  className="border rounded-lg p-4 space-y-2"
                  key={session.id}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {session.userAgent || "Unknown Device"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        IP: {session.ipAddress || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {format(new Date(session.createdAt), "PPp")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last Active:{" "}
                        {format(new Date(session.updatedAt), "PPp")}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRevokeSession(session.token)}
                      size="sm"
                      variant="destructive-outline"
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogPopup>
      </Dialog>
    </div>
  );
}
