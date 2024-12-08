import { PipelineStage } from "mongoose";
import { IGuest, IUser } from "../models/accounts";
import { Product } from "../models/shop";

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

export { getProducts }