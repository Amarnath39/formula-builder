import React, { useState } from "react";
import "./style.css";

export default function App() {
  const [variables, setVariables] = useState([]);
  const [varName, setVarName] = useState("");
  const [varType, setVarType] = useState("CONST");
  const [varValue, setVarValue] = useState("");

  const [formulas, setFormulas] = useState([]);
  const [formulaName, setFormulaName] = useState("");
  const [formulaExpr, setFormulaExpr] = useState("");

  // Evaluate variable value (dynamic)
  const evaluateVariable = (name, seen = new Set()) => {
    if (seen.has(name)) throw new Error("Circular reference detected!");
    seen.add(name);

    const variable = variables.find(v => v.name === name);
    if (!variable) throw new Error(`Variable ${name} not found`);

    if (variable.type === "CONST") {
      return Number(variable.value);
    }

    // dynamic variable
    let expr = variable.value;
    variables.forEach(v => {
      expr = expr.replaceAll(v.name, evaluateVariable(v.name, new Set(seen)));
    });

    return eval(expr);
  };

  const addVariable = () => {
    if (!varName || !varValue) return alert("Please fill all fields");

    setVariables([...variables, { name: varName, type: varType, value: varValue }]);
    setVarName("");
    setVarValue("");
  };

  const deleteVariable = (name) => {
    setVariables(variables.filter(v => v.name !== name));
  };

  const addFormula = () => {
    if (!formulaName || !formulaExpr) return alert("Enter formula details");

    setFormulas([...formulas, { name: formulaName, expr: formulaExpr }]);
    setFormulaName("");
    setFormulaExpr("");
  };

  const executeFormula = (formula) => {
    let expr = formula.expr;

    // substitute dynamic variables
    variables.forEach(v => {
      try {
        const val = evaluateVariable(v.name);
        expr = expr.replaceAll(v.name, val);
      } catch (err) {
        console.error(err);
      }
    });

    // substitute contextual variables {{#var}}
    expr = expr.replace(/{{#(.*?)}}/g, (m, varName) => {
      const userInput = prompt(`Enter value for ${varName}`);
      return Number(userInput);
    });

    try {
      const result = eval(expr);
      alert(`Result: ${result}`);
    } catch {
      alert("Error evaluating formula.");
    }
  };

  return (
    <div className="container">
      <h1>Formula Builder</h1>

      {/* Variables Section */}
      <div className="section">
        <h2>Variables</h2>

        <div className="input-row">
          <input
            placeholder="Variable Name"
            value={varName}
            onChange={(e) => setVarName(e.target.value.toUpperCase())}
          />
          <select value={varType} onChange={(e) => setVarType(e.target.value)}>
            <option value="CONST">CONST</option>
            <option value="DYNAMIC">DYNAMIC</option>
          </select>
          <input
            placeholder="Value / Expression"
            value={varValue}
            onChange={(e) => setVarValue(e.target.value)}
          />
          <button className="btn" onClick={addVariable}>Add</button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Value/Expression</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {variables.map((v, i) => (
              <tr key={i}>
                <td data-label="Name">{v.name}</td>
                <td data-label="Type">{v.type}</td>
                <td data-label="Value">{v.value}</td>
                <td data-label="Action">
                  <button className="btn danger" onClick={() => deleteVariable(v.name)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulas Section */}
      <div className="section">
        <h2>Formulas</h2>

        <div className="input-row">
          <input
            placeholder="Formula Name"
            value={formulaName}
            onChange={(e) => setFormulaName(e.target.value.toUpperCase())}
          />
          <input
            placeholder="Expression"
            value={formulaExpr}
            onChange={(e) => setFormulaExpr(e.target.value)}
          />
          <button className="btn" onClick={addFormula}>Add</button>
        </div>

        <div className="formula-list">
          {formulas.map((f, index) => (
            <div className="formula-card" key={index}>
              <h3>{f.name}</h3>
              <p>{f.expr}</p>
              <button className="btn" onClick={() => executeFormula(f)}>Execute</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
