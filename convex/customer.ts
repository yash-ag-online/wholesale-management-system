import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getCustomerById = query({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    return customer;
  },
});

export const getPriceForCustomer = query({
  args: {
    customerId: v.id("customers"),
    stockId: v.id("stocks"),
  },
  handler: async (ctx, args) => {
    const special = await ctx.db
      .query("customerSpecialPrices")
      .withIndex(
        "by_customer_and_stock",
        (q) =>
          q.eq("customerId", args.customerId)
            .eq("stockId", args.stockId),
      )
      .unique();

    if (special) {
      return special.specialPrice;
    }

    const stock = await ctx.db.get(args.stockId);
    return stock?.regularPrice ?? 0;
  },
});

export const getCustomersByBusiness = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .order("desc") // newest first
      .collect();

    return customers;
  },
});

export const createCustomer = mutation({
  args: {
    businessId: v.id("businesses"),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const customerId = await ctx.db.insert("customers", {
      businessId: args.businessId,
      name: args.name,
      phone: args.phone,
      email: args.email,
      createdAt: Date.now(),
    });

    return customerId;
  },
});

export const updateCustomer = mutation({
  args: {
    customerId: v.id("customers"),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.customerId, {
      name: args.name,
      phone: args.phone,
      email: args.email,
    });
  },
});

export const deleteCustomer = mutation({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.customerId);
  },
});

export const setSpecialPrice = mutation({
  args: {
    businessId: v.id("businesses"),
    customerId: v.id("customers"),
    stockId: v.id("stocks"),
    specialPrice: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if special price already exists
    const existing = await ctx.db
      .query("customerSpecialPrices")
      .withIndex(
        "by_customer_and_stock",
        (q) => q.eq("customerId", args.customerId).eq("stockId", args.stockId),
      )
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        specialPrice: args.specialPrice,
      });
      return existing._id;
    } else {
      // Create new
      return await ctx.db.insert("customerSpecialPrices", {
        businessId: args.businessId,
        customerId: args.customerId,
        stockId: args.stockId,
        specialPrice: args.specialPrice,
        createdAt: Date.now(),
      });
    }
  },
});

export const removeSpecialPrice = mutation({
  args: {
    customerId: v.id("customers"),
    stockId: v.id("stocks"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("customerSpecialPrices")
      .withIndex(
        "by_customer_and_stock",
        (q) => q.eq("customerId", args.customerId).eq("stockId", args.stockId),
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const getCustomerSpecialPrices = query({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const specialPrices = await ctx.db
      .query("customerSpecialPrices")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();

    // Enrich with stock details
    const enriched = await Promise.all(
      specialPrices.map(async (sp) => {
        const stock = await ctx.db.get(sp.stockId);
        return {
          ...sp,
          stockName: stock?.name,
          regularPrice: stock?.regularPrice,
          stockImage: stock?.image,
        };
      }),
    );

    return enriched;
  },
});
