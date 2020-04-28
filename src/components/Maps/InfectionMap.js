import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer,ArcLayer, PolygonLayer} from '@deck.gl/layers';
import {LightingEffect, AmbientLight, _SunLight as SunLight} from '@deck.gl/core';
import { INITIAL_VIEW_STATE } from './viewstates'
import '../../../style.css';
import emmedata from '../../../data/geojson/emmeNoWaterEPSG4326_simple.json';
import waterdata from '../../../data/geojson/water.json';
import InfoBox from '../InfoBox/InfoBox'

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 2.0
});

const dirLight = new SunLight({
  timestamp: Date.UTC(2019, 7, 1, 10),
  color: [255, 255, 255],
  intensity: 1.0,
  _shadow: true
});

const landCover = [[[19.7, 61.2], [15.5, 61.2], [15.5, 58], [19.7, 58]]];

export default class InfectionMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sidebarOpen : true,
      population: false
    };
    const lightingEffect = new LightingEffect({ambientLight, dirLight});
    lightingEffect.shadowColor = [0, 0, 0, 0.1];
    this._effects = [lightingEffect];
  }
  

  componentWillMount = () =>
  {    
    this.SetPopulation()
  }
  getColor = (x,population) =>
  {
    var coronaData = this.props.coronaData
    var zone = x.properties.ID;
    if(zone > coronaData.NumberOfLocations)
       return -0.01;
    
    var ntime = coronaData.NumberOfDays;
    var t = Math.round(this.props.time)
    var i = t + zone *ntime;
    if(population[zone] < 1)
      return 0.0000001

    var val = ( coronaData.Infectuous[i ] + coronaData.Exposed[i ] + coronaData.Asymptomatic[i ] + coronaData.Presymptomatic[i ]) / population[zone]
    //console.log(coronaData.Infectuous)
    //console.log(this.state.time + " " + t + " " + zone + " " + ntime + " " + " " + i + " " + val);
    return val*5;
  }
  getHeight = (x,population) =>
  {
    var coronaData = this.props.coronaData
    var zone = x.properties.ID;
    if(zone > coronaData.NumberOfLocations)
       return -0.01;

    var ntime = coronaData.NumberOfDays;
    var t = Math.round(this.props.time)
    if(population[zone] < 1)
      return 0.0000001

    var val =  (population[zone] - coronaData.Susceptible[t + zone *ntime ])/population[zone] 

    //console.log(coronaData.Infectuous)
    //console.log(this.state.time + " " + t + " " + zone + " " + ntime + " " + " " + i + " " + val);
    //console.log(val)
    return val*400;
  }
  SetPopulation = () =>
  {
    var coronaData = this.props.coronaData

    var data = []
    for(var l = 0; l<coronaData.NumberOfLocations; l++)
    {
       var i = l*coronaData.NumberOfDays
       var sum = coronaData.Infectuous[i] + coronaData.Exposed[i] + coronaData.Susceptible[i] + coronaData.Presymptomatic[i] + coronaData.Dead[i] + coronaData.Asymptomatic[i] + coronaData.Immunized[i]
       //console.log(l + " " + i + " " +sum)
       data[l] = sum+0.0000001
    }
    this.setState({population : data})
    console.log("population set in ScaperCovid19.js")
  }
  totalHeight = () => 
  {
    var coronaData = this.props.coronaData
    var ntime = coronaData.NumberOfDays;
    var t = Math.round(this.props.time)
    var val = 0.01
    for(var zone = 0;zone < coronaData.NumberOfLocations; zone++ )
    {
      val += coronaData.Infectuous[t + zone *ntime ]
    }
    return val;
  }
  hue2rgb = (p, q, t) => {
    if(t < 0) t += 1;
    if(t > 1) t -= 1;
    if(t < 1/6) return p + (q - p) * 6 * t;
    if(t < 1/2) return q;
    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}
hslToRgb = (h, s, l) => {
var r, g, b;
l = l<1 ? l : 0.9999;
l = 1-l; 
if(s <= 0){
r = g = b = l; // achromatic
} else if (l==1)
{
r = 0.8;
g = 0.8;
b = 0.8;
} else{
 

var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
var p = 2 * l - q;
r = this.hue2rgb(p, q, h + 1/3);
g = this.hue2rgb(p, q, h);
b = this.hue2rgb(p, q, h - 1/3);
}

return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

  _renderLayers = () => {
    var d0 = Date.now()
    var totalHeight= this.totalHeight()
    //console.log(totalHeight)
    //console.log("hej")
    var pop = this.state.population;
    return [
      // only needed when using shadows - a plane for shadows to drop on
      new PolygonLayer({
        id: 'ground',
        data: landCover,
        stroked: false,
        getPolygon: f => f,
        getElevation: f=>0.1,
        getFillColor: [255,255,255]
      }),
      new GeoJsonLayer({
        id: 'inf',
        data: emmedata,
        opacity: 0.7,
        stroked: true,
        wireframe: true,
        filled: true,
        extruded: true,
        getElevation: f => this.getHeight(f,pop)*100,
        getFillColor: f => this.hslToRgb(0, 0.58, this.getColor(f,pop)),
        getLineWidth: 1,
        getLineColor: [0,0,0],
        pickable: true,
        onHover:this._onHover,
        updateTriggers : {
          getElevation : Math.round(this.props.time),
          getFillColor : Math.round(this.props.time),
        }
      }),
      new GeoJsonLayer({
        id: 'water',
        data:waterdata,
        opacity: 1,
        stroked: false,
        filled: true,
        extruded: true,
        wireframe: true,
        getElevation: f => 2,
        getFillColor: [190, 207, 232,110],
        getLineColor: [255, 255, 255],
        pickable: true,
        onHover: this._onHover
      }),
    ];
  }
  
  render() {
    const {mapStyle = 'mapbox://styles/mapbox/light-v9'} = this.props;
    console.log(this.props.coronaData)

    return (
      <div>

      <div>
      
        <DeckGL
          layers={this._renderLayers()}
          effects={this._effects}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
        >
          {this._renderTooltip}
        </DeckGL>
      </div>

      <div className="map-plot-info">
      <InfoBox
       title={"Covid-19 per zone"}
       text={"The height represent the share of the population that has been infected. \n The color shows the current infection rate in the zone."}
       />
       </div>

      
      </div>
    );
  }
}

export function renderToDOM(container) {
  render(<InfectionMap />, container);
}