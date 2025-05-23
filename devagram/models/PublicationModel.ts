import mongoose, { Schema } from 'mongoose';

const PublicationSchema = new Schema({
    idUser: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    date: { type: Date, require: true },
    comments: { type: Array, required: true, default: [] },
    likes: { type: Array, required: true, default: [] },
});

export const PublicationModel = (mongoose.models.publications || mongoose.model('publications', PublicationSchema));