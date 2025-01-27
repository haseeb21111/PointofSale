import User from "../models/userModel.js";


//for login
export const loginController = async (req, res) => {
    try {

        const {userId, password} = req.body;
        const user = await User.findOne({userId, password});
        if(user) {
            res.status(200).send(user);
        } else {
            res.json({
                message: "Login Fail",
                user,
            });
        }

    } catch(error) {
        console.log(error);
    }
}