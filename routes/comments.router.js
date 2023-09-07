import express from "express";
import Comment from "../schemas/comment.js";

const router = express.Router();

// 댓글 생성
router.post("/posts/:_postId/comments", async (req, res) => {
  const { user, password, content } = req.body;

  if (!user) {
    return res.status(400).json({ errorMessage: "댓글 작성자를 입력하세요." });
  } else if (!password) {
    return res
      .status(400)
      .json({ errorMessage: "댓글 비밀번홀를 입력하세요." });
  } else if (!content) {
    return res.status(400).json({ errorMessage: "댓글 내용을 입력하세요." });
  }

  const RecentComment = await Comment.findOne().sort("-date").exec();

  const date = new Date();
  const comment = new Comment({ user, password, content, date });

  await comment.save();

  return res.status(201).json({ comment: comment });
});

// 댓글 조회
router.get("/posts/:_postId/comments", async (req, res, next) => {
  const comments = await Comment.find().sort("-date").exec();
  return res.status(200).json({ comments });
});

// 댓글 수정
router.patch("/posts/:_postId/comments/:_commentId", async (req, res, next) => {
  const { commentId } = req.params;
  const { content, password } = req.body;

  // (1) 현재 댓글 조회
  const currentComment = await Comment.findById(commentId).exec();
  if (!currentComment) {
    return res.status(404).json({ errorMessage: "댓글 내용을 입력해주세요" });
  }

  // (2) 현재 게시글 수정
  const targetComment = await Comment.findOne({ password }).exec();
  if (password !== currentComment.password) {
    return res
      .status(401)
      .json({ errorMessage: "비밀번호가 일치하지 않습니다." });
  } else {
    targetComment.content = content;
  }
  targetComment.save();

  return res.status(200).json({ message: "댓글을 수정했습니다." });
});

// 댓글 삭제
router.delete("/posts/:_postId/comments/:_commentId", async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId).exec();
  if (!comment) {
    return res.status(404).json({ errorMessage: "존재하지 않는 댓글입니다." });
  }

  await Comment.deleteOne({ _id: commentId }).exec();

  return res.status(200).json({ message: "댓글 삭제에 성공했습니다." });
});

export default router;
