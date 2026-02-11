"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { CustomerList } from "@/components/customer-list";
import { AddCustomerDialog } from "@/components/add-customer-dialog";

function Page() {
  const { user } = useUser();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Get current user's data
  const userData = useQuery(
    api.user.getUserByClerkId,
    user ? { clerkId: user.id } : "skip",
  );

  // Get customers for the business
  const customers = useQuery(
    api.customer.getCustomersByBusiness,
    userData?.exists && userData.user?.businessId
      ? { businessId: userData.user.businessId }
      : "skip",
  );

  if (!userData?.exists || !userData.user?.businessId) {
    return (
      <div className="w-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="font-medium text-lg flex items-center justify-between">
        Your Customers
        <Button size="lg" onClick={() => setIsAddDialogOpen(true)}>
          <Plus />
          Add Customer
        </Button>
      </div>

      <CustomerList
        customers={customers || []}
        businessId={userData.user.businessId}
      />

      <AddCustomerDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        businessId={userData.user.businessId}
      />
    </div>
  );
}

export default Page;
