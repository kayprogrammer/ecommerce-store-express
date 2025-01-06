import { PipelineStage, Types } from "mongoose";
import { Order } from "../models/shop";

const getSellerOrdersWithDetailedOrderItems = async (filter: Record<string, any>, sellerId: Types.ObjectId, deliveryStatus: string | null = null) => {
    const pipeline: PipelineStage[] = [
        { $match: filter },
        { $sort: { createdAt: -1 } },

        // Lookup orderItems related to the order
        {
            $lookup: {
                from: "orderitems",
                localField: "_id",
                foreignField: "order",
                as: "orderItems",
            },
        },
        // Unwind the orderItems array
        { $unwind: { path: "$orderItems", preserveNullAndEmptyArrays: true } },

        // Lookup product data for each orderItem
        {
            $lookup: {
                from: "products",
                localField: "orderItems.product",
                foreignField: "_id",
                as: "orderItems.product",
            },
        },
        // Unwind the product array
        { $unwind: { path: "$orderItems.product", preserveNullAndEmptyArrays: true } },

        // Lookup seller data for the product's seller
        {
            $lookup: {
                from: "sellers",
                localField: "orderItems.product.seller",
                foreignField: "_id",
                as: "orderItems.product.seller",
            },
        },
        // Unwind the seller array
        { $unwind: { path: "$orderItems.product.seller", preserveNullAndEmptyArrays: true } },

        // Filter orderItems by seller and optionally by deliveryStatus
        {
            $match: {
                $and: [
                    { "orderItems.product.seller._id": sellerId },
                    ...(deliveryStatus
                        ? [{ "orderItems.deliveryStatus": deliveryStatus }]
                        : []),
                ],
            },
        },

        // Add calculated fields for variants and total price
        {
            $addFields: {
                "orderItems.variant": {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: "$orderItems.product.variants",
                                as: "variant",
                                cond: { $eq: ["$$variant._id", "$orderItems.variant"] },
                            },
                        },
                        0, // Take the first matched variant
                    ],
                },
            },
        },
        {
            $addFields: {
                "orderItems.total": {
                    $cond: {
                        if: { $ifNull: ["$orderItems.variant", false] },
                        then: { $multiply: ["$orderItems.quantity", "$orderItems.variant.price"] },
                        else: { $multiply: ["$orderItems.quantity", "$orderItems.product.priceCurrent"] },
                    },
                },
            },
        },

        // Group back to include all filtered orderItems in a single order
        {
            $group: {
                _id: "$_id", // Group by order ID
                txRef: { $first: "$txRef" },
                paymentStatus: { $first: "$paymentStatus" },
                shippingDetails: { $first: "$shippingDetails" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                orderItems: { $push: "$orderItems" }, // Push filtered orderItems
            },
        },

        // Add the order-level total
        {
            $addFields: {
                total: {
                    $reduce: {
                        input: "$orderItems",
                        initialValue: 0,
                        in: { $add: ["$$value", "$$this.total"] },
                    },
                },
            },
        },
    ];

    const orders = await Order.aggregate(pipeline);
    return orders;
};

export { getSellerOrdersWithDetailedOrderItems };