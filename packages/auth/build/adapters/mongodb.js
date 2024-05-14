"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBAdapter = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongodb_1 = require("mongodb");
function MongoDBAdapter(getClient) {
    async function db() {
        const client = await getClient();
        const db = client.db();
        return {
            User: db.collection("users"),
            Verification: db.collection("verifications"),
        };
    }
    async function hashUserPassword(password) {
        return bcryptjs_1.default.hash(password, 10);
    }
    async function comparePasswordToHashedPassword(password, hashedPassword) {
        return bcryptjs_1.default.compare(password, hashedPassword);
    }
    function validateEmail(email) {
        // simple email validation - must contain @ and a dot
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function validatePassword(password) {
        // must contain letters and numbers and be at least 6 characters long, but not limited to only numbers and letters
        // Example Password@123 or 123Password.com are valid but 123456 is not, can contain any special character
        return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{6,}$/.test(password);
    }
    async function registerUser(request) {
        const formData = await request.formData();
        const formEntries = Object.fromEntries(formData.entries());
        const userData = {
            firstName: formEntries.firstName,
            lastName: formEntries.lastName,
            email: formEntries.email,
            password: formEntries.password,
        };
        for (const [key, value] of Object.entries(userData)) {
            if (!value.trim()) {
                return {
                    user: null,
                    error: {
                        message: `${key} is required`,
                        code: `${key}_required`,
                    },
                };
            }
        }
        const isValidEmail = validateEmail(userData.email);
        if (!isValidEmail) {
            return {
                user: null,
                error: {
                    message: "Invalid email address",
                    code: "invalid_email",
                },
            };
        }
        const isValidPassword = validatePassword(userData.password);
        if (!isValidPassword) {
            return {
                user: null,
                error: {
                    message: "Password must contain at least one letter and one number",
                    code: "invalid_password_format",
                },
            };
        }
        const { User } = await db();
        const normalizedEmail = userData.email.trim().toLowerCase();
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return {
                user: null,
                error: {
                    message: "A user with this email already exists",
                    code: "user_already_exists",
                },
            };
        }
        const hashedPassword = await hashUserPassword(userData.password);
        const user = await User.insertOne({
            email: normalizedEmail,
            password: hashedPassword,
            fullName: `${userData.firstName} ${userData.lastName}`,
            firstName: userData.firstName,
            lastName: userData.lastName,
            createdAt: new Date(),
            updatedAt: new Date(),
            avatar: "",
            emailVerified: false,
            roles: ["user"],
        });
        return {
            error: null,
            user: {
                id: user.insertedId.toHexString(),
                email: userData.email,
                fullName: `${userData.firstName} ${userData.lastName}`,
                firstName: userData.firstName,
                lastName: userData.lastName,
                emailVerified: false,
                avatar: null,
                roles: ["user"],
            },
        };
    }
    async function loginUser(credentials) {
        const { User } = await db();
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
            return {
                user: null,
                error: {
                    message: "Invalid credentials",
                    code: "invalid_credentials",
                },
            };
        }
        const hashedPassword = user.password;
        const isValidPassword = await comparePasswordToHashedPassword(credentials.password, hashedPassword);
        if (!isValidPassword) {
            return {
                user: null,
                error: {
                    message: "Invalid credentials",
                    code: "invalid_credentials",
                },
            };
        }
        return {
            error: null,
            user: {
                id: user._id.toHexString(),
                avatar: user.avatar,
                email: user.email,
                fullName: user.fullName,
                firstName: user.firstName,
                lastName: user.lastName,
                emailVerified: user.emailVerified,
                roles: user.roles,
            },
        };
    }
    async function getUserByEmail(email) {
        const { User } = await db();
        const user = await User.findOne({ email });
        if (!user) {
            return {
                user: null,
                error: {
                    message: "User not found",
                    code: "user_not_found",
                },
            };
        }
        return {
            error: null,
            user: {
                id: user._id.toHexString(),
                avatar: user.avatar,
                email: user.email,
                fullName: user.fullName,
                firstName: user.firstName,
                lastName: user.lastName,
                emailVerified: user.emailVerified,
                roles: user.roles,
            },
        };
    }
    async function generatePasswordResetToken(email, options) {
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const { Verification } = await db();
        const existingRequest = await Verification.findOne({
            identifier: email,
            type: "password_reset",
        });
        if (existingRequest) {
            await Verification.deleteOne({ _id: existingRequest._id });
        }
        await Verification.insertOne({
            token,
            identifier: email,
            type: "password_reset",
            expires: new Date(Date.now() + options.expiresAfterMinutes * 60 * 1000),
        });
        return { error: null, token };
    }
    async function validatePasswordResetToken(token) {
        const { Verification } = await db();
        const verificationRequest = await Verification.findOne({
            token,
            type: "password_reset",
        });
        if (!verificationRequest) {
            return {
                tokenData: null,
                error: {
                    message: "Invalid or expired token",
                    code: "invalid_token",
                },
            };
        }
        const isExpired = verificationRequest.expires < new Date();
        if (isExpired) {
            await Verification.deleteOne({ _id: verificationRequest._id });
            return {
                tokenData: null,
                error: {
                    message: "Invalid or expired token",
                    code: "token_expired",
                },
            };
        }
        return {
            error: null,
            tokenData: {
                token: verificationRequest.token,
                identifier: verificationRequest.identifier,
                type: verificationRequest.type,
                expires: verificationRequest.expires,
            },
        };
    }
    async function resetUserPassword({ token, newPassword }) {
        const hashedPassword = await hashUserPassword(newPassword);
        const { User } = await db();
        const validation = await validatePasswordResetToken(token);
        if (validation.error) {
            return {
                user: null,
                error: validation.error,
            };
        }
        const verificationRequest = validation.tokenData;
        const user = await User.findOneAndUpdate({ email: verificationRequest.identifier }, { $set: { password: hashedPassword } }, { returnDocument: "after" });
        if (!user) {
            return {
                user: null,
                error: {
                    message: "User not found",
                    code: "user_not_found",
                },
            };
        }
        return {
            error: null,
            user: {
                id: user._id.toHexString(),
                avatar: user.avatar,
                email: user.email,
                fullName: user.fullName,
                firstName: user.firstName,
                lastName: user.lastName,
                emailVerified: user.emailVerified,
                roles: user.roles,
            },
        };
    }
    async function changeUserPassword({ userId, currentPassword, newPassword, }) {
        const { User } = await db();
        const user = await User.findOne({ _id: new mongodb_1.ObjectId(userId) });
        if (!user) {
            return {
                user: null,
                error: {
                    message: "User not found",
                    code: "user_not_found",
                },
            };
        }
        const isValidPassword = await comparePasswordToHashedPassword(currentPassword, user.password);
        if (!isValidPassword) {
            return {
                user: null,
                error: {
                    message: "Invalid current password",
                    code: "invalid_current_password",
                },
            };
        }
        const hashedPassword = await hashUserPassword(newPassword);
        const updatedUser = await User.findOneAndUpdate({ _id: new mongodb_1.ObjectId(user._id) }, { $set: { password: hashedPassword } }, { returnDocument: "after" });
        if (!updatedUser) {
            return {
                user: null,
                error: {
                    message: "User not found",
                    code: "user_not_found",
                },
            };
        }
        return {
            error: null,
            user: {
                id: updatedUser._id.toHexString(),
                avatar: updatedUser.avatar,
                email: updatedUser.email,
                fullName: updatedUser.fullName,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                emailVerified: updatedUser.emailVerified,
                roles: updatedUser.roles,
            },
        };
    }
    async function deletePasswordResetToken(token) {
        const { Verification } = await db();
        const verificationRequest = await Verification.findOne({ token, type: "password_reset" });
        if (!verificationRequest) {
            return {
                error: {
                    message: "Token not found",
                    code: "token_not_found",
                },
            };
        }
        await Verification.deleteOne({ _id: verificationRequest._id });
        return { error: null };
    }
    return {
        loginUser,
        registerUser,
        getUserByEmail,
        resetUserPassword,
        changeUserPassword,
        deletePasswordResetToken,
        generatePasswordResetToken,
        validatePasswordResetToken,
    };
}
exports.MongoDBAdapter = MongoDBAdapter;
