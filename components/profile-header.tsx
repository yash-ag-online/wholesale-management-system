"use client";

import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Building2, Calendar, Camera, LogOut, Mail } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const profileImageSchema = z.object({
  image: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, "Please select an image file.")
    .refine(
      (files) => files?.[0]?.size <= 5000000,
      "Max file size is 5MB.",
    )
    .refine(
      (files) =>
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
          files?.[0]?.type,
        ),
      "Only .jpg, .jpeg, .png and .webp formats are supported.",
    ),
});

type ProfileImageFormValues = z.infer<typeof profileImageSchema>;

export default function ProfileHeader() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch user data from Convex
  const userData = useQuery(
    api.user.getUserByClerkId,
    user ? { clerkId: user.id } : "skip",
  );

  // Fetch business data
  const businessData = useQuery(
    api.business.getBusinessById,
    userData?.exists && userData.user?.businessId
      ? { businessId: userData.user.businessId }
      : "skip",
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileImageFormValues>({
    resolver: zodResolver(profileImageSchema),
  });

  const onSubmit = async (data: ProfileImageFormValues) => {
    if (!user) return;

    try {
      setIsUpdating(true);
      const file = data.image[0];

      // Update profile image in Clerk
      await user.setProfileImage({ file });

      toast.success("Profile picture updated successfully!");

      setIsDialogOpen(false);
      reset();
    } catch (error) {
      console.error("Error updating profile image:", error);
      toast.error("Failed to update profile picture. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  if (!isLoaded || !userData) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  };

  // Format join date
  const formatJoinDate = () => {
    if (!user.createdAt) return "Recently";
    const date = new Date(user.createdAt);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
              <AvatarFallback className="text-2xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                  <DialogTitle>Update Profile Picture</DialogTitle>
                  <DialogDescription>
                    Upload a new profile picture. Max file size is 5MB.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Field>
                    <FieldLabel htmlFor="image">Profile Image</FieldLabel>
                    <Input
                      id="image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      {...register("image")}
                    />
                    {errors.image && (
                      <FieldError>{errors.image.message}</FieldError>
                    )}
                  </Field>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        reset();
                      }}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold">
                {user.fullName || "User"}
              </h1>
            </div>
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              <Badge
                variant={userData.user?.role === "admin"
                  ? "default"
                  : "secondary"}
              >
                {userData.user?.role === "admin" ? "Admin" : "Team Member"}
              </Badge>
              <div className="flex items-center gap-1">
                <Mail className="size-4" />
                {user.primaryEmailAddress?.emailAddress || "No email"}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                Joined {formatJoinDate()}
              </div>
              {businessData && (
                <div className="flex items-center gap-1">
                  <Building2 className="size-4" />
                  {businessData.name}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
