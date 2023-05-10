import PostSchema from "../models/Post.js";
import UserSchema from "../models/User.js";

export const getAll = async (req, res) => {
    try {
        const posts = await PostSchema.find().populate('user').exec()
        res.json(posts);
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статьи',
        })
    }
}

export const getOne = async (req, res) => {
    try {
        const postId = req.params.id

        const doc = await PostSchema.findOneAndUpdate({
                _id: postId,
            }, {
                $inc: { viewsCount: 1 },
            }, {
                returnDocument: 'after',
            }).populate('user')

        if (!doc) {
                return res.status(404).json({
                    message: 'Статья не найдена',
                })
            }

        res.json(doc)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статью',
        })
    }
}

export const create = async (req, res) => {
    try {
        const doc = new PostSchema({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            user: req.userId,
        })

        const post = await doc.save()
        res.json(post)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось создать статью',
        })
    }
}

export const remove = async (req, res) => {
    try {
        const postId = req.params.id

        const doc = await PostSchema.findOneAndDelete({
                _id: postId,
            })

        if (!doc) {
                return res.status(404).json({
                    message: 'Статья не найдена',
                })
            }

        res.json({
            success: true,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось удалить статью',
        })
    }
}

export const update = async (req, res) => {
    try {
        const postId = req.params.id

        const doc = await PostSchema.updateOne({
                _id: postId,
            }, {
                title: req.body.title,
                text: req.body.text,
                imageUrl: req.body.imageUrl,
                user: req.userId,
        })

        if (!doc) {
                return res.status(404).json({
                    message: 'Статья не найдена',
                })
            }

        res.json({
            success: true,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось обновить статью',
        })
    }
}

export const likePost = async (req, res) => {
    try {
        const postId = req.params.id
        const userId = req.userId

        const doc = await PostSchema.findOne({
            _id: postId,
            likes: userId,
        })

        if (doc) {
            return res.status(400).json({
                message: 'Вы уже лайкнули эту статью',
            })
        }

        const updatedDoc = await PostSchema.findOneAndUpdate({
            _id: postId,
        }, {
            $push: { likes: userId },
        }, {
            new: true,
        }).populate('user').populate('likes')

        if (!updatedDoc) {
            return res.status(404).json({
                message: 'Статья не найдена',
            })
        }

        res.json(updatedDoc)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось лайкнуть статью',
        })
    }
}

export const unlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId;

        const doc = await PostSchema.findByIdAndUpdate(postId, {
            $pull: { likes: userId },
        });

        if (!doc) {
            return res.status(404).json({
                message: 'Статья не найдена',
            })
        }

        res.json(doc)
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось удалить лайк',
        });
    }
}

export const getPostsByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const posts = await PostSchema.find({ user: userId }).populate('user').exec();
        res.json(posts);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статьи пользователя',
        })
    }
}

export const getFriendsPosts = async (req, res) => {
    try {
        const user = req.userId;
        const currentUser = await UserSchema.findById(user);
        const friends = currentUser.friends;

        const posts = await PostSchema.find({
            user: { $in: friends }
        }).populate('user').exec();

        res.json(posts);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статьи друзей',
        });
    }
}