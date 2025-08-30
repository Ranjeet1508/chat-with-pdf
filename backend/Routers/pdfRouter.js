import {Router} from 'express';
import {indexDocument, upload, deleteFile, deletePineconeVectors} from '../Controllers/pdfController.js'

const pdfRouter = Router();

pdfRouter.post('/upload', upload.single('pdf'), async(req, res) => {
    try {
        await indexDocument(req);
        return res.status(200).json({
            message: "File uploaded successfully"
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: "Internal Server Error"
        })
    }
})

pdfRouter.delete("/delete", async(req, res) => {
    try {
        deleteFile();
        await deletePineconeVectors();
        return res.status(200).json({
            message: "File removed successfully"
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            message: "Internal Server Error"
        })
    }
})

export {pdfRouter}