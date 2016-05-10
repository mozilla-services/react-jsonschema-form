import { expect } from "chai";
import sinon from "sinon";
import React from "react";
import { renderIntoDocument } from "react-addons-test-utils";
import { findDOMNode } from "react-dom";

import Form from "../src";
import {
  createFormComponent,
  createSandbox,
  Simulate,
  updateComponentProps
} from "./test_utils";


describe("Form", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Empty schema", () => {
    it("should render a form tag", function*() {
      const {node} = yield createFormComponent({schema: {}});

      expect(node.tagName).eql("FORM");
    });

    it("should render a submit button", function*() {
      const {node} = yield createFormComponent({schema: {}});

      expect(node.querySelectorAll("button[type=submit]"))
        .to.have.length.of(1);
    });

    it("should render children buttons", () => {
      const props = {schema: {}};
      const comp = renderIntoDocument(
        <Form {...props}>
          <button type="submit">Submit</button>
          <button type="submit">Another submit</button>
        </Form>
      );
      const node = findDOMNode(comp);
      expect(node.querySelectorAll("button[type=submit]"))
        .to.have.length.of(2);
    });
  });

  describe("Custom submit buttons", () => {
    it("should submit the form when clicked", function*() {
      const onSubmit = sandbox.spy();
      const comp = renderIntoDocument(
        <Form onSubmit={ onSubmit } schema={ {} }>
          <button type="submit">Submit</button>
          <button type="submit">Another submit</button>
        </Form>
      );

      yield new Promise(setImmediate);

      const node = findDOMNode(comp);
      const buttons = node.querySelectorAll("button[type=submit]");
      buttons[0].click();
      buttons[1].click();

      yield new Promise(setImmediate);

      sinon.assert.calledTwice(onSubmit);
    });
  });

  describe("Schema definitions", () => {
    it("should use a single schema definition reference", function*() {
      const schema = {
        definitions: {
          testdef: {type: "string"}
        },
        $ref: "#/definitions/testdef"
      };

      const {node} = yield createFormComponent({schema});

      expect(node.querySelectorAll("input[type=text]"))
        .to.have.length.of(1);
    });

    it("should handle multiple schema definition references", function*() {
      const schema = {
        definitions: {
          testdef: {type: "string"}
        },
        type: "object",
        properties: {
          foo: {$ref: "#/definitions/testdef"},
          bar: {$ref: "#/definitions/testdef"},
        }
      };

      const {node} = yield createFormComponent({schema});

      expect(node.querySelectorAll("input[type=text]"))
        .to.have.length.of(2);
    });

    it("should handle deeply referenced schema definitions", function*() {
      const schema = {
        definitions: {
          testdef: {type: "string"}
        },
        type: "object",
        properties: {
          foo: {
            type: "object",
            properties: {
              bar: {$ref: "#/definitions/testdef"},
            }
          }
        }
      };

      const {node} = yield createFormComponent({schema});

      expect(node.querySelectorAll("input[type=text]"))
        .to.have.length.of(1);
    });

    it("should handle referenced definitions for array items", function*() {
      const schema = {
        definitions: {
          testdef: {type: "string"}
        },
        type: "object",
        properties: {
          foo: {
            type: "array",
            items: {$ref: "#/definitions/testdef"}
          }
        }
      };

      const {node} = yield createFormComponent({schema, formData: {
        foo: ["blah"]
      }});

      expect(node.querySelectorAll("input[type=text]"))
        .to.have.length.of(1);
    });

    it("should raise for non-existent definitions referenced", () => {
      const schema = {
        type: "object",
        properties: {
          foo: {$ref: "#/definitions/nonexistent"},
        }
      };

      expect(() => createFormComponent({schema}))
        .to.Throw(Error, /#\/definitions\/nonexistent/);
    });

    it("should propagate referenced definition defaults", function*() {
      const schema = {
        definitions: {
          testdef: {type: "string", default: "hello"}
        },
        $ref: "#/definitions/testdef"
      };

      const {node} = yield createFormComponent({schema});

      expect(node.querySelector("input[type=text]").value)
        .eql("hello");
    });

    it("should propagate nested referenced definition defaults", function*() {
      const schema = {
        definitions: {
          testdef: {type: "string", default: "hello"}
        },
        type: "object",
        properties: {
          foo: {$ref: "#/definitions/testdef"}
        }
      };

      const {node} = yield createFormComponent({schema});

      expect(node.querySelector("input[type=text]").value)
        .eql("hello");
    });

    it("should propagate referenced definition defaults for array items", function*() {
      const schema = {
        definitions: {
          testdef: {type: "string", default: "hello"}
        },
        type: "array",
        items: {
          $ref: "#/definitions/testdef"
        }
      };

      const {node} = yield createFormComponent({schema});

      yield Simulate.click(node.querySelector(".array-item-add button"));

      expect(node.querySelector("input[type=text]").value)
        .eql("hello");
    });

    it("should priorize definition over schema type property", function*() {
      // Refs bug #140
      const schema = {
        type: "object",
        properties: {
          name: {type: "string"},
          childObj: {
            type: "object",
            $ref: "#/definitions/childObj"
          }
        },
        definitions: {
          childObj: {
            type: "object",
            properties: {
              otherName: {type: "string"}
            }
          }
        }
      };

      const {node} = yield createFormComponent({schema});

      expect(node.querySelectorAll("input[type=text]"))
        .to.have.length.of(2);
    });

    it("should priorize local properties over definition ones", function*() {
      // Refs bug #140
      const schema = {
        type: "object",
        properties: {
          foo: {
            title: "custom title",
            $ref: "#/definitions/objectDef"
          }
        },
        definitions: {
          objectDef: {
            type: "object",
            title: "definition title",
            properties: {
              field: {type: "string"}
            }
          }
        }
      };

      const {node} = yield createFormComponent({schema});

      expect(node.querySelector("legend").textContent)
        .eql("custom title");
    });

    it("should propagate and handle a resolved schema definition", function*() {
      const schema = {
        definitions: {
          enumDef: {type: "string", enum: ["a", "b"]}
        },
        type: "object",
        properties: {
          name: {$ref: "#/definitions/enumDef"}
        },
      };

      const {node} = yield createFormComponent({schema});

      expect(node.querySelectorAll("option"))
        .to.have.length.of(2);
    });
  });

  describe("Defaults array items default propagation", () => {
    const schema = {
      type: "object",
      title: "lvl 1 obj",
      properties: {
        object: {
          type: "object",
          title: "lvl 2 obj",
          properties: {
            array: {
              type: "array",
              items: {
                type: "object",
                title: "lvl 3 obj",
                properties: {
                  bool: {
                    type: "boolean",
                    default: true
                  }
                }
              }
            }
          }
        }
      }
    };

    it("should propagate deeply nested defaults to form state", function* () {
      const {comp, node} = yield createFormComponent({schema});

      yield Simulate.click(node.querySelector(".array-item-add button"));
      yield Simulate.submit(node);

      expect(comp.state.formData).eql({
        object: {
          array: [
            {
              bool: true
            }
          ]
        }
      });
    });
  });

  describe("Submit handler", () => {
    it("should call provided submit handler with form state", function*() {
      const onSubmit = sandbox.spy();
      const {comp, node} = yield createFormComponent({
        schema: {
          type: "object",
          properties: {
            foo: {type: "string"},
          }
        },
        formData: {foo: "bar"},
        onSubmit
      });

      yield Simulate.submit(node);

      sinon.assert.calledWithExactly(onSubmit,
        {...comp.state, status: "submitted"});
    });

    it("should not call provided submit handler on validation errors", function*() {
      const schema = {
        type: "object",
        properties: {
          foo: {
            type: "string",
            minLength: 1,
          },
        }
      };
      const formData = {
        foo: ""
      };
      const onSubmit = sandbox.spy();
      const onError = sandbox.spy();
      const {node} = yield createFormComponent({schema, formData, onSubmit, onError});

      yield Simulate.submit(node);

      sinon.assert.notCalled(onSubmit);
    });
  });

  describe("Change handler", () => {
    it("should call provided change handler on form state change", function*() {
      const schema = {
        type: "object",
        properties: {
          foo: {
            type: "string",
          },
        }
      };
      const formData = {
        foo: ""
      };
      const onChange = sandbox.spy();
      const {node} = yield createFormComponent({schema, formData, onChange});

      yield Simulate.change(node.querySelector("[type=text]"), {
        target: {value: "new"}
      });

      sinon.assert.calledWithMatch(onChange, {
        formData: {
          foo: "new"
        }
      });
    });
  });

  describe("Error handler", () => {
    it("should call provided error handler on validation errors", function*() {
      const schema = {
        type: "object",
        properties: {
          foo: {
            type: "string",
            minLength: 1,
          },
        }
      };
      const formData = {
        foo: ""
      };
      const onError = sandbox.spy();
      const {node} = yield createFormComponent({schema, formData, onError});

      yield Simulate.submit(node);

      sinon.assert.calledOnce(onError);
    });
  });

  describe("External formData updates", () => {
    describe("root level", () => {
      const formProps = {
        schema: {type: "string"},
        liveValidate: true,
      };

      it("should update form state from new formData prop value", function*() {
        const {comp} = yield createFormComponent(formProps);

        yield updateComponentProps(comp, {formData: "yo"});

        expect(comp.state.formData).eql("yo");
      });

      it("should validate formData when the schema is updated", function*() {
        const {comp} = yield createFormComponent(formProps);

        yield updateComponentProps(comp, {formData: "yo", schema: {type: "number"}});

        expect(comp.state.errors).to.have.length.of(1);
        expect(comp.state.errors[0].stack)
          .to.eql("instance is not of a type(s) number");
      });
    });

    describe("object level", () => {
      it("should update form state from new formData prop value", function*() {
        const {comp} = yield createFormComponent({
          schema: {
            type: "object",
            properties: {
              foo: {
                type: "string"
              }
            }
          }
        });

        yield updateComponentProps(comp, {formData: {foo: "yo"}});

        expect(comp.state.formData).eql({foo: "yo"});
      });
    });

    describe("array level", () => {
      it("should update form state from new formData prop value", function*() {
        const schema = {
          type: "array",
          items: {
            type: "string"
          }
        };
        const {comp} = yield createFormComponent({schema});

        yield updateComponentProps(comp, {formData: ["yo"]});

        expect(comp.state.formData).eql(["yo"]);
      });
    });
  });

  describe("Error contextualization", () => {
    describe("on form state updated", () => {
      const schema = {
        type: "string",
        minLength: 8
      };

      describe("Lazy validation", () => {
        it("should not update the errorSchema when the formData changes", function*() {
          const {comp, node} = yield createFormComponent({schema});

          yield Simulate.change(node.querySelector("input[type=text]"), {
            target: {value: "short"}
          });

          expect(comp.state.errorSchema).eql({});
        });

        it("should not denote an error in the field", function*() {
          const {node} = yield createFormComponent({schema});

          yield Simulate.change(node.querySelector("input[type=text]"), {
            target: {value: "short"}
          });

          expect(node.querySelectorAll(".field-error"))
            .to.have.length.of(0);
        });

        it("should clean contextualized errors up when they're fixed", function*() {
          const altSchema = {
            type: "object",
            properties: {
              field1: {type: "string", minLength: 8},
              field2: {type: "string", minLength: 8},
            }
          };
          const {node} = yield createFormComponent({schema: altSchema, formData: {
            field1: "short",
            field2: "short",
          }});

          function* submit(node) {
            try {
              yield Simulate.submit(node);
            } catch(err) {
              // Validation is expected to fail and call console.error, which is
              // stubbed to actually throw in createSandbox().
            }
          }

          submit(node);

          // Fix the first field
          yield Simulate.change(node.querySelectorAll("input[type=text]")[0], {
            target: {value: "fixed error"}
          });
          yield submit(node);

          expect(node.querySelectorAll(".field-error"))
            .to.have.length.of(1);

          // Fix the second field
          yield Simulate.change(node.querySelectorAll("input[type=text]")[1], {
            target: {value: "fixed error too"}
          });

          // No error remaining, shouldn't throw.
          yield Simulate.submit(node);

          expect(node.querySelectorAll(".field-error"))
            .to.have.length.of(0);
        });
      });

      describe("Live validation", () => {
        it("should update the errorSchema when the formData changes", function*() {
          const {comp, node} = yield createFormComponent({schema, liveValidate: true});

          yield Simulate.change(node.querySelector("input[type=text]"), {
            target: {value: "short"}
          });

          expect(comp.state.errorSchema).eql({
            __errors: ["does not meet minimum length of 8"]
          });
        });

        it("should denote the new error in the field", function*() {
          const {node} = yield createFormComponent({schema, liveValidate: true});

          yield Simulate.change(node.querySelector("input[type=text]"), {
            target: {value: "short"}
          });

          expect(node.querySelectorAll(".field-error"))
            .to.have.length.of(1);
          expect(node.querySelector(".field-string .error-detail").textContent)
            .eql("does not meet minimum length of 8");
        });
      });
    });

    describe("on form submitted", () => {
      const schema = {
        type: "string",
        minLength: 8
      };

      it("should update the errorSchema on form submission", function*() {
        const {comp, node} = yield createFormComponent({schema, onError: () => {}});

        yield Simulate.change(node.querySelector("input[type=text]"), {
          target: {value: "short"}
        });
        yield Simulate.submit(node);

        expect(comp.state.errorSchema).eql({
          __errors: ["does not meet minimum length of 8"]
        });
      });

      it("should call the onError handler", function*() {
        const onError = sandbox.spy();
        const {node} = yield createFormComponent({schema, onError});

        yield Simulate.change(node.querySelector("input[type=text]"), {
          target: {value: "short"}
        });
        yield Simulate.submit(node);

        sinon.assert.calledWithMatch(onError, sinon.match(value => {
          return value.length === 1 &&
                 value[0].message === "does not meet minimum length of 8";
        }));
      });
    });

    describe("root level", () => {
      const formProps = {
        liveValidate: true,
        schema: {
          type: "string",
          minLength: 8
        },
        formData: "short"
      };

      it("should reflect the contextualized error in state", function*() {
        const {comp} = yield createFormComponent(formProps);

        expect(comp.state.errorSchema).eql({
          __errors: ["does not meet minimum length of 8"]
        });
      });

      it("should denote the error in the field", function*() {
        const {node} = yield createFormComponent(formProps);

        expect(node.querySelectorAll(".field-error"))
          .to.have.length.of(1);
        expect(node.querySelector(".field-string .error-detail").textContent)
          .eql("does not meet minimum length of 8");
      });
    });

    describe("root level with multiple errors", () => {
      const formProps = {
        liveValidate: true,
        schema: {
          type: "string",
          minLength: 8,
          pattern: "\d+",
        },
        formData: "short"
      };

      it("should reflect the contextualized error in state", function*() {
        const {comp} = yield createFormComponent(formProps);
        expect(comp.state.errorSchema).eql({
          __errors: [
            "does not meet minimum length of 8",
            `does not match pattern "\d+"`
          ]
        });
      });

      it("should denote the error in the field", function*() {
        const {node} = yield createFormComponent(formProps);

        const liNodes = node.querySelectorAll(".field-string .error-detail li");
        const errors = [].map.call(liNodes, li => li.textContent);

        expect(errors).eql([
          "does not meet minimum length of 8",
          `does not match pattern "\d+"`
        ]);
      });
    });

    describe("nested field level", () => {
      const schema = {
        type: "object",
        properties: {
          level1: {
            type: "object",
            properties: {
              level2: {
                type: "string",
                minLength: 8
              }
            }
          }
        }
      };

      const formProps = {
        schema,
        liveValidate: true,
        formData: {
          level1: {
            level2: "short"
          }
        }
      };

      it("should reflect the contextualized error in state", function*() {
        const {comp} = yield createFormComponent(formProps);

        expect(comp.state.errorSchema).eql({
          level1: {
            level2: {
              __errors: ["does not meet minimum length of 8"]
            }
          }
        });
      });

      it("should denote the error in the field", function*() {
        const {node} = yield createFormComponent(formProps);
        const errorDetail = node.querySelector(
          ".field-object .field-string .error-detail");

        expect(node.querySelectorAll(".field-error"))
          .to.have.length.of(1);
        expect(errorDetail.textContent)
          .eql("does not meet minimum length of 8");
      });
    });

    describe("array indices", () => {
      const schema = {
        type: "array",
        items: {
          type: "string",
          minLength: 4
        }
      };

      const formProps = {
        schema,
        liveValidate: true,
        formData: ["good", "bad", "good"]
      };

      it("should contextualize the error for array indices", function*() {
        const {comp} = yield createFormComponent(formProps);

        expect(comp.state.errorSchema)
          .eql({
            1: {__errors: ["does not meet minimum length of 4"]}
          });
      });

      it("should denote the error in the item field in error", function*() {
        const {node} = yield createFormComponent(formProps);
        const fieldNodes = node.querySelectorAll(".field-string");

        const liNodes = fieldNodes[1]
          .querySelectorAll(".field-string .error-detail li");
        const errors = [].map.call(liNodes, li => li.textContent);

        expect(fieldNodes[1].classList.contains("field-error")).eql(true);
        expect(errors)
          .eql(["does not meet minimum length of 4"]);
      });

      it("should not denote errors on non impacted fields", function*() {
        const {node} = yield createFormComponent(formProps);
        const fieldNodes = node.querySelectorAll(".field-string");

        expect(fieldNodes[0].classList.contains("field-error")).eql(false);
        expect(fieldNodes[2].classList.contains("field-error")).eql(false);
      });
    });

    describe("nested array indices", () => {
      const schema = {
        type: "object",
        properties: {
          level1: {
            type: "array",
            items: {
              type: "string",
              minLength: 4
            }
          }
        }
      };

      const formProps = {schema, liveValidate: true};

      it("should contextualize the error for nested array indices", function*() {
        const {comp} = yield createFormComponent({...formProps, formData: {
          level1: ["good", "bad", "good", "bad"]
        }});

        expect(comp.state.errorSchema).eql({
          level1: {
            1: {__errors: ["does not meet minimum length of 4"]},
            3: {__errors: ["does not meet minimum length of 4"]},
          }
        });
      });

      it("should denote the error in the nested item field in error", function*() {
        const {node} = yield createFormComponent({...formProps, formData: {
          level1: ["good", "bad", "good"]
        }});

        const liNodes = node.querySelectorAll(".field-string .error-detail li");
        const errors = [].map.call(liNodes, li => li.textContent);

        expect(errors)
          .eql(["does not meet minimum length of 4"]);
      });
    });

    describe("nested arrays", () => {
      const schema = {
        type: "object",
        properties: {
          outer: {
            type: "array",
            items: {
              type: "array",
              items: {
                type: "string",
                minLength: 4
              }
            }
          }
        }
      };

      const formData = {
        outer: [
          ["good", "bad"],
          ["bad", "good"]
        ]
      };

      const formProps = {schema, formData, liveValidate: true};

      it("should contextualize the error for nested array indices", function*() {
        const {comp} = yield createFormComponent(formProps);

        expect(comp.state.errorSchema).eql({
          outer: {
            0: {
              1: {__errors: ["does not meet minimum length of 4"]}
            },
            1: {
              0: {__errors: ["does not meet minimum length of 4"]}
            }
          }
        });
      });

      it("should denote the error in the nested item field in error", function*() {
        const {node} = yield createFormComponent(formProps);
        const fields = node.querySelectorAll(".field-string");
        const errors = [].map.call(fields, field => {
          const li = field.querySelector(".error-detail li");
          return li && li.textContent;
        });

        expect(errors)
          .eql([
            null,
            "does not meet minimum length of 4",
            "does not meet minimum length of 4",
            null
          ]);
      });
    });

    describe("array nested items", () => {
      const schema = {
        type: "array",
        items: {
          type: "object",
          properties: {
            foo: {
              type: "string",
              minLength: 4
            }
          }
        }
      };

      const formProps = {
        schema,
        liveValidate: true,
        formData: [
          {foo: "good"}, {foo: "bad"}, {foo: "good"}
        ]
      };

      it("should contextualize the error for array nested items", function*() {
        const {comp} = yield createFormComponent(formProps);

        expect(comp.state.errorSchema).eql({
          1: {
            foo: {
              __errors: ["does not meet minimum length of 4"]
            }
          }
        });
      });

      it("should denote the error in the array nested item", function*() {
        const {node} = yield createFormComponent(formProps);
        const fieldNodes = node.querySelectorAll(".field-string");

        const liNodes = fieldNodes[1]
          .querySelectorAll(".field-string .error-detail li");
        const errors = [].map.call(liNodes, li => li.textContent);

        expect(fieldNodes[1].classList.contains("field-error")).eql(true);
        expect(errors)
          .eql(["does not meet minimum length of 4"]);
      });
    });
  });
});
