import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import prisma from "./prisma";

// Admin için özel auth konfigürasyonu
export const adminAuthOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "AdminCredentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                // Admin email kontrolü
                const adminEmails = (process.env.ADMIN_EMAILS || '')
                    .split(',')
                    .map(email => email.trim().toLowerCase())
                    .filter(Boolean);

                if (!adminEmails.includes(credentials.email.toLowerCase())) {
                    return null;
                }

                // Admin kullanıcısını bul
                const user = await prisma.user.findUnique({ 
                    where: { email: credentials.email } 
                });

                if (user && user.password) {
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password, 
                        user.password
                    );
                    
                    if (isPasswordValid) {
                        const name = (user.firstName && user.lastName) 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.email;
                        return { ...user, name, role: 'admin' };
                    }
                }
                return null;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/grbt-8/giris',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = 'admin';
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        }
    }
};
