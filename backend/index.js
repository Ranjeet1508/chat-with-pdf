import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();
import {pdfRouter} from './Routers/pdfRouter.js';
import {queryRouter} from './Routers/queryRouter.js'

const app = express();

app.use(cors({
    origin: "*"
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT;

app.use('/pdf', pdfRouter);
app.use('/query', queryRouter);


app.listen(PORT, async() => {
    console.log(`server started on port ${PORT}`)
})