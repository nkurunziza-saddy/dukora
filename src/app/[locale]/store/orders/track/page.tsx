// import Link from "next/link";
// import { getTranslations } from "next-intl/server";
// import { Suspense } from "react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { getCustomerOrders } from "@/server/actions/customer-order-actions";

// function TrackOrderLoading() {
//   return (
//     <div className="space-y-2">
//       <div className="mb-8">
//         <Skeleton className="h-8 w-1/4 mb-2" />
//         <Skeleton className="h-4 w-1/2" />
//       </div>
//       <Skeleton className="h-12 w-full" />
//       <Skeleton className="h-12 w-full" />
//       <Skeleton className="h-12 w-full" />
//       <Skeleton className="h-12 w-full" />
//       <Skeleton className="h-12 w-full" />
//     </div>
//   );
// }

// async function TrackOrderContent() {
//   const t = await getTranslations("store.orders.track");
//   const result = await getCustomerOrders({});

//   if (result.error || !result.data) {
//     return (
//       <>
//         <div className="mb-8">
//           <h1 className="text-xl font-medium text-foreground mb-2 text-balance">
//             {t("myOrders")}
//           </h1>
//           <p className="text-sm text-text-secondary text-pretty">
//             {t("myOrdersDescription")}
//           </p>
//         </div>
//         <Empty>
//           <EmptyTitle>{t("ordersNotFound")}</EmptyTitle>
//         </Empty>
//       </>
//     );
//   }

//   const orders = result.data;

//   if (orders.length === 0) {
//     return (
//       <>
//         <div className="mb-8">
//           <h1 className="text-xl font-medium text-foreground mb-2 text-balance">
//             {t("myOrders")}
//           </h1>
//           <p className="text-sm text-text-secondary text-pretty">
//             {t("myOrdersDescription")}
//           </p>
//         </div>
//         <Empty>
//           <EmptyHeader>
//
// <EmptyTitle>{t("noOrdersFound")}</EmptyTitle>
//           <EmptyDescription>{t("noOrdersFoundDescription")}</EmptyDescription>
//
// </EmptyHeader>
//           <Button render={<Link href="/store/products" />}>
//             {t("continueShopping")}
//           </Button>
//         </Empty>
//       </>
//     );
//   }

//   return (
//     <>
//       <div className="mb-8">
//         <h1 className="text-xl font-medium text-foreground mb-2 text-balance">
//           {t("myOrders")}
//         </h1>
//         <p className="text-sm text-text-secondary text-pretty">
//           {t("myOrdersDescription")}
//         </p>
//       </div>
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>{t("orderNumber")}</TableHead>
//             <TableHead>{t("orderDate")}</TableHead>
//             <TableHead>{t("status")}</TableHead>
//             <TableHead className="text-right">{t("total")}</TableHead>
//             <TableHead />
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {orders.map((order) => (
//             <TableRow key={order.id}>
//               <TableCell className="font-medium">{order.orderNumber}</TableCell>
//               <TableCell>
//                 {new Date(order.createdAt).toLocaleDateString()}
//               </TableCell>
//               <TableCell>
//                 <Badge variant="outline">{order.status}</Badge>
//               </TableCell>
//               <TableCell className="text-right">
//                 ${parseFloat(order.totalAmount).toFixed(2)}
//               </TableCell>
//               <TableCell className="text-right">
//                 <Button
//                   render={<Link href={`/store/orders/${order.id}`} />}
//                   size="sm"
//                   variant="outline"
//                 >
//                   {t("viewOrder")}
//                 </Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </>
//   );
// }

export default function TrackOrderPage() {
  return (
    <div className="pt-10 pb-24 md:pb-32 md:pt-16 lg:pb-40 min-h-[calc(100vh-3rem)]">
      <div className="pgtx ">
        {/* <Suspense fallback={<TrackOrderLoading />}>
          <TrackOrderContent />
        </Suspense> */}
      </div>
    </div>
  );
}
