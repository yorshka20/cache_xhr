import React, { ChangeEvent, useState } from "react";

import "./App.css";

import CacheXHR from "./xhr";

function App() {
  const [input, setInput] = useState("");

  const send = () => {
    console.log("input", input);
    const xhr = new CacheXHR(100);

    const url = `http://${input}`;
    xhr
      .get(url)
      .then((res) => {
        console.log("res", res);
        const container = document.getElementById("result");

        container!.innerText = res + "\n";
      })
      .catch((err) => {
        console.log("err", err);
        const container = document.getElementById("result");

        container!.innerText = "request error" + "\n";
      });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e;

    setInput(value);
  };

  return (
    <div className="App">
      <header className="App-header">Cache xhr test</header>

      <div className="inputWrapper">
        <input onChange={handleChange} placeholder="url" type="text" />
        <button onClick={send}>send</button>
      </div>

      <div className="result" id="result"></div>
    </div>
  );
}

export default App;
