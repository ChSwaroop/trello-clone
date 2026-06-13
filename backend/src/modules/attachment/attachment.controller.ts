import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/utils/app-error.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { getRouteParam } from "../../shared/utils/route-params.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { attachmentService } from "./attachment.service.js";
import type { CreateAttachmentInput, SignUploadInput } from "./attachment.validator.js";

export class AttachmentController {
  signUpload = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
    }

    const input = req.body as SignUploadInput;
    const result = await attachmentService.signUpload(input, req.user.id);
    sendSuccess(res, result);
  });

  createAttachment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
    }

    const input = req.body as CreateAttachmentInput;
    const attachment = await attachmentService.createAttachment(
      getRouteParam(req, "cardId"),
      input,
      req.user.id,
    );
    sendSuccess(res, attachment, HTTP_STATUS.CREATED);
  });

  uploadFileAttachment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
    }

    if (!req.file) {
      throw new AppError("No file uploaded", HTTP_STATUS.BAD_REQUEST);
    }

    const attachment = await attachmentService.uploadFileAttachment(
      getRouteParam(req, "cardId"),
      {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      req.user.id,
    );
    sendSuccess(res, attachment, HTTP_STATUS.CREATED);
  });

  deleteAttachment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
    }

    await attachmentService.deleteAttachment(getRouteParam(req, "attachmentId"), req.user.id);
    sendSuccess(res, { deleted: true });
  });

  downloadAttachment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
    }

    const { buffer, filename, mimeType } = await attachmentService.getAttachmentDownload(
      getRouteParam(req, "attachmentId"),
      req.user.id,
    );

    const safeFilename = filename.replace(/["\r\n]/g, "");
    res.setHeader("Content-Type", mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    );
    res.send(buffer);
  });
}

export const attachmentController = new AttachmentController();
