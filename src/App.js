import './App.css';
import {Grid} from "@mui/material";
import Title from "./components/title";
import Trading from "./components/trading";

function App() {
  return (
    <div className="App" style={{paddingTop:0}}>
      <Grid container spacing={2}>
        <Grid item xs={8}>
            <Trading/>
        </Grid>
        <Grid item xs={4} style={{paddingTop:0, backgroundColor: '#1976d2'}}>
          <Title/>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
