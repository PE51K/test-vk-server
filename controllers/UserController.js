import bcrypt from "bcrypt";
import UserSchema from "../models/User.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const password = req.body.password
        const salt = await bcrypt.genSalt()
        const hash = await bcrypt.hash(password, salt)

        const doc = new UserSchema({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            cityName: req.body.cityName,
            age: req.body.age,
            passwordHash: hash,
        })

        const user = await doc.save()
        const token = jwt.sign({
            _id: user._id
            },
            'secret123',
            {
                expiresIn: '30d',
            },
        )

        const {_doc} = user;
        const {passwordHash, ...userData} = _doc

        res.json({
            ...userData,
            token,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось зарегистрироваться',
        })
    }
}

export const login = async (req, res) => {
    try {
        const user = await UserSchema.findOne({
            email: req.body.email,
        })

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            })
        }

        const {_doc} = user;
        const {passwordHash, ...userData} = _doc
        const isValidPass = await  bcrypt.compare(req.body.password, passwordHash)

        if (!isValidPass) {
            return res.status(400).json({
                message: 'Неверный логин или пароль',
            })
        }

        const token = jwt.sign({
                _id: user._id
            },
            'secret123',
            {
                expiresIn: '30d',
            },
        )

        res.json({
            ...userData,
            token,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось авторизоваться',
        })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await UserSchema.findById(req.userId)

        if (!user) {
            res.status(404).json({
                message: 'Пользователь не найден'
            })
        } else {
            const {_doc} = user;
            const {passwordHash, ...userData} = _doc
            res.json(userData)
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Нет доступа'
        })
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await UserSchema.find({ _id: { $ne: req.userId } })
            .select('_id fullName avatarUrl cityName age');

        res.json(users);
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить список пользователей',
        })
    }
}

export const addFriend = async (req, res) => {
    try {
        const user = await UserSchema.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        if (user.friends.includes(req.userId)) {
            return res.status(400).json({
                message: 'Вы уже отправили запрос на добавление в друзья',
            });
        }

        await user.updateOne({
            $push: { friends: req.userId },
        });

        const currentUser = await UserSchema.findById(req.userId);

        await currentUser.updateOne({
            $push: { friends: user._id },
        });

        res.json({
            message: 'Запрос на добавление в друзья отправлен',
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось отправить запрос на добавление в друзья',
        });
    }
};

export const removeFriend = async (req, res) => {
    try {
        const user = await UserSchema.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        if (!user.friends.includes(req.userId)) {
            return res.status(400).json({
                message: 'Пользователь не добавлен в друзья',
            });
        }

        await user.updateOne({
            $pull: { friends: req.userId },
        });

        const currentUser = await UserSchema.findById(req.userId);

        await currentUser.updateOne({
            $pull: { friends: user._id },
        });

        res.json({
            message: 'Пользователь удален из друзей',
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось удалить пользователя из друзей',
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await UserSchema.findById(req.params.id)
            .select('fullName age avatarUrl cityName friends');

        if (!user) {
            res.status(404).json({
                message: 'Пользователь не найден'
            });
        } else {
            res.json(user);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить пользователя'
        });
    }
};