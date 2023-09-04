import express from "express";
import joi from "joi";
import Todo from "../schemas/todo.schemas.js";

const router = express.Router();

// Joi API
const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

// Creat API
router.post("/todos", async (req, res, next) => {
  try {
    const validation = await createdTodoSchema.validateAsync(req.body);

    const { value } = validation;

    if (!value) {
      return res
        .status(400)
        .json({ errorMessage: "해야할 일(value) 데이터가 존재하지 않습니다." });
    }
    // findOne = 1개의 데이터만 조회
    const todoMaxOrder = await Todo.findOne().sort("-order").exec();
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;
    const todo = new Todo({ value, order });
    await todo.save();
    return res.status(201).json({ todo: todo });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ errorMessage: error.message });
    }

    return res
      .status(500)
      .json({ errorMessage: "서버에서 에러가 발생했습니다." });
  }
});

// Read API
router.get("/todos", async (req, res, next) => {
  const todos = await Todo.find().sort("-order").exec();
  return res.status(200).json({ todos });
});

// Update(Patch) API
router.patch("/todos/:todoId", async (req, res, next) => {
  const { todoId } = req.params;
  const { order, done, value } = req.body;

  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 해야할 일 입니다." });
  }

  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }

    currentTodo.order = order;
  }

  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }

  if (value) {
    currentTodo.value = value;
  }

  await currentTodo.save();

  return res.status(200).json({});
});

// Delete API
router.delete("/todos/:todoId", async (req, res, next) => {
  const { todoId } = req.params;
  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 해야할 일 정보입니다." });
  }

  await Todo.deleteOne({ _id: todoId });

  return res.status(200).json({});
});

export default router;