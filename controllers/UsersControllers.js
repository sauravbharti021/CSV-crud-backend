const Users = require('./../models/usersSchema')
const moment= require('moment')
const csv= require('fast-csv')
const fs= require('fs')
const B_URL = process.env.B_URL

exports.userpost = async(req, res) =>{
    // console.log(req.body)
    const file = req.file.filename;
    const {fname, lname, email, mobile, Nationality, status, location} = req.body;

    if(!fname || !lname || !email || !mobile || !Nationality || !status || !location || !file){
        return res.status(401).json("All inputs fields are mandatory!")
    }

    try{
        const emailCheck = await Users.findOne({email: email});
        const mobileCheck = await Users.findOne({mobile: mobile})
        if(emailCheck){
            console.log("Already registered with this email")
            return res.status(401).json("User already registered with this Email.")
        }
        if(mobileCheck){
            console.log("Already registered with this mobile")
            return res.status(401).json("User already registered with this mobile.")
        }
        const dateCreated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

        const user_data = new Users({
            fname, lname, email, mobile, Nationality, status, location, profile: file, dateCreated
        })
        const saved= await user_data.save();
        if(saved){
            return res.status(200).json(user_data);
        }
        else {
            throw new Error(err);
        }

    }catch(error){
        console.log(error);
        return res.json(401).json(error);
    }
}

exports.userget = async(req, res)=>{

    const search = req.query.search || "";

    const Nationality = req.query.Nationality || "";

    const status = req.query.status || "";

    const sort = req.query.sort || "";

    const page = req.query.page || 1;

    const ItemPerPage= 4;

    // console.log(req.query)
    const query= {
        fname : {$regex : search, $options: "i"}
    }
    if(Nationality!== "All"){
        query.Nationality= Nationality
    }
    if(status!=="All"){
        query.status = status
    }

    try{
        const skip= (page-1)*ItemPerPage;

        const count= await Users.countDocuments(query);

        const user_data = await Users.find(query).
        sort({dateCreated:(sort=="new"? -1 : 1)}).
        limit(ItemPerPage).
        skip(skip) 
        ;

        const pageCount= Math.ceil(count/ItemPerPage);
        console.log(pageCount, "lol")
        res.status(200).json({
            Pagination: {
                count, pageCount, 
            },
            
            user_data
        })
    }catch(err){
        res.status(401).json(err)
    }
}

exports.singleUserGet= async(req, res)=>{

    const {id} =req.params

    try{
        const user_data = await Users.findOne({_id: id})
        res.status(200).json(user_data)
    }catch(error){
        res.status(401).json(error)
    }
}

exports.userEdit = async(req,res)=>{
    const {id} = req.params;
    const {fname, lname, email, mobile, Nationality, status, location, profile_picture} = req.body;
    const file = req.file ? req.file.filename : profile_picture;

    const dateUpdated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
    if(!fname || !lname || !email || !mobile || !Nationality || !status || !location || !file){
        return res.status(401).json("All inputs fields are mandatory!")
    }

    try{
        const updateUser = await Users.findByIdAndUpdate({_id: id},{
            fname, lname, email, mobile, Nationality, status, location, profile: file, dateUpdated
        },{
            new: true
        })
        const saved = await updateUser.save();
        if(saved){
            return res.status(200).json(updateUser)
        }else{
            throw new Error();
        }
    }catch(error){
        res.status(401).json(error);
    }

}

exports.deleteUser= async(req, res)=>{
    const {id} = req.params;
    try {
        const userDelete= await Users.findByIdAndDelete({_id: id});
        
        res.status(200).json(userDelete)
    } catch (error) {
        res.status(401).json({message: "error aaya"})
    }
}

exports.updateStatus= async(req, res) =>{
    const {id} = req.params;

    const {data} = req.body;

    try {
        const userStatusUpdate = await Users.findByIdAndUpdate({ _id : id }, {
            status : data
        }, {
            new : true
        });

        res.status(200).json(userStatusUpdate)
    } catch (error) {
        res.status(401).json(error)
    }
}

exports.userExport= async(req, res)=>{
    try {
        const user_data = await Users.find()
        const csvStream = csv.format({headers:true}) 

        if(!fs.existsSync("public/files/export/")){
            if(!fs.existsSync("public/files")){
                fs.mkdirSync("public/files/")
            }
            if(!fs.existsSync("public/files/export")){
                fs.mkdirSync(".public/files/export/")
            }
        }

        const writeAbleStream = fs.createWriteStream(
            "public/files/export/users.csv"
        )

        csvStream.pipe(writeAbleStream);
        writeAbleStream.on("finish", function(){
            res.json({
                downloadUrl : `${B_URL}/files/export/users.csv`
            })
        })

        if(user_data.length>0){
            user_data.map((user)=>{
                csvStream.write({
                    FirstName: user.fname ? user.fname : "-",
                    LastName: user.lname ? user.lname : "-",
                    Email : user.email? user.email: "-",
                    Mobile: user.mobile? user.mobile: "-",
                    Nationality: user.Nationality? user.Nationality: "-",
                    Status: user.status? user.status: "-",
                    Profile: user.profile? user.profile: "-",
                    Location: user.location? user.location: "-",
                    DateCreated: user.dateCreated? user.dateCreated: "-",
                    DateUpdated: user.dateUpdated? user.dateUpdated: "-" 
                })
            })
        }

        csvStream.end();
        writeAbleStream.end()

    } catch (error) {
        res.status(401).json(error)
    }
}