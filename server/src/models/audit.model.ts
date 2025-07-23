import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the Audit document
export interface IAudit extends Document {
  action: string;
  userId: mongoose.Types.ObjectId;
  userModel: string;
  targetId?: mongoose.Types.ObjectId;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the audit schema
const auditSchema: Schema = new Schema(
  {
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      enum: [
        'admin_creation',
        'superadmin_initialization',
        'admin_update',
        'user_update_by_admin',
        'user_deletion',
        'user_creation',
        'login_success',
        'login_failure',
        'password_reset',
        'password_change',
        'payment_received',
        'number_assigned',
        'number_released',
        'subscription_created',
        'subscription_updated',
        'subscription_cancelled'
      ]
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User'
    },
    userModel: {
      type: String,
      required: [true, 'User model name is required'],
      default: 'User'
    },
    targetId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    details: {
      type: Schema.Types.Mixed,
      required: true
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    }
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
auditSchema.index({ action: 1 });
auditSchema.index({ userId: 1 });
auditSchema.index({ createdAt: -1 });
auditSchema.index({ targetId: 1 });

// Create a static method to help with finding audit logs by various fields
auditSchema.statics.findByActionAndDateRange = async function (
  action: string,
  startDate: Date,
  endDate: Date
) {
  return this.find({
    action,
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort('-createdAt');
};

// Create and export the model
const Audit: Model<IAudit> = mongoose.model<IAudit>('Audit', auditSchema);

export default Audit;