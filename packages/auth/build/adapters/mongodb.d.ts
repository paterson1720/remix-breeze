import { MongoClient } from "mongodb";
import { BreezeAuthSessionUser, DatabaseAdapter } from "../types";
export declare function MongoDBAdapter(getClient: () => Promise<MongoClient>): DatabaseAdapter<BreezeAuthSessionUser>;
