import Docker from "dockerode";


const docker = new Docker()


const fetchAndStoreContainerStats = async () => {
    try {
        const containers = await docker.listContainers({ all: true });









    } catch (error) {
        console.error("Error fetching container stats:", error);
    }
}