import React, {Component} from 'react';
import {render} from 'react-dom';

import TimeBar from './components/TimeBar/TimeBar';

import './../style.css';

import coronaData from './../data/simulations/CoronaScaper.json';

import CovidPlot from './components/Plot/covidPlot';
import CovidBublesPlot from './components/Plot/covidBublesPlot';
import InfectionMap from './components/Maps/InfectionMap';


export default class BublePlot extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sidebarOpen : true,
      time: 0,
    };
  }
  

  componentWillMount = () =>
  {
  
  }
  setTime = (time) =>
  {
      this.setState({time:time})
  }
  render() {
    let background;
       
    if (this.props.display == "bublesplot")
    {
      background = <CovidBublesPlot
      data = {coronaData}
      time = {this.state.time}
      ></CovidBublesPlot>
    }
    else
    {
      console.log("main:")
      console.log(coronaData)
      background = <InfectionMap
            coronaData = {coronaData}
            time = {this.state.time}
            ></InfectionMap>

    }

    return (

      

      <div>
        {
          <TimeBar
            left={this.state.sidebarOpen ? "calc(170px + 10px)" : "100vw"}
            time = {this.state.time}
            min = {0}
            max = {coronaData.NumberOfDays}
            setTime={this.setTime}
            loaded = {true}
          />

        }
        {
        background       
        
        }
        {
        <CovidPlot
        data = {coronaData}
        time = {this.state.time}
        ></CovidPlot>
      }
      </div>
    );
  }
}

export function renderToDOM(container) {
  render(<BublePlot  />, container);
}