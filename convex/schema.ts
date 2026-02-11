import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  businesses: defineTable({
    name: v.string(),
    ownerId: v.id("users"), // Reference to the owner user
    createdAt: v.number(),
  }).index("by_ownerId", ["ownerId"]),

  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("teamMember")),
    businessId: v.optional(v.id("businesses")), // Optional
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_businessId", ["businessId"])
    .index("by_business_and_role", ["businessId", "role"]),

  stocks: defineTable({
    businessId: v.id("businesses"), // 🔑 which business owns this stock
    name: v.string(),
    regularPrice: v.number(),
    quantityAvailable: v.number(),
    image: v.string(),
    createdAt: v.number(),
  }).index("by_businessId", ["businessId"]),

  customers: defineTable({
    businessId: v.id("businesses"),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_businessId", ["businessId"])
    .index("by_phone", ["phone"]),

  customerSpecialPrices: defineTable({
    businessId: v.id("businesses"),
    customerId: v.id("customers"),
    stockId: v.id("stocks"),
    specialPrice: v.number(),
    createdAt: v.number(),
  })
    .index("by_customer", ["customerId"])
    .index("by_stock", ["stockId"])
    .index("by_customer_and_stock", ["customerId", "stockId"]),

  orders: defineTable({
    businessId: v.id("businesses"),
    customerId: v.optional(v.id("customers")),
    createdBy: v.id("users"), // which user created order
    totalAmount: v.number(),
    createdAt: v.number(),
  })
    .index("by_businessId", ["businessId"])
    .index("by_customerId", ["customerId"])
    .index("by_business_and_date", ["businessId", "createdAt"])
    .index("by_business_and_customer", ["businessId", "customerId"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    stockId: v.id("stocks"),
    quantity: v.number(),

    // IMPORTANT: price snapshot at time of sale
    unitPrice: v.number(),
    totalPrice: v.number(),

    createdAt: v.number(),
  })
    .index("by_orderId", ["orderId"])
    .index("by_stockId", ["stockId"]),

  payments: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_customerId", ["customerId"])
    .index("by_businessId", ["businessId"])
    .index("by_business_and_customer", ["businessId", "customerId"]),
});
