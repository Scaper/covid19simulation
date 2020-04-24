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
  ChartLabel,
  AreaSeries,
  DiscreteColorLegend} from 'react-vis';
import React from 'react';
import './covidPlot.css';


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



export default class CovidPlot extends React.Component {


  
  constructor(props) {
    super(props);

    this.state = {
       dataPre : [],
       dataInf : [],
       dataInfTot : [],
       dataExp : [],
       dataSuc : [],
       dataDead : [],
       dataAss : [],
       dataImm : [],
       datapop : [],
       popTotal : 0,

    }
 }
componentWillMount = () =>
{
  this.setState({dataInf : this.GetXY(this.props.data.Infectuous)})
  this.setState({dataExp : this.GetXY(this.props.data.Exposed)})
  var dataSuc = this.GetXY(this.props.data.Susceptible)
  this.setState({dataSuc : dataSuc})
  this.setState({dataPre : this.GetXY(this.props.data.Presymptomatic)})
  var dataDead = this.GetXY(this.props.data.Dead)
  

  this.setState({dataAss : this.GetXY(this.props.data.Asymptomatic)})
  this.setState({dataImm : this.GetXY(this.props.data.Immunized)})
  var totalp = this.SetPopulation()
  this.setState({dataInfTot: this.GetTotalInfected(dataSuc,dataDead,totalp)})
  this.setState({dataDead : dataDead.filter(d=>d.y>0.5)})
}

SetPopulation = () =>
{
  var d = this.props.data
  var data = []
  var sump = 0
  for(var l = 0; l<this.props.data.NumberOfLocations; l++)
  {
     var i = l*this.props.data.NumberOfDays
     var sum = d.Infectuous[i] + d.Exposed[i] + d.Susceptible[i] + d.Presymptomatic[i] + d.Dead[i] + d.Asymptomatic[i] + d.Immunized[i]
     //console.log(l + " " + i + " " +sum)
     data[l] = sum+0.0000001
     sump +=sum
  }
  this.setState({datapop : data, popTotal : sump})
  return sump
}

GetXY = (d) =>
{
  var data = []
  for(var t = 0; t<this.props.data.NumberOfDays; t++)
  {
    data[t] = {x:t, y:0.0000001}
  }
  for(var l = 0; l<this.props.data.NumberOfLocations; l++)
  {
    for(var t = 0; t<this.props.data.NumberOfDays; t++)
    {
      data[t].y += d[t+l*this.props.data.NumberOfDays]
    }
  }
  return data 
}
GetTotalInfected = (dsuc,dataDead,popTotal) =>
{
  var data = []
  for(var t = 0; t<this.props.data.NumberOfDays; t++)
  {
    data[t] = {x:t, y:popTotal-dsuc[t].y-dataDead[t].y}
  }
  return data
}
    render() {
      //console.log(this.state.data)
return (
  <div className="grid-container">
    <div className="item1">
        <FlexibleXYPlot  
        stackBy="y"
        opacity = {1}
        xDomain={[0,this.props.time]}
        >
          <DiscreteColorLegend style = {{position: 'absolute', left: '70px', top: '-10px', fontSize:'0.7rem'}}
            items={[
                'Exposed',
                'Presymptomatic',
                'Infectuous',
                'Assymptomatic'
            ]}
            orientation="horizontal"

          />
          <YAxis style = {axisStyle} title="Number of active cases in 1000" tickFormat={v=>v/1000} />
          <AreaSeries  data = {this.state.dataExp} />
          <AreaSeries  data = {this.state.dataPre} />
          <AreaSeries  data = {this.state.dataInf} />
          <AreaSeries  data = {this.state.dataAss} />
          </FlexibleXYPlot>
      </div>
      <div className="item2">
        <FlexibleXYPlot  
        stackBy="y"
        opacity = {1}
        xDomain={[0,this.props.time]}
        yDomain={[1,1000000]}
        yType={'log'}
        >
           <DiscreteColorLegend style = {{position: 'absolute', left: '70px', top: '-10px', fontSize:'0.7rem'}}
            items={[
                'Dead',
                'Infected total',
            ]}
            orientation="horizontal"

          />
          <XAxis style = {axisStyle} title="Days"/>
          <YAxis style = {axisStyle} title="Total Number of cases"/>
          <LineSeries  data = {this.state.dataDead}/>
          <LineSeries  data = {this.state.dataInfTot}/>
          </FlexibleXYPlot>
      </div>
</div>
)}

}