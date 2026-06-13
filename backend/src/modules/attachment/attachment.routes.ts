import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request.js";
import { attachmentController } from "./attachment.controller.js";
import {
  attachmentIdParamSchema,
  signUploadSchema,
} from "./attachment.validator.js";

const attachmentRoutes = Router();

attachmentRoutes.post(
  "/sign-upload",
  validateRequest({ body: signUploadSchema }),
  attachmentController.signUpload,
);
attachmentRoutes.get(
  "/:attachmentId/download",
  validateRequest({ params: attachmentIdParamSchema }),
  attachmentController.downloadAttachment,
);
attachmentRoutes.delete(
  "/:attachmentId",
  validateRequest({ params: attachmentIdParamSchema }),
  attachmentController.deleteAttachment,
);

export default attachmentRoutes;
