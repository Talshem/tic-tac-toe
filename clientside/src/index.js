import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Modal from 'react-modal';
import axios from 'axios';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

function Board(props) {


 function renderSquare(i) {
  return(
      <Square
        value={props.squares[i]}
        onClick={() =>props.onClick(i)}
      />)
  }

    return (
      <div className="board">
        <div className="board-row">
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </div>
        <div className="board-row">
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </div>
        <div className="board-row">
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
      </div>
    );

}


function Game(props) {


const [history, setHistory] = useState([{squares: Array(9).fill(null)}]);
const [stepNumber, setStepNumber] = useState(0);
const [xIsNext, setXisNext] = useState(true)
const [sec, setSec] = useState(0)
const [min, setMin] = useState(0)

useEffect(() => {
  const interval = setInterval(() => {
   setSec(sec => sec + 1)
  }, 1000);
  return () => clearInterval(interval);
},[]);


useEffect(() => {
  const interval = setInterval(() => {
   setMin(min => min + 1)
   setSec(0)
  }, 60000);
  return () => clearInterval(interval);
},[]);

useEffect(() => {
  const interval = setInterval(() => {
   setMin(0)
   setSec(0)
  }, 3600000);
  return () => clearInterval(interval);
},[]);


var counter = (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec)

  function handleClick(i) {
    const thisHistory = history.slice(0, stepNumber + 1);
    const current = thisHistory[thisHistory.length - 1];
    const thisSquares = current.squares.slice();
    if (calculateWinner(thisSquares) || thisSquares[i]) {
      return;
    }
    thisSquares[i] = xIsNext ? "X" : "O";
    setHistory(thisHistory.concat([{squares: thisSquares}]));
    setStepNumber(thisHistory.length);
    setXisNext(!xIsNext);

  }

  function jumpTo(step) {
   setStepNumber(step);
   setXisNext((step % 2) === 0);

  }

    const thisHistory = history;
    const current = thisHistory[stepNumber];
    let winner = calculateWinner(current.squares);

    const moves = thisHistory.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => handleClick(i)}
          />
        </div>

        <div className="game-info">
          <div>{status}</div>
          <ul>{moves}</ul>
        </div>
          <div className="counter">
          {counter}
        </div>
        <div>
          <PopUp winner={winner} counter={counter}/>
        </div>
        <div>
          <Record/>
        </div>
      </div>
    );
  }



function PopUp(props){
  var subtitle;
  const [IsOpen,setIsOpen] = useState(false);
  const [winner, SetWinner] = useState(null)
  const [id, setId] = useState(0)
  const [name, setName] = useState('')

  const handleChange = (event) => {
    setName(event.target.value);
  }

  function afterOpenModal() {
    subtitle.style.color = 'white';
  }



if(props.winner && winner !== 'none'){
    SetWinner(props.winner)
  }

  if(winner === 'X' || winner === 'O'){
    setIsOpen(true);
    SetWinner('none')
  }

  var res = '';

  useEffect(() => {
    async function fetchData() {
    res = await axios.get('/api/v1/records');
    res = (res.data.length + 1).toString()
    setId(res)
  }
  fetchData()}, []);

function handleClose(){
  setIsOpen(false)
  SetWinner(null)
}

  const sendWinner = async () => {
try{
await axios.post('/api/v1/records', {
    id: id,
    winnerName: (name === '' ?  '-' : name),
    date: new Date().toISOString().substr(0, 19).replace('T', ' '),
    duration: props.counter
  })

  .then(function (response) {
  console.log(response.data);
  setIsOpen(false);
  SetWinner(null)
  })}
    catch(error) {
    console.log(error);
    }

}

    return (


      <div>
        <Modal className="modal"
          animation='true'
          isOpen={IsOpen}
          onAfterOpen={afterOpenModal}
          onRequestClose={() => sendWinner('tal')}
          contentLabel="Example Modal"
        >
          <h2 ref={_subtitle => (subtitle = _subtitle)}>Congratulations winner!</h2>
          <div>Place your name in the records list!</div>
          <br/>
          <form>
            <input onChange={handleChange} style={{border:'2px solid white', borderRadius:'5px'}}/>
            <button onClick={() => sendWinner()}>Send</button>
            <button onClick={() => handleClose()}>Cancel</button>
  
          </form>
        </Modal>
      </div>
    );
}

Modal.setAppElement('#root')

function Record(props){
const [loading, setLoading] = useState(true);
const [dots, setDots] = useState('Loading leaderboard')
const [list, setList] = useState([])


useEffect(() => {
  const interval = setInterval(() => {
   setDots(dots => dots + ' .')
  }, 200);
  return () => clearInterval(interval);
},[]);

useEffect(() => {
  const interval = setInterval(() => {
   setDots(dots => 'Loading leaderboard')
  }, 800);
  return () => clearInterval(interval);
},[]);


  useEffect(() => {
    async function fetchData() {
    const res = await axios.get('/api/v1/records');
    setList(res.data)
    setLoading(false)
  }
  fetchData()}, []);


  return (  
<div>
  <table>
    <tbody>
<tr>
  <th>Winner</th>
  <th>Date</th>
  <th>duration</th>
</tr>

{list.map(e => 
<tr key={e.id}>
  <td>{e.winnerName}</td>
  <td>{e.date}</td>
  <td>{e.duration}</td>
</tr>)}
</tbody>
  </table>
  <div  className="loading">
          { loading ?
          <div>{dots}</div> :
          <div></div>
        }
        </div> </div>
  )
}

// ========================================

ReactDOM.render(<Game/>, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
