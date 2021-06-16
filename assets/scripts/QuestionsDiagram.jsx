import React, { useState, useEffect } from 'react';
import createEngine, {
  DiagramModel,
  DefaultNodeModel
} from '@projectstorm/react-diagrams';
import {
  CanvasWidget
} from '@projectstorm/react-canvas-core';
import styled from '@emotion/styled';
import { CustomNodeModel } from './CustomNode/CustomNodeModel';
import { CustomNodeFactory } from './CustomNode/CustomNodeFactory';
import { CustomPortFactory } from './CustomNode/CustomPortFactory';
import { CustomPortModel } from './CustomNode/CustomPortModel';
const engine = createEngine();
class StartNodeModel extends DiagramModel {
  serialize() {
    return {
      ...super.serialize(),
      extras: this.extras,
      label: this.label,
      icon: this.icon,
    };
  }
  deserialize(event, engine) {
    super.deserialize(event, engine);
    this.extras = event.data.extras;
    this.label = event.data.label;
    this.icon = event.data.icon;
  }
}

const model = new StartNodeModel();
// register some other factories as well
engine
  .getPortFactories()
  .registerFactory(new CustomPortFactory('tommy', config => new CustomPortModel(PortModelAlignment.LEFT)));
engine.getNodeFactories().registerFactory(new CustomNodeFactory());

engine.setModel(model);

const CanvasWrapper = styled.div`
  flex-grow: 1;
  overflow: hidden;
  & > div {
    height: 100%;
    width: 100vw;
  }
`

