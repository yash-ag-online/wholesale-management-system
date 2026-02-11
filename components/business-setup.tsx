"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export default function BusinessSetup() {
  const { user } = useUser();
  const [businessName, setBusinessName] = useState("");
  const [businessCode, setBusinessCode] = useState("");
  const [loading, setLoading] = useState(false);

  const createBusinessWithOwner = useMutation(
    api.business.createBusinessWithOwner,
  );
  const joinBusiness = useMutation(api.user.createUser);

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !businessName.trim()) return;

    setLoading(true);
    try {
      await createBusinessWithOwner({
        businessName: businessName.trim(),
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
      });
      toast.success("Business created successfully!");
    } catch (error) {
      toast.error("Failed to create business");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !businessCode.trim()) return;

    setLoading(true);
    try {
      // You'll need to create a query to get business by code/invite
      // For now, this is a placeholder
      await joinBusiness({
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        businessId: businessCode as any, // Replace with actual business lookup
      });
      toast.success("Joined team successfully!");
    } catch (error) {
      toast.error("Failed to join team");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome! Let's get you started</CardTitle>
          <CardDescription>
            Create your own business or join an existing team to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Business</TabsTrigger>
              <TabsTrigger value="join">Join Team</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <form onSubmit={handleCreateBusiness} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    placeholder="Enter your business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Create Business"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="join">
              <form onSubmit={handleJoinTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-code">
                    Business Code or Invite Link
                  </Label>
                  <Input
                    id="business-code"
                    placeholder="Enter business code"
                    value={businessCode}
                    onChange={(e) => setBusinessCode(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Joining..." : "Join Team"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
