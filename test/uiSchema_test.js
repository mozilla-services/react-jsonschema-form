import { expect } from "chai";
import React from "react";
import { Simulate } from "react-addons-test-utils";

import { createFormComponent } from "./test_utils";

describe("uiSchema", () => {
  describe("custom classNames", () => {
    const schema = {
      type: "object",
      properties: {
        foo: {type: "string"},
        bar: {type: "string"},
      }
    };

    const uiSchema = {
      foo: { classNames: "class-for-foo"},
      bar: { classNames: "class-for-bar another-for-bar"},
    };

    it("should apply custom class names to target widgets", () => {
      const {node} = createFormComponent({schema, uiSchema});
      const [foo, bar] = node.querySelectorAll(".field-string");

      expect(foo.classList.contains("class-for-foo")).eql(true);
      expect(bar.classList.contains("class-for-bar")).eql(true);
      expect(bar.classList.contains("another-for-bar")).eql(true);
    });
  });

  describe("custom widget", () => {
    describe("root widget", () => {
      const schema = {
        type: "string"
      };

      const uiSchema = {
        "ui:widget": (props) => {
          return (
            <input type="text"
              className="custom"
              value={props.value}
              defaultValue={props.defaultValue}
              required={props.required}
              onChange={(event) => props.onChange(event.target.value)} />
          );
        }
      };

      it("should render a root custom widget", () => {
        const {node} = createFormComponent({schema, uiSchema});

        expect(node.querySelectorAll(".custom")).to.have.length.of(1);
      });
    });

    describe("nested widget", () => {
      const schema = {
        "type": "object",
        "properties": {
          "field": {
            "type": "string"
          }
        }
      };

      const uiSchema = {
        "field": {
          "ui:widget": "custom"
        }
      };

      const CustomWidget = (props) => {
        return (
          <input type="text"
            className="custom"
            value={props.value}
            defaultValue={props.defaultValue}
            required={props.required}
            onChange={(event) => props.onChange(event.target.value)} />
        );
      };

      const widgets = {
        custom: CustomWidget
      };

      it("should render a nested custom widget", () => {
        const {node} = createFormComponent({schema, uiSchema, widgets});

        expect(node.querySelectorAll(".custom")).to.have.length.of(1);
      });
    });
  });

  describe("ui:help", () => {
    it("should render the provided help text", () => {
      const schema = {type: "string"};
      const uiSchema = {"ui:help": "plop"};

      const {node} = createFormComponent({schema, uiSchema});

      expect(node.querySelector(".help-block").textContent).eql("plop");
    });
  });

  describe("string", () => {
    const schema = {
      type: "object",
      properties: {
        foo: {
          type: "string",
        }
      }
    };

    describe("textarea", () => {
      const uiSchema = {
        foo: {
          "ui:widget": "textarea"
        }
      };

      it("should accept a uiSchema object", () => {
        const {node} = createFormComponent({schema, uiSchema});

        expect(node.querySelectorAll("textarea"))
          .to.have.length.of(1);
      });

      it("should support formData", () => {
        const {node} = createFormComponent({schema, uiSchema, formData: {
          foo: "a"
        }});

        expect(node.querySelector("textarea").value)
          .eql("a");
      });

      it("should update state when text is updated is checked", () => {
        const {comp, node} = createFormComponent({schema, uiSchema, formData: {
          foo: "a"
        }});

        Simulate.change(node.querySelector("textarea"), {
          target: {value: "b"}
        });

        expect(comp.state.formData).eql({foo: "b"});
      });
    });

    describe("password", () => {
      const uiSchema = {
        foo: {
          "ui:widget": "password"
        }
      };

      it("should accept a uiSchema object", () => {
        const {node} = createFormComponent({schema, uiSchema});

        expect(node.querySelectorAll("[type=password]"))
          .to.have.length.of(1);
      });

      it("should support formData", () => {
        const {node} = createFormComponent({schema, uiSchema, formData: {
          foo: "a"
        }});

        expect(node.querySelector("[type=password]").value)
          .eql("a");
      });

      it("should update state when text is updated is checked", () => {
        const {comp, node} = createFormComponent({schema, uiSchema, formData: {
          foo: "a"
        }});

        Simulate.change(node.querySelector("[type=password]"), {
          target: {value: "b"}
        });

        expect(comp.state.formData).eql({foo: "b"});
      });
    });

    describe("hidden", () => {
      const uiSchema = {
        foo: {
          "ui:widget": "hidden"
        }
      };

      it("should accept a uiSchema object", () => {
        const {node} = createFormComponent({schema, uiSchema});

        expect(node.querySelectorAll("[type=hidden]"))
          .to.have.length.of(1);
      });

      it("should support formData", () => {
        const {node} = createFormComponent({schema, uiSchema, formData: {
          foo: "a"
        }});

        expect(node.querySelector("[type=hidden]").value)
          .eql("a");
      });

      it("should map widget value to a typed state one", () => {
        const {comp} = createFormComponent({schema, uiSchema, formData: {
          foo: "a"
        }});

        expect(comp.state.formData.foo).eql("a");
      });
    });
  });

  describe("string (enum)", () => {
    const schema = {
      type: "object",
      properties: {
        foo: {
          type: "string",
          enum: ["a", "b"],
        }
      }
    };

    describe("radio", () => {
      const uiSchema = {
        foo: {
          "ui:widget": "radio"
        }
      };

      it("should accept a uiSchema object", () => {
        const {node} = createFormComponent({schema, uiSchema});

        expect(node.querySelectorAll("[type=radio]"))
          .to.have.length.of(2);
      });

      it("should support formData", () => {
        const {node} = createFormComponent({schema, uiSchema, formData: {
          foo: "b"
        }});

        expect(node.querySelector("[type=radio][value=b]").checked)
          .eql(true);
      });

      it("should update state when value is updated", () => {
        const {comp, node} = createFormComponent({schema, uiSchema, formData: {
          foo: "a"
        }});

        Simulate.change(node.querySelector("[type=radio][value=b]"), {
          target: {checked: true}
        });

        expect(comp.state.formData).eql({foo: "b"});
      });
    });
  });

  describe("number", () => {
    const schema = {
      type: "object",
      properties: {
        foo: {
          type: "number",
        }
      }
    };

    describe("updown", () => {
      const uiSchema = {
        foo: {
          "ui:widget": "updown"
        }
      };

      it("should accept a uiSchema object", () => {
        const {node} = createFormComponent({schema, uiSchema});

        expect(node.querySelectorAll("[type=number]"))
          .to.have.length.of(1);
      });

      it("should support formData", () => {
        const {node} = createFormComponent({schema, uiSchema, formData: {
          foo: 3.14
        }});

        expect(node.querySelector("[type=number]").value)
          .eql("3.14");
      });

      it("should update state when value is updated", () => {
        const {comp, node} = createFormComponent({schema, uiSchema, formData: {
          foo: 3.14
        }});

        Simulate.change(node.querySelector("[type=number]"), {
          target: {value: "6.28"}
        });

        expect(comp.state.formData).eql({foo: 6.28});
      });
    });

    describe("range", () => {
      const uiSchema = {
        foo: {
          "ui:widget": "range"
        }
      };

      it("should accept a uiSchema object", () => {
        const {node} = createFormComponent({schema, uiSchema});

        expect(node.querySelectorAll("[type=range]"))
          .to.have.length.of(1);
      });

      it("should support formData", () => {
        const {node} = createFormComponent({schema, uiSchema, formData: {
          foo: 3.14
        }});

        expect(node.querySelector("[type=range]").value)
          .eql("3.14");
      });

      it("should update state when value is updated", () => {
        const {comp, node} = createFormComponent({schema, uiSchema, formData: {
          foo: 3.14
        }});

        Simulate.change(node.querySelector("[type=range]"), {
          target: {value: "6.28"}
        });

        expect(comp.state.formData).eql({foo: 6.28});
      });
    });

    describe("hidden", () => {
      const uiSchema = {
        foo: {
          "ui:widget": "hidden"
        }
      };

      it("should accept a uiSchema object", () => {
        const {node} = createFormComponent({schema, uiSchema});

        expect(node.querySelectorAll("[type=hidden]"))
          .to.have.length.of(1);
      });

      it("should support formData", () => {
        const {node} = createFormComponent({schema, uiSchema, formData: {
          foo: 42
        }});

        expect(node.querySelector("[type=hidden]").value)
          .eql("42");
      });

      it("should map widget value to a typed state one", () => {
        const {comp} = createFormComponent({schema, uiSchema, formData: {
          foo: 42
        }});

        expect(comp.state.formData.foo).eql(42);
      });
    });
  });

  describe("integer", () => {
    const schema = {
      type: "object",
      properties: {
        foo: {
          type: "integer",
        }
      }
    };

    describe("updown", () => {
      const uiSchema = {
        foo: {
          "ui:widget": "updown"
        }
      };

      it("should accept a uiSchema object", () => {
        const {node} = createFormComponent({schema, uiSchema});

        expect(node.querySelectorAll("[type=number]"))
          .to.have.length.of(1);
      });

      it("should support formData", () => {
        const {node} = createFormComponent({schema, uiSchema, formData: {
          foo: 3
        }});

        expect(node.querySelector("[type=number]").value)
          .eql("3");
      });

      it("should update state when value is updated", () => {
        const {comp, node} = createFormComponent({schema, uiSchema, formData: {
          foo: 3
        }});

        Simulate.change(node.querySelector("[type=number]"), {
          target: {value: "6"}
        });

        expect(comp.state.formData).eql({foo: 6});
      });
    });

    describe("range", () => {
      const uiSchema = {
        foo: {
          "ui:widget": "range"
        }
      };

      it("should accept a uiSchema object", () => {
        const {node} = createFormComponent({schema, uiSchema});

        expect(node.querySelectorAll("[type=range]"))
          .to.have.length.of(1);
      });

      it("should support formData", () => {
        const {node} = createFormComponent({schema, uiSchema, formData: {
          foo: 3
        }});

        expect(node.querySelector("[type=range]").value)
          .eql("3");
      });

      it("should update state when value is updated", () => {
        const {comp, node} = createFormComponent({schema, uiSchema, formData: {
          foo: 3
        }});

        Simulate.change(node.querySelector("[type=range]"), {
          target: {value: "6"}
        });

        expect(comp.state.formData).eql({foo: 6});
      });
    });

    describe("hidden", () => {
      const uiSchema = {
        foo: {
          "ui:widget": "hidden"
        }
      };

      it("should accept a uiSchema object", () => {
        const {node} = createFormComponent({schema, uiSchema});

        expect(node.querySelectorAll("[type=hidden]"))
          .to.have.length.of(1);
      });

      it("should support formData", () => {
        const {node} = createFormComponent({schema, uiSchema, formData: {
          foo: 42
        }});

        expect(node.querySelector("[type=hidden]").value)
          .eql("42");
      });

      it("should map widget value to a typed state one", () => {
        const {comp} = createFormComponent({schema, uiSchema, formData: {
          foo: 42
        }});

        expect(comp.state.formData.foo).eql(42);
      });
    });
  });

  describe("boolean", () => {
    const schema = {
      type: "object",
      properties: {
        foo: {
          type: "boolean",
        }
      }
    };

    describe("radio", () => {
      const uiSchema = {
        foo: {
          "ui:widget": "radio"
        }
      };

      it("should accept a uiSchema object", () => {
        const {node} = createFormComponent({schema, uiSchema});

        expect(node.querySelectorAll("[type=radio]"))
          .to.have.length.of(2);
        expect(node.querySelector("[type=radio][value=true]"))
          .not.eql(null);
        expect(node.querySelector("[type=radio][value=false]"))
          .not.eql(null);
      });

      it("should render boolean option labels", () => {
        const {node} = createFormComponent({schema, uiSchema});
        const labels = [].map.call(
          node.querySelectorAll(".field-radio-group label > span"),
          node => node.textContent);

        expect(labels)
          .eql(["true", "false"]);
      });

      it("should support formData", () => {
        const {node} = createFormComponent({schema, uiSchema, formData: {
          foo: false
        }});

        expect(node.querySelector("[type=radio][value=false]").checked)
          .eql(true);
      });

      it("should update state when false is checked", () => {
        const {comp, node} = createFormComponent({schema, uiSchema, formData: {
          foo: true
        }});

        Simulate.change(node.querySelector("[type=radio][value=false]"), {
          target: {checked: true}
        });

        expect(comp.state.formData).eql({foo: false});
      });

      it("should update state when true is checked", () => {
        const {comp, node} = createFormComponent({schema, uiSchema, formData: {
          foo: false
        }});

        Simulate.change(node.querySelector("[type=radio][value=true]"), {
          target: {checked: true}
        });

        expect(comp.state.formData).eql({foo: true});
      });
    });

    describe("select", () => {
      const uiSchema = {
        foo: {
          "ui:widget": "select"
        }
      };

      it("should accept a uiSchema object", () => {
        const {node} = createFormComponent({schema, uiSchema});

        expect(node.querySelectorAll("select option"))
          .to.have.length.of(2);
      });

      it("should render boolean option labels", () => {
        const {node} = createFormComponent({schema, uiSchema});

        expect(node.querySelectorAll("option")[0].textContent)
          .eql("true");
        expect(node.querySelectorAll("option")[1].textContent)
          .eql("false");
      });

      it("should update state when true is selected", () => {
        const {comp, node} = createFormComponent({schema, uiSchema, formData: {
          foo: false
        }});

        Simulate.change(node.querySelector("select"), {
          // DOM option change events always return strings
          target: {value: "true"}
        });

        expect(comp.state.formData).eql({foo: true});
      });

      it("should update state when false is selected", () => {
        const {comp, node} = createFormComponent({schema, uiSchema, formData: {
          foo: false
        }});

        Simulate.change(node.querySelector("select"), {
          // DOM option change events always return strings
          target: {value: "false"}
        });

        expect(comp.state.formData).eql({foo: false});
      });
    });

    describe("hidden", () => {
      const uiSchema = {
        foo: {
          "ui:widget": "hidden"
        }
      };

      it("should accept a uiSchema object", () => {
        const {node} = createFormComponent({schema, uiSchema});

        expect(node.querySelectorAll("[type=hidden]"))
          .to.have.length.of(1);
      });

      it("should support formData", () => {
        const {node} = createFormComponent({schema, uiSchema, formData: {
          foo: true
        }});

        expect(node.querySelector("[type=hidden]").value)
          .eql("true");
      });

      it("should map widget value to a typed state one", () => {
        const {comp} = createFormComponent({schema, uiSchema, formData: {
          foo: true
        }});

        expect(comp.state.formData.foo).eql(true);
      });
    });
  });

  describe("custom root field id", () => {
    it("should use a custom root field id for objects", () => {
      const schema = {
        type: "object",
        properties: {
          foo: {type: "string"},
          bar: {type: "string"},
        }
      };
      const uiSchema = {"ui:rootFieldId": "myform"};
      const {node} = createFormComponent({schema, uiSchema});

      const ids = [].map.call(node.querySelectorAll("input[type=text]"),
                              node => node.id);
      expect(ids).eql(["myform_foo", "myform_bar"]);
    });

    it("should use a custom root field id for arrays", () => {
      const schema = {
        type: "array",
        items: {type: "string"},
      };
      const uiSchema = {"ui:rootFieldId": "myform"};
      const {node} = createFormComponent({schema, uiSchema, formData: [
        "foo",
        "bar"
      ]});

      const ids = [].map.call(node.querySelectorAll("input[type=text]"),
                              node => node.id);
      expect(ids).eql(["myform_0", "myform_1"]);
    });

    it("should use a custom root field id for array of objects", () => {
      const schema = {
        type: "array",
        items: {
          type: "object",
          properties: {
            foo: {type: "string"},
            bar: {type: "string"},
          }
        },
      };
      const uiSchema = {"ui:rootFieldId": "myform"};
      const {node} = createFormComponent({schema, uiSchema, formData: [
        {foo: "foo1", bar: "bar1"},
        {foo: "foo2", bar: "bar2"},
      ]});

      const ids = [].map.call(node.querySelectorAll("input[type=text]"),
                              node => node.id);
      expect(ids).eql([
        "myform_0_foo",
        "myform_0_bar",
        "myform_1_foo",
        "myform_1_bar"
      ]);
    });
  });
});
