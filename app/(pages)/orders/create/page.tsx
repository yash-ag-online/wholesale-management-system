"use client";

import { StockCard } from "@/components/stock-card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface CartItem {
  id: Id<"stocks">;
  name: string;
  regularPrice: number;
  quantity: number;
  image: string;
}

function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const customerId = searchParams.get("customerId") as Id<"customers"> | null;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Get current user's data
  const userData = useQuery(
    api.user.getUserByClerkId,
    user ? { clerkId: user.id } : "skip",
  );

  // Get customer data
  const customer = useQuery(
    api.customer.getCustomerById,
    customerId ? { customerId } : "skip",
  );

  // Get stocks for the business
  const stocks = useQuery(
    api.stock.getStocksForOrder,
    userData?.exists && userData.user?.businessId && customerId
      ? {
        businessId: userData.user.businessId,
        customerId: customerId,
      }
      : "skip",
  );

  const createOrder = useMutation(api.order.createOrder);

  // Redirect if no customer ID
  useEffect(() => {
    if (!customerId) {
      router.push("/orders");
    }
  }, [customerId, router]);

  if (!userData?.exists || !userData.user?.businessId || !customerId) {
    return (
      <div className="w-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleAddToCart = (id: Id<"stocks">) => {
    const item = stocks?.find((stock) => stock._id === id);
    if (!item) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === id);

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [
          ...prevCart,
          {
            id: item._id,
            name: item.name,
            regularPrice: item.finalPrice, // Use finalPrice instead
            quantity: 1,
            image: item.image,
            hasSpecialPrice: item.hasSpecialPrice, // Optional: track if special price
          },
        ];
      }
    });
  };

  const handleIncreaseQuantity = (id: Id<"stocks">) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (id: Id<"stocks">) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (id: Id<"stocks">) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const getCartQuantity = (id: Id<"stocks">) => {
    const item = cart.find((cartItem) => cartItem.id === id);
    return item ? item.quantity : 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.regularPrice * item.quantity,
    0,
  );

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      setIsPlacingOrder(true);

      const items = cart.map((item) => ({
        stockId: item.id,
        quantity: item.quantity,
      }));

      await createOrder({
        businessId: userData.user!.businessId!,
        customerId: customerId,
        createdBy: userData.user!._id,
        items,
      });

      toast.success("Order placed successfully!");
      setCart([]);
      router.push("/orders");
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">
              Order for {customer?.name || "Customer"}
            </h2>
            <Badge
              className="text-xs sm:text-sm uppercase w-fit"
              variant={"outline"}
            >
              Items: {totalItems.toString().padStart(2, "0")}
            </Badge>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" className="sm:size-default">
                <span className="text-xs sm:text-sm">View Summary</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg flex flex-col pb-4">
              <SheetHeader>
                <SheetTitle className="text-lg sm:text-xl">
                  Order Summary
                </SheetTitle>
                <SheetDescription className="text-xs sm:text-sm">
                  Review your selected items before placing the order.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 flex flex-col mt-4 sm:mt-6 overflow-hidden px-4">
                {cart.length === 0
                  ? (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xs sm:text-sm text-muted-foreground text-center px-4">
                        No items added yet. Start adding items to your order.
                      </p>
                    </div>
                  )
                  : (
                    <>
                      <ScrollArea className="flex-1">
                        <div className="space-y-2 sm:space-y-3">
                          {cart.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs sm:text-sm line-clamp-1">
                                  {item.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ₹{item.regularPrice}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-7 w-7 sm:h-8 sm:w-8"
                                  onClick={() =>
                                    handleDecreaseQuantity(item.id)}
                                >
                                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-7 w-7 sm:h-8 sm:w-8"
                                  onClick={() =>
                                    handleIncreaseQuantity(item.id)}
                                >
                                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 sm:h-8 sm:w-8 text-destructive"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="border-t mt-4 pt-3 sm:pt-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Total Items:
                          </span>
                          <span className="text-xs sm:text-sm font-medium">
                            {totalItems}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm sm:text-base font-semibold">
                            Total Amount:
                          </span>
                          <span className="text-sm sm:text-base font-semibold">
                            ₹{totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full mt-3 sm:mt-4"
                        size="default"
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder}
                      >
                        <span className="text-xs sm:text-sm">
                          {isPlacingOrder ? "Placing Order..." : "Place Order"}
                        </span>
                      </Button>
                    </>
                  )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-2 sm:mt-4">
          {stocks && stocks.length > 0
            ? (
              stocks.map((item) => {
                return (
                  <StockCard
                    key={item._id}
                    id={item._id}
                    name={item.name}
                    regularPrice={item.finalPrice}
                    quantityAvailable={item.quantityAvailable}
                    image={item.image}
                    variant={"addable"}
                    onAddToCart={handleAddToCart}
                    onIncreaseQuantity={handleIncreaseQuantity}
                    onDecreaseQuantity={handleDecreaseQuantity}
                    cartQuantity={getCartQuantity(item._id)}
                  />
                );
              })
            )
            : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No stock available</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default Page;
