import { Router } from "express";
import { memberController } from "./member.controller.js";

const memberRoutes = Router();

memberRoutes.get("/", memberController.getMembers);

export default memberRoutes;
