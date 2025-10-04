"use strict";
'use server';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishScheduledWallpaper = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * An HTTP-triggered Cloud Function that finds the next scheduled wallpaper,
 * publishes it, and then deletes the draft from the batch.
 * This function is designed to be idempotent.
 */
exports.publishScheduledWallpaper = (0, https_1.onRequest)({ memory: "512MiB", timeoutSeconds: 300 }, async (req, res) => {
    console.log("Scheduler triggered. Looking for next wallpaper to publish...");
    try {
        // Find the oldest batch that still has unprocessed wallpapers.
        const batchQuery = db.collection("wallpaper_batches").orderBy("createdAt").limit(1);
        const batchSnapshot = await batchQuery.get();
        if (batchSnapshot.empty) {
            console.log("No active wallpaper batches found. Nothing to do.");
            res.status(200).send("No active batches found.");
            return;
        }
        const batchDoc = batchSnapshot.docs[0];
        const batchId = batchDoc.id;
        // Now find the oldest wallpaper within that batch.
        const wallpaperQuery = batchDoc.ref.collection("wallpapers").limit(1);
        const wallpaperSnapshot = await wallpaperQuery.get();
        // If the batch is empty, delete it and we're done.
        if (wallpaperSnapshot.empty) {
            console.log(`Batch ${batchId} is empty. Deleting it.`);
            await batchDoc.ref.delete();
            res.status(200).send(`Deleted empty batch: ${batchId}`);
            return;
        }
        const wallpaperDoc = wallpaperSnapshot.docs[0];
        const wallpaperData = wallpaperDoc.data();
        const newWallpaperPayload = {
            title: wallpaperData.title,
            description: wallpaperData.description,
            imageUrl: wallpaperData.imageUrl,
            fileName: wallpaperData.fileName,
            thumbnailUrl: wallpaperData.thumbnailUrl,
            resolution: wallpaperData.resolution,
            aiHint: wallpaperData.aiHint,
            category: wallpaperData.category,
            tags: wallpaperData.tags,
            premium: wallpaperData.premium,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
            featured: false,
            downloads: 0,
            likes: 0,
            shares: 0,
            views: 0,
            rating: 0,
        };
        // --- Transaction for Atomic Operation ---
        await db.runTransaction(async (transaction) => {
            // 1. Create the new live wallpaper document.
            const liveWallpaperRef = db.collection("wallpapers").doc();
            transaction.set(liveWallpaperRef, newWallpaperPayload);
            // 2. Increment the wallpaper count for the corresponding category.
            const categoryQuery = db.collection("categories").where("name", "==", wallpaperData.category).limit(1);
            const categorySnapshot = await transaction.get(categoryQuery);
            if (!categorySnapshot.empty) {
                const categoryDoc = categorySnapshot.docs[0];
                transaction.update(categoryDoc.ref, {
                    wallpaperCount: admin.firestore.FieldValue.increment(1)
                });
                console.log(`Incremented count for category: "${wallpaperData.category}"`);
            }
            else {
                console.warn(`Category "${wallpaperData.category}" not found. Could not increment count.`);
            }
            // 3. Delete the processed draft wallpaper from the batch.
            transaction.delete(wallpaperDoc.ref);
        });
        // --- End of Transaction ---
        console.log(`Successfully published wallpaper ${wallpaperDoc.id} from batch ${batchId}.`);
        res.status(200).send(`Published wallpaper: ${wallpaperDoc.id}`);
    }
    catch (error) {
        console.error("Error publishing scheduled wallpaper:", error);
        res.status(500).send("Internal Server Error");
    }
});
//# sourceMappingURL=index.js.map