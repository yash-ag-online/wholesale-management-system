"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Divide, Plus } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { OrderCard } from "@/components/order-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

function Page() {
  const { user } = useUser();
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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

  // Get orders for the business
  const orders = useQuery(
    api.order.getOrdersByBusiness,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer) {
      setDialogOpen(false);
      // Navigate to create order page with customer ID
      router.push(`/orders/create?customerId=${selectedCustomer}`);
    }
  };

  // Filter orders based on search query
  const filteredOrders = orders?.filter((order) => {
    if (!searchQuery) return true;
    const customer = customers?.find((c) => c._id === order.customerId);
    return (
      customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="w-full">
      <div className="font-medium text-lg flex items-center justify-between">
        Your Orders{" "}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild type="button">
            <Button size={"lg"}>
              <Plus /> New Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Customer</DialogTitle>
              <DialogDescription>
                Select a customer to create a new order for them.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <Field>
                <Label>Customers</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild className="w-full">
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {selectedCustomer
                        ? customers?.find((customer) =>
                          customer._id === selectedCustomer
                        )?.name
                        : "Select a customer..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-full min-w-(--radix-popover-trigger-width)">
                    <Command>
                      <CommandInput placeholder="Search customer..." />
                      <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                          {customers?.map((customer) => (
                            <CommandItem
                              key={customer._id}
                              value={customer.name}
                              onSelect={() => {
                                setSelectedCustomer(customer._id);
                                setOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCustomer === customer._id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {customer.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </Field>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setSelectedCustomer("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedCustomer}>
                  Continue
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Field orientation="horizontal" className="mt-4">
        <Input
          type="search"
          placeholder="Search by customer or order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Field>
      <div className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-2">
        {filteredOrders && filteredOrders.length > 0
          ? (
            filteredOrders.map((order) => {
              const customer = customers?.find((c) =>
                c._id === order.customerId
              );
              return (
                <OrderCard
                  key={order._id}
                  id={order._id}
                  date={new Date(order.createdAt).toLocaleDateString()}
                  customer={customer?.name || "Walk-in Customer"}
                  items={order.totalAmount}
                  total={order.totalAmount}
                  linkTo={`/orders/${order._id}`}
                />
              );
            })
          )
          : (
            searchQuery
              ? (
                <div className="flex items-center justify-center col-span-2 lg:col-span-3 text-muted-foreground text-sm">
                  No orders found matching your search.
                </div>
              )
              : (
                <div className="text-center border rounded-lg p-8 col-span-2 lg:col-span-3">
                  <p className="text-lg font-medium">No orders yet</p>
                  <p className="text-muted-foreground text-sm mt-2 mb-4">
                    Create your first order!
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus />
                    New Order
                  </Button>
                </div>
              )
          )}
      </div>
    </div>
  );
}

export default Page;
