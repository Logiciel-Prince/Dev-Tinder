const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email');
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 18
    },
    gender: {
        type: String
    },
    photoUrl: {
        type: String,
        default: "https://www.w3schools.com/howto/img_avatar.png",
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error('Invalid URL');
            }
        }
    },
    about: {
        type: String,
        maxLength: 500
    },
    skills: {
        type: [String]
    },
}, {
    timesetamps: true, // Automatically adds createdAt and updatedAt fields
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compareSync(password, this.password);
};

userSchema.methods.getJWTToken = async function () {
    return await jwt.sign({ userId: this._id }, "PrinceKumar");
};

const User = mongoose.model('User', userSchema);
module.exports = User;