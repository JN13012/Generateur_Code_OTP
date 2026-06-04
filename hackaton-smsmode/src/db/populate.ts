import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
const mongoose = require('mongoose');

require('dotenv').config();

const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
    console.error('MONGODB_URI not found in environment. Please add it to your .env file.');
    process.exit(1);
}

mongoose.connect(dbURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });

const db = mongoose.connection;

export async function Populate() {
    // Connection successful
    db.once('open', () => console.log('Connected to MongoDB'));

    // Connection error
    db.on('error', (err) => console.error('MongoDB connection error:', err));

    // Connection disconnected
    db.on('disconnected', () => console.log('Disconnected from MongoDB'));
}
