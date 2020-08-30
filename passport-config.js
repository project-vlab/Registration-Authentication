const { authenticate } = require('passport');

// requiring local strategy and bcrypt
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt');

function initialize(passport, getUserByEmail, getUserById){
    const authenticate = async (email, password, done) => {
        // sending the email to check if the user exists
        const user = getUserByEmail(email);
        if (user == null) {
            return done(null, false, { message: "No user found"});

        } 
        // if the user is found
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else { return done(null, false, { message: "Password incorrect." }); }

        } catch(e) {
            return done(e)
        }

    }
    passport.use( new LocalStrategy({usernameField: "email"}, authenticate));
    
    // to serialize and deserialize user
    passport.serializeUser( (user, done) => done(null, user.id));
    passport.deserializeUser( (id, done) => {
        return done(null, getUserById(id))
    })
}
//exporting this module
module.exports = initialize;