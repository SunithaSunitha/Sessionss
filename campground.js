const mongoose = require('mongoose');
const Review= require('./review')
const Schema=mongoose.Schema;
//to set the mongoose.Schema to an easier variable

// Set the schema
const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'

        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function(doc) {
   
    if(doc){
        await  Review.deleteMany({
            _id:{
                $in:doc.reviews 
            }
        })
            
                
           
        
        //console.log(res)
    }
    //console.log("Moddle ware executed")
})
    
// if(farm.products.length){
//     const res = await Product.deleteMany({_id:{$in:farm.products}})
//     console.log(res)
// }


// export to the app.js so the database can read it and define the model
module.exports= mongoose.model('Campground', CampgroundSchema);
