import React, { Component } from "react";

const render = props => {
  return (
    <div className={props.className}>
      {props.children}
      <button onClick={props.onAddClick}>Plus</button>
    </div>
  );
};

const renderItem = props => {
  return (
    <div className={props.className} key={props.index}>
      {props.hasMoveDown &&
        <button onClick={props.onReorderClick(props.index, props.index + 1)}>Down</button>}
      {props.hasMoveUp &&
        <button onClick={props.onReorderClick(props.index, props.index - 1)}>Up</button>}
      <button onClick={props.onDropIndexClick(props.index)}>Delete</button>
      {props.children}
    </div>
  );
};

module.exports = {
  schema: {
    title: "Custom array of strings",
    type: "array",
    items: {
      type: "string"
    }
  },
  uiSchema: {
    "ui:options": { render, renderItem }
  },
  formData: ["react", "jsonschema", "form"]
};
