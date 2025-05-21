import mongoose from "mongoose";
import {Schema} from "mongoose";
import './users';


const postSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  caption: { type: String },
  image: { type: String, required: true },
  location: { 
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
export default Post;
