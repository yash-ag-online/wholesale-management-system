import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createPayment = mutation({
  args: {
    businessId: v.id("businesses"),
    customerId: v.id("customers"),
    amount: v.number(),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("upi"),
      v.literal("bank"),
      v.literal("cheque"),
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("payments", {
      businessId: args.businessId,
      customerId: args.customerId,
      amount: args.amount,
      paymentMethod: args.paymentMethod,
      note: args.note,
      createdAt: Date.now(),
    });
  },
});

export const getPaymentsByCustomer = query({
  args: {
    businessId: v.id("businesses"),
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex(
        "by_business_and_customer",
        (q) =>
          q.eq("businessId", args.businessId)
            .eq("customerId", args.customerId),
      )
      .order("desc")
      .collect();
  },
});

export const getPaymentsByBusiness = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .order("desc")
      .collect();
  },
});

export const updatePayment = mutation({
  args: {
    paymentId: v.id("payments"),
    amount: v.optional(v.number()),
    paymentMethod: v.optional(
      v.union(
        v.literal("cash"),
        v.literal("upi"),
        v.literal("bank"),
        v.literal("cheque"),
      ),
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { paymentId, ...updates } = args;
    await ctx.db.patch(paymentId, updates);
  },
});

export const deletePayment = mutation({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.paymentId);
  },
});

export const getCustomerBalance = query({
  args: {
    businessId: v.id("businesses"),
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex(
        "by_business_and_customer",
        (q) =>
          q.eq("businessId", args.businessId)
            .eq("customerId", args.customerId),
      )
      .collect();

    const payments = await ctx.db
      .query("payments")
      .withIndex(
        "by_business_and_customer",
        (q) =>
          q.eq("businessId", args.businessId)
            .eq("customerId", args.customerId),
      )
      .collect();

    const totalDebit = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    const totalCredit = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    return {
      totalDebit,
      totalCredit,
      balance: totalDebit - totalCredit,
    };
  },
});
