import { MongoClient } from "mongodb";
import { BreezeAuthSessionUser, DatabaseAdapter } from "../types";
export declare function MongooseAdapter(getClient: () => Promise<MongoClient>): DatabaseAdapter<BreezeAuthSessionUser>;
