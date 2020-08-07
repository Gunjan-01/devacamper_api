const mongoose = require('mongoose');
const slugify = require('slugify');
// const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add your name'],
      trim: true,
      unique: true,
      maxlength: [50, 'not more than 50 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add description'],
      maxlength: [500, 'not more than 500 characters'],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'please add valid url with HTTP OR HTTPS',
      ],
    },
    // phone:{
    //     type : Number,
    //     maxlength:['phone no cannot be longer than 12 characters']
    // },
    email: {
      type: String,
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      ],
    },

    address: {
      type: String,
      required: [true, 'please add address'],
    },
    location: {
      // geoJason point
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
      },
      coordinates: {
        type: [Number],

        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      zipcode: String,
      city: String,
      country: String,
    },
    careers: {
      // arrays of strings
      type: {
        type: String,
      },
      // required: true,
      enum: [
        'Web Development',
        'mobile development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other',
      ],
    },
    averageRating: {
      type: Number,
      min: [0, 'Rating must be atleast 1'],
      max: [1, 'rating cannt be more than 10'],
    },
    averageCost: {
      type: Number,
    },
    photo: {
      type: String,
      default: 'no-photo.jpeg',
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jonGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);
// create a slug
BootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// geocode and create location field

// BootcampSchema.pre('save', async function (next) {
// const loc = await geocoder.geocode(this.address);
// this.location = {
//     type: 'Point',
//     coordinates: [loc[0].longitude, loc[0].latitude],
//     formattedAddress: loc[0].formattedAddress,
//     street: loc[0].streetName,
//     city: loc[0].city,
//     state: loc[0].stateCode,
//     zipcode: loc[0].zipcode,
//     country: loc[0].countryCode,
// };
// // dont save the address
// this.address = undefined;
// next();
// });

// cascade delete courses when bootcamp is deleted
BootcampSchema.pre('remove', async function (next) {
  await this.model('Course').deleteMany({ bootcamp: this._id });
  next();
});

// Reverse populate with virtuals
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
});
module.exports = mongoose.model('Bootcamp', BootcampSchema);
