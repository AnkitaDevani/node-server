const express = require('express');
const multer = require('multer');
const path = require('path');
const Users = require("./models/users");
const SubjectList = require("./models/subjectList");
const cors = require("cors");
const LoginUser = require("./models/isLogIn");
const bcrypt = require("bcrypt");
const Cryptr = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const router = express();
const transporter = require('./models/mail');
const uploads = require('./models/image');
const fs = require('fs');


router.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
        const filename = file.originalname.split('.')[0];
        cb(null, filename + "_" + Date.now()+".jpg")
    }
});
const maxSize = 1 * 1000 * 1000;
let uploadFile = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter:  (req, file, cb) => {

        // Set the filetypes, it is optional
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);

        const extname = filetypes.test(path.extname(
            file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }

        cb("Error: File upload only supports the "
            + "following filetypes - " + filetypes);
    }
}).single("profilePic");

router.post('/uploadProfilePic',verifyToken, (req, res, next) => {
        uploadFile(req,res,function(err) {
            if(err) {
                console.log(err);
                res.status(400).send(err);
            }
            else {
                console.log(req.body);
                console.log("Success, Image uploaded!");
                next();
            }
        })
        }, async (req, res) => {
        try {
            console.log("File details:-", req.file);
            console.log("File user:-", req.user);
            const obj = {
                profile: req.file.path
            };

            Users.findOneAndUpdate({ email: req.user.email }, obj, (err, item) => {
                if (err) {
                    console.log(err);
                    res.status(400).json(err);
                }
                else {
                    console.log(item);
                    item.profile = req.file.path;
                    res.status(200).json(item);
                }
            });
        } catch(error){
            console.log(error);
            res.status(400).json({
                message: error
            });
        }
});


router.post('/submit', async (req, res) => {
    try {
        const {fname, lname, hobbies, email, password, gender, course,profile,role} = req.body;
        console.log(role);
        if (!(email && password && fname && lname && gender)) {
            return res.status(400).json({
                message: "All input is required"
            });
        }
       let user = await Users.findOne({ email });
       if(user) {
            return res.status(400).json({
                message: "Already user exists!"
            });
        }
        const encryptPass = bcrypt.hashSync(password, 10);
        console.log(encryptPass);
        const isValidPass = bcrypt.compareSync(password, encryptPass);
        console.log("valid" + isValidPass);

        const data = new Users({
            fname: fname,
            lname: lname,
            hobbies: hobbies,
            email: email.toLowerCase(),
            password:  encryptPass,
            gender:  gender,
            course:  course,
            profile:profile,
            role:role
        });
        data.save().then(dataRes => {
            res.status(200).json(dataRes);
        }).catch(e => {
            res.status(400).json({
                message: e.errors
            });
        });
    } catch(error){
        console.log(error);
        res.status(400).json({
            message: error
        });
    }
});

router.delete('/delete/:userId', verifyToken, (req, res) => {
    console.log(req.params);
    try {
        Users.findByIdAndDelete(req.params.userId).then(data => {
            console.log(data);
            res.status(200).json(data);
        }).catch(e =>  res.status(400).json({message: e.errors}));
     } catch(e) {
        res.status(400).json({
            message: "Something went wrong"
        });
    }
});

router.get('/user/:userId',verifyToken, (req, res) => {
    try {
        /*Users.find({ _id: req.params.userId }).then(data => {
            console.log(data);*/
         res.status(200).json(req.user);
       /* }).catch(e =>  res.status(400).json({message: e.errors}));*/
    }catch (e) {
        res.status(400).json({
            message: "Something went wrong"
        });
    }
});

router.get('/users', (req, res) => {
    try{
        const names=[];
        Users.find({}, function (err, doc) {
            for (let key in doc) {
                names.push(doc[key]);
            }
            console.log(names);
            res.json(names);
        })
    }catch (e) {
        res.status(400).json({
            message: "error"
        });
    }
});

router.patch('/update/:userId', verifyToken, async (req, res) => {
    try {
        console.log(req.user.email);
        const id = req.params.userId;
        const updatedData = req.body;
        const options = { new: true };
        Users.findByIdAndUpdate(id, updatedData, options).then(data => {
                res.status(200).json(data);
            }).catch(e => res.status(400).json({message: e.errors}));


    }catch (e) {
        res.status(400).json({
            message: "Something went wrong"
        });
    }
});


