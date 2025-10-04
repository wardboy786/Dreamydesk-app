
'use server';

// This file contained the automated, event-driven functions for processing uploads.
// As per your request, this entire workflow has been replaced with a manual, client-side
// process on the /admin/upload page to ensure reliability and user control.
// These functions are no longer triggered or used and the file can be cleared or deleted.

import { onRequest } from "firebase-functions/v2/https";

/**
 * This function is now deprecated and no longer in use.
 * The new manual upload process handles everything on the client-side.
 */
export const processDraftQueue = onRequest(
  (req, res) => {
    console.log("processDraftQueue function is deprecated and no longer in use.");
    res.status(200).send("This function is deprecated.");
  }
);
