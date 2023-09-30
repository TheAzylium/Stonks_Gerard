import mongoose from 'mongoose';

const activityPossibility: string[] = [
  'MTP',
  'FFS',
  'UPW',
  'PAWL',
  'MISSINGGILET',
  'MISSINGTENUE',
  'CS',
  'BILLETS',
  'SECURISE',
  'SAISIE',
  'TRANSFERT',
];
type ActivityName = (typeof activityPossibility)[number];

export interface ACTIVITYMONITORING {
  _id: string;
  messageId: string;
  sendBy: {
    _id: string;
    name: string;
  };
  activity: {
    name: ActivityName | string;
    number?: number;
    hour?: string;
  };
  createAt: Date;
  updatedAt: Date;
}

const ActivityMonitoringSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
    },
    sendBy: {
      _id: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    activity: {
      name: {
        type: String,
      },
      number: {
        type: Number,
      },
      hour: {
        type: String,
      },
    },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model<ACTIVITYMONITORING>(
  'ActivityMonitoring',
  ActivityMonitoringSchema,
);
