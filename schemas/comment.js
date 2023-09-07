import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        required: true
    },
})

export default mongoose.model("Comment", CommentSchema);