router.post('/loginuser', async (req, res) => {
    try{
        console.log(req.body);
        const { email, password } = req.body;
        if (!(email && password)) {
           return res.status(400).send("All input is required");
        }
        const user = await Users.findOne({ email });
        console.log(user);
        const isValid = await bcrypt.compare(password, user.password);
        console.log(isValid);
        if (user && isValid) {
            // Create token
            const token = jwt.sign(
                { user_id: user._id, email, name: `${user.fname} ${user.lname}`, role: `${user.role}` },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );
            user.token = token;
            console.log(user);
            console.log(token);
            const login = new LoginUser({
                email,
                password,
                token
            });

            login.save().then(dataRes => {
                console.log(dataRes);
                user.password = "";
                res.status(200).json(user);
            }).catch(e => {
                res.status(400).json({
                    message: e.errors
                });
            });
        }else{
            return res.status(400).json({
                message: "Email or password not valid"
            });
        }
    } catch(error){
        console.log(error);
        res.status(400).json({
            message: "Something went wrong"
        });
    }
});

router.get('/getLoggedInUser', verifyToken, (req, res) => {
    try{
        Users.findOne({ _id: req.user.user_id}, function (err, doc) {
            if (err) {
                return res.status(400).json({
                    message: "Something went wrong",
                    error: err
                });
            }
            res.json(doc);
        })
    }catch (err) {
        res.status(400).json({
            message: "Something went wrong",
        });
    }
});

/*router.get('/login/user', (req, res) => {
    try{
        const names=[];
        LoginUser.find({}, function (err, doc) {
            for (let key in doc) {
                names.push(doc[key]);
            }
            console.log(names);
            res.json(names);
        })
    }catch (e) {
        res.status(400).json({
            message: "error"
        });
    }
});*/

router.delete('/logout', verifyToken , (req, res) => {
    try {
        console.log(req.user);
        LoginUser.deleteOne(req.user).then(data => {
            res.status(200).json(data);
        }).catch(e =>  res.status(400).json({message: e.errors}));
    } catch(e) {
        res.status(400).json({
            message: "Something went wrong"
        });
    }
});

function verifyToken(req,res,next) {
    const token = req.headers.authorization;
    console.log(token);
    if(token) {
        const splitToken = token.split(" ");
        req.token = splitToken[1];
        jwt.verify(req.token, process.env.TOKEN_KEY, (err, authData) => {
            if(err) {
                console.log("Token In err:-", err);
                res.status(401).json({
                    message: "Unauthorized"
                });
            }else {
                req.user = authData;
                next();
            }
        });
    }else {
        console.log("erro");
        res.status(401).json({
            message: "Unauthorized"
        });
    }
}


router.post('/mail', async (req, res) => {
    try{
        // Step 2
        let mailOptions = {
            from: 'abc@gmail.com', // sender address
            to: "ankiabhuva12@gmail.com", // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            //html: "<b>Hello world?</b>", // html body
        };
        // Step 3
        transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
                console.log(err);
              return res.status(400).json({
                    message: 'Error occurs'
                });
            }
            res.status(200).json({
                message: 'Email sent!!!'
            });
        });
    } catch(error){
        console.log(error);
        res.status(400).json({
            message: "Something went wrong"
        });
    }
});


router.patch('/changepassword', verifyToken, async (req, res) => {
    try {
        const loginUser =await Users.findOne({ email: req.user.email });
        const options = { new: true };
        const isValidPass = bcrypt.compareSync(req.body.oldPass, loginUser.password);
        const encryptPass = bcrypt.hashSync(req.body.password, 10);
        console.log(isValidPass);
        if(isValidPass) {
          Users.findOneAndUpdate({ email: req.user.email }, {
              password: encryptPass
          },options).then(data => {
                res.status(200).json(data);
            }).catch(e => res.status(400).json({message: e.errors}));
        }else {
            res.status(300).json({
                message: "password incorrect"
            });
        }
    }catch (e) {
        res.status(400).json({
            message: "Something went wrong"
        });
    }
});


router.post('/subject', async (req, res) => {
    try {
        const {subject} = req.body;
        console.log(subject);

        let user = await SubjectList.findOne({ subject });
        if(user) {
            return res.status(400).json({
                message: "Already user exists!"
            });
        }
        const data = new SubjectList({
            subject:subject
        });
        data.save().then(dataRes => {
            res.status(200).json(dataRes);
        }).catch(e => {
            res.status(400).json({
                message: e.errors
            });
        });
    } catch(error){
        console.log(error);
        res.status(400).json({
            message: error
        });
    }
});

router.get('/subjectList',(req,res) => {
    try{
        const sub=[];
        SubjectList.find({}, function (err, doc) {
            for (let key in doc) {
                sub.push(doc[key]);
            }
            console.log(sub);
            res.json(sub);
        })
    }catch (e) {
        res.status(400).json({
            message: "error"
        });
    }
});

router.delete('/subdelete/:sub', (req, res) => {
    console.log(req.params);
    try {
        SubjectList.findOneAndDelete({subject:req.params.sub}).then(data => {
            console.log(data);
            res.status(200).json(data);
        }).catch(e =>  res.status(400).json({message: e.errors}));
    } catch(e) {
        res.status(400).json({
            message: "Something went wrong"
        });
    }
});

module.exports = router;