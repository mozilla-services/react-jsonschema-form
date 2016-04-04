module.exports = {
  schema: {
    title: "Widgets",
    type: "object",
    properties: {
      boolean: {
        type: "object",
        title: "Boolean field",
        properties: {
          default: {
            type: "boolean",
            title: "checkbox (default)"
          },
          radio: {
            type: "boolean",
            title: "radio buttons"
          },
          select: {
            type: "boolean",
            title: "select box"
          }
        }
      },
      string: {
        type: "object",
        title: "String field",
        properties: {
          default: {
            type: "string",
            title: "text input (default)"
          },
          textarea: {
            type: "string",
            title: "textarea"
          }
        }
      },
      secret: {
        type: "string",
        default: "I'm a hidden string."
      }
    }
  },
  uiSchema: {
    boolean: {
      radio: {
        "ui:widget": "radio"
      },
      select: {
        "ui:widget": "select"
      }
    },
    string: {
      textarea: {
        "ui:widget": "textarea"
      }
    },
    secret: {
      "ui:widget": "hidden"
    }
  },
  formData: {
    boolean: {
      default: true,
      radio: true,
      select: true
    },
    string: {
      default: "Hello...",
      textarea: "... World"
    },
    secret: "I'm a hidden string."
  }
};
