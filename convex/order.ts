import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOrder = mutation({
  args: {
    businessId: v.id("businesses"),
    customerId: v.optional(v.id("customers")),
    createdBy: v.id("users"),
    items: v.array(
      v.object({
        stockId: v.id("stocks"),
        quantity: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let totalAmount = 0;

    // Get special prices if customer exists
    let specialPricesMap = new Map<string, number>();
    if (args.customerId) {
      const specialPrices = await ctx.db
        .query("customerSpecialPrices")
        .withIndex("by_customer", (q) => q.eq("customerId", args.customerId!))
        .collect();

      specialPricesMap = new Map(
        specialPrices.map((sp) => [sp.stockId, sp.specialPrice]),
      );
    }

    const orderId = await ctx.db.insert("orders", {
      businessId: args.businessId,
      customerId: args.customerId,
      createdBy: args.createdBy,
      totalAmount: 0,
      createdAt: Date.now(),
    });

    for (const item of args.items) {
      const stock = await ctx.db.get(item.stockId);
      if (!stock) continue;

      if (stock.quantityAvailable < item.quantity) {
        throw new Error(`Insufficient stock for ${stock.name}`);
      }

      // Use special price if exists, otherwise regular price
      const unitPrice = specialPricesMap.get(item.stockId) ??
        stock.regularPrice;
      const totalPrice = unitPrice * item.quantity;

      totalAmount += totalPrice;

      await ctx.db.insert("orderItems", {
        orderId,
        stockId: item.stockId,
        quantity: item.quantity,
        unitPrice, // This now correctly uses special price
        totalPrice,
        createdAt: Date.now(),
      });

      await ctx.db.patch(stock._id, {
        quantityAvailable: stock.quantityAvailable - item.quantity,
      });
    }

    await ctx.db.patch(orderId, { totalAmount });

    return orderId;
  },
});

export const getOrderById = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  },
});

export const getOrderWithDetails = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Get customer details
    const customer = order.customerId
      ? await ctx.db.get(order.customerId)
      : null;

    // Get user who created the order
    const createdByUser = await ctx.db.get(order.createdBy);

    // Get order items
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();

    // Get stock details for each item
    const itemsWithStock = await Promise.all(
      items.map(async (item) => {
        const stock = await ctx.db.get(item.stockId);
        return {
          ...item,
          stockName: stock?.name || "Unknown",
          stockImage: stock?.image,
        };
      }),
    );

    return {
      ...order,
      customer,
      createdByUser,
      items: itemsWithStock,
    };
  },
});

export const getOrdersByBusiness = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .order("desc")
      .collect();

    return orders;
  },
});

export const getOrderItems = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();

    return items;
  },
});

export const getOrderWithItems = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();

    // Get stock details for each item
    const itemsWithStock = await Promise.all(
      items.map(async (item) => {
        const stock = await ctx.db.get(item.stockId);
        return {
          ...item,
          stockName: stock?.name || "Unknown",
          stockImage: stock?.image,
        };
      }),
    );

    return {
      ...order,
      items: itemsWithStock,
    };
  },
});

export const deleteOrder = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    // Get order items first to restore stock
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();

    // Restore stock quantities
    for (const item of items) {
      const stock = await ctx.db.get(item.stockId);
      if (stock) {
        await ctx.db.patch(stock._id, {
          quantityAvailable: stock.quantityAvailable + item.quantity,
        });
      }
      // Delete order item
      await ctx.db.delete(item._id);
    }

    // Delete the order
    await ctx.db.delete(args.orderId);
  },
});

export const updateOrder = mutation({
  args: {
    orderId: v.id("orders"),
    items: v.array(
      v.object({
        stockId: v.id("stocks"),
        quantity: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Get existing order items to restore stock quantities
    const existingItems = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
      .collect();

    // Restore stock quantities from old order
    for (const item of existingItems) {
      const stock = await ctx.db.get(item.stockId);
      if (stock) {
        await ctx.db.patch(stock._id, {
          quantityAvailable: stock.quantityAvailable + item.quantity,
        });
      }
      // Delete old order item
      await ctx.db.delete(item._id);
    }

    // Get special prices if customer exists
    let specialPricesMap = new Map<string, number>();
    if (order.customerId) {
      const specialPrices = await ctx.db
        .query("customerSpecialPrices")
        .withIndex("by_customer", (q) => q.eq("customerId", order.customerId!))
        .collect();

      specialPricesMap = new Map(
        specialPrices.map((sp) => [sp.stockId, sp.specialPrice]),
      );
    }

    // Create new order items
    let totalAmount = 0;

    for (const item of args.items) {
      const stock = await ctx.db.get(item.stockId);
      if (!stock) continue;

      if (stock.quantityAvailable < item.quantity) {
        throw new Error(`Insufficient stock for ${stock.name}`);
      }

      // Use special price if exists, otherwise regular price
      const unitPrice = specialPricesMap.get(item.stockId) ??
        stock.regularPrice;
      const totalPrice = unitPrice * item.quantity;

      totalAmount += totalPrice;

      await ctx.db.insert("orderItems", {
        orderId: args.orderId,
        stockId: item.stockId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        createdAt: Date.now(),
      });

      // Deduct stock quantity
      await ctx.db.patch(stock._id, {
        quantityAvailable: stock.quantityAvailable - item.quantity,
      });
    }

    // Update order total
    await ctx.db.patch(args.orderId, { totalAmount });

    return args.orderId;
  },
});
