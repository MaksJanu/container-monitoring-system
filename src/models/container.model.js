import mongoose from 'mongoose';

const containerStatsSchema = new mongoose.Schema({

    containerId: {
        type: String,
        required: true,
        unique: true, 
    },

    name: {
        type: String,
        required: true,
    },

    status: {
        type: String,
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