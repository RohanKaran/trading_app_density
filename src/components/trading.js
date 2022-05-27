import {useState} from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Clock from 'react-live-clock';
import {
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import './trading.css'

const getTargetTime = () => {
  const today = new Date();
  return today.getHours() + ':' + (today.getMinutes() + 1) + ':';
}

const getTime = () => {
  const today = new Date();
  return today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
}

function Trading() {
  const [score, setScore] = useState(0)
  const ws = new WebSocket('wss://stream.binance.com/ws/btcusdt@kline_1m')
  // const [prev_stream, setPrev_stream] = useState(null)
  const [stream, setStream] = useState(null)
  const [table] = useState([])
  const [bet, setBet] = useState(true)
  const [current_bet] = useState([])
  ws.onmessage = function (event) {
    const tmp = JSON.parse(event.data)
    let tmp_score = 0
    if (current_bet.length > 0 && current_bet[0]["closing_price"] === null && current_bet[0]["ot"] + 120000 === tmp["k"]["t"]){
      // console.log(parseFloat(tmp["k"]["c"]) > current_bet[0]["opening_price"], parseFloat(tmp["k"]["c"]) < current_bet[0]["opening_price"])
      if ((current_bet[0]["bet"] === 1 && parseFloat(tmp["k"]["c"]) > current_bet[0]["opening_price"]) || (current_bet[0]["bet"] === 0 && parseFloat(tmp["k"]["c"]) < current_bet[0]["opening_price"])){
        table[table.length - 1]["closing_price"] = tmp["k"]["c"]
        table[table.length - 1]["score"] += 1

      }
      else {
        table[table.length - 1]["closing_price"] = tmp["k"]["c"]
        table[table.length - 1]["score"] -= 1
      }
      current_bet.pop()
      console.log("updated", )
    }
    for (const i in table) {
      tmp_score += table[i]["score"]
    }
    setScore(tmp_score)
    setStream(tmp);
    // console.log(`[message] Data received from server: ${stream}`);

  };

  const handleSubmit = () => {
    if (current_bet.length > 0){
      return
    }
    current_bet.push(
          {
            "current_time": getTime(),
            "opening_time": getTargetTime() + "00",
            "ot": stream["k"]["t"],
            "closing_time": getTargetTime() + "59",
            "opening_price": parseFloat(stream["k"]["o"]),
            "closing_price": null,
            "bet": bet,
            "score": 0
          }
        )
    table.push(
      current_bet[0]
    )
  }

  return (
    <>{stream ? <div className="Trading">
      <div className={"heading"}>
          Trading Game
      </div>

      <div className={"left_body"}>
        <div>
          <h3 style={{marginBottom:1}}>
            Current price: {stream ? parseFloat(stream["k"]["c"]) : "null"}
          </h3>
          <h3 style={{marginTop:0}}>
            Current Time: <Clock format={'HH:mm:ss'} ticking/>
          </h3>
          <div align={"left"}>
            <h2>
              User Payout Counter: {score}
            </h2>
          </div>

        </div>

      <FormControl style={{alignItems:"center"}}>
        <FormLabel>
          <div>
            <h3 style={{margin:0}}>
              Prediction
            </h3>
            (Bet available for {getTargetTime()+"00 - "+ getTargetTime() + "59"})
          </div>


        </FormLabel>
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            onChange={(e)=> {
              setBet(parseInt(e.target.value))
              console.log(e.target.value)
            }}
          >
            <FormControlLabel value={1} control={<Radio />} label="Up" className={"up"}/>
            <FormControlLabel value={0} control={<Radio />} label="Down" className={"down"}/>
          </RadioGroup>
      </FormControl>
    <br/>
    <br/>
      <Button
        disabled={(current_bet.length > 0) || (bet === true)}
        onClick={handleSubmit}
        variant={"contained"}
        style={{marginBottom:"3rem"}}
      >
        Place bet
      </Button>



      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell align="right">Bet Placed At</TableCell>
              <TableCell align="right">Opening Time</TableCell>
              <TableCell align="right">Closing Time</TableCell>
              <TableCell align="right">Opening Price</TableCell>
              <TableCell align="right">Closing Price</TableCell>
              <TableCell align="right">Bet</TableCell>
              <TableCell align="right">Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {table.map((row) => (
              <TableRow
                key={row.ot}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.ot}
                </TableCell>
                <TableCell align="right">{row.current_time}</TableCell>
                <TableCell align="right">{row.opening_time}</TableCell>
                <TableCell align="right">{row.closing_time}</TableCell>
                <TableCell align="right">{parseFloat(row.opening_price)}</TableCell>
                <TableCell align="right">{parseFloat(row.closing_price)}</TableCell>
                <TableCell align="right">{(row.bet === 1) ? "UP" : "DOWN"}</TableCell>
                <TableCell align="right">{row.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </div>

    </div>:
      <div className={"progress"}>
        <CircularProgress/>
        <br/>
        Connecting...
      </div>

    }</>
  );
}

export default Trading;
