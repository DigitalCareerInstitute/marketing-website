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
const questioncolor = "rgb(0, 128, 129)"
function QuestionsDiagram() {
  let [loading, setloading] = useState(true)
  let [form, setForm] = useState({})
  let [button, setbutton] = useState('Add')
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
          Object.values(model.activeNodeLayer.models).forEach((item) => {
            item.registerListener({
              eventDidFire: (e) => {
                e.stopPropagation();
                e.isSelected ? setbutton('update') : setbutton('add')
                setForm({ ...form, "question": e.isSelected && item.options.extras.customType !== "answer" ? item.options.name : "", 'questionidentifier': e.isSelected ? item.options.extras.questionidentifier : "", "answer": e.isSelected && item.options.extras.customType === "answer" ? item.options.name : "" })
              }
            });
          });
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
    const selectedNodes = Object.values(engine.model.activeNodeLayer.models).filter(i => i.options.selected)
    let node
    if (selectedNodes.length === 1) {
      node = selectedNodes[0]
      node.options.name = form['question']
      node.options.extras.questionidentifier = form['questionidentifier']
    } else {
      node = new CustomNodeModel({
        name: `${e.target.elements.addquestion.value}`,
        color: e.target.elements.addquestion.dataset.color,
        extras: {
          customType: e.target.elements.addquestion.dataset.type,
          questionidentifier: e.target.elements.addquestionidentifier.value
        }
      });
      node.setPosition(engine.canvas.offsetWidth / 2, engine.canvas.offsetHeight / 2);
      node.addInPort('In');
      node.addOutPort('Out');
    }
    model.addAll(node);
    engine.setModel(model);
  }
  const addAnswer = (e) => {
    e.preventDefault()
    const selectedNodes = Object.values(engine.model.activeNodeLayer.models).filter(i => i.options.selected)
    let node
    if (selectedNodes.length === 1) {
      node = selectedNodes[0]
      node.options.name = form['answer']
    } else {
      node = new CustomNodeModel({
        name: !!e.target.elements.freeanswer && !!e.target.elements.freeanswer.checked ? "Freeanswer" : e.target.elements.answer.value,
        color: !!e.target.elements.freeanswer && !!e.target.elements.freeanswer.checked ? "rgb(0, 128, 229)" : e.target.elements.answer.dataset.color,
        extras: {
          customType: e.target.elements.answer.dataset.type,
          freeanswer: !!e.target.elements.freeanswer && !!e.target.elements.freeanswer.checked,
          dropdown: !!e.target.elements.dropdown && !!e.target.elements.dropdown.checked,
          answeridentifier: e.target.elements.answeridentifier.value
        }
      });
      node.setPosition(engine.canvas.offsetWidth / 2, engine.canvas.offsetHeight / 2);
      node.addInPort('In');
      node.addOutPort('Out');
    }
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
  const createPredefinedButton = (e) => {
    e.preventDefault()
    const node = new CustomNodeModel({
      name: `${e.target.dataset.field}`,
      color: questioncolor,
      extras: {
        customType: "question",
        questionidentifier: e.target.dataset.field
      }
    });
    console.log('Enginesize', engine.canvas.offsetWidth, engine.canvas.offsetHeight);
    node.setPosition(engine.canvas.offsetWidth / 2, engine.canvas.offsetHeight / 2);
    node.addInPort('In');
    node.addOutPort('Out');
    model.addAll(node);
    engine.setModel(model);
  }
  return (
    <div className="h-100 d-flex flex-column">
      <div>
        <form onSubmit={addQuestion}>
          <div className="form-group">
            <label htmlFor="addquestion">Add Question</label>
            <input className="form-control" name="question" type="text" value={form['question']}
              onChange={(e) => {
                e.stopPropagation();
                setForm({ ...form, [e.target.name]: e.target.value })
              }} data-type="question" data-color={questioncolor} style={{ borderColor: { questioncolor }, borderStyle: "solid" }} id="addquestion" required />
            <label htmlFor="addquestionidentifier">Questionidentifier</label>
            <input className="form-control" name="questionidentifier" type="text" value={form['questionidentifier']}
              onChange={(e) => {
                e.stopPropagation();
                setForm({ ...form, [e.target.name]: e.target.value })
              }} data-type="questionidentifier" data-color={questioncolor} style={{ borderColor: { questioncolor }, borderStyle: "solid" }} id="addquestionidentifier" required />
          </div>
          <div classNamed="d-flex">
          <button className="btn btn-primary" type="submit">{button}</button>
            <span className="mx-2">Or add predefined Hubspot keys:</span>
            <button className="btn btn-primary" onClick={(e) => {
              createPredefinedButton(e)
            }} data-field="firstname">Firstname</button>
            <button className="btn btn-primary" onClick={(e) => {
              createPredefinedButton(e)
            }} data-field="lastname">Lastname</button>
            <button className="btn btn-primary" onClick={(e) => {
              createPredefinedButton(e)
            }} data-field="email">Email</button>
            <button className="btn btn-primary" onClick={(e) => {
              createPredefinedButton(e)
            }} data-field="phone">Phone</button>
          </div>
        </form>

        <form className="" onSubmit={addAnswer}>
          <div className="form-group w-100">

            <label htmlFor="addanswer">Add Answer</label>
            <input className="form-control w-100" name="answer" value={form['answer']}
              onChange={(e) => {
                e.stopPropagation();
                setForm({ ...form, [e.target.name]: e.target.value })
              }} type="text" data-type="answer" data-color="rgb(255, 204, 1)" style={{ borderColor: "rgb(255, 204, 1)", borderStyle: "solid" }} id="addanswer" disabled={!answeravailable} />

            <label htmlFor="answeridentifier">Questionidentifier</label>
            <input className="form-control w-100" name="answeridentifier" type="text" value={form['answeridentifier']}
              onChange={(e) => {
                e.stopPropagation();
                setForm({ ...form, [e.target.name]: e.target.value })
              }} data-type="answeridentifier" data-color={questioncolor} style={{ borderColor: "rgb(255, 204, 1)", borderStyle: "solid" }} id="answeridentifier" required />

          </div>
          <button className="btn btn-primary" type="submit">{button}</button>
          <div className="form-group w-100">
            <div className="form-group form-check  mb-3">
              <input type="checkbox" name="freeanswer" className="form-check-input"
                onChange={(e) => {
                  e.stopPropagation();
                  setForm({ ...form, [e.target.name]: e.target.value })
                }} style={{ borderColor: "rgb(255, 204, 1)", borderStyle: "solid" }} id="freeanswer" onChange={() => setansweravailable(!answeravailable)} />
              <label className="form-check-label" htmlFor="freeanswer">Free answer</label>
              <input type="checkbox" name="dropdown" className="form-check-input"
                onChange={(e) => {
                  e.stopPropagation();
                  setForm({ ...form, [e.target.name]: e.target.value })
                }} style={{ borderColor: "rgb(255, 204, 1)", borderStyle: "solid" }} id="dropdown" />
              <label className="form-check-label" htmlFor="dropdown">Is dropdown</label>
              <button className="btn btn-secondary badge ml-2" type="button" data-container="body" data-toggle="popover" data-trigger="hover" data-placement="top" data-content="comma seperated list build the dropdown" data-original-title="" title=""> ? </button>
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
        <div claseName="flash m-0 mr-3 alert fade show alert-danger ">
          Error: {error}
          <button className="close ml-3" type="button" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>
        </div>
      )}
      <CanvasWrapper>
        <CanvasWidget keyDown={e => console.log('AAAA', e)} id='canvas' engine={engine} />
      </CanvasWrapper>
    </div>
  );
}

export default QuestionsDiagram;
