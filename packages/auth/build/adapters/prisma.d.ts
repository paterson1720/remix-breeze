import { PrismaClient } from "@prisma/client";
import { BreezeAuthSessionUser, DatabaseAdapter } from "../types";
export declare function PrismaAdapter(client: PrismaClient | ReturnType<PrismaClient["$extends"]>): DatabaseAdapter<BreezeAuthSessionUser>;
