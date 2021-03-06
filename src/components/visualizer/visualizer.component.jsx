import React from "react";
import Node from "./node/node.component";
import { generateCave, initCave } from "../algorithms/cave";
import { recursiveFloodFill, iterativeFloodFill } from "../algorithms/flood";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Button } from 'react-bootstrap'
import "./visualizer.styles.scss";
import ControlPanel from "../control-panel/control-panel.component";

const caveAlgo = 0;
const floodAlgo = 1;

const fillVal = 2;

class Visualizer extends React.Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      algo: null,
      floodType: 0, //0 is recursive (stack), 1 is iterative (queue)
      speed: 70,
      mouseIsPressed: false,
      pressedType: false,
      draggingStart: false,
      width: 21,
      height: 21,
      birthLimit: 4,
      deathLimit: 3,
      initChance: 0.45,
      startR: 0,
      startC: 0
    };

    this.handleChangeSpeed = this.handleChangeSpeed.bind(this);
    this.handleChangeWidth = this.handleChangeWidth.bind(this);
    this.handleChangeHeight = this.handleChangeHeight.bind(this);
    this.visualizeCaveGeneration = this.visualizeCaveGeneration.bind(this);
    this.nextStepInVisualization = this.nextStepInVisualization.bind(this);
    this.killAllTimeouts = this.killAllTimeouts.bind(this);
    this.initGridCave = this.initGridCave.bind(this);
    this.initGridFlood = this.initGridFlood.bind(this);

    this.visualizeFloodFill = this.visualizeFloodFill.bind(this);
    this.clearFlood = this.clearFlood.bind(this);
  }


  // create initial grid
  componentDidMount() {
    const currentRoute = window.location.pathname;
    console.log(currentRoute)
    if (currentRoute === "/Algo-Visual/floodfill") {
      this.setState({ algo: floodAlgo }, function () {
        this.initGridFlood();
      });
    } else if (currentRoute === "/Algo-Visual/cavegen") {
      this.initGridCave();
    }
  }

  initGrid(isEmpty) {
    const grid = this.createGrid(isEmpty);
    this.setState({ grid });
  }

  initGridCave() {
    this.killAllTimeouts();
    this.setState({ width: 21, height: 21, algo: caveAlgo }, function () {
      const grid = this.createGrid(true);
      this.setState({ grid });
    });
  }

  initGridFlood() {
    const els = document.getElementsByClassName("node");

    Object.keys(els).forEach(el => {
      els[el].classList.remove("isWall");
      els[el].classList.remove("isFilled");
    });

    this.killAllTimeouts();
    this.setState({ width: 21, height: 21, algo: floodAlgo }, function () {
      const grid = this.createGrid(true, true);
      this.setState({ grid });
    });
  }

  clearFlood() {
    const els = document.getElementsByClassName("node");

    Object.keys(els).forEach(el => {
      els[el].classList.remove("isWall");
      els[el].classList.remove("isFilled");
    });

    const grid = this.state.grid;

    for (let r = 0; r < this.state.width; r++) {
      const curRow = this.state.grid[r].slice();
      for (let c = 0; c < this.state.width; c++) {
        if (curRow[c].isFilled) curRow[c].isFilled = false;
      }
    }
    this.setState({ grid });
    this.killAllTimeouts();
  }

  //// EVENT LISTENERS ////////////////////
  handleMouseDown(row, col) {
    if (this.state.grid[row][col].isStart) {
      return;
    } else {
      let val = !this.state.grid[row][col].isWall;
      console.log(val);
      // if (val === false) val = 1;
      // else val = 0;

      const newGrid = this.getNewGridWithWallToggled(
        this.state.grid,
        row,
        col,
        val
      );
      this.setState({ grid: newGrid, mouseIsPressed: true, pressedType: val });
    }
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    if (this.state.grid[row][col].isStart) return;

    if (this.state.draggingStart) {
    } else {
      const newGrid = this.getNewGridWithWallToggled(
        this.state.grid,
        row,
        col,
        this.state.pressedType
      );
      this.setState({ grid: newGrid });
    }
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false, pressedType: false });
  }

  handleChangeWidth(w) {
    this.setState({ width: w });
  }

  handleChangeHeight(h) {
    this.setState({ height: h });
  }
  handleChangeSpeed(s) {
    this.setState({ speed: s });
  }

  killAllTimeouts() {
    var highestTimeoutId = setTimeout(";");
    for (var i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }
  }

  visualizeCaveGeneration(w, initChance, birthLimit, deathLimit, speed) {
    this.setState(
      { width: w, height: w, birthLimit, deathLimit, initChance, speed },
      function () {
        const grid = this.createGrid(true);
        this.setState({ grid }, function () {
          const boolGrid = initCave(
            this.state.grid,
            this.state.width,
            this.state.height,
            this.state.initChance
          );
          this.animateCaveGeneration(boolGrid);
        });
      }
    );
  }

  nextStepInVisualization(speed) {
    this.setState({ speed }, function () {
      const boolGrid = generateCave(
        this.state.grid,
        this.state.width,
        this.state.height,
        this.state.birthLimit,
        this.state.deathLimit
      );
      this.animateCaveGeneration(boolGrid);
    });
  }

  animateCaveGeneration(boolGrid) {
    // const t = 0.5;


    const t = Math.min(70, 1000 / this.state.width / this.state.width);

    for (let row = 0; row < this.state.height; row++) {
      for (let col = 0; col < this.state.width; col++) {
        const val = boolGrid[row][col];
        const el = document.getElementById(`node-${row}-${col}`);
        setTimeout(() => {
          if (
            val === 1 ||
            row === 0 ||
            col === 0 ||
            row === this.state.height - 1 ||
            col === this.state.width - 1
          ) {
            el.classList.add("wall");
          } else {
            el.classList.remove("wall");
          }

          el.classList.add("visited");
        }, t * col + row * (t * this.state.width));

        setTimeout(() => {
          el.classList.remove("visited");
        }, t * col + row * (t * this.state.width) + Math.min(50, t * 40));
      }
    }
    setTimeout(() => {
      for (let row = 0; row < this.state.height; row++) {
        for (let col = 0; col < this.state.width; col++) {
          const g = this.setNewGrid(
            this.state.grid,
            row,
            col,
            row === 0 ||
              col === 0 ||
              row === this.state.width - 1 ||
              col === this.state.width - 1
              ? 1
              : boolGrid[row][col],
            false
          );
        }
      }
    }, t * this.state.height * this.state.width);
  }

  visualizeFloodFill(speed, floodType) {
    this.clearFlood();

    this.setState({ speed, floodType }, function () {
      console.log(floodType);
      const { grid, startR, startC } = this.state;
      let fn = floodType === 0 ? recursiveFloodFill : iterativeFloodFill;
      const traversalStack = fn(grid, startR, startC, 0, fillVal);
      this.animateFloodFill(traversalStack);
    });
  }

  mapRange = (value, x1, y1, x2, y2) =>
    ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;

  animateFloodFill(traversalStack) {
    // const t = 10; 200



    const t = this.mapRange(10 - this.state.speed, 0, 10, 5, 50);

    for (let i = 0; i < traversalStack.length; i++) {
      const node = traversalStack[i];
      const m1 = node[0],
        m2 = node[1];
      const el = document.getElementById(`node-${m1}-${m2}`);

      setTimeout(() => {
        if (el) {
          if (!this.state.grid[m1][m2].isStart) el.classList.add("isFilled");
        }
      }, t * i);
    }

    //// update state ONLY AFTER the visualization has completed, not constantly during it.
    setTimeout(() => {
      for (let i = 0; i < traversalStack.length; i++) {
        const node = traversalStack[i];
        const m1 = node[0],
          m2 = node[1];
        this.setNewGrid(
          this.state.grid,
          m1,
          m2,
          // this.state.grid[m1][m2].isWall,
          false,
          true
        );
      }
    }, t * traversalStack.length);
  }

  ////////////////////////////////////////

  caveGen = () => (
    <div className="main-container">
      <ControlPanel
        algo={this.state.algo}
        width={this.state.width}
        height={this.state.height}
        handleChangeSpeed={this.handleChangeSpeed}
        onChangeWidth={this.handleChangeWidth}
        onChangeHeight={this.handleChangeHeight}
        visualizeCaveGeneration={this.visualizeCaveGeneration}
        nextStepInVisualization={this.nextStepInVisualization}
        killAllTimeouts={this.killAllTimeouts}
      />
      <this.gridComponent></this.gridComponent>
    </div>

  );

  floodFill = () => (
    <div className="main-container">
      <ControlPanel
        algo={this.state.algo}
        width={this.state.width}
        height={this.state.height}
        handleChangeSpeed={this.handleChangeSpeed}
        visualizeFloodFill={this.visualizeFloodFill}
        initGridFlood={this.initGridFlood}
        clearFlood={this.clearFlood}
        killAllTimeouts={this.killAllTimeouts}
      />
      <this.gridComponent></this.gridComponent>
    </div>
  );

  gridComponent = algo => (
    <div className="grid">
      {this.state.grid.map((row, rowIx) => {
        return (
          <div key={rowIx} className="rowContainer">
            {row.map((node, nodeIx) => {
              const { row, col, isWall, isStart, isFilled } = node;
              return (
                <Node
                  key={nodeIx}
                  col={col}
                  row={row}
                  isWall={isWall}
                  isStart={isStart}
                  isFilled={isFilled}
                  mouseIsPressed={this.state.mouseIsPressed}
                  onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                  onMouseEnter={(row, col) => this.handleMouseEnter(row, col)}
                  onMouseUp={() => this.handleMouseUp()}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );

  GreetingComponent = () => (

    <h1>Algo-Visual</h1>

  )

  render() {
    const { grid, mouseIsPressed, width, height, algo } = this.state;
    return (
      <>
        <Router basename={'Algo-Visual'}>
          {/* <h1>Algo-Interactive</h1> */}
          <Route path="/" component={this.GreetingComponent} />
          <div className="header-nav">

            {/* <div className="header-nav2"> */}
            {/* <h3>Select an Algorithm:</h3> */}
            <Link to="/cavegen" onClick={this.initGridCave}>
              {
                algo === null ? <Button variant="outline-primary">Cave Gen</Button> : algo === caveAlgo ? (<Button variant="primary">Cave Gen</Button>) : <Button variant="outline-primary">Cave Gen</Button>
              }
            </Link>

            <Link to="/floodfill" onClick={this.initGridFlood}>
              {
                algo === null ? <Button variant="outline-primary">Flood-fill</Button> : algo === floodAlgo ? (<Button variant="primary">Flood-fill</Button>) : <Button variant="outline-primary">Flood-fill</Button>
              }

            </Link>
            {/* </div> */}
          </div>
          <h4>
            {
              algo === null ? "Choose an algorithm" : ""
            }
          </h4>

          <Route path="/cavegen" component={this.caveGen} />
          <Route path="/floodfill" component={this.floodFill} />

        </Router>
      </>
    );
  }


  //// GRID FUNCTIONS
  createNode = (row, col, isEmpty, isStart) => {
    return {
      row,
      col,
      isWall: false,
      isStart: isStart,
      isFilled: false
    };
  };

  createGrid = (isEmpty, isStart = false) => {
    const grid = [];
    for (let row = 0; row < this.state.height; row++) {
      const currentRow = [];
      for (let col = 0; col < this.state.width; col++) {
        let node;
        if (
          row === Math.floor(this.state.width / 2) &&
          col === Math.floor(this.state.width / 2)
        ) {
          node = this.createNode(row, col, isEmpty, isStart);
          this.setState({ startR: row, startC: col });
        } else node = this.createNode(row, col, isEmpty);
        currentRow.push(node);
      }
      grid.push(currentRow);
    }
    return grid;
  };

  getNewGridWithWallToggled = (grid, row, col, val) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      isWall: val
    };
    newGrid[row][col] = newNode;
    return newGrid;
  };

  getNewGridWithStartToggled = (grid, row, col, val) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      isStart: val
    };
    newGrid[row][col] = newNode;
    return newGrid;
  };

  setNewGrid = (grid, row, col, isWall, isFilled) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      isWall: isWall,
      isFilled: isFilled
    };
    newGrid[row][col] = newNode;
    return newGrid;
  };

  setNewStart = (grid, row, col, val) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      istStart: val
    };
    newGrid[row][col] = newNode;
    return newGrid;
  };
}

export default Visualizer;
