// import 'dotenv/config';
// import mongoose from 'mongoose';
// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { config } from 'dotenv';
// import mongoose from 'mongoose';

// export enum Collection {
//   OTP = 'otp',
//   USER = 'users',
// }

// export class Populate {
//   public constructor() {
//     this.mongoUri = process.env.MONGODB_URI;
//     if (!this.mongoUri) {
//       console.error(
//         'MONGODB_URI not found in environment. Please add it to your .env file.',
//       );
//       process.exit(1);
//     }

//     this.connectPromise = mongoose
//       .connect(this.mongoUri)
//       .then(() => console.log('Connected to MongoDB'))
//       .catch((error) => {
//         console.error('Error connecting to MongoDB:', error.message);
//         throw error;
//       });
//   }

//   public async create(collection: string, doc: any): Promise<any> {
//     await this.ensureConnected();
//     if (!this.db || !this.db.db) {
//       throw new Error('MongoDB not connected');
//     }
//     try {
//       const result = await this.db.db.collection(collection).insertOne(doc);
//       console.log('Create Made');
//       return result;
//     } catch (err) {
//       console.error('Create error:', err);
//       throw err;
//     }
//   }

//   public async read(collection: string, doc: any): Promise<any> {
//     await this.ensureConnected();
//     if (!this.db || !this.db.db) {
//       throw new Error('MongoDB not connected');
//     }
//     try {
//       const result = await this.db.db.collection(collection).findOne(doc);
//       console.log('Read Made');
//       console.log(result);
//       return result;
//     } catch (err) {
//       console.error('Read error:', err);
//       throw err;
//     }
//   }

//   public async update(
//     collection: string,
//     doc: any,
//     tochange: any,
//   ): Promise<any> {
//   public async update(collection: string, doc: any, tochange): Promise<any> {
//     await this.ensureConnected();
//     if (!this.db || !this.db.db) {
//       throw new Error('MongoDB not connected');
//     }
//     try {
//       const updateDocument = this.hasAtomicOperator(tochange)
//         ? tochange
//         : { $set: tochange };
//       const result = await this.db.db
//         .collection(collection)
//         .updateOne(doc, updateDocument);
//       console.log('Update Made');
//       return result;
//     } catch (err) {
//       console.error('Update error:', err);
//       throw err;
//     }
//   }

//   public async delete(collection: string, doc: any): Promise<any> {
//     await this.ensureConnected();
//     if (!this.db || !this.db.db) {
//       throw new Error('MongoDB not connected');
//     }
//     try {
//       const result = await this.db.db.collection(collection).deleteOne(doc);
//       console.log('Delete Made');
//       return result;
//     } catch (err) {
//       console.error('Delete error:', err);
//       throw err;
//     }
//   }

//   private mongoUri;
//   private db = mongoose.connection;
//   private connectPromise: Promise<any> | null = null;

//   private async ensureConnected(): Promise<void> {
//     if (!this.connectPromise) {
//       this.connectPromise = mongoose
//         .connect(this.mongoUri)
//         .then(() => console.log('Connected to MongoDB'))
//         .catch((error) => {
//           console.error('Error connecting to MongoDB:', error.message);
//           throw error;
//         });
//     }
//     await this.connectPromise;
//     this.db = mongoose.connection;
//   }

//   private hasAtomicOperator(updateDocument: any): boolean {
//     if (!updateDocument || typeof updateDocument !== 'object') {
//       return false;
//     }

//     return Object.keys(updateDocument).some((key) => key.startsWith('$'));
//   }
// }

// export default Populate;
