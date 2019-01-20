const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.checkingUser = (email, phone) => {
    return new Promise(async(resolve, reject) => {
        try{
            //Get user by email
            const userByEmail = await User.find({email : email});
            const userByPhone = await User.find({phone : phone});
            
            if(userByEmail.length == 0 || userByPhone.length == 0){
                resolve(true);
            }
            else{
                reject("User already registered");
            }
        }catch(err){
            reject("User already registered");
        }
    });
};