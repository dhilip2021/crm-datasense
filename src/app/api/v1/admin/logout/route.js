import { NextResponse } from "next/server";
import { headers } from "next/headers";
import connectMongoDB from "@/libs/mongodb";
import TokenBlacklist from "@/models/TokenBlacklist";
import { urlDecoder } from "encryptdecrypt-everytime/src";
import jwt from "jsonwebtoken";

export async function POST() {
  try {
    await connectMongoDB();

    const headersList = headers();
    const authToken = headersList.get("authorization");

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Token not found!" },
        { status: 400 }
      );
    }

    const token = authToken.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Invalid token!" },
        { status: 400 }
      );
    }

    const secretKey = process.env.NEXT_PUBLIC_ENCY_DECY_SECRET;

    // Decrypt Token
    const decrypted = urlDecoder(secretKey, token);
    const tokenString = JSON.parse(decrypted).toString();

    // Validate JWT
    jwt.verify(tokenString, process.env.NEXT_PUBLIC_JWT_SECRET);

    // Store token in blacklist
    await TokenBlacklist.create({ token: tokenString });

    return NextResponse.json(
      { success: true, message: "Logged out successfully!" },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Logout failed!", error: err.message },
      { status: 500 }
    );
  }
}
