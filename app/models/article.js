/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../../config/config'),
    User = require('./user.js'),
    Schema = mongoose.Schema;
  

/**
 * Article Schema
 */
var ArticleSchema = new Schema({
    title: {
        type: String,
        default: '',
        trim: true,
        required: true 
    }, 
    content: {
        type: String,
        default: '',
        trim: true
    },
     user: [{type:mongoose.Schema.Types.ObjectId, ref: 'User'}]
});


 /** title: 'Article Title',
                    content: 'Article Content',
                    user: user */

mongoose.model('Article', ArticleSchema);



