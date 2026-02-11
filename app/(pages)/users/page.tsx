"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { UserList } from "@/components/user-list";
import { AddUserDialog } from "@/components/add-user-dialog";

function Page() {
  const { user } = useUser();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Get current user's data
  const userData = useQuery(
    api.user.getUserByClerkId,
    user ? { clerkId: user.id } : "skip",
  );

  // Get users for the business
  const users = useQuery(
    api.user.getUsersByBusiness,
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

  // Only admins can add users
  const canAddUsers = userData.user.role === "admin";

  return (
    <div className="w-full space-y-6">
      <div className="font-medium text-lg flex items-center justify-between">
        Team Members
        {canAddUsers && (
          <Button
            size="lg"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus />
            Add User
          </Button>
        )}
      </div>

      <UserList users={users || []} currentUserRole={userData.user.role} />

      {canAddUsers && (
        <AddUserDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          businessId={userData.user.businessId}
        />
      )}
    </div>
  );
}

export default Page;
