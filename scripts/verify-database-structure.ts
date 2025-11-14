

import {
 userRepository,
 videoRepository,
 transactionRepository,
} from "../src/lib/database/repositories";
import * as schema from "../src/lib/database/schema";

async function verifyDatabaseStructure() {
 console.log("🔍 Verifying database structure and setup...");

 try {

 console.log("📋 Testing schema definitions...");

 const requiredTables = [
 "users",
 "creatorProfiles",
 "memberProfiles",
 "videos",
 "transactions",
 ];

 for (const table of requiredTables) {
 if (!(table in schema)) {
 console.error(`❌ Missing table definition: ${table}`);
 return false;
 }
 }

 console.log("✅ Schema definitions are properly structured");

 console.log("🏪 Testing repository instantiation...");

 const repositories = [
 { name: "userRepository", instance: userRepository },
 { name: "videoRepository", instance: videoRepository },
 { name: "transactionRepository", instance: transactionRepository },
 ];

 for (const repo of repositories) {
 if (!repo.instance) {
 console.error(`❌ Repository not properly instantiated: ${repo.name}`);
 return false;
 }

 const expectedMethods = ["create", "findById", "update", "delete"];
 for (const method of expectedMethods) {
 if (typeof (repo.instance as any)[method] !== "function") {
 console.error(`❌ Repository ${repo.name} missing method: ${method}`);
 return false;
 }
 }
 }

 console.log("✅ Repositories properly instantiated with expected methods");

 console.log("⚙️ Testing configuration...");

 const { databaseConfig } = await import("../src/lib/database/config");

 if (!databaseConfig) {
 console.error("❌ Database configuration not properly loaded");
 return false;
 }

 const requiredConfigKeys: (keyof typeof databaseConfig)[] = [
 "host",
 "port",
 "database",
 "username",
 "password",
 ];
 
 for (const key of requiredConfigKeys) {
 if (!databaseConfig[key]) {
 console.error(`❌ Missing database configuration: ${key}`);
 return false;
 }
 }

 console.log("✅ Database configuration properly loaded");

 console.log("🛣️ Testing API route structure...");

 try {
 const profileRoute = await import("../src/app/api/auth/profile/route");
 const setupRoute = await import(
 "../src/app/api/auth/setup-profile/route"
 );

 if (!profileRoute.GET || !profileRoute.PATCH) {
 console.error("❌ Profile route missing required methods");
 return false;
 }

 if (!setupRoute.POST) {
 console.error("❌ Setup profile route missing POST method");
 return false;
 }

 console.log("✅ API routes properly structured");
 } catch (error) {
 console.error("❌ API route import failed:", error);
 return false;
 }

 console.log("🎉 Database structure verification completed successfully!");
 console.log("");
 console.log("📝 Summary:");
 console.log(" ✅ Schema definitions: OK");
 console.log(" ✅ Repository classes: OK");
 console.log(" ✅ Database configuration: OK");
 console.log(" ✅ API routes: OK");
 console.log("");
 console.log("💡 To test with Neon DB:");
 console.log(" 1. Sign up at https://neon.tech");
 console.log(" 2. Create a new project");
 console.log(" 3. Copy the connection string to DATABASE_URL in .env.local");
 console.log(" 4. Run: npm run db:generate");
 console.log(" 5. Run: npm run db:migrate");
 console.log(" 6. Run: npm run db:seed");
 console.log("");
 console.log("📖 See docs/NEON_DB_SETUP.md for detailed setup instructions");

 return true;
 } catch (error) {
 console.error("❌ Database structure verification failed:", error);
 return false;
 }
}

if (require.main === module) {
 verifyDatabaseStructure()
 .then((success) => {
 process.exit(success ? 0 : 1);
 })
 .catch((error) => {
 console.error("Verification process failed:", error);
 process.exit(1);
 });
}

export { verifyDatabaseStructure };
