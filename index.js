const express= require('express');
const path= require('path');
const bodyParser= require('body-parser');
const flash= require('connect-flash');

const expressSession= require('express-session');

const MongoStore= require('connect-mongo');
//middlewares
const authMiddleware= require('./middleware/authMiddleware');
const redirectIfAuthenticatedMiddleware= require('./middleware/redirectIfAuthenticatedMiddleware');


const app = new express();
// const bodyParser = require('body-parser');


const { check, validationResult } = require('express-validator')
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const ejs = require('ejs')



app.use(flash());
app.set('view engine','ejs')

const bcrypt= require('bcrypt')

const mongoose= require('mongoose');
mongoose.connect('mongodb+srv://admin:admin@cluster0.4cp8cjf.mongodb.net/');
mongoose.connection.on('connected', function(){
    console.log("Connected to the Database");
});


app.use(expressSession({
  secret:'keyboard cat',
  // resave:false,
  // saveUninitialized: false,
  
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://admin:admin@cluster0.4cp8cjf.mongodb.net/'
 }),
  cookie : { maxAge: 180 * 60 * 1000 },
}))

app.use(function (req, res, next){
  res.locals.session = req.session; //to access session variables in all views
  next();
})

const fileUpload = require('express-fileupload')
app.use(fileUpload())

global.loggedIn= null;
global.userType= null;
global.userName= null;
global.userEmail= null;
global.profileImage= null;

 app.use("*", (req,res, next) =>{
    loggedIn= req.session.userId;
    userType= req.session.userType;
    userName= req.session.userName;
    userEmail=req.session.userEmail;
    validationEmail= req.session.validationEmail;
    profileImage= req.session.profileImage;
   
    next()
 });

//Models

const User = require('./models/User.js');
const Product= require('./models/Product.js');
const Blog= require('./models/Blog.js');
const Event= require('./models/Event.js');
const Review= require('./models/Review.js');
const Message= require('./models/Message.js');
const Booking= require('./models/Booking.js');
const Order= require('./models/Order.js')
const Cart= require('./models/Cart.js')
//Controllers

//general Controllers

//const userRegistrationController= require('./controllers/userRegistration.js')
const landingPageController= require('./controllers/landingPage.js');
const loginPageController= require('./controllers/loginPage.js');
const loginController= require('./controllers/login.js');
const registerPageController= require('./controllers/registerPage.js');
const passwordResetPage1Controller= require('./controllers/passwordResetPage1.js');
const passwordResetPage2Controller= require('./controllers/passwordResetPage2.js');
const logoutController= require('./controllers/logout.js');
const profileEditPageController= require('./controllers/editProfilePage.js');
const userTicketsPageController= require('./controllers/userTicketsPage.js');
const myOrdersPageController=require('./controllers/myOrdersPage.js');
//admin controllers
const adminMessagesPageController= require('./controllers/adminMessagesPage.js');
const adminHomePageController= require('./controllers/adminHomePage.js');
const adminBlogPageController= require('./controllers/adminBlogPage.js');
const adminCreateBlogPageController= require('./controllers/adminCreateBlogPage.js');
const adminEventPageController= require('./controllers/adminEventPage.js');
const adminAddProductPageController= require('./controllers/adminAddProductPage.js');
const EventRequestsPageController= require('./controllers/eventRequeststPage.js');
//organizer controllers
const organizerEventRequestsPageController= require('./controllers/organizerEventRequeststPage.js');
const organizerHomePageController= require('./controllers/organizerHomePage.js');
const organizerAddEventPageController= require('./controllers/organizerAddEventPage.js');
//user controllers
const cartPageController= require('./controllers/cartPage.js');
const addToCartController= require('./controllers/addToCart.js');
const checkoutPageController= require('./controllers/checkoutPage.js');
const userHomePageController= require('./controllers/userHomePage.js');
const userEventPageController= require('./controllers/userEventPage.js');
const onsaleUserEventPageController= require('./controllers/onsaleUserEventPage.js');
const userEventDetailPageController= require('./controllers/userEventDetailPage.js');
const userShopPageController= require('./controllers/userShopPage.js');
const userShopDetailPageController= require('./controllers/userShopDetailPage.js');
const userProductDeleteController= require('./controllers/userProductDelete.js');
const onSalePageController= require('./controllers/onSalePage.js');
const userContactPageController= require('./controllers/userContactPage.js');
const userBlogPageController= require('./controllers/userBlogPage.js');
const userBlogDeleteController= require('./controllers/userBlogDelete.js');
const userBlogEditController= require('./controllers/userBlogEdit.js');

