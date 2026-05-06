import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) return res.status(400).json({ message: "Email already exists" });
  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: "staff",
  });
  res.status(201).json({
    token: signToken(user._id, user.role),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const u = await User.findOne({ email });
  if (!u || !(await bcrypt.compare(password, u.password))) return res.status(401).json({ message: "Invalid credentials" });
  res.json({
    token: signToken(u._id, u.role),
    user: { id: u._id, name: u.name, email: u.email, role: u.role },
  });
};

export const me = async (req, res) => res.json(req.user);

