export const createCRUD=(Model)=>({
list:async(req,res)=>{const {q="",page=1,limit=10,sort="-createdAt"}=req.query; const query=q?{$or:[{name:{$regex:q,$options:"i"}},{category:{$regex:q,$options:"i"}},{email:{$regex:q,$options:"i"}},{sku:{$regex:q,$options:"i"}},{invoiceNo:{$regex:q,$options:"i"}}]}:{}; const skip=(Number(page)-1)*Number(limit); const [items,total]=await Promise.all([Model.find(query).sort(sort).skip(skip).limit(Number(limit)),Model.countDocuments(query)]); res.json({items,total,page:Number(page),pages:Math.ceil(total/Number(limit)||1)});},
getById:async(req,res)=>{const i=await Model.findById(req.params.id); if(!i) return res.status(404).json({message:"Not found"}); res.json(i);},
create:async(req,res)=>{const i=await Model.create(req.body); res.status(201).json(i);},
update:async(req,res)=>{const i=await Model.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true}); if(!i) return res.status(404).json({message:"Not found"}); res.json(i);},
remove:async(req,res)=>{const i=await Model.findByIdAndDelete(req.params.id); if(!i)return res.status(404).json({message:"Not found"}); res.json({message:"Deleted"});}
});