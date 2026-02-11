"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Edit, Plus } from "lucide-react";
import { StockCard } from "@/components/stock-card";
import { StockListManager } from "@/components/stock-list-manager";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function Page() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const convexUser = useQuery(
    api.user.getUserByClerkId,
    user ? { clerkId: user.id } : "skip",
  );

  const stocks = useQuery(
    api.stock.getStocksByBusiness,
    convexUser?.exists && convexUser.user?.businessId
      ? { businessId: convexUser.user.businessId }
      : "skip",
  );

  const businessId = convexUser?.user?.businessId;

  // 🔥 Filtered Stocks
  const filteredStocks = useMemo(() => {
    if (!stocks) return [];
    return stocks.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stocks, searchTerm]);

  return (
    <div className="w-full">
      <div className="font-medium text-lg flex items-center justify-between">
        Your Stock
        <Button size="lg" onClick={() => setIsEditing(!isEditing)}>
          <Edit />
          {isEditing ? "Close Edit" : "Edit List"}
        </Button>
      </div>

      {!isEditing && (
        <>
          <Field orientation="horizontal" className="mt-4">
            <Input
              type="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Field>

          {/* 🔥 Empty State */}
          {stocks && stocks.length === 0 && (
            <div className="mt-10 text-center border rounded-lg p-8">
              <p className="text-lg font-medium">No stock available</p>
              <p className="text-muted-foreground text-sm mt-2">
                Add products to start managing your inventory.
              </p>
              <Button
                className="mt-4"
                onClick={() => setIsEditing(true)}
              >
                <Plus /> Add Stock
              </Button>
            </div>
          )}

          {/* 🔥 No Search Results */}
          {stocks && stocks.length > 0 && filteredStocks.length === 0 && (
            <div className="mt-10 text-center text-muted-foreground">
              No matching stock found.
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
            {filteredStocks.map((item) => (
              <StockCard
                key={item._id}
                id={item._id}
                name={item.name}
                regularPrice={item.regularPrice}
                quantityAvailable={item.quantityAvailable}
                image={item.image}
              />
            ))}
          </div>
        </>
      )}

      {/* 🔥 Stock Manager */}
      {isEditing && businessId && (
        <StockListManager
          businessId={businessId}
          stocks={stocks ?? []}
        />
      )}
    </div>
  );
}
