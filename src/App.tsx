import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {Box, Typography} from "@mui/material";
import NewMetricsSelector, {targets} from "./Selectors/Metrics/Metrics";

function App() {
    const [metrics, setMetrics] = useState([] as string[]);
  return (
    <Box className="App" sx={{width:'100%', height:'100%'}}>
      <NewMetricsSelector value={metrics} updateContext={false} updateValue={setMetrics} target={targets.competitive}/>
        <Typography>Metrics</Typography>
        <Typography>{metrics.toString()}</Typography>
    </Box>
  );
}

export default App;