const userBlogDetailPageController= require('./controllers/userBlogDetailPage.js');
const userReviewsPageController= require('./controllers/userReviewPage.js');


app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded())

// app.listen(5000, ()=>{
//     console.log("App listening on port 5000")
// })
let port= process.env.PORT;
if(port==null || port== ""){
port=4000;
}

app.listen(port, ()=>{
  console.log('App listening...')
})

//creating new user
// app.post('/register/new',redirectIfAuthenticatedMiddleware,userRegistrationController)

//Creating new user
app.post('/register/new',redirectIfAuthenticatedMiddleware,

urlencodedParser, [
    //Form Validation
        check('name').notEmpty().withMessage("Please enter your name"),

        check("email")
        .notEmpty().withMessage("Please enter your Email")
        .isEmail().withMessage("Please enter a valid Email Id")
        .custom((value, {req}) => {
          return new Promise((resolve, reject) => {
            User.findOne({email:req.body.email}, function(err, user){
              if(err) {
                reject(new Error('Server Error'))
              }
              if(Boolean(user)) {
                reject(new Error('E-mail already Registered'))
              }
              resolve(true)
            });
          });
        }),

        check("password")
        .notEmpty().withMessage("Password should not be empty")
        
        .custom((value,{req, loc, path}) => {
            if (value !== req.body.cpassword) {
                // throw error if passwords do not match
                throw new Error("Passwords don't match");
            }
            else {
                return value;
            } 
        }),

        check('password')
        .isLength({ min: 8 }).withMessage('Password Must Be at Least 8 Characters')
        .matches('[0-9]').withMessage('Password Must Contain a Number')
        .matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter').trim().escape(),

        check("cpassword")
        .notEmpty().withMessage("Confirm Password should not be empty"),

        check("usertype")
        .notEmpty().withMessage("Please enter your user type"),
    
        check("firstquestion")
        .notEmpty().withMessage("Please enter Question 1"),
        check("firstanswer")
        .notEmpty().withMessage("Please enter Answer 1"),

        check("secondquestion")
        .notEmpty().withMessage("Please enter Question 2"),
        check("secondanswer")
        .notEmpty().withMessage("Please enter Answer 2"),

        check("thirdquestion")
        .notEmpty().withMessage("Please enter Question 3"),
        check("thirdanswer")
        .notEmpty().withMessage("Please enter Answer 3"),

    ], (req, res)=> {
        const errors = validationResult(req)
        if(errors.isEmpty()){
            User.create(req.body, (error,user)=> {
                if(error){
                    
                    return res.redirect('/register')
                }
                req.flash('success','Registration Successful')
                res.redirect('/login')
            })
        }
        if(!errors.isEmpty()) { 
            // return res.status(422).jsonp(errors.array())
            const alert = errors.array()
            req.flash('data',req.body) //so that the entered data in form wont disappear after page is refreshed
            req.flash('validationErrors', alert)
            res.redirect('/register')
        }

        
    }

)

