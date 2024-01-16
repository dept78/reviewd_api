import express from 'express';
import mongoose from 'mongoose';
import { Request, Response } from 'express';

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/tsdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});



const reviewSchema = new mongoose.Schema({
    id: Number,
    userId: String,
    text: String,
});

const ReviewModel = mongoose.model('Review', reviewSchema);

const isOwner = async (req: Request, res: Response, next: () => void) => {
    const reviewId = parseInt(req.params.id);
    const userId = req.body.userId;

    try {
        const review = await ReviewModel.findOne({ id: reviewId });

        if (!review || review.userId !== userId) {
            return res.status(404).json({ error: "Forbidden: Sorry! You can delete your own review only" });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

app.delete('/reviews/:id', isOwner, async (req: Request, res: Response) => {
    const reviewId = parseInt(req.params.id);

    try {
        const review = await ReviewModel.findOneAndDelete({ id: reviewId });

        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        res.status(200).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

