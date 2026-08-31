/**
 * MongoDB Models
 *
 * Extracted from Prisma schema:
 *   libraries/nestjs-libraries/src/database/prisma/schema.prisma
 *
 * Translated from PostgreSQL/Prisma to Mongoose (MongoDB).
 * Only the core models needed for social scheduling are included.
 * Complex relations (billing, agencies, marketplace) are removed.
 */

import mongoose from 'mongoose';

// ─── User Model ────────────────────────────────────────────────────────────────
// Source: schema.prisma → model User
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String }, // bcrypt hashed; null for OAuth users
    name: { type: String },
    picture: { type: String },    // URL to profile picture
    activated: { type: Boolean, default: true },
    isSuperAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);

// ─── Integration Model ─────────────────────────────────────────────────────────
// Source: schema.prisma → model Integration
// Represents a connected social media account
const IntegrationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    internalId: { type: String, required: true }, // Platform's user/page ID
    name: { type: String, required: true },        // Display name on the platform
    picture: { type: String },                     // Profile picture URL
    providerIdentifier: {                          // 'facebook' | 'instagram' | 'x' | 'linkedin'
      type: String,
      required: true,
      enum: ['facebook', 'instagram', 'x', 'linkedin'],
    },
    type: { type: String, default: 'personal' },   // 'personal' | 'company' (LinkedIn)
    token: { type: String, required: true },        // Access token
    refreshToken: { type: String },                 // Refresh token (LinkedIn)
    tokenExpiration: { type: Date },               // When the token expires
    profile: { type: String },                     // Username/handle
    disabled: { type: Boolean, default: false },
    refreshNeeded: { type: Boolean, default: false }, // True when token needs re-auth
    inBetweenSteps: { type: Boolean, default: false },// True when OAuth step 2 pending
    additionalSettings: { type: String, default: '[]' }, // JSON array of extra settings
    postingTimes: {                                // Preferred posting times
      type: String,
      default: '[{"time":120},{"time":400},{"time":700}]',
    },
  },
  { timestamps: true }
);

IntegrationSchema.index({ userId: 1 });
IntegrationSchema.index({ providerIdentifier: 1 });
IntegrationSchema.index({ userId: 1, internalId: 1 }, { unique: true });

const Integration = mongoose.model('Integration', IntegrationSchema);

// ─── Post Model ────────────────────────────────────────────────────────────────
// Source: schema.prisma → model Post
// Represents a scheduled or published post
const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    integrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Integration', required: true },
    content: { type: String, required: true },     // Post text/HTML
    publishDate: { type: Date, required: true },   // When to publish
    state: {
      type: String,
      enum: ['QUEUE', 'SCHEDULED', 'PUBLISHED', 'ERROR', 'DRAFT'],
      default: 'QUEUE',
    },
    group: { type: String, required: true },       // Groups posts that publish together (thread)
    settings: { type: String, default: '{}' },     // Platform-specific settings JSON
    image: { type: String, default: '[]' },        // Media attachments JSON array
    releaseURL: { type: String },                  // Published post URL
    postId: { type: String },                      // Platform-assigned post ID
    error: { type: String },                       // Error message if state === ERROR
    parentPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // For thread replies
  },
  { timestamps: true }
);

PostSchema.index({ publishDate: 1, state: 1 }); // For the scheduler query
PostSchema.index({ userId: 1 });
PostSchema.index({ group: 1 });
PostSchema.index({ integrationId: 1 });

const Post = mongoose.model('Post', PostSchema);

// ─── Media Model ───────────────────────────────────────────────────────────────
// Source: schema.prisma → model Media
const MediaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    originalName: { type: String },
    path: { type: String, required: true }, // Public URL to the file
    type: { type: String, default: 'image', enum: ['image', 'video'] },
    fileSize: { type: Number, default: 0 },
    thumbnail: { type: String },
    alt: { type: String },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

MediaSchema.index({ userId: 1 });

const Media = mongoose.model('Media', MediaSchema);

export { User, Integration, Post, Media };