app.post('/users/login',redirectIfAuthenticatedMiddleware,
urlencodedParser, [
    //Login Form Validation
        
        check("email")
        .notEmpty().withMessage("Please enter your Email")
        .isEmail().withMessage("Please enter a valid Email Id")
        .custom((value, {req}) => {
          return new Promise((resolve, reject) => {
            User.findOne({email:req.body.email}, function(err, user){
              if(err) {
                reject(new Error('Server Error'))
              }
              if(!(user)) {
                reject(new Error('User does not Exist. Please Register First'))
              }
              if((user)) {
                 
                bcrypt.compare(req.body.password, user.password, (error, same)=>{
       
                                    if(same){  //if passwords dont  match

                                        req.session.userType= user.usertype
                                        req.session.userId= user._id
                                        req.session.userEmail= user.email
                                        req.session.userName= user.name
                                        req.session.profileImage= user.profileimage
                                        
                                        console.log("Passwords match") 
 
                                    }
                                    else{
                                        reject(new Error('Incorrect Username/Password'))
                                        console.log("Passwords donot match")
                                    }
                                    resolve(true)
                                })}
            //    resolve(true)
            });
           
          });
         
        }),

        check("password")
        .notEmpty().withMessage("Password should not be empty"),
    
    
    ], (req, res)=> {
        const errors = validationResult(req)
        if(errors.isEmpty()){
            console.log('Entered no errors ')

                res.redirect('/userHome')
            
        }
        if(!errors.isEmpty()) { 
          
            console.log('Entered errors ')
            const loginalert = errors.array()
            req.flash('data',req.body) //so that the entered data in form wont disappear after page is refreshed
            req.flash('validationErrors', loginalert)
            res.redirect('/login')

        }})


        app.post('/passwordResetPage1/auth',redirectIfAuthenticatedMiddleware, 
        urlencodedParser, [
            //Login Form Validation
                
                check("email")
                .notEmpty().withMessage("Please enter your Email")
                .isEmail().withMessage("Please enter a valid Email Id")
                .custom((value, {req}) => {
                  return new Promise((resolve, reject) => {
                    User.findOne({email:req.body.email}, function(err, user){
                      if(err) {
                        reject(new Error('Server Error'))
                      }
                      if(!(user)) {
                        reject(new Error('User does not Exist. Please Register First'))
                      }

                      resolve(true)
                    });
                   
                  });
                 
                }),
                    
            
            ], (req, res)=> {
                const errors = validationResult(req)
                if(errors.isEmpty()){
                    req.session.validationEmail= req.body.email
                    res.redirect('/passwordResetPage2')
                    
                }
                if(!errors.isEmpty()) { 
                  
                    const alert = errors.array()
                    req.flash('data',req.body) //so that the entered data in form wont disappear after page is refreshed
                    req.flash('validationErrors', alert)
                    res.redirect('/passwordResetPage1')
                }})


               



                app.post('/passwordResetPage2/auth',redirectIfAuthenticatedMiddleware,
urlencodedParser, [
        
        check("firstanswer")
        .notEmpty().withMessage("Please enter your first answer")
        .custom((value, {req}) => {
          return new Promise((resolve, reject) => {
            User.findOne({email:validationEmail}, function(err, user){
              if(err) {
                reject(new Error('Server Error'))
              }
             
              if((user)) {
                 
                bcrypt.compare(req.body.firstanswer, user.firstanswer, (error, same)=>{
       
                                    if(!same){  //if answers dont match
                                       
                                        reject(new Error('Answers Incorrect'))
                                        
                                        console.log("Answer 1 dosent match")
 
                                    }
                                     resolve(true)      
                                }) }  
              
            });
          });
        }),

        check("secondanswer")
        .notEmpty().withMessage("Please enter your second answer")
        .custom((value, {req}) => {
          return new Promise((resolve, reject) => {
            User.findOne({email:validationEmail}, function(err, user){
              if(err) {
                reject(new Error('Server Error'))
              }
             
              if((user)) {
                 
                bcrypt.compare(req.body.secondanswer, user.secondanswer, (error, same)=>{
       
                                    if(!same){  //if answers dont match
                                       
                                        reject(new Error('Answers Incorrect'))
                                        
                                        console.log("Answer 2 dosent match")
 
                                    }
                                     resolve(true)      
                                }) }  
              
            });
          });
        }),

        check("thirdanswer")
        .notEmpty().withMessage("Please enter your third answer")
        .custom((value, {req}) => {
          return new Promise((resolve, reject) => {
            User.findOne({email:validationEmail}, function(err, user){
              if(err) {
                reject(new Error('Server Error'))
              }
             
              if((user)) {
                 
                bcrypt.compare(req.body.thirdanswer, user.thirdanswer, (error, same)=>{
       
                                    if(!same){  //if answers dont match
                                       
                                        reject(new Error('Answers Incorrect'))
                                        
                                        console.log("Answer 3 dosent match")
 
                                    }
                                     resolve(true)      
                                }) }  
              
            });
          });
        }),
    
    
    ], (req, res)=> {
        const errors = validationResult(req)
        if(errors.isEmpty()){
            console.log('Entered no errors ')

                res.redirect('/passwordResetPage')
            
        }
        if(!errors.isEmpty()) { 
          
            console.log('Entered errors ')
            const alert = errors.array()
            req.flash('data',req.body) //so that the entered data in form wont disappear after page is refreshed
            req.flash('validationErrors', alert)
            res.redirect('/passwordResetPage2')

        }})



        app.post('/passwordReset/auth',redirectIfAuthenticatedMiddleware, 
        urlencodedParser, [
    //Form Validation
      

        check("password")
        .notEmpty().withMessage("Password should not be empty")
        
        .custom((value,{req, loc, path}) => {
            if (value !== req.body.cpassword) {
                // throw error if passwords do not match
                throw new Error("Passwords don't match");
            }
            else {
                return value;
            } 
        }),

        check('password')
        .isLength({ min: 8 }).withMessage('Password Must Be at Least 8 Characters')
        .matches('[0-9]').withMessage('Password Must Contain a Number')
        .matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter').trim().escape(),

      check("cpassword")
        .notEmpty().withMessage("Confirm Password should not be empty"),

    ], async (req, res)=> {
        const errors = validationResult(req)

        

        if(errors.isEmpty()){
           await User.findOneAndUpdate({email: validationEmail},{
            password: req.body.password
            
           })
           console.log("Password Updated")
           req.flash('success','Password Successfully Updated')
           res.redirect('/login')
           
        }
        if(!errors.isEmpty()) { 
            // return res.status(422).jsonp(errors.array())
            const alert = errors.array()
            req.flash('data',req.body) //so that the entered data in form wont disappear after page is refreshed
            req.flash('validationErrors', alert)
            res.redirect('/passwordResetPage')
        }
  
    })

    //ADMIN ADD PRODUCT

    app.post('/add/product',authMiddleware,

    urlencodedParser, [


    check("title")
    .notEmpty().withMessage("Please enter product title"),

    check("quantity")
    .notEmpty().withMessage("Please enter product quantity"),

    check('onsale')
    .notEmpty().withMessage("Please enter product onSale value"),

    check('discountpercent')
    .notEmpty().withMessage("Please enter discount Percentage/ if no discount enter 0"),

    // check('finalprice')
    // .notEmpty().withMessage("Please enter Final Price"),
    

  // check("image")
  //   .notEmpty().withMessage("Please upload product image"),

    check("shortdescription")
    .notEmpty().withMessage("Pleaeenter short description"),

    check("longdescription")
    .notEmpty().withMessage("Please enter long description"),

], async (req, res)=> {

  const errors = validationResult(req)

        if(errors.isEmpty()){ // if no error
          let image= req.files.image;
                image.mv(path.resolve(__dirname,'public/img/storeImages',image.name),
                async (error)=>{
                await Product.create({
                  ...req.body,
                  finalprice: ((req.body.originalprice)-((req.body.originalprice)*req.body.discountpercent/100)),
                  image:'/img/storeImages/'+ image.name
                })
              req.flash('success','Product Successfully Added')
               res.redirect('/usershop')
        
              })
        }
        if(!errors.isEmpty()) { 
            const alert = errors.array()
            req.flash('data',req.body) //so that the entered data in form wont disappear after page is refreshed
            req.flash('validationErrors', alert)
            res.redirect('/admin/addproductspage')
        }
})


