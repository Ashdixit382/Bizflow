import jwt from "jsonwebtoken";
import User from "../models/User.js";
export const protect=async(req,res,next)=>{const h=req.headers.authorization||"";if(!h.startsWith("Bearer ")) return res.status(401).json({message:"Unauthorized"});try{const t=h.split(" ")[1];const d=jwt.verify(t,process.env.JWT_SECRET);req.user=await User.findById(d.id).select("-password");if(!req.user)return res.status(401).json({message:"User not found"});next();}catch{return res.status(401).json({message:"Invalid token"});}};
export const allowRoles=(...roles)=>(req,res,next)=>{if(!roles.includes(req.user.role)) return res.status(403).json({message:"Forbidden"});next();};
