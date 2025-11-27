import {
  AlertCircleIcon,
  ArrowDownIcon,
  DollarSignIcon,
  SendIcon,
  TrendingUpIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import CreateCustomerPaymentForm from "@/components/forms/create-customer-payment-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getInterBusinessPayments } from "@/server/actions/payments/inter-business-actions";
import { getCustomerPayments } from "@/server/actions/shopper/payments-actions";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "payments",
  });
}

async function PaymentsContent() {
  const t = await getTranslations("payments");

  const { data: interBusinessPayments, error: interBusinessError } =
    await getInterBusinessPayments({
      page: 1,
      pageSize: 10,
    });

  const { data: customerPayments, error: customerPaymentsError } =
    await getCustomerPayments({
      page: 1,
      pageSize: 10,
    });

  if (interBusinessError || customerPaymentsError) {
    return (
      <div className="space-y-6">
        <div className="head">
          <h1 className="">{t("title")}</h1>
          <p className="">{t("description")}</p>
        </div>
        <div className="">
          <Alert className="max-w-xl" variant="error">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>Error loading payments</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const allPayments = [
    ...(interBusinessPayments?.payments || []).map((payment) => ({
      id: payment.id,
      type: "sent" as const,
      amount: parseFloat(payment.amount),
      business: payment.receiverBusinessId,
      date: new Date(payment.createdAt).toISOString(),
      status: payment.status === "succeeded" ? "completed" : "pending",
      description: `Payment to business`,
    })),
    ...(customerPayments?.payments || []).map((payment) => ({
      id: payment.id,
      type: "received" as const,
      amount: payment.amount / 100, // Convert from cents
      business: payment.metadata?.customerEmail || "Customer",
      date: new Date(payment.created * 1000).toISOString(),
      status: payment.status === "succeeded" ? "completed" : "pending",
      description: `Customer payment`,
    })),
  ];

  const totalSent = allPayments
    .filter((p) => p.type === "sent")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalReceived = allPayments
    .filter((p) => p.type === "received")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = allPayments.filter(
    (p) => p.status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="head">
          <h1 className="">{t("title")}</h1>
          <p className="">{t("description")}</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              <ArrowDownIcon className="mr-2 h-4 w-4" />
              {t("receivePayment")}
            </DialogTrigger>
            <DialogPopup>
              <DialogHeader>
                <DialogTitle>{t("createPaymentLink")}</DialogTitle>
                <DialogDescription>
                  {t("createPaymentLinkDescription")}
                </DialogDescription>
              </DialogHeader>
              <CreateCustomerPaymentForm />
            </DialogPopup>
          </Dialog>
          <Button>
            <SendIcon className="mr-2 h-4 w-4" />
            {t("sendPayment")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalSent")}
            </CardTitle>
            <SendIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardPanel>
            <div className="text-2xl font-bold">${totalSent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {t("paymentsToBusinesses")}
            </p>
          </CardPanel>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalReceived")}
            </CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardPanel>
            <div className="text-2xl font-bold text-success-foreground">
              ${totalReceived.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("paymentsFromCustomers")}
            </p>
          </CardPanel>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("netBalance")}
            </CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardPanel>
            <div
              className={`text-2xl font-bold ${totalReceived - totalSent >= 0 ? "text-success-foreground" : "text-destructive-foreground"}`}
            >
              ${(totalReceived - totalSent).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("currentBalance")}
            </p>
          </CardPanel>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("pending")}
            </CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardPanel>
            <div className="text-2xl font-bold text-orange-600">
              {pendingPayments}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("awaitingConfirmation")}
            </p>
          </CardPanel>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentPayments")}</CardTitle>
          <CardDescription>{t("latestPaymentTransactions")}</CardDescription>
        </CardHeader>
        <CardPanel>
          <div className="space-y-4">
            {allPayments.map((payment) => (
              <div
                className="flex items-center justify-between p-4 border rounded-lg"
                key={payment.id}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      payment.type === "sent"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-success text-success-foreground"
                    }`}
                  >
                    {payment.type === "sent" ? (
                      <SendIcon className="h-5 w-5" />
                    ) : (
                      <ArrowDownIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{payment.business}</h3>
                    <p className="text-sm text-muted-foreground">
                      {payment.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-medium ${
                      payment.type === "sent"
                        ? "text-destructive-foreground"
                        : "text-success-foreground"
                    }`}
                  >
                    {payment.type === "sent" ? "-" : "+"}$
                    {payment.amount.toFixed(2)}
                  </div>
                  <Badge
                    variant={
                      payment.status === "completed" ? "default" : "secondary"
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardPanel>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("sendPayment")}</CardTitle>
            <CardDescription>{t("payOtherBusinesses")}</CardDescription>
          </CardHeader>
          <CardPanel>
            <Button className="w-full">
              <SendIcon className="mr-2 h-4 w-4" />
              {t("sendPaymentToBusiness")}
            </Button>
          </CardPanel>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("receivePayment")}</CardTitle>
            <CardDescription>{t("generatePaymentLinks")}</CardDescription>
          </CardHeader>
          <CardPanel>
            <Dialog>
              <DialogTrigger
                render={<Button className="w-full" variant="outline" />}
              >
                <ArrowDownIcon className="mr-2 h-4 w-4" />
                {t("createPaymentLink")}
              </DialogTrigger>
              <DialogPopup>
                <DialogHeader>
                  <DialogTitle>{t("createPaymentLink")}</DialogTitle>
                  <DialogDescription>
                    {t("createPaymentLinkDescription")}
                  </DialogDescription>
                </DialogHeader>
                <CreateCustomerPaymentForm />
              </DialogPopup>
            </Dialog>
          </CardPanel>
        </Card>
      </div>
    </div>
  );
}

export default async function PaymentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentsContent />
    </Suspense>
  );
}
