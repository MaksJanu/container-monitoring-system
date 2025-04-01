import Docker from "dockerode";
import ContainerStats from "../models/container.model.js";

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


export { fetchAndStoreContainerStats, getAllContainerStats };