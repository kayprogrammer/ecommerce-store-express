import mongoose, { PipelineStage } from "mongoose";
import { IGuest, IUser } from "../models/accounts";
import { IOrder, IOrderItem, Order, OrderItem, Product } from "../models/shop";
import { Types } from "mongoose";
import { IShippingAddress } from "../models/profiles";
import { NotFoundError } from "../config/handlers";

const getProducts = async (user: IUser | IGuest | null, filter: Record<string,any> | null = null) => {
    try {
        let userOrGuestMatch: Record<string,any>[] = [];
        if (user) userOrGuestMatch = [{[ "email" in user ? "user" : "guest" ]: user._id}];
        const aggregateData: PipelineStage[] = [
            // Add reviewsCount and avgRating
            {
                $lookup: {
                    from: 'reviews',  // The collection where reviews are stored
                    localField: '_id',
                    foreignField: 'product',
                    as: 'reviews',
                },
            },
            {
                $addFields: {
                    reviewsCount: { $size: '$reviews' }, 
                    avgRating: { 
                        $ifNull: [{ $avg: '$reviews.rating' }, 0]
                    }
                }
            },
            // Lookup the Wishlist collection
            {
                $lookup: {
                    from: 'wishlists', let: { productId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$product', '$$productId'] } } },
                        { $match: { $or: userOrGuestMatch } },
                    ], as: 'wishlistedDocs'
                }
            },
    
            // Add a wishlisted field
            {$addFields: { wishlisted: { $gt: [{ $size: '$wishlistedDocs' }, 0] } }},
    
            // Cleanup the output
            { $project: { wishlistedDocs: 0 }},

            // Populate the seller
            {
                $lookup: { from: 'sellers', localField: 'seller', foreignField: '_id', as: 'seller'},
            },
            {
                $unwind: {
                path: '$seller',
                preserveNullAndEmptyArrays: true, // Allow products without a seller
                },
            },
            
            // Populate the category
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            {
                $unwind: {
                    path: '$category',
                    preserveNullAndEmptyArrays: true,
                },
            },

            // Sort by createdAt descending
            { $sort: { createdAt: -1 } }
        ];
        if (filter) aggregateData.push({$match: filter})
        const products = await Product.aggregate(aggregateData)
        return products;
    } catch (err) {
      console.error(err);
      throw err;
    }
}

const getOrderItems = async (user: IUser | IGuest, orderId: Types.ObjectId | null = null): Promise<IOrderItem[]> => {
    const pipeline = [
        { $match: { $or: [{ user: user._id }, { guest: user._id }], order: orderId } },
        {
            $lookup: {
                from: "products", // Join with the Product collection
                localField: "product", // Field in OrderItem referring to Product
                foreignField: "_id", // Field in Product being matched
                as: "product"
            }
        },
        {
            $unwind: "$product" // Unwind product as each OrderItem has one product
        },
        {
            $lookup: {
                from: "sellers", // Join with the seller collection
                localField: "product.seller", // Field in Product referring to seller
                foreignField: "_id", // Field in seller being matched
                as: "product.seller"
            }
        },
        {
            $unwind: "$product.seller" // Unwind sellerDetails
        },
        {
            $addFields: {
                variant: {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: "$product.variants", // Access variants array in product
                                as: "variant",
                                cond: { $eq: ["$$variant._id", "$variant"] } // Match the variant by ID
                            }
                        },
                        0 // Extract the first matched variant
                    ]
                }
            }
        },
        {
            $addFields: {
                // Calculate total price based on quantity and variant or product price
                total: {
                    $cond: {
                        if: { $ifNull: ["$variant", false] }, // Check if the variant exists
                        then: { $multiply: ["$quantity", "$variant.price"] }, // Multiply quantity by variant price
                        else: { $multiply: ["$quantity", "$product.priceCurrent"] } // Multiply quantity by product price
                    }
                }
            }
        },
        {
            $project: {
                product: {
                    _id: 1, seller: { name: 1, slug: 1, image: 1 },
                    name: 1, slug: 1, priceCurrent: 1, image1: 1
                },
                variant: { _id: 1, size: 1, color: 1, stock: 1, image: 1, price: 1 },
                quantity: 1, total: 1
            }
        }
    ];
    const orderitems = await OrderItem.aggregate(pipeline);
    return orderitems
}

