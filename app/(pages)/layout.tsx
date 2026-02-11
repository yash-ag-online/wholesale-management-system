"use client";

import Dock from "@/components/dock";
import { Button } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserAvatar,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import BusinessSetup from "@/components/business-setup";
import { Loader2 } from "lucide-react";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoaded } = useUser();
  const userData = useQuery(
    api.user.getUserByClerkId,
    user ? { clerkId: user.id } : "skip",
  );

  // Wait for both Clerk and Convex to load
  const isLoading = !isLoaded || (user && userData === undefined);

  // Show business setup if:
  // 1. User is signed in with Clerk
  // 2. User doesn't exist in Convex (!userData?.exists) OR
  // 3. User exists but has no business association
  const showBusinessSetup = user && userData !== undefined && (
    !userData?.exists ||
    (userData.exists && userData.user && !userData.user.businessId)
  );

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="w-full min-h-screen max-w-3xl mx-auto flex items-center justify-center">
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen max-w-3xl mx-auto flex flex-col px-4">
      <div className="w-full flex items-end justify-end h-12 sticky top-0 z-50">
        <SignedIn>
          <Link href={`/profile`}>
            <UserAvatar />
          </Link>
        </SignedIn>
        <SignedOut>
          <Button asChild>
            <SignInButton />
          </Button>
        </SignedOut>
      </div>

      {!showBusinessSetup && (
        <div className="top-16 sticky inset-x-0 flex items-end justify-center z-50">
          <Dock />
        </div>
      )}

      <div className="flex-1 w-full pt-12 pb-4">
        {showBusinessSetup ? <BusinessSetup /> : children}
      </div>
    </div>
  );
}

export default Layout;