function QuestionsDiagram() {
  let [loading, setloading] = useState(true)
  let [answeravailable, setansweravailable] = useState(true)
  let [error, seterror] = useState(undefined)
  useEffect(() => {
    fetch(`/admin/questions/fetch`, {
      headers: {
        "content-type": "application/json"
      },
    }).then(res => res.json())
      .then(res => {
        if (res.payload.model) {
          model.deserializeModel(res.payload.model, engine);
          engine.setModel(model);
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        setloading(false)
      })
  }, [])

  const addQuestion = (e) => {
    e.preventDefault()
    const node = new CustomNodeModel({
      name: `${e.target.elements.addquestion.value}`,
      color: e.target.elements.addquestion.dataset.color,
      extras: {
        customType: e.target.elements.addquestion.dataset.type,
        questionidentifier: e.target.elements.addquestionidentifier.value
      }
    });
    node.setPosition(engine.canvas.offsetWidth / 2, engine.canvas.offsetHeight / 2);

    let port1 = node.addInPort('In');
    let port2 = node.addOutPort('Out');

    model.addAll(node);
    engine.setModel(model);
  }
  const addAnswer = (e) => {
    e.preventDefault()
    const node = new DefaultNodeModel({
      name: !!e.target.elements.freeanswer && !!e.target.elements.freeanswer.checked ? "Freeanswer" : e.target.elements.input.value,
      color: !!e.target.elements.freeanswer && !!e.target.elements.freeanswer.checked ? "rgb(0, 128, 229)" : e.target.elements.input.dataset.color,
      extras: {
        customType: e.target.elements.input.dataset.type,
        freeanswer: !!e.target.elements.freeanswer && !!e.target.elements.freeanswer.checked
      }
    });
    node.setPosition(engine.canvas.offsetWidth / 2, engine.canvas.offsetHeight / 2);

    let port1 = node.addInPort('In');
    let port2 = node.addOutPort('Out');

    model.addAll(node);
    engine.setModel(model);
  }
  const saveModel = () => {
    setloading(true)
    var nodes = Object.values(model.layers.find(layer => layer.options.type === "diagram-nodes").models)
    var filteredLinks = Object.values(model.layers.find(layer => layer.options.type === "diagram-links").models)

    var beginningQuestion = nodes.find(n => {
      return Object.values(n.portsIn[0].links).length === 0
    })
    let errorNodes = []

    var checkQABalance = (question) => {
      return Object.values(question.portsOut[0].links).map(link => {
        if (link.targetPort.parent.options.extras.customType !== "answer") {
          engine.getModel().getNode(link.targetPort.parent.options.id).setSelected(true);
          engine.getModel().getNode(link.targetPort.parent.options.id).options.color = "rgb(255,0,0)"
          return link.targetPort.parent
        }
      }).filter(l => !!l)
    }

    const questions = nodes.filter(n => n.options.extras.customType !== "answer")
    questions.map(q => {
      errorNodes = [...errorNodes, ...checkQABalance(q)]
    })
    seterror(`Answer followes to answer for nodes: ${errorNodes.map(e => e.options.name + ', ')}`)
    if (errorNodes.length === 0) {
      seterror(undefined)
    }

    // Model serialise has the EXTRAS
    fetch(`/admin/questions/update`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(model.serialize())
    }).then(res => res.json())
      .then(res => {
        setloading(false)
      })
  }

  const cloneSelected = () => {
    setloading(true)
    let itemMap = {};
    model.getSelectedEntities().filter(m => m.parent.options.type === "diagram-nodes").map(item => {
      let newItem = item.clone(itemMap)
      model.addNode(newItem)
      newItem.setPosition(newItem.getX() + 20, newItem.getY() + 20)
      engine.setModel(model);
      item.setSelected(!1)
      setloading(false)
    })
  }
  return (
    <div className="h-100 d-flex flex-column">
      <div>
        <form onSubmit={addQuestion}>
          <div className="form-group">
            <label htmlFor="addquestion">Add Question</label>
            <input className="form-control" name="input" type="text" data-type="question" data-color="rgb(0, 128, 129)" style={{ borderColor: "rgb(0, 128, 129)", borderStyle: "solid" }} id="addquestion" required />
            <label htmlFor="addquestionidentifier">Questionidentifier</label>
            <input className="form-control" name="input" type="text" data-type="questionidentifier" data-color="rgb(0, 128, 129)" style={{ borderColor: "rgb(0, 128, 129)", borderStyle: "solid" }} id="addquestionidentifier" required />
          </div>
          <button className="btn btn-primary" type="submit">Add</button>
        </form>

        <label htmlFor="addanswer">Add Answer</label>
        <form className="form-inline" onSubmit={addAnswer}>
          <div className="form-group w-100">
            <input className="form-control w-100" name="input" type="text" data-type="answer" data-color="rgb(255, 204, 1)" style={{ borderColor: "rgb(255, 204, 1)", borderStyle: "solid" }} id="addanswer" disabled={!answeravailable} />
            <button className="btn btn-primary" type="submit">Add</button>
          </div>
          <div className="form-group w-100">
            <div className="form-group form-check  mb-3">
              <input type="checkbox" name="freeanswer" className="form-check-input" style={{ borderColor: "rgb(255, 204, 1)", borderStyle: "solid" }} id="freeanswer" onChange={() => setansweravailable(!answeravailable)} />
              <label className="form-check-label" htmlFor="freeanswer">Free answer</label>
            </div>
          </div>
        </form>

        <button className="btn btn-primary btn-sm mr-2"
          disabled={loading}
          onClick={() => {
            cloneSelected()
          }}>{loading ? "Loading" : "Clone selected"}</button>
        <button className="btn btn-success btn-sm"
          disabled={loading}
          onClick={() => {
            saveModel()
          }}>{loading ? "Loading" : "Save"}</button>
      </div>
      {error && (
        <div clase="flash m-0 mr-3 alert fade show alert-danger ">
          Error: {error}
          <button className="close ml-3" type="button" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>
        </div>
      )}
      <CanvasWrapper>
        <CanvasWidget id='canvas' engine={engine} />
      </CanvasWrapper>
    </div>
  );
}

export default QuestionsDiagram;
