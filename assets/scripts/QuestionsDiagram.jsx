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
            setloading(true)
            let itemMap = {};
            model.getSelectedEntities().map(item => {
              let newItem = item.clone(itemMap)
              model.addNode(newItem)
              newItem.setPosition(newItem.getX() + 20, newItem.getY() + 20)
              engine.setModel(model);
              item.setSelected(!1)
              setloading(false)
            })
          }}>{loading ? "Loading" : "Clone selected"}</button>
        <button className="btn btn-success btn-sm"
          disabled={loading}
          onClick={() => {
            setloading(true)
            console.log(`11111`, model);
            console.log(`11111`, model.serialize());
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
          }}>{loading ? "Loading" : "Save"}</button>
      </div>
      <CanvasWrapper>
        <CanvasWidget id='canvas' engine={engine} />
      </CanvasWrapper>
    </div>
  );
}

export default QuestionsDiagram;
