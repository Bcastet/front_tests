import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import {GameMetricssApi} from './farsight-api/apis';
import {GameMetricsList} from './farsight-api/models';

interface AppProviderProps {
    children: ReactNode;
}

interface AppContextProps {
    metricsReferential: GameMetricsList[];
    setMetricsReferential: React.Dispatch<React.SetStateAction<any>>;
    selectedMetrics: GameMetricsList[];
    setSelectedMetrics: React.Dispatch<React.SetStateAction<any>>;
    // Add more data and setData as needed
}

const OpenAPIClientAxios = require("openapi-client-axios").default;

const farsight_api = new OpenAPIClientAxios({
    definition: "http://localhost:8000/schema/",
});

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [metricsReferential, setMetricsReferential] = useState<GameMetricsList[]>([]);
    const [selectedMetrics, setSelectedMetrics] = useState<GameMetricsList[]>([]);

    useEffect(() => {
        const fetchMetricsReferentialOnMount = async () => {
            try {
                const game_metrics = new GameMetricssApi()
                await game_metrics.gameMetricssList({ordering: ['group','index'], additional_filters:{label__gte:0}}).then(
                    (result: GameMetricsList[]) => {
                      setMetricsReferential(result);
                      setSelectedMetrics([])
                  }
                );
            } catch (error) {
                console.error('Error fetching metrics referential on mount:', error);
            }
        };
        fetchMetricsReferentialOnMount();
    }, []);


    return (
        <AppContext.Provider value={{ metricsReferential, setMetricsReferential, selectedMetrics, setSelectedMetrics /* Add more properties */ }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
