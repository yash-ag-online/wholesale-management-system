"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Check, Trash2, X } from "lucide-react";

interface SpecialPricesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: Id<"customers">;
  customerName: string;
  businessId: Id<"businesses">;
}

export function SpecialPricesDialog({
  open,
  onOpenChange,
  customerId,
  customerName,
  businessId,
}: SpecialPricesDialogProps) {
  const [editingStockId, setEditingStockId] = useState<Id<"stocks"> | null>(
    null,
  );
  const [specialPriceInput, setSpecialPriceInput] = useState("");

  const stocks = useQuery(
    api.stock.getStocksByBusiness,
    open ? { businessId } : "skip",
  );
  const specialPrices = useQuery(
    api.customer.getCustomerSpecialPrices,
    open ? { customerId } : "skip",
  );

  const setSpecialPrice = useMutation(api.customer.setSpecialPrice);
  const removeSpecialPrice = useMutation(
    api.customer.removeSpecialPrice,
  );

  const specialPricesMap = new Map(
    specialPrices?.map((sp) => [sp.stockId, sp]) || [],
  );

  const handleSetPrice = async (stockId: Id<"stocks">) => {
    const price = parseFloat(specialPriceInput);
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      await setSpecialPrice({
        businessId,
        customerId,
        stockId,
        specialPrice: price,
      });
      toast.success("Special price set successfully");
      setEditingStockId(null);
      setSpecialPriceInput("");
    } catch (error) {
      toast.error("Failed to set special price");
    }
  };

  const handleRemovePrice = async (stockId: Id<"stocks">) => {
    try {
      await removeSpecialPrice({ customerId, stockId });
      toast.success("Special price removed");
    } catch (error) {
      toast.error("Failed to remove special price");
    }
  };

  const startEditing = (stockId: Id<"stocks">, currentPrice?: number) => {
    setEditingStockId(stockId);
    setSpecialPriceInput(currentPrice?.toString() || "");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Special Prices for {customerName}</DialogTitle>
          <DialogDescription>
            Set custom prices for specific products for this customer
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {stocks?.map((stock) => {
              const specialPrice = specialPricesMap.get(stock._id);
              const isEditing = editingStockId === stock._id;

              return (
                <div
                  key={stock._id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <img
                    src={stock.image}
                    alt={stock.name}
                    className="w-16 h-16 object-cover rounded"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{stock.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Regular: ₹{stock.regularPrice}
                    </p>
                    {specialPrice && !isEditing && (
                      <p className="text-xs text-green-600 font-medium">
                        Special: ₹{specialPrice.specialPrice}
                      </p>
                    )}
                  </div>

                  {isEditing
                    ? (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <Label
                            htmlFor={`price-${stock._id}`}
                            className="text-xs"
                          >
                            Special Price
                          </Label>
                          <Input
                            id={`price-${stock._id}`}
                            type="number"
                            step="0.01"
                            value={specialPriceInput}
                            onChange={(e) =>
                              setSpecialPriceInput(e.target.value)}
                            className="w-28 h-8"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="flex gap-1 mt-5">
                          <Button
                            size="icon"
                            variant="default"
                            className="h-8 w-8"
                            onClick={() => handleSetPrice(stock._id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingStockId(null);
                              setSpecialPriceInput("");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                    : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            startEditing(stock._id, specialPrice?.specialPrice)}
                        >
                          {specialPrice ? "Edit" : "Set Price"}
                        </Button>
                        {specialPrice && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleRemovePrice(stock._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