//ORGANIZER ADD Event

app.post('/add/event',authMiddleware,

urlencodedParser, [


check("title")
.notEmpty().withMessage("Please enter event title"),

check("vehicletype")
.notEmpty().withMessage("Please select vehicle type for race"),

check("racedistance")
.notEmpty().withMessage("Please enter distance for race"),

check("location")
.notEmpty().withMessage("Please enter location for race"),

// check("time")
// .notEmpty().withMessage("Please enter race starting time "),

check("noofracers")
.notEmpty().withMessage("Please enter maximum number of racers allowed"),

check("noofviewers")
.notEmpty().withMessage("Please enter maximum number of viewers allowed"),

check('onsale')
.notEmpty().withMessage("Please enter product onSale value"),

check('originalpriceforracers')
.notEmpty().withMessage("Please enter original ticket price for racers"),

check('discountpercentforracers')
.notEmpty().withMessage("Please enter discount Percentage for racers/ if no discount enter 0"),

check('originalpriceforviewers')
.notEmpty().withMessage("Please enter original ticket price for viewers"),

check('discountpercentforviewers')
.notEmpty().withMessage("Please enter ticket discount Percentage for viewers/ if no discount enter 0"),

check('eventdate')
.notEmpty().withMessage("Please enter date for event"),

], async (req, res)=> {

const errors = validationResult(req)

    if(errors.isEmpty()){ // if no error
      let image= req.files.image;
            image.mv(path.resolve(__dirname,'public/img/eventImages',image.name),
            async (error)=>{
            await Event.create({
              ...req.body,
              organizer_id: userEmail,
              date_requested: new Date(),
              finalpriceforracers: ((req.body.originalpriceforracers)-((req.body.originalpriceforracers)*req.body.discountpercentforracers/100)),
              finalpriceforviewers: ((req.body.originalpriceforviewers)-((req.body.originalpriceforviewers)*req.body.discountpercentforviewers/100)),
              image:'/img/eventImages/'+ image.name
            })
          req.flash('success','Event Request sent to Admin')
          res.redirect('/userevent')
    
          })
    }
    if(!errors.isEmpty()) { 
        const alert = errors.array()
        req.flash('data',req.body) //so that the entered data in form wont disappear after page is refreshed
        req.flash('validationErrors', alert)
        res.redirect('/addeventpage')
    }
})

 //ADMIN ADD BLOG

 app.post('/add/blog',authMiddleware,

     urlencodedParser, [
 
 
     check("title")
     .notEmpty().withMessage("Please enter blog title"),
 
     check("authorname")
     .notEmpty().withMessage("Please enter Author's Name"),
 
   // check("image")
   //   .notEmpty().withMessage("Please upload product image"),
 
     check("shortdescription")
     .notEmpty().withMessage("Pleaeenter short description"),
 
     check("longdescription")
     .notEmpty().withMessage("Please enter long description"),
 
 ], async (req, res)=> {
 
   const errors = validationResult(req)
 
         if(errors.isEmpty()){ // if no error
           let image= req.files.image;
                 image.mv(path.resolve(__dirname,'public/img/blogImages',image.name),
                 async (error)=>{
                 await Blog.create({
                   ...req.body, 
                   image:'/img/blogImages/'+ image.name
                 })
               req.flash('success','Blog Successfully Added')
                res.redirect('/userBlog')
         
               })
         }
         if(!errors.isEmpty()) { 
             const alert = errors.array()
             req.flash('data',req.body) //so that the entered data in form wont disappear after page is refreshed
             req.flash('validationErrors', alert)
             res.redirect('/admin/createblog')
         }
 })


 //ADMIN UPDATE BLOG

 app.post('blogupdate/:id',authMiddleware,
 async (req, res)=> {

           let image= req.files.image;
                 image.mv(path.resolve(__dirname,'public/img/blogImages',image.name),
                 async (error)=>{
                 await Blog.findByIdAndUpdate(req.params.id,{
                   ...req.body, 
                   image:'/img/blogImages/'+ image.name
                 })
               req.flash('success','Blog Successfully Updated')
                res.redirect('/userBlog')
         
               })
      
 })

  //ADMIN UPDATE DECISION
  
  app.post('/admineventdecision/:id',authMiddleware,
  async (req, res)=> {
    var status="";
    if((req.body.status)=="Accept"){
              status="Accepted"
              req.flash('success','Event Successfully Accepted')
    }

    else if((req.body.status)=="Decline"){
            status="Declined"
            req.flash('success','Event Declined')
    }
  
    await Event.findByIdAndUpdate(req.params.id,{
     event_status: status,
     date_accepted: new Date(),
     admin_comment: req.body.comment
    })

   res.redirect('/eventrequests')
    
       
  })

