import * as express from "express";
import { check, validationResult } from "express-validator";
import UserModel, { IUser } from "../models/User";

const router = express.Router();

const validateUser = [
  check("name").notEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Invalid email address"),
  check("age").isInt({ min: 0 }).withMessage("Age must be a non-negative integer"),
];

router.get("/users", async (req: express.Request, res: express.Response) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const pageSizeNumber = parseInt(pageSize as string, 10);

    const skip = (pageNumber - 1) * pageSizeNumber;
    const users = await UserModel.find({}).skip(skip).limit(pageSizeNumber).lean();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

router.post("/users", validateUser, async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newUser = new UserModel(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

export default router;
