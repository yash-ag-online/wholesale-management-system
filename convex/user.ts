import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      return { exists: false, user: null };
    }

    return {
      exists: true,
      user: user, // Return the full user document with _id
    };
  },
});

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    businessId: v.id("businesses"), // Required - only team members join existing businesses
  },
  handler: async (ctx, args) => {
    // Only team members can be created through this mutation
    // Admins are created through createBusinessWithOwner
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      role: "teamMember", // Always team member
      businessId: args.businessId,
    });
  },
});

// Helper mutation to update user's businessId
export const updateUserBusiness = mutation({
  args: {
    userId: v.id("users"),
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      businessId: args.businessId,
    });
  },
});

export const getUsersByBusiness = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .collect();

    return users;
  },
});

export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if user is an admin - admins can't be deleted this way
    const user = await ctx.db.get(args.userId);
    if (user?.role === "admin") {
      throw new Error("Cannot delete admin users");
    }

    await ctx.db.delete(args.userId);
  },
});
