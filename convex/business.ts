import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getBusinessById = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const business = await ctx.db.get(args.businessId);
    return business;
  },
});

export const createBusiness = mutation({
  args: {
    name: v.string(),
    ownerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("businesses", {
      name: args.name,
      ownerId: args.ownerId,
      createdAt: Date.now(),
    });
  },
});

// Combined mutation to create business with owner in one transaction
export const createBusinessWithOwner = mutation({
  args: {
    businessName: v.string(),
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Step 1: Create admin user without businessId
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      role: "admin",
      businessId: undefined,
    });

    // Step 2: Create business with the user as owner
    const businessId = await ctx.db.insert("businesses", {
      name: args.businessName,
      ownerId: userId,
      createdAt: Date.now(),
    });

    // Step 3: Update user with businessId
    await ctx.db.patch(userId, {
      businessId: businessId,
    });

    return { userId, businessId };
  },
});
