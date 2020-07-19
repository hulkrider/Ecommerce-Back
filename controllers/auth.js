const User=require('../models/user')
const jwt=require('jsonwebtoken')
const expressJwt=require('express-jwt')
require('mongoose')
const sgMail = require('@sendgrid/mail');
const { compact } = require('lodash');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);



exports.signup=(req,res)=>{
    console.log(req.body)
    const {name,email,password}=req.body
        User.findOne({email}).exec((err,user)=>{
            if(user){
                return res.status(400).json({
                    error:"User with this email already exists"
                })
            }
            const emailToken=jwt.sign({name,email,password},process.env.JWT_SECRET,{expiresIn:'1000m'})
            console.log(emailToken)
            const newuser=new User({name,email,password,emailToken})
            newuser.save((err,user)=>{
                if(err){
                    console.log(err)
                    res.status(400).json({
                        err
                    })
                }
                res.json({
                    user,
                    message:"sign up successful!"
                })
            })
            
            const msg = {
                            to: email,
                            from: process.env.EMAIL,
                            subject: 'Account Activation for E-commerec',
                           html: `<h1>Please click on the given link to activate your account<h1>
                                    <a href="${process.env.CLIENT_URL}/email-activate/${email}/${emailToken}">Click here to verify your account</a>`,
                          };
                          sgMail.send(msg,(error,body)=>{
                              if(error){
                                  return res.json({
                                      message:error
                                  })
                              }
                               res.json({
                                  message:'email has been sent, Kindly activate your account'
                              })
                          });


                        })
}

exports.activateAccount=(req,res)=>{
    //console.log(req.params)
    console.log(req.body)
    const {email,emailToken}=req.body
    
    User.findOne({email},(err,user)=>{
        if(!user || err){
            return res.status(401).json({
                error:"You are not verified!"
            })
        }
        if(user){
            if(user.emailToken===emailToken){
                user.validation=true
                user.save()
            
            }
            res.json({
                user,
                message:"verified successfully !"
            })
            console.log(user)
        }
    })


}

exports.signin=(req,res)=>{
    const {email,password}=req.body
    const NewPassword=password
       User.findOne({email},(err,user)=>{
            if(err || !user){
                return res.status(400).json({error:"User with this email does not exist"})
            }
        if(user){
            const {name,email,password}=user
            console.log(user.validation)
            if(user.validation===false){
                const emailToken=jwt.sign({name,email,password},process.env.JWT_SECRET,{expiresIn:'1000m'})
                console.log(emailToken)
                user.emailToken=emailToken
                user.save()

                const msg = {
                    to: email,
                    from: process.env.EMAIL,
                    subject: 'Account Activation for E-commerec',
                   html: `<h1>Please click on the given link to activate your account<h1>
                            <a href="${process.env.CLIENT_URL}/email-activate/${email}/${emailToken}">Click here to verify your account</a>`,
                  };
                  sgMail.send(msg,(error,body)=>{
                      if(error){
                          return res.json({
                              message:err.message
                          })
                      }
                       res.json({
                          message:'email has been sent, Kindly activate your account'
                      })
                  });



                return res.status(401).json({
                    error:"Please verify your email then signin"
                })

            }

            if(!user.authenticate(NewPassword)){
                return res.status(401).json({
                error:"email and password dont match"
            })
        }        
           
        }
        
    const token=jwt.sign({_id: user._id},process.env.JWT_SECRET)
    res.cookie('t',token,{expire:new Date()+86400000})//86400000->1 day
    const {_id,name,email,role}=user
    return res.json({token,user:{_id,email,name,role}})
})
}


exports.signout=(req,res)=>{
    res.clearCookie('t')
    res.json({
        message:'Successful signout!'
    })
}


exports.requireSignin=expressJwt({
    secret:process.env.JWT_SECRET,
    userProperty:'auth'
})

exports.isAuth=(req,res,next)=>{
    const {_id}=req.auth
    let role
    User.findOne({_id},(err,user2)=>{
        if(err || !user2){
            res.status(400).json({
                error:'Not a valid user'
            })
        }
       role=user2.role
       // console.log(role)
    let user=(req.profile && req.auth && req.profile._id==req.auth._id)||role===1
    if(!user){
        return res.status(403).json({
            error:'Access Denied',
        })
    }
    next()
})
}


exports.isAdmin=(req,res,next)=>{
    if(req.profile.role===0){
        return res.status(403).json({
            error:'Admin resource! Access Denied'
        })
    }
    next()
}

exports.forgot= (req,res)=>{
    const {email}=req.body
    console.log(email) 
    User.findOne({email},(err,user)=>{
        console.log(email)
        if(err || !user){
            return res.status(400).json({
                error:"User is not found with this email !"
            })
        }
        const pRand=Math.floor(Math.random()*1000000)
        user.pRand=pRand
        user.save()
        //console.log(user)

        const msg = {
            to: email,
            from: process.env.EMAIL,
            subject: 'Forgot password for E-commerec',
           html: `<h3>Code for resetting a password, please enter code<h3>
           <p>${pRand}</p>`
          };
          sgMail.send(msg,(error,body)=>{
              if(error){
                  return res.json({
                     // message:err.message
                     error
                  })
              }
               res.json({
                  message:'email has been sent, Kindly reset your password!'
              })
          });
          
          
          
        })
}

exports.confirm=(req,res)=>{
    const email=req.params.email
    console.log("backend in confirm",email)
    //const {email,pRand:otp,password}=req.body
    //console.log(email,otp,password)
    User.findOne({email},(err,user)=>{
        console.log("backend in confirm findone",email)
        if(err || !user){
            console.log("error",err)
            return res.status(400).json({
                error:"User is not found with this email !"
            })
        }
       // const email=req.body.email
       console.log(email,"upper otp")
        const otp=req.body.pRand
        const password=req.body.password
        console.log(otp,password)
        if(user){
            console.log("if user" ,user)
            if(user.pRand===otp){
                console.log("from backend if ", otp,email,password)
                user.hashed_password=user.encryptPassword(password)
                console.log("from backend if ", otp,email,password)
                user.save()
                console.log("from backend if save ", user)
            }
            else{
               return res.status(400).json({error:"Invalid OTP, Please try again!"})
            }
        }
        res.json({
            user
        })
    }
    )}