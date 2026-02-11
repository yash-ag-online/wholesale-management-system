import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createStock = mutation({
  args: {
    businessId: v.id("businesses"),
    name: v.string(),
    regularPrice: v.number(),
    quantityAvailable: v.number(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stocks", {
      businessId: args.businessId,
      name: args.name,
      regularPrice: args.regularPrice,
      quantityAvailable: args.quantityAvailable,
      image: args.image,
      createdAt: Date.now(),
    });
  },
});

export const getStocksByBusiness = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stocks")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .collect();
  },
});

export const updateStockQuantity = mutation({
  args: {
    stockId: v.id("stocks"),
    quantityAvailable: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.stockId, {
      quantityAvailable: args.quantityAvailable,
    });
  },
});

export const deleteStock = mutation({
  args: {
    stockId: v.id("stocks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.stockId);
  },
});

export const updateStock = mutation({
  args: {
    stockId: v.id("stocks"),
    name: v.optional(v.string()),
    regularPrice: v.optional(v.number()),
    quantityAvailable: v.optional(v.number()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { stockId, ...updates } = args;
    await ctx.db.patch(stockId, updates);
  },
});

export const getStocksForOrder = query({
  args: {
    businessId: v.id("businesses"),
    customerId: v.optional(v.id("customers")),
  },
  handler: async (ctx, args) => {
    const stocks = await ctx.db
      .query("stocks")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .collect();

    // If no customer → regular price
    if (!args.customerId) {
      return stocks.map((stock) => ({
        ...stock,
        finalPrice: stock.regularPrice,
        hasSpecialPrice: false,
      }));
    }

    const customerId = args.customerId;

    const specialPrices = await ctx.db
      .query("customerSpecialPrices")
      .withIndex("by_customer", (q) => q.eq("customerId", customerId))
      .collect();

    const specialMap = new Map(
      specialPrices.map((sp) => [sp.stockId, sp.specialPrice]),
    );

    return stocks.map((stock) => {
      const special = specialMap.get(stock._id);

      return {
        ...stock,
        finalPrice: special ?? stock.regularPrice,
        hasSpecialPrice: !!special,
      };
    });
  },
});
