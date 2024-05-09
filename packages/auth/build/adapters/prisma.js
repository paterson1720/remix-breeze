import crypto from "crypto";
import bcrypt from "bcryptjs";
function comparePasswordToHashedPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}
function hashUserPassword(password) {
    return bcrypt.hash(password, 10);
}
export function PrismaAdapter(client) {
    const prisma = client;
    function validateEmail(email) {
        // simple email validation - must contain @ and a dot
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function validatePassword(password) {
        // must contain letters and numbers and be at least 6 characters long
        return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password);
    }
    return {
        async loginUser({ email, password }) {
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            });
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
            const isValidPassword = await comparePasswordToHashedPassword(password, hashedPassword);
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
                user: {
                    id: user.id,
                    avatar: user.avatar,
                    fullName: user.fullName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    roles: user.roles.map((item) => item.role.name),
                },
                error: null,
            };
        },
        async registerUser(request) {
            const formData = await request.formData();
            const formEntries = Object.fromEntries(formData.entries());
            const userData = {
                firstName: String(formEntries.firstName || ""),
                lastName: String(formEntries.lastName || ""),
                email: String(formEntries.email || ""),
                password: String(formEntries.password || ""),
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
            if (!validateEmail(userData.email)) {
                return {
                    user: null,
                    error: {
                        message: "Invalid email address",
                        code: "invalid_email",
                    },
                };
            }
            if (!validatePassword(userData.password)) {
                return {
                    user: null,
                    error: {
                        message: "Password must contain letters and numbers and be at least 6 characters long",
                        code: "invalid_password",
                    },
                };
            }
            const normalizedEmail = userData.email.trim().toLowerCase();
            const userExists = await prisma.user.findUnique({
                where: { email: normalizedEmail },
            });
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
            const user = await await prisma.user.create({
                data: {
                    email: normalizedEmail,
                    password: hashedPassword,
                    fullName: `${userData.firstName} ${userData.lastName}`,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    roles: {
                        create: {
                            role: {
                                connect: {
                                    name: "user",
                                },
                            },
                        },
                    },
                },
                include: {
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            });
            return {
                error: null,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailVerified: user.emailVerified,
                    avatar: user.avatar,
                    roles: user.roles.map((item) => item.role.name),
                },
            };
        },
        async getUserByEmail(email) {
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            });
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
                    id: user.id,
                    avatar: user.avatar,
                    email: user.email,
                    fullName: user.fullName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailVerified: user.emailVerified,
                    roles: user.roles.map((item) => item.role.name),
                },
            };
        },
        async resetUserPassword({ token, newPassword }) {
            const hashedPassword = await hashUserPassword(newPassword);
            const validation = await this.validatePasswordResetToken(token);
            if (validation.error) {
                return {
                    error: validation.error,
                    user: null,
                };
            }
            if (!validatePassword(newPassword)) {
                return {
                    user: null,
                    error: {
                        message: "Password must contain letters and numbers and be at least 6 characters long",
                        code: "invalid_password",
                    },
                };
            }
            const verificationRequest = validation.tokenData;
            const user = await prisma.user.update({
                where: { email: verificationRequest.identifier },
                data: {
                    password: hashedPassword,
                },
                include: {
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            });
            return {
                error: null,
                user: {
                    id: user.id,
                    avatar: user.avatar,
                    email: user.email,
                    fullName: user.fullName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailVerified: user.emailVerified,
                    roles: user.roles.map((item) => item.role.name),
                },
            };
        },
        async generatePasswordResetToken(email, options) {
            const token = crypto.randomBytes(32).toString("hex");
            const existingRequest = await prisma.verificationRequest.findFirst({
                where: {
                    identifier: email,
                    type: "password_reset",
                },
            });
            if (existingRequest) {
                await prisma.verificationRequest.delete({
                    where: {
                        id: existingRequest.id,
                    },
                });
            }
            await prisma.verificationRequest.create({
                data: {
                    token,
                    identifier: email,
                    type: "password_reset",
                    expires: new Date(Date.now() + options.expiresAfterMinutes * 60 * 1000),
                },
            });
            return {
                error: null,
                token,
            };
        },
        async validatePasswordResetToken(token) {
            const verificationRequest = await prisma.verificationRequest.findFirst({
                where: {
                    token,
                    type: "password_reset",
                },
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
                await prisma.verificationRequest.delete({
                    where: {
                        id: verificationRequest.id,
                    },
                });
                return {
                    tokenData: null,
                    error: {
                        message: "Invalid or expired token",
                        code: "token_expired",
                    },
                };
            }
            return { error: null, tokenData: verificationRequest };
        },
        async deletePasswordResetToken(token) {
            const verificationRequest = await prisma.verificationRequest.findFirst({
                where: {
                    token,
                    type: "password_reset",
                },
            });
            if (!verificationRequest) {
                return {
                    error: {
                        message: "Token not found",
                        code: "token_not_found",
                    },
                };
            }
            await prisma.verificationRequest.delete({
                where: {
                    id: verificationRequest.id,
                },
            });
            return { error: null };
        },
    };
}