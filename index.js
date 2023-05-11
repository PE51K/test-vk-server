import express from "express"
import mongoose from "mongoose"
import multer from "multer";
import cors from "cors";
import { registerValidation, loginValidation, postCreateValidation } from "./validations/index.js";
import { handleValidationErrors, checkAuth } from "./utils/index.js";
import { UserController, PostController } from "./controllers/index.js"

mongoose
    .connect('mongodb+srv://admin:tykay276B@test-vk-db.jtlybb3.mongodb.net/?retryWrites=true&w=majority')
    .then(() => console.log('DB OK'))
    .catch((err) => console.log('DB error', err))

const app = express()

const corsOptions = {
    "origin": "*"
};

app.use(cors(corsOptions));
app.use('/uploads', express.static('uploads'))
app.use(express.json())

const storage = multer.diskStorage({
    "destination": (_, __, cb) => {
        cb(null, 'uploads')
    },
    "filename": (_, file, cb) => {
        cb(null, file.originalname)
    },
})

const upload = multer({ storage })

app.get('/auth/me', checkAuth, UserController.getMe)
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login)
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`,
    })
})

app.get('/posts', PostController.getAll)
app.get('/posts/:id', PostController.getOne)
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create)
app.delete('/posts/:id', checkAuth, PostController.remove)
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update)
app.post('/posts/:id/like', checkAuth, PostController.likePost)
app.delete('/posts/:id/like', checkAuth, PostController.unlikePost)
app.get('/users/:userId/posts', PostController.getPostsByUser)

app.get('/users', UserController.getUsers)
app.post('/users/:id/friends', checkAuth, UserController.addFriend);
app.delete('/users/:id/friends', checkAuth, UserController.removeFriend);
app.get('/users/:id', UserController.getUserById);

app.get('/friends/posts', checkAuth, PostController.getFriendsPosts);

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
    if (err) {
        return console.log(err)
    }
    console.log('Server OK')
});