//User Update Profile Details
   
  app.post('/updateprofile',authMiddleware,
  urlencodedParser, [
 
 
    check("name")
    .notEmpty().withMessage("Name cannot be empty"),

    check("email")
    .notEmpty().withMessage(" Email cannot be empty")
    .isEmail().withMessage("Please enter a valid Email Id")
    .custom((value, {req}) => {
      return new Promise((resolve, reject) => {
        User.findOne({email:req.body.email}, function(err, user){
          if(err) {
            reject(new Error('Server Error'))
          }
          if(Boolean(user) && (req.body.email!==userEmail)) {
            reject(new Error('E-mail already Registered. Enter unused email.'))
          }
          resolve(true)
        });
      });
    }),

    
], async (req, res)=> {

  const errors = validationResult(req);

        if(errors.isEmpty()){ // if no error
          if(!(req.files && req.files.profileimage)){

             await User.findByIdAndUpdate(loggedIn,{
              ...req.body,
            })
                 
          
          req.flash('success','User Details Successfully Updated')
           res.redirect('/editProfile')


          }
      else{
        let image= req.files.profileimage;
        image.mv(path.resolve(__dirname,'public/img/profileImages',image.name),
  
        async (error)=>{
        await User.findByIdAndUpdate(loggedIn,{
          ...req.body, 
          profileimage:'/img/profileImages/'+ image.name
        })
       
      
       req.flash('success','User Details Successfully Updated')
       res.redirect('/editProfile')
      
      })
    }}
        if(!errors.isEmpty()) { 
            const alert = errors.array()
            req.flash('validationErrors', alert)
            res.redirect('/editProfile')
        }
})



