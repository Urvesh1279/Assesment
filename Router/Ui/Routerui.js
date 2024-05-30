const libexpress = require("express");
const router = libexpress.Router();
const libJWT = require('jsonwebtoken');

router.get("/", (req, res) => {
    res.render("index");
});
router.get("/login", (req, res, next) => {
    if (req.cookies.token) {
        libJWT.verify(req.cookies.token, process.env.SECRET_KEY)
        next()
    } else {
        res.render("login")
    }

}, (req, res) => {
    res.render("Dashboard");
});

router.post("/login", (req, res) => {

    if (req.body.email === "patelurvesh@gmail.com" && req.body.password === "Patel@9694") {

        const token = libJWT.sign({ user_email: "patelurvesh@gmail.com" }, process.env.SECRET_KEY, { expiresIn: '1h' }, (error, token) => {

            res.cookie('token', token, { maxAge: 900000, httpOnly: true });
            res.redirect("Dashboard")
        });
    } else {
        res.render("login", { error: "Invalid Credential" })
    }
});

router.post("/dashboard", (req, res, next) => {

    if (req.body.hasOwnProperty("add_to_cart")) {
        req.session.cart = req.session.cart + 1
        res.render("Dashboard", { cart: req.session.cart });
    }
    else {
        req.session.destroy()
        res.clearCookie("token")
        res.redirect("/login")
    }

})
router.get("/dashboard", async (req, res, next) => {
    try {
        if (req.cookies.token) {
            await libJWT.verify(req.cookies.token, process.env.SECRET_KEY);
            next();
        } else {
            res.clearCookie('token');
            res.redirect("login");
        }
    } catch (error) {
        
        console.error("JWT verification failed:", error);
        res.clearCookie('token');
        res.redirect("login");
    }
}, (req, res, next) => {

    if (!req.session.cart) {
        req.session.cart = 0
    }
    next()


}, (req, res) => {
    res.render("Dashboard", { cart: req.session.cart });
});


router.get("/signup", (req, res) => {
    res.render("signup");
});

module.exports = router;
