const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater');
const {ObjectId} = mongoose.Schema


mongoose.plugin(slug);


const postSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    description: {
        type: String,
        trim: true,
        required: true,
    },
    video: {
        type: String,
        trim: true,
    },
    photo: {
        type: String,
        trim: true,
        required: true,
    },
    slug: {
        type: String,
        slug: "name",
        unique: true
    },
    primaryArtist: {
        type: ObjectId,
        ref: 'Artist'
    },
    isPublished: Boolean
}, { id: false })

//objectID necessary for algolia search
postSchema.virtual('objectID').get(function(){
    return this._id.toHexString();
})

postSchema.set('toJSON', {
    virtuals: true
})

module.exports = mongoose.model('Post', postSchema)