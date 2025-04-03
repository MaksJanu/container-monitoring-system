import mongoose from 'mongoose';

const containerHistorySchema = new mongoose.Schema({
  containerId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metrics: {
    cpuUsage: Number,
    ramMemoryUsage: Number,
    diskUsage: Number,
    networkUsage: Number
  }
});

containerHistorySchema.index({ containerId: 1, timestamp: 1 });

const ContainerHistory = mongoose.model('ContainerHistory', containerHistorySchema);
export default ContainerHistory;