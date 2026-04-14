import express from "express";
import {
  getAllUsers,
  sendRequest,
  acceptRequest,
  getNetwork,
  removeConnection,
  removeRequest
} from "../controllers/networkController.js";

const router = express.Router();

router.get("/users/:userId", getAllUsers);
router.post("/send-request", sendRequest);
router.post("/accept-request", acceptRequest);
router.get("/network/:userId", getNetwork);
router.post("/remove-connection", removeConnection);
router.post("/remove-request", removeRequest);

export default router;