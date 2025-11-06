import mongoose,{Schema} from "mongoose";
const categorySchema=new Schema({
    name:{
        type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
      slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    description:{type:String,trim:true},
    displayName:{
        type:String,
        trim:true,
    },
    isActive:{
        type:Boolean,
        default:true,
    }
},{timestamps:true})
categorySchema.pre("save",function(next){
    if(this.isModified("name")){
    this.slug=this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")?.trim();
    if(!this.displayName){
        this.displayName=this.name.charAt(0).toUpperCase()+this.name.slice(1)
    }
}
    next()
})
categorySchema.pre("findOneAndUpdate",function(next){
    const update=this.getUpdate();
    const name=update.name||update.$set?.name
   if (name) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .trim();

    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    if (update.$set) {
      update.$set.slug = slug;
      update.$set.displayName = displayName;
    } else {
      update.slug = slug;
      update.displayName = displayName;
    }

    this.setUpdate(update);
  }
    next()
})
const Category=mongoose.models.Category||mongoose.model("Category",categorySchema);
export  {Category};