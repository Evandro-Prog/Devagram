import mongoose, {Schema} from 'mongoose';

const FollowSchema = new Schema({
    //quem segue
    userId: { type: String, required: true },
    //quem está sendo seguido
    userFollowedId: { type: String, required: true },
});

export const FollowModel = mongoose.models.follow || mongoose.model('follow', FollowSchema);