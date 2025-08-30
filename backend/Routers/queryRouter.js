import {Router} from 'express';
import {chatting} from '../Controllers/queryController.js'
const queryRouter = Router();


queryRouter.post('/', async(req, res) => {
    try {
        const {question} = req.body;
        const answer = await chatting(question);
        return res.status(200).json({
            answer: answer
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: "Internal Server Error"
        })
    }
})

export {queryRouter}