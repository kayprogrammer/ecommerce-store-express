import { PipelineStage } from "mongoose";
import { IGuest, IUser } from "../models/accounts";
import { IOrderItem, OrderItem, Product } from "../models/shop";
import { Types } from "mongoose";

const getProducts = async (user: IUser | IGuest, filter: Record<string,any> | null = null) => {
    try {
        const userOrGuestMatch = [{[ "email" in user ? "user" : "guest" ]: user._id}];
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

export { getProducts, getOrderItems }