app.post('/updatepassword',authMiddleware,
  urlencodedParser, [
 
    check("oldpassword")
    .notEmpty().withMessage("Old Password field cannot be empty")
    .custom((value, {req}) => {
      return new Promise((resolve, reject) => {
        User.findOne({_id:loggedIn}, function(err, user){
          if(err) {
            reject(new Error('Server Error'))
          }
          if(!(user)) {
            reject(new Error('User does not Exist. Please Register First'))
          }
          if((user)) {
             
            bcrypt.compare(req.body.oldpassword, user.password, (error, same)=>{
   
                                if(same){  //if passwords dont  match

                                    // req.session.userType= user.usertype
                                    // req.session.userId= user._id
                                    // req.session.userEmail= user.email
                                    // req.session.userName= user.name
                                    // req.session.profileImage= user.profileimage
                                    
                                    console.log("Old Passwords correct")
                                   

                                }
                                else{
                                    reject(new Error('Old password is incorrect'))
                                    console.log("Old Password incorrect")
                                }
                                resolve(true)
                            })}
        
        });
      
      });
     
    }),

    check("newpassword")
    .notEmpty().withMessage("Password cannot be empty")
    .isLength({ min: 8 }).withMessage('Password Must Be at Least 8 Characters')
    .matches('[0-9]').withMessage('Password Must Contain a Number')
    .matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter').trim().escape(),

    
],  async (req, res)=> {
  const errors = validationResult(req)
  if(errors.isEmpty()){
    await User.findOneAndUpdate({_id: loggedIn},{
     password: req.body.newpassword
     
    })
    console.log("Password Updated")
    req.flash('success','Password Successfully Updated')
    res.redirect('/editProfile')
    
 }
  
      
  
  if(!errors.isEmpty()) { 
    
      const allerrors = errors.array()
      req.flash('data',req.body) //so that the entered data in form wont disappear after page is refreshed
      req.flash('validationErrors', allerrors)
      res.redirect('/editProfile')

  }})

  //Post User Review

  app.post('/postreview',authMiddleware,
urlencodedParser, [
    //Review Form Validation
        
        check("review")
        .notEmpty().withMessage("Please write a review first"),

        check("rating")
        .notEmpty().withMessage("Please select a rating"),
    
    
    ], (req, res)=> {
        const errors = validationResult(req);
        
        if(errors.isEmpty()){
          Review.create({
            ...req.body,
            name: userName,
          profileimage: profileImage},
            (error,review)=> {
            if(error){
              //req.flash('error','Server Error')
              res.redirect('/userreviews')
             
            }
            req.flash('success','Your feedback has been posted!')
            res.redirect('/userreviews')
        })
            
        }
        if(!errors.isEmpty()) { 
          
            const alert = errors.array()
            //req.flash('data',req.body) //so that the entered data in form wont disappear after page is refreshed
            req.flash('validationErrors', alert)
            res.redirect('/userreviews')

        }})

