'use strict';
const log = console.log;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const ObjectId = mongoose.Schema.Types.ObjectId;
const {MongoClient, ObjectID} = require('mongodb');

const BookSchema = mongoose.Schema({
    bookTitle: {
        type: String,
        required: true,
        minlength: 3
    },
    rating: {
        type: Number,
        default: 0
    },

    user: {
        // User module
        type: ObjectId
    },
    image:{
        type: String,
        required:true
    },
    description:{
        type:String,
        maxlength: 300,
        required:false
    },
    //Chapter module
    chapters:[ObjectId],

    //comments module
    comments:[ObjectId]

});

BookSchema.statics.addBook = ((req,res)=> {
    // Create a new student
    const book = new Book({
        bookTitle: req.body.bookTitle,
        image: req.body.image
    });
    // Save student to the database
    book.save().then((result) => {
        res.send(result)
    }, (error) => {
        res.status(400).send(error) // 400 for bad request
    })

});

BookSchema.statics.findBook = ((req,res)=> {
    // Create a new student
    Book.find({bookTitle: req.body.bookTitle}).then((book)=> {
        res.send(book);
    },(error)=>{
        res.status(404).json({success: false})
    })
});
const Book = mongoose.model('Book',BookSchema);




const User = mongoose.model("User",{
    name:{
        type:String,
        required:true,
        minlength: 3
    },
    //Book module
    bookshelf:[ObjectId],
    writtenBook:[ObjectId],
    followers:{
        type: Number,
        default: 0
    },
    image:{
        type: String,
        required:true
    },
    //User module
    following:[ObjectId]

    });
const Chapter = mongoose.model("Chapter",{
   chapterNum:{
       type:Number,
       required:true,
   },
   content:{
       content: String
   }
});
const Comment = mongoose.model("Comment",{
   user:{
       type: String,
       required: true
   },
    content: {
       type: String,
        required:true
    }
});
module.exports = { Book,User, Chapter, Comment};