import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    integrationId: { type: mongoose.Schema.Types.ObjectId, ref: "Integration", required: true },
    content: { type: String, required: true },
    publishDate: { type: Date, required: true },
    state: {
      type: String,
      enum: ["QUEUE", "SCHEDULED", "PUBLISHED", "ERROR", "DRAFT"],
      default: "QUEUE",
    },
    group: { type: String, required: true },
    settings: { type: String, default: "{}" },
    image: { type: String, default: "[]" },
    releaseURL: { type: String },
    postId: { type: String },
    error: { type: String },
    parentPostId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true },
);

PostSchema.index({ publishDate: 1, state: 1 });
PostSchema.index({ userId: 1 });
PostSchema.index({ group: 1 });
PostSchema.index({ integrationId: 1 });

const Post = mongoose.model("Post", PostSchema);

export default Post;
