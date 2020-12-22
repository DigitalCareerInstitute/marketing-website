import React, {useState, useEffect, useRef} from 'react';

function StringTranslation(props) {
  const [data, setData] = useState([]);
  const [changed, setChanged] = useState(new Set());
  let titleRef = useRef()
  let enRef = useRef()
  let deRef = useRef()
  useEffect(() => {
    fetch(`/admin/settings`, {
      headers: {"content-type": "application/json"}
    }).then(res => res.json()).then(res => {
      const {...stringtranslations} = res;
      setData(res)
    })
  }, []);
  const updateStringtranslation = (e, st) => {
    e.preventDefault()
    fetch(`/admin/settings/stringtranslations/update`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(st)
    }).then(res => res.json())
      .then(res => {
        let changedClone = new Set(changed);
        changedClone.delete(res._id)
        setChanged(changedClone)
      })
  };
  const setTheData = (e, st) => {
    e.preventDefault();
    const {...clone} = data;
    changed.add(st._id);
    setChanged(changed)
    clone.stringtranslations[data.stringtranslations.findIndex(item => item._id === st._id)] = st;
    setData(clone)
  };

  function deleteItem(e, st) {
    e.preventDefault();
    e.stopPropagation();
    fetch(`/admin/settings/stringtranslations/delete/${st._id}`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      }
    }).then(res => res.json())
      .then(res => {
        const {...clone} = data;
        clone.stringtranslations.splice(data.stringtranslations.findIndex(item => item._id === res._id), 1);
        setData(clone)
      })
  }

  function createItem(e) {
    e.preventDefault();
    e.stopPropagation();
    const payload = {
      title: e.target.elements.title.value,
      translations: {
        en: e.target.elements.en.value,
        de: e.target.elements.de.value
      }
    }
    fetch(`/admin/settings/stringtranslations`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    }).then(res => res.json())
      .then(res => {
        const {...clone} = data;
        clone.stringtranslations.unshift(res.stringtranslation);
        setData(clone)
        titleRef.current.value = ""
        enRef.current.value = ""
        deRef.current.value = ""
      }).catch(e => console.debug(e))
  }

  return (
    <div>
      <form onSubmit={createItem} className="d-flex flex-grow-1 mb-3" method="POST"
            action={`/admin/settings/stringtranslations`}>
        <div className="input-group flex-grow-1 mr-2">
          <div className="input-group-prepend w-100">
            <label className="input-group-text text-capitalize d-block" htmlFor="newtranslations">Title</label>
            <textarea
              className="form-control" name="title" placeholder="title" ref={titleRef}/>
          </div>
        </div>
        <div className="input-group flex-grow-1 mr-2">
          <div className="input-group-prepend w-100">
            <label className="input-group-text text-capitalize d-block" htmlFor="newtranslationsen">en</label>
            <textarea
              className="form-control" name="en" placeholder="en version" ref={enRef}>

            </textarea>
          </div>
        </div>
        <div className="input-group flex-grow-1 mr-2">
          <div className="input-group-prepend w-100">
            <label className="input-group-text text-capitalize d-block" htmlFor="newtranslationsde">de</label>
            <textarea className="form-control" name="de" placeholder="de version" ref={deRef}>

            </textarea>
          </div>
        </div>
        <button className="btn btn-primary" type="submit">Create</button>
      </form>

      {data.stringtranslations && data.stringtranslations.length > 0 && data.stringtranslations.map(st => (
        <div key={st._id} className={``}>
          <div className="d-flex" id="translation_events">
            <form onSubmit={(e) => updateStringtranslation(e, st)} className="d-flex flex-grow-1" method="POST"
                  action={`/admin/settings/stringtranslations/${st._id}`}>
              <div className="input-group flex-grow-1 mr-2">
                <div className="input-group-prepend w-100">
                  <label className="input-group-text text-capitalize d-block"
                         htmlFor={`${st._id}`}>Title</label>
                  <textarea
                    onChange={(e) => setTheData(e, {
                      ...st,
                      title: e.target.value
                    })}
                    className={`form-control ${changed.has(st._id) ? `border-success` : ``}`}
                    id={`${st._id}`}
                    name={`${st._id}`}
                    value={`${st.title}`}
                    placeholder="title">

                </textarea>
                </div>
              </div>
              {st.translations.map((tr, index) => (
                <div key={tr._id} className="input-group flex-grow-1 mr-2">
                  <div className="input-group-prepend">
                    <label
                      className="input-group-text text-capitalize d-block"
                      htmlFor={`${tr._id}[]`}>{tr.language.title}</label>
                  </div>
                  <textarea
                    onChange={(e) => {
                      st.translations[index].title = e.target.value
                      setTheData(e, st)
                    }}
                    className={`form-control ${changed.has(st._id) ? `border-warning` : `border-transparent`}`}
                    name={`${st._id}`}
                    id={`${tr._id}`}
                    placeholder={tr.title}
                    value={tr.title}/>
                </div>
              ))}
              <div className={`d-flex flex-column justify-content-end`}>
                {changed.has(st._id) && (
                  <button
                    className={`btn btn-block ${changed.has(st._id) ? `btn-success` : `btn-outline-primary`}`}
                    type="submit">{`Save`}</button>

                )}
                <button className="btn btn-block btn-outline-danger" onClick={(e) => deleteItem(e, st)}>Delete</button>
              </div>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StringTranslation;
