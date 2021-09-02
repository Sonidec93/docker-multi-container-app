import React, { Component } from 'react';
import AppCss from './App.module.css';
import axios from "axios"
class App extends Component {

  state = {
    value: 0,
    indices: [],
    calculatedValues: {}
  }
  inpRef = React.createRef("")



  async fetchIndices() {
    try {
      let response = await axios.get("http://localhost:5000/values/all");
      console.log(`Indices fetched ${response.data}`)
      this.setState({ indices: response.data || [] })
    } catch (err) {
      throw err
    }
  }


  async fetchIndicesWithValues() {
    try {
      let response = await axios.get("http://localhost:5000/values/current")
      console.log(`calculated Values ${response.data}`)
      this.setState({ calculatedValues: response.data || {} })
    } catch (err) {
      throw err;
    }

  }
  componentDidMount() {
    Promise.all([this.fetchIndicesWithValues(), this.fetchIndices()]).catch(err => console.log("error occurred while fetching data from node server"))
  }

  async onSubmit() {
    try {
      console.log("submitted", this.inpRef.current.value);
      let response = await axios.post("http://localhost:5000/values", { index: +this.inpRef.current.value });
      console.log(`data sent successfully ${response.data}`);
      this.inpRef.current.value = 0;
      this.fetchIndices();
      this.fetchIndicesWithValues();
    } catch (err) {
      console.log(`Error occured while fetching data ${err}`)
    }
  }
  render() {
    return (
      <React.Fragment>
        <div className={AppCss["app-heading"]}>
          Fibonacci Calculator
        </div>
        <div className={AppCss["app-form"]}>
          <b>Enter a value</b>
          <input type="number" max="10" min="0" ref={this.inpRef} />
          <button onClick={this.onSubmit.bind(this)}>Submit</button>
        </div>
        <div className={AppCss["app-indices"]}>
          <b>Indices i have already seen</b>
          <div>{this.state.indices.map(x => x.number).join(",")}</div>
        </div>
        <div className={AppCss["app-values"]}>
          <b>Indices with values </b>
          <div>{Object.entries(this.state.calculatedValues).map(([key, value]) => {
            return (<div>{`for index ${key} the value is : ${value}`}</div>)
          })}</div>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
