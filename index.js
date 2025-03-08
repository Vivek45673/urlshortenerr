const express=require("express");
const {connectToMongoDB}=require("./connect");
const urlRoute=require("./routes/url");
const URL=require("./models/url");
const path=require('path');
const staticRoute=require("./routes/staticRouter");
const userRoute=require("./routes/user");
const cookieParser=require('cookie-parser');
const {restrictToLoggedUserOnly,checkAuth}=require('./middleware/auth');

const app=express();
const PORT=8002;

app.set('view engine', 'ejs');
app.set('views',path.resolve('./views'));

app.use(express.json());
app.use(express.urlencoded({ extended:false}));
app.use(cookieParser());


connectToMongoDB("mongodb://127.0.0.1:27017/short-url")
.then(()=> console.log("Mongodb connected"));

app.use("/url",restrictToLoggedUserOnly,urlRoute);
app.use("/",checkAuth,staticRoute);
app.use("/user",userRoute);

app.get("/url/:shortId",async(req,res)=>{
    const shortId=req.params.shortId;
    const entry=await URL.findOneAndUpdate(
        {
            shortId,
        },
        {
            $push:{
                visitHistory:{
                    timestamp:Date.now(),
                },
            },
        }
    );
    res.redirect(entry.redirectURL);
})

app.listen(PORT,()=> console.log(`Server started at PORT: ${PORT}`));