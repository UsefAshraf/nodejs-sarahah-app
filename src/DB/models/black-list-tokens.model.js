import mongoose from "mongoose";


const blackListTokensSchema = new mongoose.Schema({
    tokenId:{type:String,required:true,unique:true},
    expiryDate:{type:String,required:true},
},{timestamps:true})

const blackListTokens = mongoose.models.blackListTokens || mongoose.model('blackListTokens',blackListTokensSchema);

export default blackListTokens;