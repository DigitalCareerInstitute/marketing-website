import React, { useState, useEffect } from 'react';

const Redirects = (props) => {
  const [data, setData] = useState([]);
  const [newentry, setnewentry] = useState({ from: "", to: "" });
  const [changed, setChanged] = useState(new Set());
  useEffect(() => {
    fetch(`/admin/redirects`, {
      headers: { "content-type": "application/json" }
    }).then(res => res.json()).then(res => {
      const { ...redirects } = res;
      setData(res)
    })
  }, []);
  const updateStringtranslation = (e, st) => {
    if (e.target.type === "submit") {
      e.preventDefault()
      fetch(`/admin/redirects/update`, {
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
    }
  };
  const setTheData = (e, st) => {
    e.preventDefault();
    const { ...clone } = data;
    changed.add(st._id);
    setChanged(changed)
    clone.redirects[data.redirects.findIndex(item => item._id === st._id)] = st;
    setData(clone)
  };
  const deleteItem = (e, st) => {
    e.preventDefault();
    e.stopPropagation();
    fetch(`/admin/redirects/delete/${st._id}`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      }
    }).then(res => res.json())
      .then(res => {
        const { ...clone } = data;
        clone.redirects.splice(data.redirects.findIndex(item => item._id === res._id), 1);
        setData(clone)
      })
  }
  const createItem = (e) => {
    if (e.target.type === "submit") {
      e.preventDefault();
      e.stopPropagation();
      fetch(`/admin/redirects`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(newentry)
      }).then(res => res.json())
        .then(res => {
          const { ...clone } = data;
          clone.redirects.unshift(res.redirect);
          setData(clone)
        }).catch(e => console.debug(e))
    }
  }
  return (
    <div>
      <table className="w-100 mb-3" method="POST"
        action={`/admin/redirects`}>
        <tbody>
          <tr onClick={createItem}>
            <td className="">
              <div className=" w-100">
                <label className="sr-only input-group-text text-capitalize d-block" htmlFor="newtranslations">From</label>
                <input
                  className="form-control" name="title" value={newentry.from} onChange={(e) => setnewentry({ ...newentry, from: e.target.value })} placeholder="title" />
              </div>
            </td>
            <td className="">
              <div className=" w-100">
                <label className="sr-only input-group-text text-capitalize d-block" htmlFor="newtranslationsde">To</label>
                <input className="form-control" name="de" value={newentry.to} onChange={(e) => setnewentry({ ...newentry, to: e.target.value })} placeholder="de version" />
              </div>
            </td>
            <td>
              <button className="btn btn-primary" type="submit">Create</button>
            </td>
          </tr>
        </tbody>
      </table>
      <table className={`w-100`}>
        <tbody>
          {data.redirects && data.redirects.length > 0 && data.redirects.map((redirect, index) => (
            <tr onClick={(e) => updateStringtranslation(e, redirect)} key={redirect._id} className={``}>
              <td className="">
                <div className=" w-100">
                  <label className="sr-only input-group-text text-capitalize d-block"
                    htmlFor={`${redirect._id}`}>From</label>
                  <input
                    onChange={(e) => setTheData(e, {
                      ...redirect,
                      from: e.target.value
                    })}
                    className={`form-control ${changed.has(redirect._id) ? `border-success` : ``}`}
                    id={`${redirect._id}`}
                    name={`${redirect._id}`}
                    value={`${redirect.from}`}
                    placeholder="title" />
                </div>
              </td>
              <td className="">
                <div className=" w-100">
                  <label className="sr-only input-group-text text-capitalize d-block"
                    htmlFor={`${redirect._id}`}>To</label>
                  <input
                    onChange={(e) => setTheData(e, {
                      ...redirect,
                      to: e.target.value
                    })}
                    className={`form-control ${changed.has(redirect._id) ? `border-success` : ``}`}
                    id={`${redirect._id}`}
                    name={`${redirect._id}`}
                    value={`${redirect.to}`}
                    placeholder="title" />
                </div>
              </td>
              <td className={`d-flex flex-column justify-content-end`}>
                {changed.has(redirect._id) && (
                  <button
                    className={`btn btn-block ${changed.has(redirect._id) ? `btn-success` : `btn-outline-primary`}`}
                    type="submit">{`Save`}</button>
                )}
                <button className="btn btn-block btn-outline-danger" onClick={(e) => deleteItem(e, redirect)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div >
  );
}

export default Redirects;
