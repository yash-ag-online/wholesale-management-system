"use client";

import { useState } from "react";
import {
  Eye,
  Mail,
  MoreVertical,
  Pencil,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Doc } from "@/convex/_generated/dataModel";
import { DeleteUserDialog } from "./delete-user-dialog";
import { Badge } from "./ui/badge";

interface UserListProps {
  users: Doc<"users">[];
  currentUserRole: "admin" | "teamMember";
}

export function UserList({ users, currentUserRole }: UserListProps) {
  const [selectedUser, setSelectedUser] = useState<Doc<"users"> | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isAdmin = currentUserRole === "admin";

  const handleUserClick = (user: Doc<"users">) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (user: Doc<"users">) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: Doc<"users">) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No team members yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
            onClick={() => handleUserClick(user)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{user.email.split("@")[0]}</h3>
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                >
                  {user.role === "admin"
                    ? (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </>
                    )
                    : (
                      <>
                        <User className="h-3 w-3 mr-1" />
                        Team Member
                      </>
                    )}
                </Badge>
              </div>
              <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </div>
              </div>
            </div>

            {isAdmin && user.role !== "admin" && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserClick(user);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(user);
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>

      {/* User Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedUser.email}</DialogTitle>
                <DialogDescription>User details</DialogDescription>
              </DialogHeader>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-base">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Role
                  </p>
                  <Badge
                    variant={selectedUser.role === "admin"
                      ? "default"
                      : "secondary"}
                  >
                    {selectedUser.role === "admin" ? "Admin" : "Team Member"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Clerk ID
                  </p>
                  <p className="text-base">{selectedUser.clerkId}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      {selectedUser && isAdmin && (
        <DeleteUserDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          user={selectedUser}
        />
      )}
    </>
  );
}
