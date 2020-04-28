import '../../../style.css';
import './infoboxstyle.css';
import React, {Component} from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';

export default class InfoBox extends Component {
    constructor(props) {
      super(props);
  
      this.state = {
      };
    }


    render() {
        return (<div>
          <Jumbotron className="infoBox-jumbotron">
                <h4>{this.props.title}</h4>    
                <p>{this.props.text}</p>
          </Jumbotron>
          </div>
        );
      }
    }
    
    export function renderToDOM(container) {
      render(<InfoBox />, container);
    }