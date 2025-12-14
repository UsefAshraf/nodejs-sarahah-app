import Message from "../../../DB/models/message.model.js";
import { User } from "../../../DB/models/user.model.js";



export const sendMessageService = async (req,res) => {
    const {body,ownerId} = req.body;

    const user = await User.findById(ownerId);
    if(!user) return res.status(404).json({message:"User not found"});

    const message = await Message.create({
        body,
        ownerId
    })

    res.status(201).json({message:'Message sent successfully',message})
}


export const getMessagesService = async (req,res) => {
    const messages = await Message.find({}).populate(
        [
            {
                path:'ownerId',
                select:'username email role'
            }
        ]
    )

    res.status(200).json({message:'success',data:messages});
}


export const getUserMessageService = async (req,res) => {
    try{
        const {_id} = req.loggedInUser;
        const messages = await Message.find({ownerId:_id})
        res.status(200).json({message:'success',data:messages});
    }catch(error){
        console.log("catch error from get user message service",error);
        res.status(500).json({message:"internal server error",error});
    }
}

