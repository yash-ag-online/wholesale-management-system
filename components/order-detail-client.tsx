"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Package, Pencil, User } from "lucide-react";
import { EditOrderDialog } from "@/components/edit-order-dialog";

interface OrderDetailClientProps {
  orderId: string;
}

export function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const orderDetails = useQuery(api.order.getOrderWithDetails, {
    orderId: orderId as Id<"orders">,
  });

  if (!orderDetails) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  const { customer, createdByUser, items } = orderDetails;

  return (
    <>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-medium">Order Details</h1>
            <p className="text-sm text-muted-foreground">
              Order ID: {orderId.slice(-8)}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Order
          </Button>
        </div>

        {/* Order Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Customer
                  </p>
                  <p className="font-semibold">
                    {customer?.name || "Walk-in Customer"}
                  </p>
                  {customer?.phone && (
                    <p className="text-sm text-muted-foreground">
                      {customer.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Order Date
                  </p>
                  <p className="font-semibold">
                    {new Date(orderDetails.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(orderDetails.createdAt).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
              </div>

              {/* Created By */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created By
                  </p>
                  <p className="font-semibold">
                    {createdByUser?.email || "Unknown"}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {createdByUser?.role || "Unknown"}
                  </Badge>
                </div>
              </div>

              {/* Total Items */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Items
                  </p>
                  <p className="font-semibold">
                    {items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items Card */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item._id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex items-center gap-4">
                    {item.stockImage && (
                      <img
                        src={item.stockImage}
                        alt={item.stockName}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base">
                        {item.stockName}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>Qty: {item.quantity}</span>
                        <span>Unit Price: ₹{item.unitPrice}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        ₹{item.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <Separator className="my-6" />
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-primary">
                ₹{orderDetails.totalAmount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <EditOrderDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        orderId={orderId as Id<"orders">}
        businessId={orderDetails.businessId}
        customerId={orderDetails.customerId}
        currentItems={items.map((item) => ({
          stockId: item.stockId,
          quantity: item.quantity,
          stockName: item.stockName,
          stockImage: item.stockImage,
          unitPrice: item.unitPrice,
        }))}
      />
    </>
  );
}
