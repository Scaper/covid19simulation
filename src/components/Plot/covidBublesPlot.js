import {XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
  VerticalBarSeriesCanvas,
  LineSeries,
  FlexibleXYPlot,
  FlexibleWidthXYPlot,
  FlexibleHeightXYPlot,
  AreaSeries,
  MarkSeries,
  Hint} from 'react-vis';
import React from 'react';
import './covidPlot.css';
import InfoBox from '../Infobox/InfoBox'

const axisStyle = {
  ticks: {
    fontSize: '0.7rem',
    color: '#333'
  },
  title: {
    fontSize: '0.7rem',
    color: '#333'
  }
};

export default class CovidBublesPlot extends React.Component {


  
  constructor(props) {
    super(props);

    this.state = {
       value: false,
       population : false,
       data : false,
       meanx : false,
       meany : false
    }
 }
componentWillMount = () =>
{
  this.SetPopulation();
}
SetPopulation = () =>
{
  var d = this.props.data
  var data = []
  for(var l = 0; l<this.props.data.NumberOfLocations; l++)
  {
     var i = l*this.props.data.NumberOfDays
     var sum = d.Infectuous[i] + d.Exposed[i] + d.Susceptible[i] + d.Presymptomatic[i] + d.Dead[i] + d.Asymptomatic[i] + d.Immunized[i]
     //console.log(l + " " + i + " " +sum)
     data[l] = sum+0.0000001
  }
  this.setState({population : data})
}

getLocations = () =>
{
    var data = []
    for(var l = 0; l<this.props.data.NumberOfLocations; l++)
    {
        data[l] = {l:l}
    }
    return data;
}

getVal = (l,data,time) =>
{
    var n = this.props.data.NumberOfDays
    var t0 = Math.floor(time)
    var t1 = Math.ceil(time)
    var dt = t1-t0
    var val = (t1-time)/dt * data[t0 + l*n] + (time-t0)/dt*data[t1+l*n]
    return val
}

// Calculate total number of infections in zone
getX = (l,time) =>
{
    var nsus = this.getVal(l,this.props.data.Susceptible,time);
    var pop = this.state.population[l] 
    var val = (pop - nsus)/pop * 100;
    //console.log("y = " + val) 
    return val ;
}
// Caluclate number of new infections during day. Equals number of 
getY = (l,time) =>
{
    if(time < 1)
    {
      return 0.00000000001
    }
    const x1 = this.getVal(l,this.props.data.Susceptible,time)
    let x0 = x1
    let interval = 20
    let val = 0
    if(time > 1)
    {
        if(time < interval)
        {
            interval = time-1
            x0 = this.getVal(l,this.props.data.Susceptible,1.00000001)
            val = ((x0-x1) / this.state.population[l] / interval ) * 100;
            //console.log("x0=" + x0 + " dt=" + interval + " x1=" + x1 + " val=" + val + "time=" + time)

        }
        else
            x0 = this.getVal(l,this.props.data.Susceptible,time-interval)
    }
    val = ((x0-x1) / this.state.population[l] / interval ) * 100;
    //console.log("x = " + val  + " " + this.state.population[l] + " " + (x1-x0))
    return val
}
getSize = (l,time) =>
{
    var val  = this.state.population[l];
    //console.log("s = " + val)

    return Math.sqrt(val)

}

setData = (nextProps) => 
{
    var data = []
    var nloc = this.props.data.NumberOfLocations
    var meanx = 0
    var meany = 0
    var pop = 0
    for(var l = 0; l<nloc; l++)
    {
        var x = this.getX(l,nextProps.time)
        var y = this.getY(l,nextProps.time)
        var s = this.getSize(l,nextProps.time)
        meanx+=x*this.state.population[l]
        meany+=y*this.state.population[l]
        pop+=this.state.population[l]
        data[l] = {x: x, y: y, size: s}
        //console.log(this.props.time + " " + l + " "  + this.getX(l) + " " + this.getY(l) + " " +this.getSize(l) + " " )
    }
    //console.log(data)
    meanx = meanx/pop
    meany = meany/pop
    //console.log(data)
    this.setState({meanx,meany,data})
}
componentWillReceiveProps(nextProps) {
  this.setData(nextProps);
}
    render() {
        var data = this.state.data
        //console.log(data)
        const markSeriesProps = {
            className: 'covidbubles',
            seriesId: 'covidbubles-scatterplot',
            opacityType: 'literal',
            data,
            sizeRange:[0.1, 5]
            //onNearestXY: value => this.setState({value})
          };

        return (
          <div>
          <div className="covidbubles-plot-info">
          <InfoBox
          title={"Covid-19 per zone"}
          text={"Each bubble represent one zone. The size represent the population of the zone. The x-axis shows the percentage of the popoulation in the zone that became infected on the current day, and the y-axis shows the total number of infections in the zone."}
          />
          </div>
        <div className="covidbubles-plot">
        <FlexibleXYPlot 
        opacity = {0.4}
        yDomain={[0,3]}
        xDomain={[0,100]}
        >
        <XAxis style = {axisStyle} title="Total infected (%)"/>
          <YAxis style = {axisStyle} title="Infected per day (%)"/>
          {data &&<MarkSeries 
             {...markSeriesProps}
          />}
          {this.state.value ? <Hint value={this.state.value} /> : null}
          <LineSeries data={[{x: 0, y: this.state.meany}, {x: this.state.meanx, y: this.state.meany}, {x: this.state.meanx, y: 0}]} opacity = {0.7} strokeWidth={0.6}/>
          </FlexibleXYPlot>
        </div>
        </div>

        )
    }

}