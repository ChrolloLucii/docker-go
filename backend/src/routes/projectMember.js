import { Router } from "express";
import { getProjectMembers, addProjectMember, removeProjectMember } from "../controllers/projectMemberController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { addProjectMemberByUsername } from "../controllers/projectMemberController.js";
const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get("/", getProjectMembers);
router.post("/", addProjectMember);
router.delete("/:userId", removeProjectMember);
router.post("/by-username", addProjectMemberByUsername); // POST /api/projects/:projectId/members/by-username
export default router;