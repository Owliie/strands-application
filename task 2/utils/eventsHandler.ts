import { Contract, providers } from "ethers";

// get all events between two blocks 
export const getEvents = async (
    provider: providers.BaseProvider,
    contract: Contract,
    topicData: any,
    fromBlock: number,
    toBlock: number
) => {
    const topics = Object.keys(topicData).map(
        (eventName) => contract.filters[eventName]().topics![0]
    );

    const filter: providers.Filter = {
        address: contract.address,
        fromBlock,
        toBlock,
    };

    const eventLogs = await provider.getLogs(filter);

    const events = eventLogs.map((log: providers.Log) => {
        try {
            const parsedLog = contract.interface.parseLog(log);
            if (topics.includes(parsedLog.topic)) {
                const topicFields = topicData[parsedLog.name];

                const parsedLogData: any = {
                    blockNumber: log.blockNumber,
                };
                topicFields.forEach((field: string) => {
                    parsedLogData[field] = parsedLog.args[field];
                });
                return {
                    [parsedLog.name]: parsedLogData,
                };
            }
        } catch (error) {
            console.log("error");
        }
        return "";
    });

    return events;
};
