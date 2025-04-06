import Docker from "dockerode";
import ContainerStats from "../models/container.model.js";
import ContainerHistory from "../models/containerHistory.model.js";

const docker = new Docker();

const parseDockerLogs = (logsBuffer) => {
  if (!logsBuffer || logsBuffer.length === 0) return [];
  
  return logsBuffer.toString('utf8')
    .split('\n')
    .filter(line => line.trim() !== '')
    .slice(0, 50);
};

const fetchAndStoreContainerStats = async () => {
  try {
    const containers = await docker.listContainers({ all: true });
    
    await Promise.all(containers.map(async (containerInfo) => {
      try {
        const container = docker.getContainer(containerInfo.Id);
        const stats = await container.stats({ stream: false });
  
        // CPU usage
        const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
        const systemCpuDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
        const onlineCpus = stats.cpu_stats.online_cpus || 1;
        const cpuUsage = systemCpuDelta > 0 ? (cpuDelta / systemCpuDelta) * onlineCpus * 100 : 0;
  
        // RAM usage
        const memoryUsage = stats.memory_stats.usage || 0;
        const memoryLimit = stats.memory_stats.limit || 1;
        const ramMemoryUsage = (memoryUsage / memoryLimit) * 100;
  
        // Disk usage
        const diskUsage = stats.blkio_stats.io_service_bytes_recursive?.reduce((acc, io) => acc + io.value, 0) || 0;
  
        // Network usage
        const networkUsage = Object.values(stats.networks || {}).reduce(
          (acc, net) => acc + net.rx_bytes + net.tx_bytes, 0
        );
  
        // Logs
        const logsBuffer = await container.logs({
          stdout: true,
          stderr: true,
          tail: 50,
          timestamps: true
        });
        
        const parsedLogs = parseDockerLogs(logsBuffer);
  
        await ContainerStats.findOneAndUpdate(
          { containerId: containerInfo.Id },
          {
            containerId: containerInfo.Id,
            name: containerInfo.Names[0].replace('/', ''),
            status: containerInfo.State,
            cpuUsage,
            ramMemoryUsage,
            diskUsage,
            networkUsage,
            logs: parsedLogs,
          },
          { upsert: true, new: true }
        );
        
        await ContainerHistory.create({
          containerId: containerInfo.Id,
          timestamp: new Date(),
          metrics: {
            cpuUsage,
            ramMemoryUsage,
            diskUsage,
            networkUsage
          }
        });
        
        console.log(`Updated stats for container: ${containerInfo.Names[0]}`);
      } catch (err) {
        console.error(`Error updating container ${containerInfo.Id}:`, err.message);
      }
    }));
    
    console.log('All container stats updated successfully');
  } catch (error) {
    console.error('Error fetching container stats:', error);
  }
};

const getAllContainerStats = async (req, res) => {
  try {
    const stats = await ContainerStats.find({});
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getContainerHistory = async (req, res) => {
  try {
    const { containerId, startDate, endDate, limit = 100 } = req.query;
    
    const query = { containerId };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const history = await ContainerHistory.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .exec();
      
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteOldHistory = async (daysToKeep = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await ContainerHistory.deleteMany({
      timestamp: { $lt: cutoffDate }
    });
    
    console.log(`Deleted ${result.deletedCount} historical records older than ${daysToKeep} days`);
    return result;
  } catch (error) {
    console.error('Error deleting old history:', error);
    throw error;
  }
};

const deleteAllHistory = async (req, res) => {
  try {
    const result = await deleteOldHistory(0);
    res.json({ 
      message: 'All container history records deleted', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export { 
  fetchAndStoreContainerStats, 
  getAllContainerStats, 
  getContainerHistory,
  deleteOldHistory,
  deleteAllHistory
};