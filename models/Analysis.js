import mongoose from "mongoose";


const analysisSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema. Types.ObjectId, ref : "User", required: true},
    url: { type: String, required: true},
    overallScore: {type: Number, min: 0, max: 100, default: 0},
    catagories: {
        seo: { type: Number, default: 0},
        performance: { type: Number, default : 0},
        accessibility: { type: Number, default: 0},
        bestPractices: { type : Number, default : 0 }
    },
    metaData: {
        title : { type: String, default: "" },
        description : { type: String, default: ""},
        canonical: { type: String, defaul: ""},
        robots : { type : String , default : ""},
        
    }
})