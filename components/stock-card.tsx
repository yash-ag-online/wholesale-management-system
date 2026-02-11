"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
import { Edit, Eye, Minus, Plus } from "lucide-react";

interface StockCardProps {
  id: Id<"stocks">;
  name: string;
  regularPrice: number;
  quantityAvailable: number;
  image: string;
  variant?: "display" | "editable" | "addable";
  onEdit?: (id: Id<"stocks">) => void;
  onAddToCart?: (id: Id<"stocks">) => void;
  onIncreaseQuantity?: (id: Id<"stocks">) => void;
  onDecreaseQuantity?: (id: Id<"stocks">) => void;
  onView?: (id: Id<"stocks">) => void;
  cartQuantity?: number; // Current quantity in cart
}

export function StockCard({
  id,
  name,
  regularPrice,
  quantityAvailable,
  image,
  variant = "display",
  onEdit,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onView,
  cartQuantity = 0,
}: StockCardProps) {
  const isLowStock = quantityAvailable < 50;
  const isOutOfStock = quantityAvailable === 0;
  const isInCart = cartQuantity > 0;

  const renderFooter = () => {
    switch (variant) {
      case "editable":
        return (
          <CardFooter className="gap-2 px-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => onView?.(id)}
            >
              <Eye className="w-4 h-4" />
              View
            </Button>
            <Button className="w-full" onClick={() => onEdit?.(id)}>
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </CardFooter>
        );

      case "addable":
        return (
          <CardFooter className="px-4">
            {isInCart
              ? (
                <div className="w-full flex items-center justify-between gap-2 border rounded-md p-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onDecreaseQuantity?.(id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold text-base min-w-8 text-center">
                    {cartQuantity}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onIncreaseQuantity?.(id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )
              : (
                <Button
                  className="w-full"
                  disabled={isOutOfStock}
                  onClick={() => onAddToCart?.(id)}
                >
                  <Plus className="w-4 h-4" />
                  {isOutOfStock ? "Out of Stock" : "Add"}
                </Button>
              )}
          </CardFooter>
        );

      case "display":
      default:
        return <></>;
    }
  };

  return (
    <Card className="relative mx-auto w-full max-w-sm p-0 pb-4 flex flex-col gap-4 overflow-hidden">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      <img
        src={image}
        alt={name}
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />

      {/* Badge right after image */}
      <div className="px-4">
        {isOutOfStock
          ? <Badge variant="destructive">Out of Stock</Badge>
          : isLowStock
          ? <Badge variant="secondary">Low Stock</Badge>
          : <Badge variant="default">In Stock</Badge>}
      </div>

      <CardHeader className="pb-2 px-4">
        <CardTitle className="line-clamp-2 leading-normal">{name}</CardTitle>
        <CardDescription>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold text-foreground">
              ₹{regularPrice}
            </span>
            <span className="text-sm">Available: {quantityAvailable}</span>
          </div>
        </CardDescription>
      </CardHeader>

      <div className="mt-auto">{renderFooter()}</div>
    </Card>
  );
}
