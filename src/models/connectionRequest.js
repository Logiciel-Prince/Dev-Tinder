const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ConnectioinRequestSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ['ignore', 'interested', 'accepted', 'rejected']
        },
        message: `{VALUE} is not a valid status`,
        default: 'pending'
    },
    message: {
        type: String,
        maxLength: 500
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

ConnectioinRequestSchema.pre('save', function (next) {
    if(this.sender.equals(this.receiver)) {
        return next(new Error("Sender and receiver cannot be the same user"));
    }
    next();
});

const ConnectionRequestModel = model('ConnectionRequest', ConnectioinRequestSchema);

module.exports = ConnectionRequestModel;