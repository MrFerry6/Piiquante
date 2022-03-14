const mongoose  = require("mongoose");

const sauce = mongoose.Schema({
    userId: {type: String, require: true},
    name: {type: String, require: true},
    manufacturer: {type: String, require: true},
    description: {type: String, require: true},
    mainPeppper: {type: String, require: true},
    imageUrl: {type: String, require: true},
    heat: {type: Number, require: true},
    likes:  {type: Number, require: true},
    dislikes:  {type: Number, require: true},
    usersLiked: {type: [Number], require: true},
    usersDisiked: {type: [Number], require: true},
})