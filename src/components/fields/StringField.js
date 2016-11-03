import React, {PropTypes} from "react";

import {
  defaultFieldValue,
  getDefaultWidget,
  getAlternativeWidget,
  optionsList,
  getDefaultRegistry
} from "../../utils";

function StringField(props) {
  const {
    schema,
    name,
    uiSchema,
    idSchema,
    formData,
    registry,
    required,
    disabled,
    readonly,
    autofocus,
    onChange
  } = props;
  const {title} = schema;
  const {widgets, formContext} = registry;
  const widget = uiSchema["ui:widget"] || schema.format;
  const placeholder = uiSchema["ui:placeholder"] || "";
  const commonProps = {
    schema,
    id: idSchema && idSchema.$id,
    label: (title === undefined) ? name : title,
    value: defaultFieldValue(formData, schema),
    onChange,
    required,
    disabled,
    readonly,
    formContext,
    autofocus,
  };
  if (Array.isArray(schema.enum)) {
    const enumOptions = optionsList(schema);
    if (widget) {
      const Widget = getAlternativeWidget(schema, widget, widgets, {enumOptions});
      return <Widget {...commonProps}/>;
    }
    const Widget = getDefaultWidget(schema);
    return <Widget options={{enumOptions}} {...commonProps}/>;
  }
  if (widget) {
    const Widget = getAlternativeWidget(schema, widget, widgets);
    return <Widget {...commonProps} placeholder={placeholder}/>;
  }
  const Widget = getDefaultWidget(schema);
  return <Widget {...commonProps} placeholder={placeholder}/>;
}

if (process.env.NODE_ENV !== "production") {
  StringField.propTypes = {
    schema: PropTypes.object.isRequired,
    uiSchema: PropTypes.object.isRequired,
    idSchema: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    formData: PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
    ]),
    registry: PropTypes.shape({
      widgets: PropTypes.objectOf(PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.object,
      ])).isRequired,
      fields: PropTypes.objectOf(PropTypes.func).isRequired,
      definitions: PropTypes.object.isRequired,
      formContext: PropTypes.object.isRequired,
    }),
    formContext: PropTypes.object.isRequired,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    readonly: PropTypes.bool,
    autofocus: PropTypes.bool,
  };
}

StringField.defaultProps = {
  uiSchema: {},
  registry: getDefaultRegistry(),
  disabled: false,
  readonly: false,
  autofocus: false,
};

export default StringField;
