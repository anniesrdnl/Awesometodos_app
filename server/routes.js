const express = require("express");
const router = express.Router();
const { getCollection } = require("./models/index");
const { ObjectId } = require("mongodb");
<<<<<<< HEAD
=======
// GET /todos
>>>>>>> 1cfff29ba42e175413ffeae4bfc1dc95726e76ae
router.get("/todos", async(req, res) => {
    const collection = getCollection("todos");
    const todos = await collection.find({}).toArray();

    res.status(200).json(todos);
});
<<<<<<< HEAD
=======
// POST /todos
>>>>>>> 1cfff29ba42e175413ffeae4bfc1dc95726e76ae
router.post("/todos", async(req, res) => {
        const collection = getCollection("todos");
        let { todo } = req.body;



        const newTodo = await collection.insertOne({ todo, status: false });

        res.status(201).json({ todo, status: false, _id: newTodo.insertedId });
    })
<<<<<<< HEAD
=======
    // DELETE /todos/:id
>>>>>>> 1cfff29ba42e175413ffeae4bfc1dc95726e76ae
router.delete("/todos/:id", async(req, res) => {
        const collection = getCollection("todos");
        const _id = new ObjectId(req.params.id);

        const deletedTodo = await collection.deleteOne({ _id });
        res.status(200).json(deletedTodo);
    })
<<<<<<< HEAD
=======
    // PUT /todos/:id
>>>>>>> 1cfff29ba42e175413ffeae4bfc1dc95726e76ae
router.put("/todos/:id", async(req, res) => {
    const collection = getCollection("todos");
    const _id = new ObjectId(req.params.id);
    const { status } = req.body;

    if (typeof status !== "boolean") {
        return res.status(400).json({ mssg: "invalid status" });
    }

    const updatedTodo = await collection.updateOne({ _id }, { $set: { status: !status } });
    res.status(200).json(updatedTodo);
});
module.exports = router;