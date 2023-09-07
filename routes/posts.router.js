import express from "express";
import Post from "../schemas/post.js";

const router = express.Router();

// 게시글 생성

router.post("/posts", async (req, res) => {
  const { user, password, title, content } = req.body;

  if (!user) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 작성자를 입력하세요." });
  } else if (!password) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 비밀번홀를 입력하세요." });
  } else if (!title) {
    return res.status(400).json({ errorMessage: "게시글 제목을 입력하세요." });
  } else if (!content) {
    return res.status(400).json({ errorMessage: "게시글 내용을 입력하세요." });
  }

  const RecentPost = await Post.findOne().sort("-date").exec();

  const date = new Date();
  const post = new Post({ user, password, title, content, date });

  await post.save();

  return res.status(201).json({ post: post });
});

// 게시글 조회
router.get("/posts", async (req, res, next) => {
  const posts = await Post.find().sort("-date").exec();
  return res.status(200).json({ posts });
});

// 게시글 상세 조회
router.get("/posts/:postId", async (req, res, next) => {
    const {postId} = req.body;
    const postSearch = await Post.findOne(postId).exec();
    
    return res.status(200).json({ postSearch})
})


// 게시글 수정
router.patch("/posts/:postId", async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, password } = req.body;

  // (1) 현재 게시글 조회
  const currentPost = await Post.findById(postId).exec();
  if (!currentPost) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 게시글입니다." });
  }

  // (2) 현재 게시글 수정
  const targetPost = await Post.findOne({ password }).exec();
  if (password !== currentPost.password) {
    return res.status(401).json({ errorMessage: "비밀번호가 일치하지 않습니다."});
  } else {
    targetPost.title = title;
    targetPost.content = content;
  }
  targetPost.save();
  
  return res.status(200).json({ message: "게시글을 수정했습니다."});
});

// 게시글 삭제
router.delete('/posts/:postId', async (req, res) => {
    const {postId} = req.params;

    const post = await Post.findById(postId).exec();
    if (!post) {
        return res.status(404).json({ errorMessage : "존재하지 않는 게시글입니다."})
    }

    await Post.deleteOne({_id: postId}).exec();

    return res.status(200).json({message: "게시글 삭제에 성공했습니다."})
})


export default router;
