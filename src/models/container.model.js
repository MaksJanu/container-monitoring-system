import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const containerStatsSchema = new mongoose.Schema({

    containerId: {
        type: String,
        default: uuidv4,
        unique: true,
    },

    name: {
        type: String,
        required: true,
    },

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },

    cpuUsage: {
        type: Number,
        default: 0,
    },

    ramMemoryUsage: {
        type: Number,
        default: 0,
    },

    diskUsage: {
        type: Number,
        default: 0,
    },

    networkUsage: {
        type: Number,
        default: 0,
    },

    logs: {
        type: [String],
        default: [],
    },

    createdAt: {
        type: Date,
        default: Date.now,
    }
})


const ContainerStats = mongoose.model('ContainerStats', containerStatsSchema);
export default ContainerStats;