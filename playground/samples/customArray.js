import React, { Component } from "react";

const ArrayFieldTemplate = props => (
  <div className={props.className}>
    {props.children}
    <div className="row">
      <p className="col-xs-3 col-xs-offset-9 array-item-add text-right">
        <button onClick={props.onAddClick} type="button">Custom +</button>
      </p>
    </div>
  </div>
);

module.exports = {
  schema: {
    title: "Custom array of strings",
    type: "array",
    items: {
      type: "string"
    }
  },
  formData: ["react", "jsonschema", "form"],
  ArrayFieldTemplate
};
