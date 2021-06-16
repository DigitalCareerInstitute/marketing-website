import React, { useState, useEffect, useRef } from 'react';
import createEngine, {
  DefaultLinkModel,
  DefaultNodeModel,
  DiagramModel
} from '@projectstorm/react-diagrams';
import {
  CanvasWidget
} from '@projectstorm/react-canvas-core';
import styled from '@emotion/styled';

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
engine.setModel(model);


const CanvasWrapper = styled.div`
  & > div {
    height: 100vh;
    width: 100vw;
  }
`

function QuestionsDiagram(props) {
  let questionRef = useRef(null)
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
    const node = new DefaultNodeModel({
      name: !!e.target.elements.freequestion.checked ? "Freequestion" : e.target.elements.input.value,
      color: !!e.target.elements.freequestion.checked ? "rgb(0, 128, 229)" : e.target.elements.input.dataset.color,
      customType: e.target.elements.input.dataset.type,
      extras: {
        freequestion: !!e.target.elements.freequestion.checked
      }
    });
    node.setPosition(600, 100);

    let port1 = node.addInPort('In');
    let port2 = node.addOutPort('Out');

    model.addAll(node);
    engine.setModel(model);
  }

  console.log(answeravailable);
  return (
    <div>
      <button className="btn btn-secondary badge ml-2" type='button' data-container='body' data-toggle='popover' data-trigger="hover" data-placement='top' data-content='Link questions to one or multiple answers. If a question is followed by a freeanswer, it should be the only anwer of that question'> ? </button>
      <form onSubmit={addQuestion}>
        <div className="form-group">
          <label htmlFor="addquestion">Add Question</label>
          <input className="form-control" name="input" type="text" data-type="question" data-color="rgb(0, 128, 129)" style={{ borderColor: "rgb(0, 128, 129)", borderStyle: "solid" }} id="addquestion" />
        </div>
      </form>
      <label htmlFor="addanswer">Add Answer</label>
      <form className="form-inline" onSubmit={addQuestion}>
        <div className="form-group w-100">
          <input className="form-control w-100" name="input" type="text" data-type="answer" data-color="rgb(255, 204, 1)" style={{ borderColor: "rgb(255, 204, 1)", borderStyle: "solid" }} id="addanswer" disabled={!answeravailable} />
          <button className="btn btn-primary" type="submit">Add</button>
        </div>
        <div className="form-group w-100">
          <div className="form-group form-check  mb-3">
            <input type="checkbox" name="freequestion" className="form-check-input" style={{ borderColor: "rgb(255, 204, 1)", borderStyle: "solid" }} id="freequestion" onChange={() => setansweravailable(!answeravailable)} />
            <label className="form-check-label" htmlFor="freequestion">Free answer</label>
            <input type="checkbox" name="entityanswer" className="form-check-input" style={{ borderColor: "rgb(255, 204, 1)", borderStyle: "solid" }} id="entityanswer" onChange={() => setansweravailable(!answeravailable ? "entityanswer" : answeravailable)} />
            <label className="form-check-label" htmlFor="entityanswer">Entityanswer</label>
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
      <CanvasWrapper>
        <CanvasWidget id='canvas' engine={engine} />
      </CanvasWrapper>
    </div>
  );
}

export default QuestionsDiagram;