const confirmOrder = async (user: IUser, shippingDetails: IShippingAddress): Promise<IOrder> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Step 1: Fetch all order items with their product and variant details
        const orderItems = await getOrderItems(user);

        if (orderItems.length === 0) throw new NotFoundError("No items in cart")
        const order = await Order.create(
            [
                {
                    user: user._id,
                    shippingDetails,
                },
            ],
            { session }
        );

        // Step 2: Prepare bulk update operations
        const productBulkOps = [];
        const variantBulkOps = [];

        for (const item of orderItems) {
            const { product, variant, quantity } = item;
            if (variant) {
                // Update specific variant's stock
                variantBulkOps.push({
                    updateOne: {
                        filter: { "_id": product._id, "variants._id": variant._id },
                        update: { $inc: { "variants.$.stock": -quantity } },
                    },
                });
            } else {
                // Update general product stock
                productBulkOps.push({
                    updateOne: {
                        filter: { "_id": product._id },
                        update: { $inc: { stock: -quantity } },
                    },
                });
            }
        }

        // Step 3: Update order reference in OrderItems
        const orderItemIds = orderItems.map((item) => item._id);
        await OrderItem.updateMany(
            { _id: { $in: orderItemIds } },
            { $set: { order: order[0]._id } },
            { session }
        );

        // Step 4: Execute bulk updates
        if (productBulkOps.length > 0) {
            await Product.bulkWrite(productBulkOps, { session });
        }
        if (variantBulkOps.length > 0) {
            await Product.bulkWrite(variantBulkOps, { session });
        }


        // Commit the transaction
        await session.commitTransaction();
        session.endSession();
        const orderData = order[0]
        orderData.orderItems = orderItems
        return orderData
    } catch (error) {
        // Abort the transaction on error
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const getOrdersWithDetailedOrderItems = async (filter: Record<string,any>) => {
    const pipeline: PipelineStage[] = [
        { $match: filter },
        { $sort: { createdAt: -1 } },

        // Lookup orderItems related to the order
        {
            $lookup: {
                from: "orderitems", localField: "_id", foreignField: "order", as: "orderItems"
            }
        },
        // Unwind the orderItems array
        { $unwind: { path: "$orderItems", preserveNullAndEmptyArrays: true } },

        // Lookup product data for each orderItem
        {
            $lookup: {
                from: "products", localField: "orderItems.product", 
                foreignField: "_id", as: "orderItems.product",
            }
        },
        // Unwind the product array
        { $unwind: { path: "$orderItems.product", preserveNullAndEmptyArrays: true } },

        // Lookup seller data for the product's seller
        {
            $lookup: {
                from: "sellers", localField: "orderItems.product.seller",
                foreignField: "_id", as: "orderItems.product.seller",
            },
        },
        // Unwind the seller array
        { $unwind: { path: "$orderItems.product.seller", preserveNullAndEmptyArrays: true } },

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
                            }
                        },
                        0 // Take the first matched variant
                    ]
                }
            }
        },
        {
            $addFields: {
                "orderItems.total": {
                    $cond: {
                        if: { $ifNull: ["$orderItems.variant", false] },
                        then: { $multiply: ["$orderItems.quantity", "$orderItems.variant.price"] },
                        else: { $multiply: ["$orderItems.quantity", "$orderItems.product.priceCurrent"] },
                    }
                }
            }
        },
        // Group back to include all orderItems in a single order
        {
            $group: {
                _id: "$_id", // Group by order ID
                txRef: { $first: "$txRef" },
                paymentStatus: { $first: "$paymentStatus" },
                deliveryStatus: { $first: "$deliveryStatus" },
                dateDelivered: { $first: "$dateDelivered" },
                shippingDetails: { $first: "$shippingDetails" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                orderItems: { $push: "$orderItems" }, // Push populated orderItems
            }
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
    ]

    const orders = await Order.aggregate(pipeline);
    return orders;
};

export { getProducts, getOrderItems, confirmOrder, getOrdersWithDetailedOrderItems }