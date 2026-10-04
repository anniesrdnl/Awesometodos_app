const express = require("express");
const router = express.Router();
const { getCollection } = require("./models/index");
const { ObjectId } = require("mongodb");
router.get("/todos", async(req, res) => {
    const collection = await getCollection("todos");
    const todos = await collection.find({}).toArray();

    res.status(200).json(todos);
});
// POST /todos
router.post("/todos", async(req, res) => {
        const collection = await getCollection("todos");
        let { todo } = req.body;



        const newTodo = await collection.insertOne({ todo, status: false });

        res.status(201).json({ todo, status: false, _id: newTodo.insertedId });
    })
    // DELETE /todos/:id
router.delete("/todos/:id", async(req, res) => {
        const collection = await getCollection("todos");
        const _id = new ObjectId(req.params.id);

        const deletedTodo = await collection.deleteOne({ _id });
        res.status(200).json(deletedTodo);
    })
    // PUT /todos/:id

router.put("/todos/:id", async(req, res) => {
    const collection = await getCollection("todos");
    const _id = new ObjectId(req.params.id);
    const { status, todo } = req.body;
    const changes = {};

    if (status !== undefined) {
        if (typeof status !== "boolean") {
            return res.status(400).json({ mssg: "invalid status" });
        }
        changes.status = !status;
    }

    if (todo !== undefined) {
        if (typeof todo !== "string" || !todo.trim()) {
            return res.status(400).json({ mssg: "invalid todo" });
        }
        changes.todo = todo.trim();
    }

    if (Object.keys(changes).length === 0) {
        return res.status(400).json({ mssg: "nothing to update" });
    }

    const updatedTodo = await collection.updateOne({ _id }, { $set: changes });
    res.status(200).json(updatedTodo);
});
module.exports = router;