//filter vechiletype

      app.post('/filterby',authMiddleware,
      async (req, res)=> {
        
        const events= await Event.find({
        "vehicletype" : req.body.vehicletype
  })
  console.log("Filter Results: "+events);   

  res.render('userEventPage',{
      messages:req.flash(),
      events
  });
})

//filter vechiletype

app.post('/searchby',authMiddleware,
async (req, res)=> {
  
  const events= await Event.find({
  title : {$regex:req.body.search, $options:"i"}
})
console.log("Search Results: "+events);   

res.render('userEventPage',{
messages:req.flash(),
events
});
})


  //Post Message

  app.post('/sendmessage',authMiddleware,
urlencodedParser, [
    //Form Validation
        
        check("message")
        .notEmpty().withMessage("Please write a message"),
  
    
    ], (req, res)=> {
        const errors = validationResult(req);
        
        if(errors.isEmpty()){
          Message.create({
            ...req.body,
            email: userEmail,
            username: userName,
            profileimage: profileImage
},
            (error,message)=> {
            if(error){
              
              res.redirect('/usercontact')
             
            }
            req.flash('success','Your message has been sent!')
            res.redirect('/usercontact')
        })
            
        }
        if(!errors.isEmpty()) { 
          
            const alert = errors.array()
            //req.flash('data',req.body) //so that the entered data in form wont disappear after page is refreshed
            req.flash('validationErrors', alert)
            res.redirect('/usercontact')

        }})


        //Book Event
        app.post('/bookevent/:id',authMiddleware,

        urlencodedParser, [
    
    
        check("foodpackage")
        .notEmpty().withMessage("Please enter the food package option"),
    
        check("tickettype")
        .notEmpty().withMessage("Please enter ticket type to purchase"),
    
        check("quantity")
        .notEmpty().withMessage("Please enter ticket quantity"),
    
    ], async (req, res)=> {
    
      const errors = validationResult(req)
    
            if(errors.isEmpty()){ // if no error
             
                    await Booking.create({
                      ...req.body, 
                      event_id: req.params.id,
                      email: userEmail,
                      username: userName,
                    })
                  req.flash('success','Ticket Successfully Booked! Check in MyTickets')
                   res.redirect('/userevent')
            
            }
            
            if(!errors.isEmpty()) { 
                const alert = errors.array()
                req.flash('data',req.body) //so that the entered data in form wont disappear after page is refreshed
                req.flash('validationErrors', alert)
                res.redirect('/userevent/detail/'+req.params.id)
            }
    })


    app.post('/checkout',authMiddleware,
  (req, res)=> {
    
    var cart= new Cart(req.session.cart);

      var order= new Order({
        user:loggedIn,
        cart:cart,
        address: req.body.address,
        name:req.body.name
      });
      order.save(function(err,result){
        req.flash('success','Product Successfully Bought!');
        req.session.cart=null;
        res.redirect('/usershop');
      })
    
          
            
    })
         


