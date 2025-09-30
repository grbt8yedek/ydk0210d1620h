import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from 'bcryptjs';
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import { User } from "@prisma/client";
import { Adapter } from "next-auth/adapters";

declare module "next-auth" {
    interface Session {
      user: DefaultSession["user"] & {
        id: string;
        phone?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        countryCode?: string | null;
        birthDay?: string | null;
        birthMonth?: string | null;
        birthYear?: string | null;
        gender?: string | null;
        identityNumber?: string | null;
        isForeigner?: boolean | null;
      };
    }
  }

declare module "next-auth/jwt" {
    interface JWT {
      id: string;
      phone?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      countryCode?: string | null;
      birthDay?: string | null;
      birthMonth?: string | null;
      birthYear?: string | null;
      gender?: string | null;
      identityNumber?: string | null;
      isForeigner?: boolean | null;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                // Giriş yaparken tüm bilgileri ekle
                token.id = user.id;
                token.phone = (user as User).phone;
                token.firstName = (user as User).firstName;
                token.lastName = (user as User).lastName;
                token.countryCode = (user as User).countryCode;
                token.birthDay = (user as User).birthDay;
                token.birthMonth = (user as User).birthMonth;
                token.birthYear = (user as User).birthYear;
                token.gender = (user as User).gender;
                token.identityNumber = (user as User).identityNumber;
                token.isForeigner = (user as User).isForeigner;
            } else if (trigger === 'update' && token.id) {
                // Session güncellendiğinde veritabanından güncel bilgileri çek
                const updatedUser = await prisma.user.findUnique({
                    where: { id: token.id },
                    select: {
                        phone: true,
                        firstName: true,
                        lastName: true,
                        countryCode: true,
                        birthDay: true,
                        birthMonth: true,
                        birthYear: true,
                        gender: true,
                        identityNumber: true,
                        isForeigner: true,
                    }
                });
                
                if (updatedUser) {
                    token.phone = updatedUser.phone;
                    token.firstName = updatedUser.firstName;
                    token.lastName = updatedUser.lastName;
                    token.countryCode = updatedUser.countryCode;
                    token.birthDay = updatedUser.birthDay;
                    token.birthMonth = updatedUser.birthMonth;
                    token.birthYear = updatedUser.birthYear;
                    token.gender = updatedUser.gender;
                    token.identityNumber = updatedUser.identityNumber;
                    token.isForeigner = updatedUser.isForeigner;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.phone = token.phone;
                session.user.firstName = token.firstName;
                session.user.lastName = token.lastName;
                session.user.countryCode = token.countryCode;
                session.user.birthDay = token.birthDay;
                session.user.birthMonth = token.birthMonth;
                session.user.birthYear = token.birthYear;
                session.user.gender = token.gender;
                session.user.identityNumber = token.identityNumber;
                session.user.isForeigner = token.isForeigner;
            }
            return session;
        }
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "email,public_profile"
                }
            }
        }),
        CredentialsProvider({
            name: "Credentials",
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

                // Admin paneli için sadece ADMIN_EMAILS listesindeki emailler
                const isAdminEmail = adminEmails.includes(credentials.email.toLowerCase());
                
                if (isAdminEmail) {
                    const user = await prisma.user.findUnique({ where: { email: credentials.email } });

                    if (user && user.password) {
                        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                        if (isPasswordValid) {
                            const name = (user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : user.email;
                            return { ...user, name };
                        }
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
    }
}; 