//General Routes
app.get('/', landingPageController)

app.get('/login',redirectIfAuthenticatedMiddleware, loginPageController)

app.get('/register',redirectIfAuthenticatedMiddleware, registerPageController)

app.get('/passwordResetPage1',redirectIfAuthenticatedMiddleware, passwordResetPage1Controller)

app.get('/passwordResetPage2',redirectIfAuthenticatedMiddleware, 
async(req,res)=>{
    const Users= await User.findOne({email: validationEmail});
    console.log("Users object: "+Users);
    res.render('forgotpwdPage2',{Users:Users, errors:req.flash('validationErrors')});
})

app.get('/passwordResetPage',redirectIfAuthenticatedMiddleware, 
async(req,res)=>{
    //const Users= await User.findOne({email: validationEmail});
   // console.log("Users object: "+Users);
    res.render('passwordResetPage',{errors:req.flash('validationErrors')});
})

app.get('/passwordResetPage',redirectIfAuthenticatedMiddleware, 
async(req,res)=>{
    //const Users= await User.findOne({email: validationEmail});
   // console.log("Users object: "+Users);
    res.render('passwordResetPage',{errors:req.flash('validationErrors')});
})



app.get('/add-to-cart/:id', authMiddleware, addToCartController)

app.get('/cart', authMiddleware, cartPageController)

app.get('/checkoutpage', authMiddleware, checkoutPageController)

app.get('/myorders', authMiddleware, myOrdersPageController)


app.get('/mytickets',authMiddleware, userTicketsPageController)

app.get('/logout', logoutController)



//Admin ROUTES

// app.get('/adminhome',authMiddleware, adminHomePageController)
app.get('/admin/blog', adminBlogPageController)

app.get('/admin/createblog', adminCreateBlogPageController)

app.get('/admin/addproductspage', authMiddleware, adminAddProductPageController)

app.get('/addeventpage', authMiddleware, organizerAddEventPageController)

app.get('/eventrequests', authMiddleware, EventRequestsPageController)


// app.get('/admin/event', authMiddleware, adminEventPageController)


//Organizer ROUTES


app.get('/myEventRequests', authMiddleware, organizerEventRequestsPageController)
// app.get('/organizerhome',authMiddleware, organizerHomePageController)

//User ROUTES

app.get('/userhome',authMiddleware, userHomePageController)

app.get('/userevent', authMiddleware, userEventPageController)

app.get('/onsale', authMiddleware, onsaleUserEventPageController)

app.get('/userevent/detail/:id', authMiddleware, userEventDetailPageController)

app.get('/usershop', authMiddleware, userShopPageController)

// app.get('/usershop/detail/:id', authMiddleware, userShopDetailPageController)

app.get('/product/delete/:id', authMiddleware, userProductDeleteController)

app.get('/usercontact', authMiddleware, userContactPageController)

app.get('/userblog', authMiddleware, userBlogPageController)

app.get('/blog/delete/:id', authMiddleware, userBlogDeleteController)

app.get('/userblog/detail/:id', authMiddleware, userBlogDetailPageController)

app.get('/userreviews', userReviewsPageController)

app.get('/editProfile', authMiddleware, profileEditPageController)

app.get('/allmessages',authMiddleware, adminMessagesPageController)

app.use((req,res) => res.render('notFound')); //for undefind route